# BudgetBuddy — Feature Backlog

Features identified for future development. Ordered roughly by impact vs. effort.

---

## ✅ Already Implemented

| Feature | Where |
|---------|-------|
| AI chat — add, edit, delete expenses in plain English | `src/components/AI/AIChat.jsx` |
| AI chat — add, rename, delete custom categories in plain English | `src/components/AI/AIChat.jsx` |
| AI chat — natural-language spending queries (totals, averages, top category, etc.) | `src/services/aiService.js` → `processMessage()` |
| AI chat — set a session date range via chat (e.g. "show me last month") | `src/hooks/useAIChat.js` — `sessionDateRange` state |
| AI chat — date range picker UI card (preset buttons: Today, This Week, etc.) | `src/hooks/useAIChat.js` — `handlePickDateRange` + `ChatMessage.jsx` |
| AI chat — pending action reminder (notifies user of unconfirmed cards) | `src/hooks/useAIChat.js` — `getPendingReminder()` |
| AI chat — daily rate limit (50 requests/day, tracked in localStorage) | `src/services/aiService.js` — `checkAndIncrementUsage()` |
| AI chat — chat history persisted in sessionStorage (survives page refresh) | `src/hooks/useAIChat.js` — `sessionStorage` read/write |
| AI spending summary paragraph on Reports page | `src/services/aiService.js` → `generateSummary()` |
| CSV export on Reports page | `src/components/Dashboard/Reports.jsx` — `exportToCSV()` |
| PDF export on Reports page | `src/components/Dashboard/Reports.jsx` — `generatePDF()` |
| Date filter bar (today, this week, this month, last month, select month, this year, last year, all time, custom range) | `src/hooks/useDateFilter.js` + `src/components/UI/DateFilterBar.jsx` |
| Shared date filter across all dashboard views (via DateRangeContext) | `src/context/DateRangeContext.js` |
| Select Month filter (pick any specific month from a dropdown) | `src/components/UI/DateFilterBar.jsx` — `pickMonth` filter key |
| User Settings page (display name, password reset, default date range) | `src/components/Dashboard/Settings.jsx` |
| Default date range preference saved to Firestore, applied on login | `src/context/DateRangeContext.js` + `src/services/settingsService.js` — `saveUserSettings()` |
| Display name collected on signup and saved to Firebase profile | `src/components/Auth/Signup.jsx` |
| Sortable expense table with column-level sort | `src/components/UI/ExpenseTable.jsx` |
| Pagination on Expenses and Reports | `src/components/UI/Pagination.jsx` |
| Budget limits per category — monthly spending caps with real-time progress bars and on-track / near-limit / over-budget alerts | `src/services/budgetService.js`, `src/hooks/useBudgets.js`, `src/components/Goals/`, `src/components/BudgetProgressPanel/` |
| Global live search — Navbar search bar with real-time expense and category results, text highlighting, and direct navigation | `src/hooks/useGlobalSearch.js`, `src/components/UI/SearchDropdown.jsx` |
| Multi-currency support — home + display currency picker in Settings with live exchange rates and fallback rates | `src/utils/currencyUtils.js`, `src/context/CurrencyContext.jsx`, `src/components/Settings/CurrencyCard.jsx` |
| Expense page filters — date filter bar, category filter dropdown, and search by title/category/amount | `src/components/Dashboard/Expenses.jsx`, `src/components/UI/ExpenseTable.jsx` |

---

## 🔜 To Do

### 1. Recurring Expenses — MEDIUM PRIORITY

**What:** Flag an expense as recurring (weekly / monthly). The app auto-logs it each period.

**Why it matters:** Reduces friction for fixed costs like rent, subscriptions, gym membership.

**What to build:**
- `isRecurring: true` and `recurrenceInterval: 'monthly' | 'weekly'` fields on the expense document
- A background check (or Firebase Scheduled Function / Cloud Function) that logs the expense on the due date
- A "Recurring" badge in the Expenses table

**Rough effort:** High — involves either a backend Cloud Function or a client-side "check on login" approach. Good project to learn Firebase Cloud Functions.

---

### 2. Income Tracking — MEDIUM PRIORITY

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
