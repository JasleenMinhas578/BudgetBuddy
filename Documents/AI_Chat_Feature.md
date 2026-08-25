# BudgetBuddy AI Chat — Technical Documentation

## Overview

BudgetBuddy includes a floating AI chat widget (bottom-right corner) powered by **Google Gemini**. It lets users add expenses in plain English and ask natural language questions about their spending — all without leaving the dashboard.

---

## How It Works — End-to-End Flow

```
User types a message
        │
        ▼
AIChat.jsx (React component)
  - Loads user's expenses from Firestore
  - Loads user's custom categories from Firestore
        │
        ▼
aiService.js → Gemini API (REST call)
  - Builds prompt with expense history + categories
  - Sends to: gemini-3.6-flash model
        │
        ▼
Gemini returns structured JSON
  {
    intent: "ADD_EXPENSE" | "QUERY" | "CHAT",
    message: "friendly response",
    expenseData?: { title, amount, category, date }
  }
        │
        ▼
AIChat.jsx handles the intent:
  ADD_EXPENSE → show confirmation card (user must click "Add Expense")
  QUERY       → display the answer text
  CHAT        → display the response text
        │
        ▼
User clicks "Add Expense" on confirmation card
        │
        ▼
database.js → writes to Firestore
  users/{userId}/expenses/{newDocId}
```

---

## Files

| File | Purpose |
|------|---------|
| `src/components/AI/AIChat.jsx` | The floating chat widget UI component |
| `src/components/AI/AIChat.css` | Styles for the chat widget |
| `src/services/aiService.js` | Gemini API call and response parsing |
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

USER'S EXPENSE HISTORY ({N} records):
[{ title, amount, category, date }, ...]   ← last 200 expenses from Firestore

AVAILABLE CATEGORIES: Food, Transport, Entertainment, Utilities, Rent, Other, ...custom categories

TASK: Read the user message and respond with ONLY raw JSON — no markdown, no code fences, no explanation.

Classify the user's intent as one of:
- "ADD_EXPENSE"  → user wants to log/add/record an expense
- "QUERY"        → user asks a question about their spending data
- "CHAT"         → greeting, general question, or unclear intent

Required JSON format:
{
  "intent": "ADD_EXPENSE" | "QUERY" | "CHAT",
  "message": "friendly 1-3 sentence response",
  "expenseData": {
    "title": "short descriptive title",
    "amount": 0,
    "category": "must be one of the available categories above",
    "date": "YYYY-MM-DD"
  }
}

Rules:
- Include "expenseData" ONLY when intent is "ADD_EXPENSE"
- For QUERY: compute the answer from the expense history and put it in "message"
- For ADD_EXPENSE: "amount" must be a number, "date" must be YYYY-MM-DD
- Interpret relative dates: "today" = {today}, "yesterday" = one day before
- If amount or title is missing for an expense, use CHAT intent and ask for the missing detail
- Pick the best matching category from the available list

User message: "{user's message}"
```

**Key design decisions:**
- Expense history is trimmed to the **last 200 records** to keep the prompt short and cheap
- `temperature: 0.2` makes categorization deterministic — the model picks the most obvious category, not a creative one
- Injecting today's date lets the model interpret "yesterday", "last Monday", etc. correctly
- JSON-only output makes parsing reliable; the regex fallback handles rare markdown wrapping

---

## Intent Handling in the UI

### ADD_EXPENSE
The model returns an `expenseData` object. The UI renders a **confirmation card** showing:
- Title, Amount, Category, Date

The user must click **"✓ Add Expense"** to confirm. Only then does `addExpense()` write to Firestore. Clicking **"Cancel"** dismisses the card without saving.

### QUERY
The model computes the answer directly from the expense history in the prompt (e.g., sums, averages, max values) and returns it in `message`. The UI displays it as a chat bubble.

### CHAT
For greetings or unclear messages. The model asks for clarification or responds conversationally.

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

These are hardcoded chips in `AIChat.jsx` that call `sendMessage()` directly when clicked.

---

## Environment Setup

The API key is stored in `.env` (gitignored):

```
REACT_APP_GEMINI_API_KEY=your_key_here
```

CRA (Create React App) reads `.env` at **dev server startup** — if you change the key, restart the dev server (`Ctrl+C` then `npm start`).

To get a key: [Google AI Studio](https://aistudio.google.com/) → Create API Key → free, no credit card required.

> **Note**: The available Gemini models depend on your API key's access tier. If you see a "model not available" error, check which models your key supports by calling the ListModels endpoint:
> ```bash
> curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY" | grep '"name"'
> ```

---

## Security Notes

- The API key is exposed to the browser (it's in frontend JS). This is acceptable for a free-tier key with no billing, but for a production app you would proxy requests through a backend so the key stays server-side.
- The key is stored in `.env` which is gitignored — it is **never committed** to the repository.
- User expense data is sent to Google's Gemini API as part of the prompt. Users should be informed of this in a privacy policy for a production deployment.
