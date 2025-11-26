#  🎯 Jest Unit Test Catalog

Our comprehensive test suite ensures reliability and maintainability of the Budget Buddy application. We follow industry best practices with Jest and React Testing Library for unit testing. 

This document summarizes every Jest suite that ships with **Budget Buddy**, the behaviors each file asserts, and how to rerun the suite locally.

---
### 📊 Test Coverage Overview

- Total Test Files: 26
- Total Tests: 295 tests
- Overall Coverage: 100%
- Status: All tests passing ✅


#### 📸 Snapshot of All the Tests Passing
![All the Test Cases Passing](Documents/Jest_Unit_Testing/Unit_Tests_Passing.png)
*Screenshot showing all tests passing*

--- 

## Running The Suite

- **Single pass with coverage**
  - `npm run test:coverage`
  - Generates the HTML report at `coverage/lcov-report/index.html`
- **Watch mode**
  - `npm run test:watch`
  - Useful while iterating on a specific component
- **Run just one test file**
   - `npm test -- src/__tests__/Login.test.jsx`


---

## Test Coverage Snapshot

| Metric      | Value | Notes                                   |
|-------------|-------|-----------------------------------------|
| Statements  | 100%  | Every production file is exercised      |
| Branches    | 100%  | Includes router guards & async paths    |
| Functions   | 100%  | All exported helpers/components invoked |
| Lines       | 100%  | Matches the latest `npm run test:coverage` run |


#### 📸 Snapshot of the Test Coverage HTML
![100% Coverage HTML File](Documents/Jest_Unit_Testing/Unit_Tests_Coverage_HTML.png)
*Screenshot showing 100% Coverage of the Tests included*

> This can be found in under Coverage HTML folder in repo 
> Path to that file => coverage/lcov-report/src/index.html


#### 📸 Snapshot of the Test Coverage on Running: `npm run test:coverage`
![100% Coverage](Documents/Jest_Unit_Testing/Unit_Tests_Coverage.png)
*Screenshot showing 100% Coverage of the Tests included*




---
## Test Catalog By Area

### 1. Application Shell, Routing & Navigation

| File | Behaviors Covered |
|------|-------------------|
| `App.test.jsx` | Confirms the root router renders the landing page and exclusive routes resolve correctly. |
| `Navigation.test.jsx` | Desktop + mobile menu toggling, authenticated vs guest nav items, logout button wiring, body scroll locking while the hamburger menu is open. |
| `Navbar.test.jsx` | Breadcrumb title/icon logic per dashboard sub-route, sidebar toggle callbacks (including updater functions), logout confirmation flow, conditional rendering when `currentUser` is missing. |
| `Sidebar.test.jsx` | Rendering of all nav links, desktop vs mobile controls, drag/close behavior, logout calls, delayed mobile auto-close after navigation, class handling for dragging/mobile states, desktop navigation leaving sidebar open. |
| `PagesPrivateRoute.test.jsx` & `LayoutPrivateRoute.test.jsx` | Future-proof React Router warnings, redirect vs render when `currentUser` is null, loading placeholders during auth resolution, default redirects when `redirectTo` isn’t specified. |
| `Landing.test.jsx` | Ensures the animated marketing hero renders, CTA buttons link to `signup` and `login`, and motion components are mocked for deterministic snapshots. |

### 2. Authentication Flows

| File | Behaviors Covered |
|------|-------------------|
| `Login.test.jsx` | Form rendering, input updates, validation handoff to Firebase, loading states, navigation after success, navigation state messages, error messaging for every Firebase error code, retry flows that clear stale errors. |
| `Signup.test.jsx` | Password strength validator (length/upper/lower/number), matching confirmation, submit happy path, error mapping for common Firebase codes, button loading spinner, password toggle accessibility (click and keyboard Enter/Space variants, non-activation keys ignored), eye toggles for both password fields. |
| `AuthFlow.test.jsx` | Higher-level authentication context behaviors, multi-step auth flows, in-app navigation after signup/login/logout cycles. |
| `firebaseConfig.test.js` & `TestFirebase.test.jsx` | Confidence that Firebase is initialized with env vars and smoke tests for both anonymous and email/password scenarios (mocked). |

### 3. Dashboard, Expenses & Reports

| File | Behaviors Covered |
|------|-------------------|
| `DashboardOverview.test.jsx` | Realtime Firestore listeners, derived summaries (total/month/average/top category), sorting, empty vs populated states, recent expense list (max 5 items), cleanup of snapshots, guard clauses when `currentUser` is missing. |
| `Categories.test.jsx` | Modal lifecycle, Firestore listeners (expenses + categories), add/delete flows, toast messaging, validation when Firebase or auth is missing, Unsubscribe cleanup, default category protections, drag-menu dismissal, chart data derivation. |
| `Expenses.test.jsx` | Wrapper around expense dashboard page, verifying `ExpenseForm`, modal toggling, empty state vs table rendering, summary chips, delete confirmation prompts. |
| `ExpenseForm.test.jsx` | Form validation (amount/title/date/future dates), numeric input sanitizing, add + edit flows, toast messaging, callbacks for add/update/cancel, Firestore listener errors, cleanup, custom category handling, loading states (“Adding Expense…”/“Saving…”), preventing cancels mid-submit, handling of missing callbacks. |
| `ExpenseList.test.jsx` | Tabular rendering, per-row actions, empty states, sorting, iconography for categories. |
| `Reports.test.jsx` | Reports dashboard tiles, filters, export stubs, charts conditional rendering. |

### 4. Charts & Visualization

| File | Behaviors Covered |
|------|-------------------|
| `BarChart.test.jsx` | Registration of Chart.js components, dataset/label propagation, loading placeholders. |
| `LineChart.test.jsx` | Trend line configuration, gradients, tooltip callbacks. |
| `PieChart.test.jsx` | Doughnut slices, legend data, fallback text when dataset is empty. |

Animation-heavy components mock `framer-motion` to keep these suites fast and deterministic.

### 5. Shared UI & Utilities

| File | Behaviors Covered |
|------|-------------------|
| `Modal.test.jsx` | Conditional rendering, overlay click-to-close, content click propagation, close button semantics, ARIA labelling fallback when no title is provided. |
| `Toast.test.jsx` | Success/error rendering, auto-dismiss hooks, callback wiring. |
| `reportWebVitals.test.js` | Lazy-loading web-vitals bundle, ensuring all metrics (`CLS`, `FID`, `FCP`, `LCP`, `TTFB`) invoke the provided callback and that `undefined` inputs short-circuit safely. |
| `index.test.js` | React root bootstrap sanity check (usually a smoke test to ensure `ReactDOM.createRoot` is called). |
| `database.test.js` | Every Firestore helper (add/update/delete/subscribe for expenses and categories) including happy paths, parameter validation, error handling, listener cleanup, and callback invocation when listeners fail. |

---

## 📊 Test Case Summary

> Approximate counts come from the latest `npm run test:coverage` run (26 suites / 295 specs). 

| Test File | ≈ # Tests | Key Test Cases |
|-----------|-----------|----------------|
| `App.test.jsx` | 2 | Root `<App />` renders landing page on `/`; router doesn’t crash while React Router future flags log warnings. |
| `Navigation.test.jsx` | 5 | Desktop vs mobile menu rendering; hamburger toggle locks body scroll; auth-aware nav items; logout button fires context `logout`; mobile menu auto-closes. |
| `Navbar.test.jsx` | 5 | Breadcrumb title/icon per route; sidebar toggle callback invoked with updater fn; logout confirmation respects `window.confirm`; hides user chip when no `currentUser`. |
| `Sidebar.test.jsx` | 8 | Nav links render with icons; desktop toggle/ mobile close buttons; logout button calls context; mobile navigation auto-closes via timer; dragging/mobile classes applied; desktop nav leaves sidebar open. |
| `PagesPrivateRoute.test.jsx` | 3 | Protected route renders when authed, redirects to `/login` when not; loading indicator shown while auth is resolving. |
| `LayoutPrivateRoute.test.jsx` | 4 | Same patterns for layout wrapper, plus fallback redirect when `redirectTo` prop absent. |
| `Landing.test.jsx` | 2 | Hero copy, CTA buttons (`/signup`, `/login`), animated sections render with mocked `framer-motion`. |
| `Login.test.jsx` | 18 | Form field bindings, button disabled states, success navigation to `/dashboard`, `useNavigate` state messaging, Firebase error mapping (user not found, wrong password, invalid email, unknown), retry clears prior errors. |
| `Signup.test.jsx` | 24 | Password-strength validator (length/upper/lower/number), password match check, Firebase error codes, button spinner, password eye toggles via click + Enter/Space, non-activation keys ignored. |
| `AuthFlow.test.jsx` | 14 | Auth context provider wiring, signup→dashboard journey, logout returning to login, forgot-reset flows mocked. |
| `firebaseConfig.test.js` | 3 | Ensures Firebase app initializes with env vars and exports `auth`/`db`. |
| `TestFirebase.test.jsx` | 6 | Anonymous + email/password smoke tests (mocked) updating Firestore docs and rendering status messaging. |
| `DashboardOverview.test.jsx` | 22 | Firestore listeners populate expenses, derived totals/month/average/top category, recency sorting, empty states, “View All” link, listener cleanup + guard when user missing. |
| `Categories.test.jsx` | 25 | Real-time listeners for categories/expenses, modal lifecycle, add/delete category flows, toast success/error, validations when Firebase/auth missing, default category protection, chart data generation. |
| `Expenses.test.jsx` | 6 | Expense dashboard shell: summary chips, empty table state, open/close add & edit modal, delete confirmation prompt path. |
| `ExpenseForm.test.jsx` | 34 | Amount sanitizing, validation errors (amount/title/date/future), add + edit submissions, toast messages, onCancel behavior (including loading guard), Firestore listener errors & cleanup, custom categories without IDs, loading copy (“Adding Expense…” / “Saving…”). |
| `ExpenseList.test.jsx` | 8 | Renders table rows with category icons, amount formatting, edit/delete action buttons, empty-state card. |
| `Reports.test.jsx` | 5 | Reports dashboard cards, filters, conditionally rendered charts, export button stubs. |
| `BarChart.test.jsx` | 3 | Chart.js registration happens once, datasets/labels propagate, loading fallback renders when data missing. |
| `LineChart.test.jsx` | 4 | Gradient creation, dataset mapping, options (tooltips, axes) wired correctly. |
| `PieChart.test.jsx` | 4 | Doughnut chart renders slices + legend, empty dataset fallback messaging. |
| `Modal.test.jsx` | 5 | `isOpen` gating, overlay click closes modal, content click stops propagation, close button/ARIA label fallback when title absent. |
| `Toast.test.jsx` | 4 | Success/error variants render, dismiss button fires callback, auto-dismiss timers mocked. |
| `database.test.js` | 18 | `addExpense/addCategory` validation + success, update/delete functions, subscribe helpers (expenses/categories/by-category) including error callbacks and parameter guards. |
| `reportWebVitals.test.js` | 3 | Lazy import of `web-vitals`, ensures each metric callback (`getCLS`, etc.) forwards to `onPerfEntry`, no-op when callback missing. |
| `index.test.js` | 1 | Confirms React root is created and renders without crashing. |


> **Note:** All the test cases passes. In total 295 test cases, in 26 test files, that has 100% coverage over the project.

---

## Detailed Breakdown (File-by-File)

### App Shell & Routing
- **`App.test.jsx`**
  - Verifies that the landing page renders on `/`.
  - Guards against React Router future-flag warnings causing crashes.
- **`Navigation.test.jsx`**
  - Confirms desktop vs mobile menu DOM, hover/tap animations (mocked), and body scroll locking.
  - Checks logout button calls the auth context and that mobile drawers close after navigation.
- **`Navbar.test.jsx`**
  - Tests breadcrumb icon/title logic for `/dashboard`, `/expenses`, `/categories`, `/reports`.
  - Exercises sidebar toggle callback (ensuring updater fn behavior) and logout confirmation.
- **`Sidebar.test.jsx`**
  - Covers desktop toggle button, mobile close button, drag state classes, and auto-close timers.
  - Validates logout button, mobile vs desktop navigation differences, and user info block rendering.
- **`PagesPrivateRoute.test.jsx`** / **`LayoutPrivateRoute.test.jsx`**
  - Validate redirect to `/login` when unauthenticated.
  - Ensure loading spinners render while `useAuth()` is resolving.
  - Check `Navigate` preserves the `from` state and that default `redirectTo` is `/login`.
- **`Landing.test.jsx`**
  - Snapshot-like checks for hero text, CTA buttons (`/signup`, `/login`), and mocked motion animations.

### Authentication
- **`Login.test.jsx`**
  - Input bindings, submit flows, and `useNavigate` success redirects.
  - All Firebase auth error cases (user not found, wrong password, invalid email, unknown).
  - Ensures retry clears prior errors and buttons show “Signing in…” while pending.
- **`Signup.test.jsx`**
  - Password strength validator (length, upper, lower, number) + mismatch handling.
  - Firebase error mapping (email in use, invalid email, weak password, default).
  - Password eye toggles via click + keyboard (Enter/Space) and ignore other keys.
- **`AuthFlow.test.jsx`**
  - Exercises the context provider: signup → dashboard, logout → login, reset password notifications.
- **`firebaseConfig.test.js`**
  - Guards around Firebase app initialization and exported `auth` / `db` references.
- **`TestFirebase.test.jsx`**
  - Mocks `signInAnonymously`, `createUserWithEmailAndPassword`, Firestore writes/reads, and status UI.

### Dashboard & Data
- **`DashboardOverview.test.jsx`**
  - Real-time listeners, derived totals/month/average/top category, and sorting logic.
  - Verifies recent expenses (max 5), empty-state CTA, “View All” link, and cleanup unsubscribe.
- **`Categories.test.jsx`**
  - Listeners for expenses + categories, modal open/close, add/delete flows, toast success/error.
  - Default category protection, Firestore error handling, chart data normalization.
- **`Expenses.test.jsx`**
  - Ensures summary chips, empty state vs table, add/edit modals, delete confirmation, toast handling.
- **`ExpenseForm.test.jsx`**
  - Amount input sanitizing (decimals, rejecting letters), validation errors for amount/title/date.
  - Add vs edit submissions, callbacks (`onExpenseAdded`, `onExpenseEdited`, `onCancel`), success toasts.
  - Firestore listener errors/cleanup, custom categories w/out IDs, loading text (“Adding Expense…” / “Saving…”).
- **`ExpenseList.test.jsx`**
  - Table rendering, category icons, currency formatting, edit/delete buttons, empty state.
- **`Reports.test.jsx`**
  - Reports cards, filters, chart toggles, export buttons.

### Charts & UI Components
- **`BarChart.test.jsx` / `LineChart.test.jsx` / `PieChart.test.jsx`**
  - Chart.js registration, dataset props, loading fallbacks, gradients/tooltips (where applicable).
- **`Modal.test.jsx`**
  - Conditional rendering, overlay click to close, content click propagation block, close button ARIA label.
- **`Toast.test.jsx`**
  - Success vs error styles, dismiss button, auto-dismiss timer behavior.

### Infrastructure & Utilities
- **`database.test.js`**
  - `add`, `update`, `delete` helpers for expenses/categories with parameter validation.
  - Subscription helpers for expenses/categories/by-category including callback invocation on errors.
- **`reportWebVitals.test.js`**
  - Lazy import of `web-vitals`, ensures each metric forwards to `onPerfEntry`, no-op for missing callback.
- **`index.test.js`**
  - Smoke test for `ReactDOM.createRoot` and strict mode rendering.

---


### 🛠️ Testing Strategy

#### **Mocking Strategy**
- **Firebase**: Complete mocking of Auth and Firestore services
- **Charts**: Mocked Chart.js components to prevent DOM errors
- **Animations**: Framer Motion components mocked for test stability
- **Navigation**: React Router mocked for route testing
- **UI Components**: Modal and Toast components mocked

#### **Test Quality Features**
- ✅ **Comprehensive Coverage**: Authentication, CRUD operations, UI interactions
- ✅ **Error Handling**: Firebase errors, validation errors, edge cases
- ✅ **Accessibility**: ARIA attributes and keyboard navigation testing
- ✅ **Loading States**: Button states, spinners, and async operations
- ✅ **Form Validation**: Input validation and submission testing
- ✅ **Component Lifecycle**: Mount/unmount and re-render testing

--- 
### 🔧 Test Configuration

Our test setup includes:
- **Jest** as the testing framework
- **React Testing Library** for component testing
- **@testing-library/jest-dom** for custom matchers
- **@testing-library/user-event** for user interaction simulation
- **jsdom** environment for DOM testing
