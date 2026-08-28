# BudgetBuddy — Next Up

Two features to build next, in order of effort. Each section has a full implementation plan you can follow step by step against the real codebase.

---

## 1. Income Tracking — MEDIUM EFFORT (~2–3 days)

### What it does
Let users log income sources (salary, freelance, etc.) and show a **Net Savings** card on the Dashboard (`total income − total expenses`).

### Why build this first
The code structure is almost identical to the existing expenses feature. Same Firestore pattern, same hook shape — you're mostly copy-adapting, not designing from scratch.

---

### Files to create

| File | What it does |
|------|-------------|
| `src/services/incomeService.js` | Firestore CRUD for income (mirrors `src/services/expenseService.js`) |
| `src/hooks/useIncome.js` | Real-time income listener (mirrors `src/hooks/useExpenses.js`) |
| `src/components/Income/IncomeForm.jsx` | Add/edit income form (mirrors `src/components/Expense/ExpenseForm.jsx`) |
| `src/components/Dashboard/Income.jsx` | Income page (mirrors `src/components/Dashboard/Expenses.jsx`) |

### Files to modify

| File | What changes |
|------|-------------|
| `src/components/DashboardOverview/SummaryCards.jsx` | Add a 5th "Net Savings" card; accept a new `totalIncome` prop |
| `src/components/Dashboard/DashboardOverview.jsx` | Import `useIncome`, compute `totalIncome`, pass it to `SummaryCards` |
| `src/components/Layout/Sidebar.jsx` | Add Income to the `navItems` array |
| `src/App.js` | Add `income` nested route inside the dashboard block |

---

### Step-by-step plan

**Step 1 — Firestore service (`src/services/incomeService.js`)**

Model it exactly on `src/services/expenseService.js`. The Firestore path is `users/{userId}/income/{docId}`.

Each income document shape:
```js
{
  title: "August salary",
  amount: 3000,                 // positive number
  category: "Salary",           // from a fixed list (see Step 3)
  date: "2026-08-25",          // ISO date string "yyyy-MM-dd"
  notes: "",                    // optional
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
}
```

Functions to write — copy the structure from `expenseService.js` and swap `expenses` → `income`:
- `addIncome(userId, incomeData)` — validates title, amount > 0, date are present
- `updateIncome(userId, incomeId, updateData)`
- `deleteIncome(userId, incomeId)`
- `subscribeToIncome(userId, callback)` — uses `orderBy('createdAt', 'desc')`, same as `subscribeToExpenses`

Import `snapshotToArray` from `src/utils/firebaseUtils.js` — it's a shared helper that converts a Firestore snapshot into a plain array.

**Step 2 — Real-time hook (`src/hooks/useIncome.js`)**

Copy `src/hooks/useExpenses.js` and change two things:
- Import `subscribeToIncome` instead of `subscribeToExpenses`
- Return `{ income, loading, error }` instead of `{ expenses, loading, error }`

```js
import { subscribeToIncome } from '../services/incomeService';
// ... rest is identical to useExpenses.js
return { income, loading, error };
```

**Step 3 — Income form (`src/components/Income/IncomeForm.jsx`)**

Copy `src/components/Expense/ExpenseForm.jsx`. Key differences:
- Replace the `CategoryDropdown` with a simple `<select>` of fixed income categories: `Salary`, `Freelance`, `Gift`, `Investment`, `Other`
- Remove the `suggestCategory` import and suggestion logic (that's expense-only)
- Call `addIncome` / `updateIncome` instead of `addExpense` / `updateExpense`
- Change the button label from "Add Expense" → "Add Income"
- Default `category` state to `'Salary'` instead of `'Food'`

**Step 4 — Income page (`src/components/Dashboard/Income.jsx`)**

Copy `src/components/Dashboard/Expenses.jsx`. Key changes:
- Import `useIncome` instead of `useExpenses`
- Import `addIncome`, `updateIncome`, `deleteIncome` instead of expense equivalents
- Pass `income` (not expenses) everywhere
- Update page title: "Income" / "Track your income sources"
- The `ExpenseTable` component is generic enough to reuse — it just renders rows

**Step 5 — Net Savings card on Dashboard**

There are two files to touch:

`src/components/DashboardOverview/SummaryCards.jsx` — add a new prop and a new card:
```jsx
// Add to the function signature:
export default function SummaryCards({ totalSpent, totalIncome, averageExpense, ... }) {

// Add a new card (after the existing 4):
<div className="summary-card">
  <div className="card-icon"><LuTrendingDown size={26} /></div>  {/* or LuPiggyBank */}
  <div className="card-content">
    <h3>Net Savings</h3>
    <p className="card-amount" style={{ color: totalIncome - totalSpent >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
      {formatAmount(totalIncome - totalSpent)}
    </p>
    <p className="card-subtitle">Income minus expenses</p>
  </div>
</div>
```

`src/components/Dashboard/DashboardOverview.jsx` — import the hook and pass the prop:
```js
import { useIncome } from '../../hooks/useIncome';
// inside the component:
const { income } = useIncome();
const totalIncome = income.reduce((sum, i) => sum + (typeof i.amount === 'number' ? i.amount : 0), 0);
// then pass to SummaryCards:
<SummaryCards totalIncome={totalIncome} ... />
```

**Step 6 — Sidebar nav (`src/components/Layout/Sidebar.jsx`)**

The sidebar uses a `navItems` array at the top. Add one entry:
```js
import { LuWallet } from 'react-icons/lu';  // add to existing import

const navItems = [
  { path: '/dashboard',            label: 'Dashboard',  Icon: LuLayoutDashboard },
  { path: '/dashboard/expenses',   label: 'Expenses',   Icon: LuCreditCard,   addAction: 'expense' },
  { path: '/dashboard/income',     label: 'Income',     Icon: LuWallet },       // ← add this
  { path: '/dashboard/categories', label: 'Categories', Icon: LuTag,          addAction: 'category' },
  { path: '/dashboard/goals',      label: 'Goals',      Icon: LuTarget },
];
```

**Step 7 — Router (`src/App.js`)**

The dashboard uses nested routes (all under `/dashboard`). Add one line inside the existing dashboard block:
```jsx
import Income from './components/Dashboard/Income';   // add this import

// inside the <Route path="/dashboard"> block:
<Route path="income" element={<Income />} />
```

**Step 8 — Test manually**
- Add an income entry → verify it appears in the Income page list
- Add expenses → verify Net Savings card on Dashboard updates correctly
- Net Savings should be green when income > expenses, red otherwise
- Delete an income entry → verify Net Savings recalculates
- Reload the page → verify income data persists (real-time listener rehydrates from Firestore)

---

## 2. Recurring Expenses — HIGH EFFORT (~4–5 days)

### What it does
Let users flag an expense as recurring (weekly or monthly). The app auto-logs a copy on each due date.

### Why it's harder
The form change is straightforward. The auto-logging logic requires a "check on startup" function that reads recurring rules and creates new expense entries for any that are overdue. No Firebase Cloud Functions needed for v1 — runs client-side when the user opens the app.

---

### Files to create

| File | What it does |
|------|-------------|
| `src/services/recurringService.js` | Firestore CRUD for recurring rules + the due-date check logic |
| `src/hooks/useRecurringCheck.js` | Runs the due-date check once on startup when user is authenticated |
| `src/components/Recurring/RecurringList.jsx` | Lists active recurring rules with edit/delete |

### Files to modify

| File | What changes |
|------|-------------|
| `src/components/Expense/ExpenseForm.jsx` | Add "Make recurring" toggle + weekly/monthly interval picker |
| `src/pages/Dashboard.jsx` | Call `useRecurringCheck()` so the check runs once the user is in the dashboard |
| `src/components/UI/ExpenseTable.jsx` | Optionally show a "↻" badge on expenses that were auto-generated by a rule |

---

### Step-by-step plan

**Step 1 — Data model**

Two Firestore paths:

`users/{userId}/recurring/{ruleId}` — the rule:
```js
{
  title: "Netflix",
  amount: 15.99,
  category: "Entertainment",
  interval: "monthly",          // "weekly" | "monthly"
  nextDueDate: "2026-09-01",   // ISO date string; updated after each auto-log
  createdAt: serverTimestamp(),
}
```

When a rule fires it creates a normal expense in `users/{userId}/expenses/{docId}` with one extra field:
```js
{
  title: "Netflix",
  amount: 15.99,
  category: "Entertainment",
  date: "2026-09-01",          // the nextDueDate from the rule
  recurringRuleId: "ruleId123", // links this expense back to the rule
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
}
```

**Step 2 — Recurring service (`src/services/recurringService.js`)**

Functions to write:

```js
// Add a new recurring rule
export const addRecurringRule = async (userId, ruleData) => { ... }

// Delete a rule (stops future auto-logs; does NOT delete past expenses)
export const deleteRecurringRule = async (userId, ruleId) => { ... }

// Subscribe to all rules (for RecurringList)
export const subscribeToRecurring = (userId, callback) => { ... }

// The main check: reads all rules, logs expenses for any that are overdue
export const checkAndLogDueRecurring = async (userId) => {
  // 1. Fetch all rules in users/{userId}/recurring
  // 2. For each where nextDueDate <= today:
  //    a. Call addExpense(userId, { title, amount, category, date: nextDueDate, recurringRuleId })
  //    b. Compute the next due date (add 7 days for weekly, 1 month for monthly)
  //    c. Update the rule's nextDueDate field in Firestore
}
```

For computing the next date in step 2b, use plain JS `Date` arithmetic — no library needed:
```js
const d = new Date(nextDueDate);
if (interval === 'weekly') d.setDate(d.getDate() + 7);
if (interval === 'monthly') d.setMonth(d.getMonth() + 1);
// Convert back to "yyyy-MM-dd" string:
const newDate = d.toISOString().split('T')[0];
```

**Step 3 — Startup hook (`src/hooks/useRecurringCheck.js`)**

Do NOT modify `AuthContext.js`. Instead, create a dedicated hook that fires once when the user is authenticated — the same pattern `useExpenses` uses:

```js
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { checkAndLogDueRecurring } from '../services/recurringService';

export function useRecurringCheck() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    checkAndLogDueRecurring(currentUser.uid).catch(console.error);
  }, [currentUser]);   // runs once per session when currentUser becomes available
}
```

**Step 4 — Call the hook in the Dashboard layout (`src/pages/Dashboard.jsx`)**

`Dashboard.jsx` is the authenticated shell that wraps all dashboard pages. Call the hook there so it runs once regardless of which sub-page the user lands on:

```js
import { useRecurringCheck } from '../hooks/useRecurringCheck';

export default function Dashboard() {
  useRecurringCheck();   // ← add this one line
  // ... rest of Dashboard unchanged
}
```

**Step 5 — Form change (`src/components/Expense/ExpenseForm.jsx`)**

Add two pieces of state:
```js
const [isRecurring, setIsRecurring] = useState(false);
const [recurrenceInterval, setRecurrenceInterval] = useState('monthly');
```

Add to the form JSX (below the date field):
```jsx
<div className="form-group">
  <label>
    <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} />
    {' '}Make this recurring
  </label>
  {isRecurring && (
    <select value={recurrenceInterval} onChange={e => setRecurrenceInterval(e.target.value)}>
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
    </select>
  )}
</div>
```

In `handleSubmit`, after `addExpense`, if `isRecurring` is true, also call:
```js
await addRecurringRule(currentUser.uid, {
  title: title.trim(),
  amount: parseFloat(amount),
  category,
  interval: recurrenceInterval,
  nextDueDate: /* date + 1 interval from the form's date field */,
});
```

**Step 6 — Recurring list (`src/components/Recurring/RecurringList.jsx`)**

A simple table showing active rules. Each row: title, amount, interval, next due date, delete button. Add it as a collapsible section at the bottom of the Expenses page, or as its own route (`/dashboard/recurring`).

**Step 7 — Optional: recurring badge in expense table**

In `src/components/UI/ExpenseTable.jsx`, find where the expense title is rendered. If `expense.recurringRuleId` exists, append a small indicator:
```jsx
{expense.recurringRuleId && <span title="Auto-logged recurring expense">↻</span>}
```

**Step 8 — Test manually**
- Create a recurring rule with `nextDueDate` set to today (or yesterday to force the trigger)
- Navigate away from the dashboard and back — verify a new expense entry was logged
- Verify the rule's `nextDueDate` updated to the next period in Firestore
- Delete the rule → confirm no new expenses are auto-logged on the next visit
- Test edge case: if the user was offline for 2 weeks with a weekly rule, it should log 2 expenses and advance the date twice

---

## Suggested order

```
Income Tracking   →   Recurring Expenses
   ~2–3 days              ~4–5 days
```

Start with Income Tracking. It ships fast, adds real value, and the patterns (new Firestore collection, new hook, new form) directly apply to Recurring Expenses.

---

## When you're done

Move each completed feature from the 🔜 To Do section to the ✅ Already Implemented table in `Documents/Feature_Backlog.md` with the relevant file paths.

Any feature that passes data to the AI chat (e.g., including income in spending summaries) should be documented in `Documents/AI_Chat_Feature.md`.
