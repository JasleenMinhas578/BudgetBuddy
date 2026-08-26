# BudgetBuddy AI Chat — Technical Documentation

## Overview

BudgetBuddy includes a floating AI chat widget (bottom-right corner) powered by **Google Gemini**. Users can add, edit, and delete expenses and categories in plain English, query their spending data with natural-language date ranges, and control the dashboard date filter — all without leaving the app.

---

## How It Works — End-to-End Flow

```
User types a message
        │
        ▼
AIChat.jsx (React component)
  - Loads user's expenses from Firestore
  - Loads user's custom categories from Firestore
  - Injects the current dashboard date filter (from DateRangeContext)
        │
        ▼
aiService.js → Gemini API (REST call)
  - Builds prompt with expense history + categories + current date range
  - Sends to: gemini-3.6-flash model
        │
        ▼
Gemini returns structured JSON
  {
    intent: "ADD_EXPENSE" | "EDIT_EXPENSE" | "DELETE_EXPENSE" |
            "ADD_CATEGORY" | "EDIT_CATEGORY" | "DELETE_CATEGORY" |
            "QUERY" | "SET_DATE_RANGE" | "ASK_DATE_RANGE" | "CHAT",
    message: "friendly response",
    expenseData?:       { title, amount, category, date },
    editExpenseData?:   { id, updates: { title?, amount?, category?, date? } },
    deleteExpenseData?: { id, title, amount, category, date },
    categoryData?:      { name },
    editCategoryData?:  { id, name },
    deleteCategoryData?:{ id, name },
    dateRange?:         { from, to, label }
  }
        │
        ▼
AIChat.jsx handles the intent:
  ADD_EXPENSE       → show confirmation card → user clicks "Add Expense" → Firestore write
  EDIT_EXPENSE      → show confirmation card → user clicks "Confirm Edit" → Firestore update
  DELETE_EXPENSE    → show confirmation card → user clicks "Confirm Delete" → Firestore delete
  ADD_CATEGORY      → show confirmation card → user clicks "Add Category" → Firestore write
  EDIT_CATEGORY     → show confirmation card → user clicks "Confirm Rename" → Firestore update
  DELETE_CATEGORY   → show confirmation card → user clicks "Confirm Delete" → Firestore delete
  SET_DATE_RANGE    → updates DateRangeContext (dashboard filter changes immediately)
  ASK_DATE_RANGE    → AI asks which time period the user wants before answering a query
  QUERY             → display the computed answer as a chat bubble
  CHAT              → display the conversational response as a chat bubble
```

Every destructive or mutating action requires an explicit user confirmation click — the AI never writes to Firestore without it.

---

## Files

| File | Purpose |
|------|---------|
| `src/components/AI/AIChat.jsx` | The floating chat widget UI component |
| `src/components/AI/AIChat.css` | Styles for the chat widget |
| `src/services/aiService.js` | Gemini API call and response parsing |
| `src/context/DateRangeContext.js` | Global date-filter context — `SET_DATE_RANGE` writes here |
| `.env` | Stores the API key as `REACT_APP_GEMINI_API_KEY` |

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
    "maxOutputTokens": 512
  }
}
```

- `temperature: 0.2` — keeps responses factual and consistent (lower = less creative/random)
- `maxOutputTokens: 512` — limits response length to keep latency low

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

CURRENT DASHBOARD DATE RANGE: {e.g. "thisMonth" | "lastMonth" | none}

USER'S EXPENSE HISTORY ({N} records):
[{ id, title, amount, category, date }, ...]   ← last 200 expenses from Firestore

AVAILABLE CATEGORIES (default): Food, Transport, Entertainment, Utilities, Rent, Other
CUSTOM CATEGORIES (user-created): [{ id, name }, ...]

TASK: Read the user message and respond with ONLY raw JSON — no markdown, no code fences.

Classify the user's intent as one of:
- "ADD_EXPENSE"       → user wants to log/add a new expense
- "EDIT_EXPENSE"      → user wants to change an existing expense
- "DELETE_EXPENSE"    → user wants to remove an expense from history
- "ADD_CATEGORY"      → user wants to create a new custom category
- "EDIT_CATEGORY"     → user wants to rename a custom category
- "DELETE_CATEGORY"   → user wants to delete a custom category (default categories cannot be deleted)
- "QUERY"             → user asks a question about their spending data
- "SET_DATE_RANGE"    → user's message IS a date range (e.g. "last month", "July 2026")
- "ASK_DATE_RANGE"    → query has no time period; ask the user which period they mean
- "CHAT"              → greeting, general question, or unclear intent

Rules:
- Include "expenseData" ONLY for ADD_EXPENSE
- Include "editExpenseData" ONLY for EDIT_EXPENSE — "updates" contains only the changed fields; use the expense's id from history
- Include "deleteExpenseData" ONLY for DELETE_EXPENSE — use the id from history
- Include "categoryData" ONLY for ADD_CATEGORY
- Include "editCategoryData" / "deleteCategoryData" ONLY for their respective intents — use the id from CUSTOM CATEGORIES
- Default categories (Food, Transport, etc.) cannot be renamed or deleted; use CHAT and explain why
- Include "dateRange" ONLY for SET_DATE_RANGE — parse to exact from/to dates; "label" is a short human-friendly name
- If the expense/category is ambiguous, use CHAT and ask for more detail
- If amount or title is missing for ADD_EXPENSE, use CHAT and ask for the missing detail

User message: "{user's message}"
```

**Key design decisions:**
- Expense history is trimmed to the **last 200 records** to keep the prompt short
- `temperature: 0.2` makes categorization and expense matching deterministic
- Injecting today's date lets the model interpret "yesterday", "last Monday", etc.
- Injecting the current date-range context lets the model know what period is already active
- Each expense in history includes its Firestore `id` so edits and deletes can target the exact record
- JSON-only output makes parsing reliable; the regex fallback handles rare markdown wrapping

---

## Intent Handling in the UI

### ADD_EXPENSE
Shows a **confirmation card** with the detected title, amount, category, and date. User must click **"Add Expense"** to write to Firestore. "Cancel" dismisses without saving.

### EDIT_EXPENSE
Shows a **confirmation card** listing the current values and the proposed changes. User clicks **"Confirm Edit"** to apply the update to Firestore.

### DELETE_EXPENSE
Shows a **confirmation card** identifying the expense to be removed. User clicks **"Confirm Delete"** to delete from Firestore.

### ADD_CATEGORY
Shows a **confirmation card** with the new category name. User clicks **"Add Category"** to create it in Firestore.

### EDIT_CATEGORY / DELETE_CATEGORY
Same confirmation-card pattern — user must confirm before the Firestore write happens.

### SET_DATE_RANGE
Calls `setDateFilter()` / `setCustomDateRange()` on `DateRangeContext` immediately (no confirmation needed — it's reversible). All dashboard views update to show the new period.

### ASK_DATE_RANGE
The AI responds with a clarifying question asking which time period the user wants. The user's next message is sent as a follow-up.

### QUERY
The model computes the answer from the expense history in the prompt (sums, averages, max values, etc.) and returns it in `message`. Displayed as a chat bubble.

### CHAT
For greetings, out-of-scope questions, or ambiguous messages. The model asks for clarification or responds conversationally.

---

## Suggested Questions (shown in empty state)

```
"What's my total spending this month?"
"Which category do I spend most on?"
"What's my highest expense this month?"
"How much did I spend on food?"
"What's my average daily spending?"
"Add $25 for coffee today"
"Delete my Uber expense from last Tuesday"
"Rename my 'Snacks' category to 'Dining'"
"Show me last month"
```

These are hardcoded chips in `AIChat.jsx` that call `sendMessage()` directly when clicked.

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

## Security Notes

- The API key is exposed to the browser (it's in frontend JS). This is acceptable for a free-tier key with no billing, but a production app should proxy requests through a backend so the key stays server-side.
- The key is stored in `.env` which is gitignored — it is **never committed** to the repository.
- User expense data is sent to Google's Gemini API as part of the prompt. Users should be informed of this in a privacy policy for a production deployment.
