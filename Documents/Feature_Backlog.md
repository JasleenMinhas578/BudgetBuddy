# BudgetBuddy — Feature Backlog

Features identified for future development. Ordered roughly by impact vs. effort.

---

## ✅ Already Implemented

| Feature | Where |
|---------|-------|
| AI chat widget (add expenses in plain English, query spending) | `src/components/AI/AIChat.jsx` |
| AI spending summary on Reports page | `src/components/Dashboard/Reports.jsx` |
| CSV export on Reports page | `src/components/Dashboard/Reports.jsx` — `exportToCSV()` |
| PDF export on Reports page | `src/components/Dashboard/Reports.jsx` — `generatePDF()` |
| Date filter (this month, last month, custom range, etc.) | `src/hooks/useDateFilter.js` |
| Pagination on Expenses and Reports | `src/components/UI/Pagination.jsx` |

---

## 🔜 To Do

### 1. Budget Limits per Category — HIGH PRIORITY

**What:** Let users set a monthly spending cap for each category (e.g. Food: $300). Show a progress bar and a warning when they're close to or over the limit.

**Why it matters:** The most common personal finance feature. Without it, the app shows what was spent but doesn't help users stay on target.

**What to build:**
- A "Budget Limits" settings screen (or a modal on the Dashboard)
- Firestore path: `users/{userId}/budgets/{categoryName}` — store `{ limit: 300, category: 'Food' }`
- On the Dashboard, a budget progress card for each category that has a limit set
- Warning state: yellow at 80%, red at 100%

**Rough effort:** Medium — 2–3 days

---

### 2. Expense Search & Filters — HIGH PRIORITY

**What:** On the Expenses page, allow filtering by category, date range, and amount. A text search bar to find expenses by title.

**Why it matters:** Once a user has 50+ expenses, scrolling through the table is the only option — filtering is essential.

**What to build:**
- Search input that filters `expenses` state client-side (no extra Firestore query needed)
- Category dropdown filter
- Amount range inputs (min / max)
- Clear filters button

**Rough effort:** Low-Medium — 1–2 days

---

### 3. Recurring Expenses — MEDIUM PRIORITY

**What:** Flag an expense as recurring (weekly / monthly). The app auto-logs it each period.

**Why it matters:** Reduces friction for fixed costs like rent, subscriptions, gym membership.

**What to build:**
- `isRecurring: true` and `recurrenceInterval: 'monthly' | 'weekly'` fields on the expense document
- A background check (or Firebase Scheduled Function / Cloud Function) that logs the expense on the due date
- A "Recurring" badge in the Expenses table

**Rough effort:** High — involves either a backend Cloud Function or a client-side "check on login" approach. Good project to learn Firebase Cloud Functions.

---

### 4. Income Tracking — MEDIUM PRIORITY

**What:** Add an "Income" section so users can log salary, freelance, etc. Show net savings (income minus expenses) on the Dashboard.

**Why it matters:** Turns BudgetBuddy from an expense tracker into a full budget tool.

**What to build:**
- New Firestore collection: `users/{userId}/income`
- An "Add Income" form (similar to the existing Add Expense form)
- A "Net Savings" card on the Dashboard: `total income − total expenses`
- Income tab or section in Reports

**Rough effort:** Medium — structure is nearly identical to the existing expenses feature, just a new collection and a few new UI cards.

---

## Notes

- All new Firestore paths should follow the existing pattern: `users/{userId}/{collection}/{docId}`
- New features that add data should include a delete option so users can fix mistakes
- Any feature that sends data outside the app (like Income if added to AI prompts) should be noted in `Documents/AI_Chat_Feature.md`
