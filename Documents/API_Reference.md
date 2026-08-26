# API Reference — Budget Buddy

**Project**: Budget Buddy  
**Last Updated**: August 26, 2026  
**Purpose**: Complete reference for all external API calls and internal service functions

Budget Buddy has two API surfaces:
1. **Google Gemini API** — the external AI REST endpoint called from `src/services/aiService.js`
2. **Firebase/Firestore functions** — the internal database service in `src/services/database.js`

---

## Table of Contents

1. [Google Gemini API](#1-google-gemini-api)
   - [1.1 Endpoint](#11-endpoint)
   - [1.2 Authentication](#12-authentication)
   - [1.3 `processMessage()` — Chat intent classification](#13-processmessage--chat-intent-classification)
   - [1.4 `generateSummary()` — Reports AI paragraph](#14-generatesummary--reports-ai-paragraph)
   - [1.5 Error handling and rate limiting](#15-error-handling-and-rate-limiting)
2. [Firestore Database Functions](#2-firestore-database-functions)
   - [2.1 Expense operations](#21-expense-operations)
   - [2.2 Category operations](#22-category-operations)
   - [2.3 User settings](#23-user-settings)
3. [Data Shapes Reference](#3-data-shapes-reference)

---

## 1. Google Gemini API

**File**: `src/services/aiService.js`  
**Documentation**: [`Documents/AI_Chat_Feature.md`](AI_Chat_Feature.md)

### 1.1 Endpoint

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=<REACT_APP_GEMINI_API_KEY>
```

| Field | Value |
|-------|-------|
| Model | `gemini-3.6-flash` |
| API version | `v1beta` |
| Auth method | API key as URL query param (`?key=…`) |
| Content-Type | `application/json` |

### 1.2 Authentication

The key is read from `process.env.REACT_APP_GEMINI_API_KEY` (set in `.env`, never committed). If the key is missing or equals the placeholder string `YOUR_GEMINI_KEY_HERE`, the service throws immediately before making any network call.

To get a free key: [Google AI Studio](https://aistudio.google.com/) → Create API Key.

---

### 1.3 `processMessage()` — Chat intent classification

**Signature**:
```js
processMessage(
  userMessage:     string,
  expenses:        Expense[],       // user's current expense list
  customCategories: Category[],     // user's custom categories
  sessionDateRange: DateRange | null // the chat's active date range, or null
) → Promise<IntentResponse>
```

**Request body sent to Gemini**:
```json
{
  "contents": [
    { "parts": [{ "text": "<full prompt string>" }] }
  ],
  "generationConfig": {
    "temperature": 0.2,
    "maxOutputTokens": 512,
    "responseMimeType": "application/json"
  }
}
```

**What the prompt includes**:

| Section | Content |
|---------|---------|
| Today's date | `YYYY-MM-DD` — lets the model interpret "yesterday", "last Monday" |
| Session date range | Active range, or instruction to use `ASK_DATE_RANGE` if no range is set |
| Spending summary | Pre-aggregated stats over all filtered records: `grandTotal`, `avgPerTransaction`, `dailyAvg`, `spendingByCategory`, `spendingByMonth`, `spendingByCategoryMonth`, `countByCategory`, `countByMonth`, `largestExpense` |
| Recent expenses | Last ≤50 individual records with Firestore IDs (for EDIT/DELETE matching) |
| Available categories | Default list + user's custom categories with IDs |
| Task + rules | Intent classification instructions, fuzzy-matching rules, output format |
| User message | The raw message string |

**Response** from Gemini (`candidates[0].content.parts[0].text`):

The model returns raw JSON (enforced by `responseMimeType: "application/json"`). A regex fallback `(/\{[\s\S]*\}/)` handles rare cases where the model wraps output in markdown code fences.

**`IntentResponse` shape**:

```ts
{
  intent: "ADD_EXPENSE" | "EDIT_EXPENSE" | "DELETE_EXPENSE"
        | "ADD_CATEGORY" | "EDIT_CATEGORY" | "DELETE_CATEGORY"
        | "QUERY" | "ASK_DATE_RANGE" | "SET_DATE_RANGE" | "CHAT",
  message: string,                // friendly 1-3 sentence response shown to the user

  // Only present when intent === "ADD_EXPENSE"
  expenseData?: {
    title:    string,
    amount:   number,
    category: string,
    date:     string   // "YYYY-MM-DD"
  },

  // Only present when intent === "EDIT_EXPENSE"
  editExpenseData?: {
    id:       string,  // Firestore document ID
    title:    string,  // original title (for the confirmation card display)
    amount:   number,  // original amount
    category: string,  // original category
    date:     string,  // original date
    updates: {         // only the fields being changed
      title?:    string,
      amount?:   number,
      category?: string,
      date?:     string
    }
  },

  // Only present when intent === "DELETE_EXPENSE"
  deleteExpenseData?: {
    id:       string,
    title:    string,
    amount:   number,
    category: string,
    date:     string
  },

  // Only present when intent === "ADD_CATEGORY"
  categoryData?: {
    name: string   // properly capitalised
  },

  // Only present when intent === "EDIT_CATEGORY"
  editCategoryData?: {
    id:      string,  // Firestore document ID
    name:    string,  // current name
    newName: string   // proposed new name
  },

  // Only present when intent === "DELETE_CATEGORY"
  deleteCategoryData?: {
    id:   string,
    name: string
  },

  // Only present when intent === "SET_DATE_RANGE"
  dateRange?: {
    label: string,  // human-friendly label, e.g. "last month", "July 2026"
    from:  string,  // "YYYY-MM-DD"
    to:    string   // "YYYY-MM-DD"
  }
}
```

**How `AIChat.jsx` uses the response**:

| intent | UI action |
|--------|-----------|
| `ADD_EXPENSE` | Renders a confirmation card; user clicks "Add Expense" → `addExpense()` |
| `EDIT_EXPENSE` | Renders a confirmation card with old + new values; user clicks "Save Changes" → `updateExpense()` |
| `DELETE_EXPENSE` | Renders a danger confirmation card; user clicks "Delete Expense" → `deleteExpense()` |
| `ADD_CATEGORY` | Renders a confirmation card; user clicks "Add Category" → `addCategory()` |
| `EDIT_CATEGORY` | Renders a confirmation card; user clicks "Rename" → `updateCategory()` |
| `DELETE_CATEGORY` | Renders a danger confirmation card; user clicks "Delete Category" → `deleteCategory()` |
| `SET_DATE_RANGE` | Sets `sessionDateRange` state in `AIChat.jsx` (chat-internal only) |
| `ASK_DATE_RANGE` | Renders a date range picker card with 6 presets; user's pick re-runs the original question |
| `QUERY` | Displays `message` as a plain chat bubble |
| `CHAT` | Displays `message` as a plain chat bubble |

---

### 1.4 `generateSummary()` — Reports AI paragraph

**Signature**:
```js
generateSummary(
  expenses:    Expense[],  // array to summarise (up to last 200 used)
  filterLabel: string      // human-readable label for the period, e.g. "This Month"
) → Promise<string>
```

**Request body**:
```json
{
  "contents": [
    { "parts": [{ "text": "<prompt>" }] }
  ],
  "generationConfig": {
    "temperature": 0.4,
    "maxOutputTokens": 256
  }
}
```

Note: No `responseMimeType` — the response is a plain text paragraph, not JSON.

**Prompt asks the model to write a 3–4 sentence paragraph that**:
1. States the total spent and the period.
2. Identifies the top spending category and any notable pattern.
3. Gives one specific, actionable suggestion to reduce spending.

**Returns**: A plain text string (the paragraph). Used directly by the Reports page as a human-readable AI insight.

**Counts toward the same 50-request/day limit as `processMessage`.**

---

### 1.5 Error handling and rate limiting

#### Daily limit
- **50 requests per user per day**, tracked in `localStorage` under `bb_ai_usage`.
- Shape: `{ date: "YYYY-MM-DD", count: number }`.
- The counter resets when `date` no longer equals today. If `count >= 50`, an error is thrown before the network call: `"Daily AI limit of 50 requests reached. Resets at midnight."`.

#### 429 retry logic
When Gemini returns HTTP 429 (rate limit exceeded), the service retries up to 3 times with increasing delays:

| Attempt | Delay before retry |
|---------|--------------------|
| 1st | 5 000 ms (5 s) |
| 2nd | 15 000 ms (15 s) |
| 3rd | 30 000 ms (30 s) |
| 4th (final) | No more retries — surface the error |

If after 4 total attempts the response is still 429, the error is thrown as: `"Too many requests right now — please wait a moment and try again."`

#### Other HTTP errors
Non-429 errors are thrown immediately using the message from `error.error.message` in the response body, or a generic `Gemini API error {status}` fallback.

---

## 2. Firestore Database Functions

**File**: `src/services/database.js`  
**Firestore path pattern**: `users/{userId}/{collection}/{docId}`

All functions require a `userId` (from `currentUser.uid` in `AuthContext`). Firestore Security Rules enforce that users can only read/write their own subcollections.

---

### 2.1 Expense operations

#### `addExpense(userId, expenseData) → Promise<string>`

Creates a new expense document.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | ✅ | Firebase Auth UID |
| `expenseData.title` | string | ✅ | Expense title |
| `expenseData.amount` | number | ✅ | Amount in dollars |
| `expenseData.category` | string | ✅ | Category name |
| `expenseData.date` | string | ✅ | `"YYYY-MM-DD"` |

**Returns**: The Firestore document ID of the created expense.  
**Adds automatically**: `userId`, `createdAt` (serverTimestamp), `updatedAt` (serverTimestamp).  
**Throws**: If any required field is missing, or on Firestore error.

---

#### `getExpenses(userId) → Promise<Expense[]>`

Fetches all expenses for the user, ordered by `createdAt` descending (newest first).

| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | string | ✅ |

**Returns**: Array of expense objects, each with `id` (Firestore doc ID) plus all stored fields.

---

#### `updateExpense(userId, expenseId, updateData) → Promise<void>`

Partially updates an existing expense.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | ✅ | Firebase Auth UID |
| `expenseId` | string | ✅ | Firestore document ID |
| `updateData` | object | ✅ | Fields to update (only changed fields needed) |

**Adds automatically**: `updatedAt` (serverTimestamp).

---

#### `deleteExpense(userId, expenseId) → Promise<void>`

Permanently deletes an expense.

| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | string | ✅ |
| `expenseId` | string | ✅ |

---

#### `subscribeToExpenses(userId, callback) → unsubscribeFn`

Sets up a real-time Firestore listener for all expenses. Fires immediately with current data, then again on every change.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | ✅ | Firebase Auth UID |
| `callback` | `(expenses: Expense[], error?) => void` | ✅ | Called with updated data. On error: `callback(null, error)` |

**Returns**: An `unsubscribe` function. Call it on component unmount to stop the listener.  
**Order**: Expenses ordered by `createdAt` descending.

---

#### `subscribeToExpensesByCategory(userId, category, callback) → unsubscribeFn`

Real-time listener filtered to a single category.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | ✅ | Firebase Auth UID |
| `category` | string | ✅ | Category name to filter by |
| `callback` | `(expenses: Expense[], error?) => void` | ✅ | On error: `callback([], error)` |

**Returns**: An `unsubscribe` function.

---

### 2.2 Category operations

#### `addCategory(userId, categoryData) → Promise<string>`

Creates a new custom category.

| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | string | ✅ |
| `categoryData.name` | string | ✅ |
| `categoryData.color` | string | — (optional) |

**Returns**: Firestore document ID of the created category.

---

#### `getCategories(userId) → Promise<Category[]>`

Fetches all custom categories for the user.

**Returns**: Array of category objects with `id` plus stored fields.

---

#### `updateCategory(userId, categoryId, updateData) → Promise<void>`

Partially updates a category (e.g. rename).

| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | string | ✅ |
| `categoryId` | string | ✅ |
| `updateData` | `{ name?: string }` | ✅ |

---

#### `deleteCategory(userId, categoryId) → Promise<void>`

Permanently deletes a custom category.

| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | string | ✅ |
| `categoryId` | string | ✅ |

---

#### `subscribeToCategories(userId, callback) → unsubscribeFn`

Real-time listener for all custom categories.

| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | string | ✅ |
| `callback` | `(categories: Category[], error?) => void` | ✅ |

**Returns**: An `unsubscribe` function.

---

### 2.3 User settings

Stored at `users/{userId}/settings/preferences` (a single Firestore document, not a collection).

#### `getUserSettings(userId) → Promise<UserSettings>`

Reads the user's saved preferences.

| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | string | ✅ |

**Returns**: `{}` if no preferences have been saved yet. Never throws — errors are caught and return `{}`.

---

#### `saveUserSettings(userId, settings) → Promise<void>`

Merges new preferences into the existing document (uses `setDoc` with `{ merge: true }` — existing keys not in `settings` are preserved).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | ✅ | Firebase Auth UID |
| `settings` | `{ defaultDateFilter?: string }` | ✅ | Fields to save |

**Throws**: On Firestore error.

---

## 3. Data Shapes Reference

### `Expense` (stored in Firestore)

```ts
{
  id:        string,   // Firestore document ID (added on read)
  title:     string,
  amount:    number,
  category:  string,
  date:      string,   // "YYYY-MM-DD"
  userId:    string,   // added automatically by addExpense()
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `Category` (stored in Firestore)

```ts
{
  id:        string,   // Firestore document ID (added on read)
  name:      string,
  userId:    string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `UserSettings` (stored in Firestore)

```ts
{
  defaultDateFilter?: "today" | "thisWeek" | "thisMonth" | "lastMonth"
                    | "thisYear" | "lastYear" | "all"
}
```

### `DateRange` (AI chat session state, not persisted)

```ts
{
  label: string,   // human-friendly label, e.g. "last month"
  from:  string,   // "YYYY-MM-DD"
  to:    string    // "YYYY-MM-DD"
}
```

### Date filter keys (used in `useDateFilter` and `DateFilterBar`)

| Key | Description |
|-----|-------------|
| `today` | Current calendar day |
| `thisWeek` | Monday to today (ISO week) |
| `thisMonth` | 1st of current month to today |
| `lastMonth` | Full previous calendar month |
| `pickMonth` | User-selected month from a dropdown (stored in `pickedMonth: "YYYY-MM"`) |
| `thisYear` | Jan 1 of current year to today |
| `lastYear` | Full previous calendar year |
| `all` | All time (no date restriction) |
| `custom` | User-specified `startDate`/`endDate` pair |

---

> 📋 **Related documents**:
> - [`Documents/AI_Chat_Feature.md`](AI_Chat_Feature.md) — end-to-end AI chat flow and prompt design
> - [`Documents/Architecture_Diagrams.md`](Architecture_Diagrams.md) — system architecture and Firestore structure
> - [`Documents/Naming_Conventions_Summary.md`](Naming_Conventions_Summary.md) — function and variable naming patterns
