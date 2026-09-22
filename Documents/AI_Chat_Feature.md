# BudgetBuddy AI Chat — Technical Documentation

## Overview

BudgetBuddy includes a floating AI chat widget (bottom-right corner) powered by **Google Gemini**, using real **tool-calling / retrieval-augmented generation (RAG)** rather than stuffing the user's data into the prompt. Users can add, edit, and delete expenses, categories, and budget goals in plain English, query their spending data with natural-language date ranges, and get live currency conversions — all without leaving the app.

This is Phase 3 of the project's migration off Firebase/Vercel (see [`ROADMAP.md`](../ROADMAP.md)). The previous version computed every aggregate client-side in JavaScript and pasted the last 50 expenses plus the full category/budget lists into every single prompt. The current version sends a small, static instruction prompt and lets Gemini call SQL-backed tools whenever it actually needs real data.

---

## How It Works — End-to-End Flow

```
User types a message
        │
        ▼
AIChat.jsx (UI shell) → delegates all logic to useAIChat.js (custom hook)
  useAIChat.js:
  - Holds chat state: messages, input, loading, sessionDateRange
  - Subscribes to customCategories/budgets only for UI rendering (the category
    dropdown on confirm cards, and migrating a budget limit when a category
    is renamed) — NOT sent to the AI; the server looks its own data up
        │
        ▼
aiService.js → POST {API_BASE}/api/ai/chat  (Cognito-authenticated, via apiClient.js)
  body: { message, sessionDateRange, currencyInfo }
        │
        ▼
server/routes/ai.js  (Express, requireAuth middleware already ran)
  1. checkAndIncrement(req.uid) — DB-backed daily limit (50/day), server/services/aiUsage.js
  2. buildChatPrompt(...) — static instructions + this request's date/currency context only
  3. Tool-calling loop (up to 5 turns) against server/services/geminiClient.js:
       Gemini responds with a functionCall  →  server runs the matching SQL tool
       (server/services/aiTools.js, scoped to WHERE user_id = req.uid)  →  the
       result is handed back to Gemini as the next turn  →  repeat until Gemini
       returns plain text (the final JSON) instead of a functionCall
  4. extractJson(...) parses the final { intent, message, ...data } object
        │
        ▼
Client receives the same intent/data shape as before:
  {
    intent: "ADD_EXPENSE" | "ADD_MULTIPLE_EXPENSES" | "ADD_CATEGORY" |
            "DELETE_EXPENSE" | "EDIT_EXPENSE" | "DELETE_CATEGORY" | "EDIT_CATEGORY" |
            "SET_BUDGET" | "REMOVE_BUDGET" | "QUERY" | "ASK_DATE_RANGE" |
            "SET_DATE_RANGE" | "CURRENCY_CONVERT" | "CHAT",
    message: "friendly response",
    expenseData?, expensesData?, categoryData?, deleteExpenseData?,
    editExpenseData?, deleteCategoryData?, editCategoryData?, dateRange?, budgetData?
  }
        │
        ▼
useAIChat.js maps the intent to a confirm-card message type (INTENT_MAP) and
renders it via ChatMessage.jsx. Every mutating action still requires an
explicit confirm click — the AI never writes to Postgres on its own; it only
ever returns a proposed action for the user to approve.
```

---

## Why tool-calling instead of a data dump

The old design had a real correctness bug: it could only "find" an expense or category to edit/delete by scanning the last 50 records pasted into the prompt, so anything older was invisible to the model. The new design fixes this by letting Gemini call `find_expenses`/`list_categories` against the whole table — it can locate *any* record regardless of age, and it gets the record's real id back from a live query instead of hoping the model remembered it correctly from context.

It also means the prompt no longer grows with the size of the user's data — it's a fixed set of instructions plus whatever small amount of context (today's date, active date range, currency rates) is relevant to that one message.

---

## The Tools (`server/services/aiTools.js`)

Every tool takes `req.uid` as its first argument (never trusted from the model's `args`) and runs a parameterized SQL query scoped to that user.

| Tool | Purpose | Key args |
|------|---------|----------|
| `get_spending_summary` | Total spent, transaction count, average, and a per-category breakdown for a date range | `from`, `to` |
| `get_monthly_totals` | Spending grouped by month, for trend/comparison questions | `from`, `to` |
| `get_top_expenses` | Largest individual expenses in a date range, sorted descending | `from`, `to`, `limit` (default 5) |
| `find_expenses` | Case-insensitive substring search on title, optionally filtered by category/date range — used both to answer "what did I spend on X" and to locate the real expense behind an EDIT/DELETE | `titleQuery`, `category`, `from`, `to`, `limit` (default 10) |
| `get_budget_status` | Current month's budget goals per category, spend-to-date against each, and the overall monthly limit | — |
| `list_categories` | The 7 built-in defaults plus the user's custom categories with their real ids | — |

Gemini is instructed (in the prompt) to call the right tool before answering any QUERY, before resolving which expense/category an EDIT or DELETE refers to, and before matching a category name for ADD_CATEGORY/SET_BUDGET/REMOVE_BUDGET — never to guess a number, id, or name.

---

## The Tool-Calling Loop (`server/routes/ai.js`)

```js
let finalText = null;
for (let turn = 0; turn < 5 && finalText === null; turn++) {
  const data = await callGemini(contents, TOOLS);
  const parts = data.candidates[0].content.parts;
  const functionCalls = parts.filter(p => p.functionCall);

  if (functionCalls.length === 0) {
    finalText = parts.map(p => p.text || '').join('').trim();
    break;
  }

  contents.push({ role: 'model', parts });               // record the model's own turn
  const responseParts = functionCalls.map(({ functionCall: { name, args } }) => ({
    functionResponse: { name, response: { result: executeTool(req.uid, name, args) } },
  }));
  contents.push({ role: 'user', parts: responseParts });  // hand results back
}
```

**A real API quirk found while building this**: this model's API rejects `role: "function"` for tool results — the role name used in most Gemini function-calling examples and in older API versions. It wants the tool's response framed as the next `role: "user"` turn instead. There's a comment marking this in the code since it's easy to silently get wrong (the request doesn't fail loudly in every SDK/version).

---

## Prompt Design (`server/services/aiPrompts.js`)

`buildChatPrompt()` returns two concatenated parts:

1. **`CHAT_INSTRUCTIONS`** — a module-level constant, byte-identical on every call for every user, containing the tool list, the intent taxonomy, the required JSON output shape, and all the intent-specific rules. Kept free of any per-request interpolation (no date, no session range, no currency) on purpose — Gemini's implicit prompt caching only discounts a request when its prefix matches a prior one byte-for-byte, and this is designed to be that stable, cacheable prefix.
2. **Per-request context** — today's date, the active session date range (or an instruction to ask for one), and currency/exchange-rate info if available. This is appended *after* `CHAT_INSTRUCTIONS`, never interpolated into it, so the cacheable prefix never changes.

Intents classified: `ADD_EXPENSE`, `ADD_MULTIPLE_EXPENSES`, `ADD_CATEGORY`, `DELETE_EXPENSE`, `EDIT_EXPENSE`, `DELETE_CATEGORY`, `EDIT_CATEGORY`, `SET_BUDGET`, `REMOVE_BUDGET`, `QUERY`, `ASK_DATE_RANGE`, `SET_DATE_RANGE`, `CURRENCY_CONVERT`, `CHAT`.

A separate, much simpler prompt (`buildSummaryPrompt`) powers the Reports page's AI paragraph — see [Reports summary](#reports-page-ai-summary) below.

---

## Model Selection and Fallback (`server/services/geminiClient.js`)

```js
const MODELS = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-pro-latest'];
```

`gemini-3.6-flash` is the required primary model (see [`CLAUDE.md`](../CLAUDE.md)). The two rolling aliases behind it are Google's own "always current-gen" pointers, used only as a fallback when the primary is overloaded — never as a silent downgrade to an old pinned model version.

**Retry strategy**: cycle through all 3 models fast with no per-model backoff, then if a full pass through every model fails, wait 3 seconds once and do one more full pass. (An earlier version retried the *same* overloaded model 3 times with a 5s/15s/30s backoff before falling back — since this function gets called up to 5 times in one tool-calling request, that compounded into multi-minute hangs on a single slow request. Cycling models fast and only pausing between full passes fixed that.)

**Known limitation found live**: the free tier of the Gemini API has **zero** quota for the pro model (`gemini-pro-latest` resolves to `gemini-3.1-pro`, confirmed via a live "quota exceeded ... limit: 0" response) — so on a free-tier key, that fallback link never actually succeeds. It's left in place since it's harmless and free the moment the account moves off the free tier.

**Error sanitization**: `callGemini`'s errors are Google's raw upstream text (e.g. the quota message above, which names an internal model id the user has no reason to know). `server/routes/ai.js` catches these, logs the real message server-side, and returns a plain "BudgetBuddy AI is busy right now, please try again in a moment" message to the client instead.

**Token usage logging**: every successful call logs `promptTokenCount`, `cachedContentTokenCount` (and the resulting cache-hit %), `candidatesTokenCount`, and `totalTokenCount` straight from Gemini's own `usageMetadata` — real ground truth for what a call cost and whether the implicit-caching prefix actually got reused, not an estimate.

---

## Rate Limiting (`server/services/aiUsage.js`)

A **daily limit of 50 AI requests per user**, tracked in a real Postgres table (`ai_usage`, columns `user_id`, `usage_date`, `request_count`) rather than client-side `localStorage` — the old design could be reset by any user via `localStorage.removeItem('bb_ai_usage')` in DevTools, and didn't survive across browsers/devices anyway. The increment is a single atomic `INSERT ... ON CONFLICT DO UPDATE` query, avoiding a check-then-write race between two requests from the same user landing at once.

---

## Client Side (`src/services/aiService.js`, `src/hooks/useAIChat.js`)

`aiService.js` is now a thin client:

```js
export const processMessage = async (userMessage, sessionDateRange, currencyInfo) =>
  apiFetch('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message: userMessage, sessionDateRange, currencyInfo }) });

export const generateSummary = async (expenses, filterLabel, currencyInfo) => {
  const trimmed = expenses.slice(-200).map(e => ({ title: e.title, amount: e.amount, category: e.category, date: e.date }));
  const { summary } = await apiFetch('/api/ai/summary', { method: 'POST', body: JSON.stringify({ expenses: trimmed, filterLabel, currencyInfo }) });
  return summary;
};
```

`apiFetch` (`src/services/apiClient.js`) attaches the Cognito ID token automatically — no manual `getIdToken()` calls needed at the call site anymore.

`useAIChat.js` no longer subscribes to the user's expenses at all (removed along with the `dataReady` load-gate it used to need) — nothing client-side has to pre-fetch expense data for the AI, since retrieval happens server-side per question. It still subscribes to `customCategories` (for the category dropdown on confirm cards) and `budgets` (to migrate a budget limit client-side when a category gets renamed via AI).

Every mutating action still goes through the same `INTENT_MAP` → confirm-card → `handleConfirmAction` flow as before, calling the existing `expenseService`/`categoryService`/`budgetService` REST functions once the user clicks confirm.

---

## Files

| File | Role |
|------|------|
| `server/routes/ai.js` | `POST /api/ai/chat` (tool-calling loop) and `POST /api/ai/summary` (Reports blurb) |
| `server/services/aiTools.js` | The 6 SQL-backed tools + their Gemini function-declaration schemas |
| `server/services/aiPrompts.js` | `buildChatPrompt`, `buildSummaryPrompt` |
| `server/services/geminiClient.js` | `callGemini` — model fallback chain, retry, token-usage logging |
| `server/services/aiUsage.js` | DB-backed daily rate limit |
| `src/services/aiService.js` | Thin client — `processMessage`, `generateSummary` |
| `src/hooks/useAIChat.js` | Chat state and event handling (the "brain" of the widget) |
| `src/components/AI/AIChat.jsx` | UI shell — panel, header, input, message list |
| `src/components/AI/ChatMessage.jsx` | Renders each message type, including all 9 confirmation card types |

---

## Intent Handling in the UI

`useAIChat.js`'s `INTENT_MAP` maps each intent to a message type + data key, rendered by `ChatMessage.jsx` as a confirmation card:

| Intent | Card / action |
|--------|---------------|
| `ADD_EXPENSE` | Confirm card (editable) → "Add Expense" → `addExpense()` |
| `ADD_MULTIPLE_EXPENSES` | Card listing every expense → "Add All" → one `addExpense()` call per item (partial-failure tolerant) |
| `ADD_CATEGORY` | Confirm card → "Add Category" → `addCategory()` |
| `DELETE_EXPENSE` | Danger card, real id resolved via `find_expenses` → "Delete Expense" → `deleteExpense()` |
| `EDIT_EXPENSE` | Card showing current vs. proposed values → "Save Changes" → `updateExpense()` |
| `DELETE_CATEGORY` | Danger card, real id resolved via `list_categories` → "Delete Category" → `deleteCategory()` |
| `EDIT_CATEGORY` | Card with current/new name → "Rename" → `updateCategory()` (+ migrates any budget limit to the new name) |
| `SET_BUDGET` | Card with category + amount → "Set Goal" → `updateCategoryBudget()` |
| `REMOVE_BUDGET` | Danger card showing the current limit → "Remove Goal" → `updateCategoryBudget(..., null)` |
| `SET_DATE_RANGE` | Sets the chat's own internal `sessionDateRange` (shown in the panel header, independent of the dashboard's date filter) |
| `ASK_DATE_RANGE` | Renders a date-range picker card (6 presets); picking one re-runs the original question |
| `CURRENCY_CONVERT` | Plain chat bubble with the computed rate/amount |
| `QUERY` / `CHAT` | Plain chat bubble |

Every mutating action requires an explicit confirm click — the AI never writes to the database without it.

---

## Reports Page AI Summary

`generateSummary(expenses, filterLabel, currencyInfo)` posts to `POST /api/ai/summary`, a much simpler endpoint than `/chat`: no tools, no loop, just one Gemini call with a fixed prompt asking for a 3–4 sentence paragraph (total spent + period, top category/notable pattern, one actionable suggestion). It shares the same `ai_usage` daily counter as the chat.

---

## Chat message persistence

Chat messages are still saved to and restored from `sessionStorage` under `ai-chat-messages` — unchanged by the Phase 3 rework. Messages survive a page refresh within the same tab and clear when the tab closes. `sessionDateRange` is not persisted.

---

## Security Notes

- **Auth**: every `/api/ai/*` request goes through the same `requireAuth` Cognito-JWT-verification middleware as the rest of the API (`server/middleware/auth.js`) — the AI can only ever see and act on the authenticated user's own data, enforced by `WHERE user_id = req.uid` in every tool's SQL, not by anything the client sends.
- **API key**: `GEMINI_API_KEY` lives only in the server's `.env` and is never sent to the browser — unlike the pre-Phase-3 design, which used `REACT_APP_GEMINI_API_KEY` and compiled the key straight into the client bundle.
- **Rate limiting**: now server-enforced and DB-backed (see above), not a client-resettable `localStorage` counter.
- **Data sent to Google**: still just the SQL tool results relevant to that one message (e.g. a spending-by-category breakdown, a handful of matching expense rows) — never the user's full expense history in one shot, and never anything beyond financial records (no name, email, or password).
