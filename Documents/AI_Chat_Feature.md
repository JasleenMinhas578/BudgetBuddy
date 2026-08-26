# BudgetBuddy AI Chat — Technical Documentation

## Overview

BudgetBuddy includes a floating AI chat widget (bottom-right corner) powered by **Google Gemini**. Users can add, edit, and delete expenses and categories in plain English, query their spending data with natural-language date ranges, and control the dashboard date filter — all without leaving the app.

---

## How It Works — End-to-End Flow

```
User types a message
        │
        ▼
AIChat.jsx (UI shell) → delegates all logic to useAIChat.js (custom hook)
  useAIChat.js:
  - Loads user's expenses from Firestore once on chat open (getExpenses)
  - Subscribes to user's custom categories via Firestore onSnapshot (direct query)
  - Holds its own sessionDateRange state (internal — separate from the dashboard filter)
  - Owns all state: messages, input, loading, expenses, customCategories, sessionDateRange
        │
        ▼
aiService.js → Gemini API (REST call)
  - Checks daily rate limit (50 requests/day via localStorage)
  - Pre-aggregates spending stats over filtered expenses
  - Builds prompt: stats + last 50 individual records + categories + session date range
  - Sends to: gemini-3.6-flash model (with retry logic for 429 errors)
        │
        ▼
Gemini returns structured JSON
  {
    intent: "ADD_EXPENSE" | "EDIT_EXPENSE" | "DELETE_EXPENSE" |
            "ADD_CATEGORY" | "EDIT_CATEGORY" | "DELETE_CATEGORY" |
            "QUERY" | "SET_DATE_RANGE" | "ASK_DATE_RANGE" | "CHAT",
    message: "friendly response",
    expenseData?:       { title, amount, category, date },
    editExpenseData?:   { id, title, amount, category, date, updates: { title?, amount?, category?, date? } },
    deleteExpenseData?: { id, title, amount, category, date },
    categoryData?:      { name },
    editCategoryData?:  { id, name, newName },
    deleteCategoryData?:{ id, name },
    dateRange?:         { label, from, to }
  }
        │
        ▼
AIChat.jsx handles the intent:
  ADD_EXPENSE       → show confirmation card → user clicks "Add Expense"      → Firestore write
  EDIT_EXPENSE      → show confirmation card → user clicks "Save Changes"     → Firestore update
  DELETE_EXPENSE    → show confirmation card → user clicks "Delete Expense"   → Firestore delete
  ADD_CATEGORY      → show confirmation card → user clicks "Add Category"     → Firestore write
  EDIT_CATEGORY     → show confirmation card → user clicks "Rename"           → Firestore update
  DELETE_CATEGORY   → show confirmation card → user clicks "Delete Category"  → Firestore delete
  SET_DATE_RANGE    → updates the chat's own sessionDateRange (shown in header)
                     (this does NOT change the dashboard date filter)
  ASK_DATE_RANGE    → renders a date_range_picker card with 6 preset buttons;
                     user picks a preset → range is set and original question is re-answered
  QUERY             → display the computed answer as a chat bubble
  CHAT              → display the conversational response as a chat bubble
```

Every destructive or mutating action requires an explicit user confirmation click — the AI never writes to Firestore without it.

> **Important**: The chat's session date range (`sessionDateRange`) is **internal to the chat widget**. It is used to focus AI queries within a chosen period. It does **not** affect the dashboard's `DateRangeContext` or any other view. If the user wants to change the dashboard date filter, they use the date filter bar on each page or the Settings page default.

---

## Files

| File | Purpose |
|------|---------|
| `src/components/AI/AIChat.jsx` | UI shell — renders the panel, header, input bar, message list, and toggle button. Delegates all state/logic to `useAIChat`. |
| `src/components/AI/ChatMessage.jsx` | Renders individual chat messages, including all 6 confirmation card types (`expense_confirm`, `category_confirm`, `delete_expense_confirm`, `edit_expense_confirm`, `delete_category_confirm`, `edit_category_confirm`), the date range picker card, reminder bubbles, and plain text bubbles. |
| `src/components/AI/AIChat.css` | Styles for the chat widget |
| `src/hooks/useAIChat.js` | All AI chat logic: state (`messages`, `input`, `loading`, `expenses`, `customCategories`, `sessionDateRange`), `sendMessage`, `handleConfirmAction`, `handleDismiss`, `handlePickDateRange`, `handleKeyDown`, `getPendingReminder`, `buildPresetRange`. This is the "brain" of the chat — `AIChat.jsx` is just the UI shell. |
| `src/services/aiService.js` | Gemini API calls: `processMessage()` and `generateSummary()`. Rate limiting, retry logic. |
| `.env` | Stores the API key as `REACT_APP_GEMINI_API_KEY` |

> **Note**: `src/context/DateRangeContext.js` is **not** involved in the AI chat. `SET_DATE_RANGE` sets `sessionDateRange` state inside `useAIChat.js` only — it never touches `DateRangeContext`.

---

## Gemini API Call

### Endpoint

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=YOUR_KEY
```

- **Model**: `gemini-3.6-flash` — Google's latest free-tier model (as of August 2026)
- **API version**: `v1beta`
- **Auth**: API key passed as a URL query parameter

### Request body

```json
{
  "contents": [
    {
      "parts": [{ "text": "<the full prompt>" }]
    }
  ],
  "generationConfig": {
    "temperature": 0.2,
    "maxOutputTokens": 512,
    "responseMimeType": "application/json"
  }
}
```

- `temperature: 0.2` — keeps responses factual and consistent (lower = less creative/random)
- `maxOutputTokens: 512` — limits response length to keep latency low
- `responseMimeType: "application/json"` — instructs the model to return structured JSON directly

### Rate limiting and retry

`aiService.js` enforces a **daily limit of 50 AI requests per user**, tracked in `localStorage` under the key `bb_ai_usage` (`{ date, count }`). The counter resets at midnight. If the limit is reached, an error is thrown before the API call is made.

For **429 (rate limit) errors** from Gemini, the service retries up to 3 times with delays of `[5 s, 15 s, 30 s]` before giving up and surfacing the error to the user.

### Response structure

```json
{
  "candidates": [
    {
      "content": {
        "parts": [{ "text": "{ \"intent\": \"QUERY\", \"message\": \"...\" }" }]
      }
    }
  ]
}
```

The model returns a JSON string inside `candidates[0].content.parts[0].text`. We extract it with a regex (`/\{[\s\S]*\}/`) to handle any accidental markdown wrapping.

---

## The Prompt

The full prompt is built in `aiService.js` at call time. Here is its structure:

```
You are BudgetBuddy AI, a helpful personal finance assistant. Today is {YYYY-MM-DD}.

{ACTIVE SESSION DATE RANGE: <label> (<from> to <to>). Treat this as the default period.}
 — OR —
{NO SESSION DATE RANGE SET. If the user asks a spending QUERY with no time period mentioned,
 respond with intent "ASK_DATE_RANGE" to ask which period they want.}

SPENDING SUMMARY (all {N} records{, <label>}):
Total spent: ${grandTotal}
Average per transaction: ${avgPerTransaction}
Daily average: ${dailyAvg}
By category: { "Food": 123.45, ... }
By month (chronological): [{ "month": "2026-07", "total": 456.78 }, ...]
By category and month: { "Food": { "2026-07": 123.45 }, ... }
Count by category: { "Food": 12, ... }
Count by month: { "2026-07": 18, ... }
Largest single expense: { id, title, amount, category, date }

RECENT EXPENSES — last {≤50} individual records (use these for EDIT or DELETE):
[{ id, title, amount, category, date }, ...]

AVAILABLE CATEGORIES: Food, Transport, Entertainment, Utilities, Rent, Other, <custom...>
CUSTOM CATEGORIES (with IDs, only these can be deleted/renamed): [{ id, name }, ...]

TASK: Respond with ONLY raw JSON — no markdown, no code fences.

Classify intent as one of:
- "ADD_EXPENSE"     → log/add a new expense
- "EDIT_EXPENSE"    → change an existing expense
- "DELETE_EXPENSE"  → remove an expense from history
- "ADD_CATEGORY"    → create a new custom category
- "EDIT_CATEGORY"   → rename a custom category
- "DELETE_CATEGORY" → delete a custom category
- "QUERY"           → spending question AND a time period is known
- "ASK_DATE_RANGE"  → spending question but no time period is mentioned and no session range set
- "SET_DATE_RANGE"  → the message IS a date range / time period (e.g. "last month", "July 2026")
- "CHAT"            → greeting, unclear, or not enough info to act

Key rules:
- For QUERY: use the SPENDING SUMMARY totals (covers all records, not just the recent 50)
- For EDIT/DELETE: find the expense in RECENT EXPENSES by id; fuzzy-match spelling mistakes
- Default categories (Food, Transport, etc.) cannot be renamed or deleted; use CHAT if asked
- For ASK_DATE_RANGE: ONLY use this when no session range is set AND no period is mentioned
- If the expense or category is ambiguous, use CHAT and list the options or ask for more detail
- If amount or title is missing for ADD_EXPENSE, use CHAT and ask for the missing detail

User message: "{user's message}"
```

**Key design decisions:**
- The prompt pre-aggregates spending data (totals, by-category, by-month, counts, largest expense) over **all** records in the active date range — so QUERY answers are accurate even when there are thousands of records.
- Only the **last 50 individual records** are sent for EDIT/DELETE context. This keeps the prompt small while still covering nearly all practical cases.
- `temperature: 0.2` makes categorization and expense matching deterministic.
- Injecting today's date lets the model interpret "yesterday", "last Monday", etc.
- The session date range (or its absence) controls when `ASK_DATE_RANGE` fires — if a range is already set, the model always answers using it instead of asking.
- Fuzzy matching rules in the prompt let the model handle common misspellings (e.g. "coffe" → "Coffee").
- JSON-only output + `responseMimeType: "application/json"` makes parsing reliable; a regex fallback (`/\{[\s\S]*\}/`) handles rare cases where the model wraps the output in markdown.

---

## Intent Handling in the UI

### ADD_EXPENSE
Shows a **confirmation card** with the detected title, amount, category, and date. User must click **"Add Expense"** to write to Firestore. "Cancel" dismisses without saving.

### EDIT_EXPENSE
Shows a **confirmation card** listing the current and proposed values for every field. User clicks **"Save Changes"** to apply the update to Firestore.

### DELETE_EXPENSE
Shows a **confirmation card** with the full expense details. User clicks **"Delete Expense"** (styled as a danger button) to remove it from Firestore.

### ADD_CATEGORY
Shows a **confirmation card** with the new category name. User clicks **"Add Category"** to create it in Firestore.

### EDIT_CATEGORY
Shows a **confirmation card** with the current name and the proposed new name. User clicks **"Rename"** to save.

### DELETE_CATEGORY
Shows a **confirmation card** with the category name. User clicks **"Delete Category"** (danger button) to remove it. Only custom (user-created) categories can be deleted — attempting to delete a default category (Food, Transport, etc.) returns a CHAT response explaining why.

### SET_DATE_RANGE
Sets the **chat's own internal session date range** (`sessionDateRange` state in `AIChat.jsx`). This is displayed in the chat header: `Showing: <label> ×`. The × button clears it. This does **not** affect the dashboard date filter — it only scopes the AI's spending queries within the chat session.

### ASK_DATE_RANGE
Renders a **date range picker card** with 6 preset buttons: Today, This Week, This Month, Last Month, This Year, All Time. When the user picks one, the chat sets `sessionDateRange` and immediately re-runs the original question with the chosen period. The user can also type a custom range as a follow-up message.

### QUERY
The model uses the pre-aggregated spending summary in the prompt (totals, by-category, by-month, daily average, largest expense) to compute accurate answers. The result appears as a plain chat bubble.

### CHAT
For greetings, out-of-scope questions, or messages where the intent is unclear. The model responds conversationally or asks for clarification.

### Pending action reminders
If a user sends a new message while there are **already-unconfirmed** action cards on screen (e.g. they asked to add an expense but haven't clicked "Add Expense" yet), the AI appends a **reminder bubble** after responding, listing everything that still needs confirmation. This only fires for cards that were pending _before_ the current message — it won't remind about a card that was just created.

---

## `ChatMessage.jsx` — Message Types and Confirmed Labels

`ChatMessage.jsx` is a pure presentational component. It receives a `msg` object and renders the appropriate UI:

| `msg.type` | Rendered as |
|------------|-------------|
| `text` | Plain paragraph (also used for errors when `msg.isError: true`) |
| `reminder` | Styled reminder paragraph (`ai-reminder` CSS class) |
| `expense_confirm` | Confirmation card with Title / Amount / Category / Date rows + "Add Expense" button |
| `category_confirm` | Confirmation card with Category row + "Add Category" button |
| `delete_expense_confirm` | Danger confirmation card + "Delete Expense" button |
| `edit_expense_confirm` | Confirmation card showing **updated** field values + "Save Changes" button |
| `delete_category_confirm` | Danger confirmation card + "Delete Category" button |
| `edit_category_confirm` | Confirmation card with Current Name / New Name rows + "Rename" button |
| `date_range_picker` | Preset grid with 6 buttons + "Or type a custom range below" hint |

**After confirmation or dismissal**, the card is replaced with a status line:

| `msg.type` after confirm | Status label |
|--------------------------|--------------|
| `expense_confirm` | `Done!` |
| `category_confirm` | `Category added successfully!` |
| `delete_expense_confirm` | `Expense deleted!` |
| `edit_expense_confirm` | `Expense updated!` |
| `delete_category_confirm` | `Category deleted!` |
| `edit_category_confirm` | `Category renamed!` |

After cancel, all types show `Cancelled`.

---

## `useAIChat.js` — Internal Constants

The hook defines several constants that control AI chat behavior:

**`ACTION_TYPES`** — message types that represent pending user confirmations:
```js
['expense_confirm', 'category_confirm', 'delete_expense_confirm',
 'edit_expense_confirm', 'delete_category_confirm', 'edit_category_confirm']
```

**`INTENT_MAP`** — maps AI intent → `{ type, dataKey }` for building the message object:
```js
ADD_EXPENSE     → { type: 'expense_confirm',         dataKey: 'expenseData' }
ADD_CATEGORY    → { type: 'category_confirm',        dataKey: 'categoryData' }
DELETE_EXPENSE  → { type: 'delete_expense_confirm',  dataKey: 'deleteExpenseData' }
EDIT_EXPENSE    → { type: 'edit_expense_confirm',    dataKey: 'editExpenseData' }
DELETE_CATEGORY → { type: 'delete_category_confirm', dataKey: 'deleteCategoryData' }
EDIT_CATEGORY   → { type: 'edit_category_confirm',   dataKey: 'editCategoryData' }
```

**`buildPresetRange(label)`** — converts a date preset label to a `DateRange` object. Used by the date range picker card when the user clicks a preset:

| Label | from | to |
|-------|------|----|
| `Today` | today | today |
| `This Week` | today − 6 days | today |
| `This Month` | 1st of current month | today |
| `Last Month` | 1st of previous month | last day of previous month |
| `This Year` | Jan 1 of current year | today |
| `All Time` | `2000-01-01` | today |

> **Note**: `This Week` in the AI chat date picker means **last 7 days** (today minus 6). This is different from the `thisWeek` filter in `useDateFilter.js`, which uses an ISO Monday-to-Sunday week. Be aware they can return different sets of expenses.

---

## Suggested Questions (shown in empty state)

```
"What's my total spending this month?"
"Which category do I spend most on?"
"What's my highest expense this month?"
"How much did I spend on food?"
"What's my average daily spending?"
"Add $25 for coffee today"
```

These are hardcoded chips in `AIChat.jsx` (`SUGGESTED_QUESTIONS` constant) that call `sendMessage()` directly when clicked. They are shown only when the conversation is empty.

## Chat message persistence

Chat messages are saved to and restored from **`sessionStorage`** under the key `ai-chat-messages`. This means:
- Messages survive page refreshes within the same browser tab.
- Messages are cleared when the tab is closed or the user opens a new session (unlike `localStorage`, `sessionStorage` is tab-scoped).
- The chat's `sessionDateRange` is **not** persisted — it resets when the page reloads.

---

## Environment Setup

The API key is stored in `.env`:

```
REACT_APP_GEMINI_API_KEY=your_key_here
```

CRA (Create React App) reads `.env` at **dev server startup** — if you change the key, restart the dev server (`Ctrl+C` then `npm start`).

To get a key: [Google AI Studio](https://aistudio.google.com/) → Create API Key → free, no credit card required.

> **Note**: If you see a "model not available" error, check which models your key supports:
> ```bash
> curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY" | grep '"name"'
> ```

---

## `generateSummary` — Reports Page AI Summary

`aiService.js` exports a second function used by the **Reports page**:

```js
generateSummary(expenses, filterLabel) → Promise<string>
```

This sends up to 200 expense records (title, amount, category, date — no ids) and the current filter label to Gemini and asks for a **3–4 sentence plain-text paragraph** that:
1. States the total spent and the period.
2. Identifies the top spending category and any notable pattern.
3. Gives one actionable suggestion to reduce spending.

| Config | Value |
|--------|-------|
| Temperature | 0.4 (slightly more creative than `processMessage`) |
| maxOutputTokens | 256 |
| responseMimeType | not set (plain text) |

Unlike `processMessage`, this returns a raw string (not JSON) and does not include expense IDs or categories in the response. It also counts against the same 50-request daily limit.

---

## Security Notes

### Data isolation
The AI chat only ever sees the logged-in user's own data. Expenses and categories are loaded with `currentUser.uid` in `useAIChat.js` before being passed to `aiService.js` — the AI service has no direct Firestore access and cannot query any other user's data.

Firestore Security Rules enforce this at the backend level: `users/{userId}/{document=**}` is readable/writable only when `request.auth.uid == userId`. These rules are version-controlled in [`firestore.rules`](../firestore.rules) at the project root and deployed to Firebase.

### Known limitations

**Gemini API key exposed in the browser bundle**
`REACT_APP_GEMINI_API_KEY` is compiled into the client-side JavaScript by Create React App. Anyone can find it via browser DevTools → Sources. They can then make Gemini API calls charged to your account from outside the app entirely. For a production deployment, proxy the Gemini call through a backend function so the key never leaves the server.

**Daily limit is bypassable client-side**
The 50 requests/day cap is tracked in `localStorage` under `bb_ai_usage`. A user can reset it instantly by running `localStorage.removeItem('bb_ai_usage')` in the browser console. This is a soft limit — it does not protect against abuse of the Gemini API key. A production app should enforce this limit server-side, tied to the Firebase Auth UID.

**User data sent to Google**
User expense data (titles, amounts, categories, dates) is included in the Gemini prompt. Users should be informed of this in a privacy policy for a production deployment. No personally identifiable information beyond financial records is sent — names, emails, and passwords are never included in the prompt.
