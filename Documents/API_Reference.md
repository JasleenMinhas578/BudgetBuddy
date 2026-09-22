# API Reference — Budget Buddy

**Project**: Budget Buddy
**Last Updated**: September 2026 (post Firebase → AWS/Postgres/Cognito migration — see [`ROADMAP.md`](../ROADMAP.md))
**Purpose**: Complete reference for the Express REST API and the AI endpoints

Budget Buddy's backend is a self-hosted **Node/Express API** (`server/`) backed by **AWS RDS Postgres**, with **AWS Cognito** for auth. There is no Firestore and no client-side Firebase SDK anymore — the React app talks to this API over plain HTTPS/REST, authenticated with a Cognito ID token on every request.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Expenses](#2-expenses)
3. [Categories](#3-categories)
4. [Budgets](#4-budgets)
5. [Settings](#5-settings)
6. [AI Endpoints](#6-ai-endpoints)
7. [Data Shapes Reference](#7-data-shapes-reference)
8. [Error Shape](#8-error-shape)

---

## 1. Authentication

Every route below except `GET /health` is mounted behind `requireAuth` (`server/middleware/auth.js`):

```
Authorization: Bearer <Cognito ID token>
```

`requireAuth`:
1. Verifies the token via `aws-jwt-verify`'s `CognitoJwtVerifier` (checks signature against the User Pool's JWKS, expiry, issuer, audience).
2. Sets `req.uid` to the token's `sub` claim (a Cognito UUID) — every query below is scoped to this value.
3. **Just-in-time provisions** the `users` row: `INSERT ... ON CONFLICT (id) DO UPDATE` using `sub`/`email`/`name` from the token claims. This runs on *every* authenticated request, not just signup, so a newly confirmed Cognito user works immediately on their first API call without any separate provisioning step.

On the client, `src/services/apiClient.js`'s `apiFetch()` reads the current ID token via `getIdToken()` (`src/cognito.js`, backed by `amazon-cognito-identity-js`) and attaches it automatically — call sites never handle the token directly.

A request with a missing/invalid/expired token gets `401 { "error": "Unauthorized" }`.

**Cognito env vars** (server): `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, `COGNITO_REGION`
**Cognito env vars** (client, CRA-prefixed): `REACT_APP_COGNITO_USER_POOL_ID`, `REACT_APP_COGNITO_CLIENT_ID`, `REACT_APP_COGNITO_REGION`

---

## 2. Expenses

`server/routes/expenses.js`, mounted at `/api/expenses`. Backed by the `expenses` table.

### `GET /api/expenses`
Returns every expense for `req.uid`, ordered by `expense_date DESC, created_at DESC`.

### `POST /api/expenses`
Body: `{ title, amount, category, date, notes? }`. `400` if `title`/`category`/`date` are missing or `amount` isn't a positive number. Returns the created row (`201`).

### `PUT /api/expenses/:id`
Body: any subset of `{ title, amount, category, date, notes }` — omitted fields are left unchanged (`COALESCE` against the existing row). `404` if the id doesn't belong to `req.uid`.

### `DELETE /api/expenses/:id`
`204` on success, `404` if not found/not owned.

---

## 3. Categories

`server/routes/categories.js`, mounted at `/api/categories`. Backed by the `categories` table (custom categories only — the 7 defaults are not rows in this table; see [Data Shapes](#category)).

### `GET /api/categories`
Returns `{ id, name }[]` for `req.uid`'s custom categories, alphabetical.

### `POST /api/categories`
Body: `{ name }`. `409` if a category with that name already exists for this user (unique constraint on `(user_id, name)`).

### `PUT /api/categories/:id`
Body: `{ name }` (the new name). Runs as a SQL transaction: renames the category row **and** cascades the new name onto every expense that referenced the old one (`UPDATE expenses SET category_name = ... WHERE user_id = ... AND category_name = <old name>`). `404` if not found/not owned.

### `POST /api/categories/reassign`
Body: `{ categoryName }`. Reassigns every expense in that category to `"Other"` without deleting anything from the `categories` table — used when hiding one of the 7 *default* categories, since defaults were never rows here.

### `DELETE /api/categories/:id`
Deletes the category and reassigns its expenses to `"Other"`, in one transaction. `204` on success, `404` if not found/not owned.

---

## 4. Budgets

`server/routes/budgets.js`, mounted at `/api/budgets`. Backed by `budgets` (one row per user, overall monthly limit) and `budget_category_limits` (one row per user+category).

### `GET /api/budgets`
Shaped like the old Firestore budgets doc for a direct comparison:
```json
{ "monthly": 2000, "categories": { "Food": 400, "Rent": 1200 } }
```

### `PUT /api/budgets/monthly`
Body: `{ monthly }` (or `null` to clear). Upserts the overall limit.

### `PUT /api/budgets/categories/:categoryName`
Body: `{ amount }`. `amount` empty/`null` **deletes** that category's limit row; otherwise upserts it.

> "Goals" (on the Goals page) are not a separate table — they're just categories with a `budget_category_limits` row where `monthly_limit > 0`, same derived pattern as the original Firestore design.

---

## 5. Settings

`server/routes/settings.js`, mounted at `/api/settings`. Backed by `settings` (currency/date-filter prefs) and `preferences` (hidden default categories) — combined into one response since the frontend always reads them together.

### `GET /api/settings`
```json
{ "currency": "USD", "homeCurrency": "USD", "defaultDateFilter": null, "hiddenDefaultCategories": [] }
```

### `PUT /api/settings`
Body: any subset of `{ currency, homeCurrency, defaultDateFilter }` — partial-update semantics (like Firestore's old `{ merge: true }`); omitted fields are left alone, not reset.

### `POST /api/settings/hide-category`
Body: `{ categoryName }`. Appends to `hidden_default_categories` only if not already present (mirrors Firestore's `arrayUnion`, done in one query rather than a read-then-write).

---

## 6. AI Endpoints

`server/routes/ai.js`, mounted at `/api/ai`. Full design detail (tool-calling loop, prompt structure, model fallback chain, rate limiting) is in [`Documents/AI_Chat_Feature.md`](AI_Chat_Feature.md) — this section covers just the request/response contract.

### `POST /api/ai/chat`
Body:
```json
{ "message": "what's my total spending this month?", "sessionDateRange": { "label": "...", "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" } | null, "currencyInfo": { "homeCurrency": "USD", "homeSymbol": "$", "displayCurrency": "USD", "displaySymbol": "$", "liveRates": {...} } | null }
```

The server classifies intent and, when it needs real data (a spending total, an expense's actual id, a category's actual id, a budget's current amount), calls one of 6 SQL-backed tools scoped to `req.uid` before answering — see `server/services/aiTools.js`. Response shape:

```ts
{
  intent: "ADD_EXPENSE" | "ADD_MULTIPLE_EXPENSES" | "ADD_CATEGORY" | "DELETE_EXPENSE"
        | "EDIT_EXPENSE" | "DELETE_CATEGORY" | "EDIT_CATEGORY" | "SET_BUDGET"
        | "REMOVE_BUDGET" | "QUERY" | "ASK_DATE_RANGE" | "SET_DATE_RANGE"
        | "CURRENCY_CONVERT" | "CHAT",
  message: string,
  expenseData?, expensesData?, categoryData?, deleteExpenseData?,
  editExpenseData?, deleteCategoryData?, editCategoryData?, dateRange?, budgetData?
}
```
(Field shapes match the AI-driven mutation payloads described under each resource above — an `expenseData` here has the same shape as a `POST /api/expenses` body, etc.)

**Rate limit**: `429` with `{ "error": "Daily AI limit of 50 requests reached. Resets at midnight." }` once `req.uid` has made 50 requests today (tracked in the `ai_usage` table, shared between `/chat` and `/summary`).

**Upstream failures**: if every model in the fallback chain fails, the client gets `{ "error": "BudgetBuddy AI is busy right now (upstream model overloaded or rate-limited). Please try again in a moment." }` — Google's raw error text is logged server-side only, never forwarded to the client.

### `POST /api/ai/summary`
Body: `{ expenses: {title, amount, category, date}[], filterLabel, currencyInfo }` — used by the Reports page's AI paragraph. No tools, one Gemini call. Response: `{ "summary": "<3-4 sentence paragraph>" }`.

---

## 7. Data Shapes Reference

Full DDL in [`schema.sql`](../schema.sql) at the project root.

### `users`
```ts
{ id: string /* Cognito sub */, email: string, display_name: string | null, created_at: timestamptz }
```

### `Expense` (`expenses` table; API shape after the column-alias mapping in `expenses.js`)
```ts
{
  id:        number,   // SERIAL
  title:     string,
  amount:    number,   // NUMERIC(12,2), parsed to a real JS number by a pg type parser (server/db.js)
  category:  string,   // aliased from category_name — free text, not a foreign key
  date:      string,   // "YYYY-MM-DD", aliased from expense_date — returned as a raw string
                        // by a pg type parser (server/db.js) to avoid timezone-shifting the date
  notes:     string | null,
}
```

### `Category` (`categories` table — custom categories only)
```ts
{ id: number, name: string }
```
The 7 built-in defaults (`Food`, `Transport`, `Entertainment`, `Utilities`, `Rent`, `Shopping`, `Other`) are **not** rows in this table — they're a hardcoded list (`src/utils/getCategoryIcon.js` on the client, `server/constants.js` on the server) that every user has automatically.

### `UserSettings`
```ts
{ currency: string, homeCurrency: string, defaultDateFilter: string | null, hiddenDefaultCategories: string[] }
```

### `DateRange` (AI chat session state, not persisted)
```ts
{ label: string, from: string /* YYYY-MM-DD */, to: string /* YYYY-MM-DD */ }
```

---

## 8. Error Shape

Every error response is `{ "error": "<message>" }`. The Express error middleware (`server/index.js`) only forwards a specific message when the thrown error intentionally set `err.status` (e.g. the AI rate limit, a missing config value); anything unexpected (a raw DB/driver error) is hidden behind a generic `500 { "error": "Internal server error" }` so internals never leak to the client. Full detail is always logged server-side via `console.error`.

---

> 📋 **Related documents**:
> - [`Documents/AI_Chat_Feature.md`](AI_Chat_Feature.md) — end-to-end AI chat flow, tool-calling design, and prompt structure
> - [`ROADMAP.md`](../ROADMAP.md) — the Firebase → AWS/Postgres/Cognito/RAG migration history and current known limitations
> - [`schema.sql`](../schema.sql) — full Postgres schema
