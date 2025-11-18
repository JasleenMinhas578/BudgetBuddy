# 💸 Budget Buddy (Group 6)

## 🚀 Project Overview

Budget Buddy is your **Budget Companion** — a free, easy-to-use web app for managing personal expenses.  
Unlike many market apps that become paid after trial, Budget Buddy focuses on **cost-effectiveness, accessibility, and simplicity**.  

**Core features: (Fall 2025 Scope)**
- Secure authentication (login/signup with Firebase)  
- Expense and category management  
- Data visualization with charts  
- Report generation (PDF export, CSV export)  
- Responsive design for desktop, tablet, and mobile  

---


## 📊 Project Status

[![CI Tests](https://github.com/JasleenMinhas578/BudgetBuddy/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/JasleenMinhas578/BudgetBuddy/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/JasleenMinhas578/BudgetBuddy/actions/workflows/e2e.yml/badge.svg?branch=main)](https://github.com/JasleenMinhas578/BudgetBuddy/actions/workflows/e2e.yml)

> The project works perfectly, all the CI unit tests, E2E test with 100% coverage runs perfectly, across multiple browser - Chrome, Edge, and Firefox.
> The `coverage_report` is there in the repo. 

- **View Detailed Test Results**: Go to the [Actions tab](https://github.com/JasleenMinhas578/BudgetBuddy/actions)

- **View Deployement**: Go to the [Deployments](https://github.com/JasleenMinhas578/BudgetBuddy/deployments/Production)

- **Live Project (Vercel main-branch deployment URL)**: https://budget-buddy-mun.vercel.app/


---

## 👥 Team

- **Group**: 6  

- **Planning Board** - Go to the [Planning Board](https://github.com/users/JasleenMinhas578/projects/4/views/1)

- **Roadmap** - Go to the [Roadmap Board](https://github.com/users/JasleenMinhas578/projects/4/views/4)

**Team Lead**  
- Jasleen Minhas — ID: 202481225 — jminhas@mun.ca  

**Team Members**  
- Sumaiya Khan — ID: 202480995 — sumaiyak@mun.ca  
- Kaustubh Patil — ID: 202580621 — kspatil@mun.ca  
- Joel George Sam — ID: 202483190 — jgeorgesam@mun.ca  
- Mashroor Rahman — ID: 202482239 — masroorr@mun.ca  
- Ronit Gajjar — ID: 202488048 — rhgajjar@mun.ca  

### 🛠️ Team Responsibilities 
- **Jasleen Minhas** — Project Lead / Full-Stack: Leads sprints, manages GitHub, authentication & security modules.  
- **Sumaiya Khan** — Frontend (UI/UX): Page layout and user-friendly interface design.  
- **Mashroor Rahman** — Backend/Database: Firestore structure, CRUD logic, and data validation.  
- **Kaustubh Patil** — Frontend (Expenses): Expense management UI and category integration.  
- **Joel George Sam** — QA/Testing: Test cases, automated/system testing, V&V compliance.  
- **Ronit Gajjar** — Reporting/Features: Charts, analytics, and PDF export module.  


### 🧮 Story Point Contribution Per Member

> 📌 Assumption used:  
Each contributor receives **full story points for any issue they worked on** — standard for team Agile contribution analysis unless partial points were assigned originally.

#### ✅ **Automated Story Point Summary**
(Complete calculation based on full issue list you provided in [Planning Mapping](https://github.com/users/JasleenMinhas578/projects/4/views/1))

| Member | Total Story Points |
|--------|--------------------|
| **Jasleen** |  **≈ 170 SP** |
| **Mashroor** | **≈ 110 SP** |
| **Sumaiya** | **≈ 58 SP** |
| **Joel** | **≈ 55 SP** |
| **Kaustubh** | **≈ 45 SP** |
| **Ronit** | **≈ 48 SP** |

---

## 🖥️ Methodology

We are following the **Agile Software Development** methodology, using an iterative sprint-based approach.  
- Work is divided into 5 sprints (2 weeks each), with clear milestones.  
- GitHub Projects, Issues, and Milestones are used for sprint planning and tracking.  
- Each feature is implemented incrementally, tested with unit/system tests, and refined based on feedback.  
- Continuous Integration (CI) is set up to ensure all commits are validated before merging. 
- Continous deployement (CD) is set up in vercel to insure non stop availabilty of the app. 
- Cypress tests are used E2E testing.
- Jest is used for Unit tesing of each functionality.

---

## 📅 Milestones / Iterations

### Iteration 1 (Sept 22 – Oct 5)
- Requirements gathering & analysis  
- User stories in GitHub (issues with story points, risk, priority)  
- UML diagrams (use case, sequence, class)  
- GitHub setup: repo, branch strategy, labels, milestones, issue templates  
- CI/CD setup (GitHub Actions)  
- Firebase project initialization  

**Deliverable:** Requirements documentation + repo setup  

---

### Iteration 2 (Oct 6 – Oct 19)
- React frontend setup (CRA, routing, context API)  
- Landing Page, Login, Signup  
- Authentication module with Firebase (login/signup/logout, session protection)  
- Unit tests for auth  

**Deliverable:** Working login/signup flow (deployed version)  

---

### Iteration 3 (Oct 20 – Nov 2)
- Expense management (Add/Edit/Delete/List)  
- Category management (create/manage categories)  
- Firestore integration with real-time sync  
- Unit tests for CRUD  

**Deliverable:** Functional expense + category management  

---

### Iteration 4 (Nov 3 – Nov 16)
- Visualization with Pie, Bar, Line charts  
- Reporting: export PDF summaries + charts  
- Dashboard with summary view  
- UI/UX responsiveness across devices  
- Usability testing  

**Deliverable:** Dashboard with analytics & reporting  

---

### Iteration 5 (Nov 17 – Nov 30)
- E2E Testing using Cypress
- Bug fixing, performance optimization  
- Final documentation (report)  
- Presentation & demo prep  
- Repo finalization (issues closed, PRs merged, iteration tags added)  

**Deliverable:** Final working app + report + demo  

---

## 🏷️ Labels (Features)

We use GitHub **Labels** for tracking features and tasks:  

- 🔒 **Authentication** — Login/Signup & Firebase Auth  
- 💸 **Expense Management** — CRUD operations for expenses  
- 📂 **Category Management** — Organizing expense categories  
- 📊 **Visualisation using Charts** — Pie/Bar/Line charts  
- 🖥️ **Dashboard** — Central view of expenses & insights  
- 🔑 **Login** — User login flow  
- 📝 **Sign up** — User registration flow  
- 📑 **Report Generation** — PDF export of expenses  
- 📚 **Documentation** — Reports, diagrams, project docs  
- 🐞 **Bug Fixing** — Debugging & patching issues  
- 📱 **Responsive Design** — Cross-device support  
- 🔥 **Firebase/Database Setup** — Firestore structure, sync  
- ✅ **Unit Test** — Component/feature-level testing  
- 🧪 **E2E Test** — End-to-end testing  


---

## Technologies & Tools  

| **Technology / Tool**       | **Purpose**              | **Reason for Choice**                                                                 |
|------------------------------|--------------------------|----------------------------------------------------------------------------------------|
| **React.js**                | Frontend UI              | Popular, component-based, scalable, and supports responsive web design.                 |
| **React Context API** + **React Router** | State management & routing | Lightweight global state + SPA routing for auth-protected pages. |
| **Firebase Authentication** | User login/signup        | Secure, easy-to-integrate, with session handling built-in.                             |
| **Firebase Firestore**      | Database                 | Cloud-based, real-time NoSQL DB, ideal for expense data storage and synchronization.   |
| **Chart.js**                | Visualization            | Widely used, customizable, and integrates easily with React.                           |
| **date-fns**                | Date handling            | Lightweight and faster than Moment.js for parsing and formatting dates.                |
| **jsPDF + html2canvas**     | Report generation        | Allows exporting dashboard summaries into PDF easily.                                  |
| **Jest + React Testing Library** | Component testing   | Industry standard for reliable, maintainable unit & integration tests.                 |
| **Cypress**                  | E2E testing             | Real-browser coverage of signup/login, expenses, categories, reports, charts, logout. |
| **Node.js 20 + npm**         | Runtime/tooling         | Aligns with Cypress/Joi engine requirements and CI runners.                            |
| **Vercel and GitHub Actions**           | CI/CD                   | Automates builds, Jest coverage, Cypress suites, and artifact uploads.                 |
| **GitHub (Projects, Issues, PRs)** | Collaboration     | Central hub for Agile planning, documentation, and code reviews.                      |


---

## 🚀 How to Run the Project

### Prerequisites
- **Node.js** (version 20 LTS or newer — required by Cypress & Joi)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/JasleenMinhas578/BudgetBuddy.git
   cd BudgetBuddy
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - ✅ **The `.env` file is already included in this private repository**
   - ✅ **Firebase configuration is pre-configured**
   - ✅ **No additional environment setup required**

4. **Start the Development Server**
   ```bash
   npm start
   ```

5. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - The application will automatically reload when you make changes

### Available Scripts

```bash
# Start development server
npm start

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Build for production
npm run build

# Run specific test file
npm test -- --testPathPattern=Categories.test.jsx
```

### Project Structure
```
budget-buddy/
├── public/                         # CRA public assets (index.html, icons, manifest)
├── src/
│   ├── components/
│   │   ├── Auth/                   # Login / Signup views
│   │   ├── Charts/                 # PieChart, BarChart, LineChart wrappers
│   │   ├── Dashboard/              # DashboardOverview, Reports, Categories, Expenses
│   │   ├── Expense/                # ExpenseForm, ExpenseList
│   │   ├── Layout/                 # Navbar, Sidebar, responsive shells
│   │   └── UI/                     # Modal, Toast, loaders, shared UI pieces
│   ├── context/                    # AuthContext provider
│   ├── services/                   # Firebase CRUD helpers (database.js)
│   ├── styles/                     # main.css, modal css, etc.
│   ├── __tests__/                  # Jest + RTL suites (AuthFlow, Reports, Charts…)
│   ├── firebaseConfig.js           # Firebase initialization
│   └── setupTests.js               # RTL/Jest bootstrap & mocks
├── cypress/
│   ├── e2e/                        # Cypress specs (01-signup … smoke)
│   ├── fixtures/                   # JSON fixtures for tests
│   ├── support/                    # commands.js, e2e.js
│   ├── screenshots/                # Auto-captured failure screenshots
│   └── videos/                     # Recorded runs (local + CI)
├── Documents/
│   ├── CI_e2e_run_docs_screenshots/# Cypress summaries, reports, guide, screenshots
|   ├── Jest_Unit_Tests_docs_screenshots/ # Jest Unit tests summaries, screenshots, catalog
│   ├── Project_Progress_Files/     # PDFs & slides submitted for the course
│   ├── Project_Proposal_Files/     # Proposal docs/slides
│   └── UML/                        # Use case, sequence, class diagrams
├── build/                          # Production build artifacts (generated)
├── coverage/                       # Jest coverage reports
├── scripts/                        # Helper scripts / utilities
├── .github/workflows/              # CI/CD definitions (ci.yml, e2e.yml)
├── .env                            # Firebase env vars (private repo)
├── package.json / package-lock.json
└── README.md
```

### Firebase Configuration
- **Authentication**: Email/Password authentication enabled
- **Firestore**: Real-time database for expenses and categories

### Troubleshooting

**Common Issues:**
- **Port 3000 in use**: The app will automatically suggest using a different port
- **Dependencies issues**: Run `npm install` again
- **Firebase errors**: Ensure you have internet connection
- **Test failures**: Run `npm test -- --watchAll=false` to see detailed error messages

**Need Help?**
- Check the console for error messages
- Ensure all dependencies are installed: `npm install`
- Verify Node.js version: `node --version` (should be 16+)

---

## 🧪 Unit Test Summary (Jest)

Our comprehensive test suite ensures reliability and maintainability of the Budget Buddy application. We follow industry best practices with **Jest** and **React Testing Library** for unit testing.

> Detailed Despcription of the Test details present under: **`Documents/Jest_Unit_Tests_docs_screenshots/Jest_Unit_Test_Catalog.md`**

### 📊 Test Coverage Overview
- **Total Test Files**: 26
- **Total Tests**: 295 tests
- **Overall Coverage**: 100%
- **Status**: All tests passing ✅

#### 📸 Snapshot of the Test Passing on Running: `npm run test:coverage`
![100% Coverage and All Tests Passing](Documents/Jest_Unit_Tests_docs_screenshots/Unit_Tests_Coverage.png)
*Screenshot showing 100% Coverage and all of the Tests Passing*


### 🔬 Unit Test Case Summary:

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



### 🎯 Testing Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test -- --testPathPattern=Categories.test.jsx

# Run tests in watch mode
npm test -- --watch
```

---

## 🎭 E2E Testing with Cypress

Budget Buddy includes comprehensive end-to-end (E2E) testing using **Cypress** to ensure all critical user flows work correctly in a real browser environment.

### 📦 Cypress Setup

Cypress is already installed and configured in the project. The E2E tests verify:
- ✅ User signup and registration
- ✅ User login and authentication
- ✅ Dashboard display and navigation
- ✅ Adding and managing expenses
- ✅ Creating and managing categories
- ✅ Viewing charts and visualizations
- ✅ Generating and exporting reports
- ✅ User logout and session management

### 🚀 Running Cypress Tests

#### **Interactive Mode (Recommended for Development)**
Open Cypress Test Runner with a visual interface:

```bash
# Open Cypress in interactive mode
npm run cypress:open

# Or with the app already running
npm run test:e2e:dev
```

This will:
1. Open the Cypress Test Runner GUI
2. Allow you to select and run individual test files
3. Watch tests execute in a real browser
4. Enable debugging and step-through

#### **Headless Mode (For CI/CD)**
Run all tests in the terminal without GUI:

```bash
# Run all tests in headless mode
npm run cypress:run

# Run with specific browser
npm run cypress:run:chrome

# Run with visible browser (headed mode)
npm run cypress:run:headed

# Run with server start and tests
npm run test:e2e
```

#### **Run Specific Test File**
```bash
# Run a specific test file
npx cypress run --spec "cypress/e2e/01-signup.cy.js"

# Run tests matching a pattern
npx cypress run --spec "cypress/e2e/*-login.cy.js"
```

### 📁 Test File Structure

```
cypress/
├── e2e/
│   ├── smoke.cy.js           # Smoke tests for basic functionality
│   ├── 01-signup.cy.js        # User signup flow tests
│   ├── 02-login.cy.js         # User login flow tests
│   ├── 03-dashboard.cy.js     # Dashboard display tests
│   ├── 04-expenses.cy.js      # Add expense flow tests
│   ├── 05-categories.cy.js    # Add categories flow tests
│   ├── 06-reports.cy.js       # Export reports flow tests
│   └── 07-logout.cy.js        # User logout flow tests
├── fixtures/
│   ├── users.json            # Test user data
│   ├── expenses.json         # Test expense data
│   └── categories.json       # Test category data
├── support/
│   ├── commands.js           # Custom Cypress commands
│   └── e2e.js                # Global test configuration
├── screenshots/              # Auto-captured on test failure
└── videos/                   # Recorded test runs
```

### 🧪 Test Coverage Overview

| Test Suite | # Tests | Coverage |
|------------|---------|----------|
| **Smoke Tests** | 10 | Basic application functionality |
| **Signup Flow** | 11 | User registration and validation |
| **Login Flow** | 13 | Authentication and error handling |
| **Dashboard** | 16 | Navigation and data display |
| **Expenses** | 12 | CRUD operations for expenses |
| **Categories** | 12 | Category management |
| **Reports** | 16 | Report generation and export |
| **Logout** | 18 | Session management |
| **Total** | **102** | **Complete E2E coverage** |

## 🎯 Screenshot of E2E Test Cases and Coverage
![Test Cases Passing](Documents/CI_e2e_run_docs_screenshots/Cypress_Tests_Analysis.png)
*Screenshot showing all tests passing*

> This can be verified by running: `npm run cypress:run`

![Test Cases Passing](Documents/CI_e2e_run_docs_screenshots/Cypress_Tests_Passing.png)
*Screenshot showing all tests passing*

> This can be verified by running: `npm run cypress:run`

![Cypress Test Coverage](Documents/CI_e2e_run_docs_screenshots/Cypress_Coverage_Report.png)
*Screenshot showing the test Coverage of Cypress tests*

> This report can be found under the artifcats of the latest test run in Github Actions

### 📊 Test Results Artifacts

After running tests, Cypress generates:

#### **Screenshots**
- Automatically captured on test failures
- Location: `cypress/screenshots/`
- Helps identify what went wrong

#### **Videos**
- Recorded for all test runs
- Location: `cypress/videos/`
- Complete playback of test execution

#### **Access Artifacts**
```bash
# View screenshots
open cypress/screenshots/

# View videos
open cypress/videos/
```

### 🔄 CI/CD Integration

Cypress tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

#### **GitHub Actions Workflow**

The `.github/workflows/e2e.yml` workflow:
- Runs the Cypress suite on Node 20 across Chrome & Edge matrices
- Uploads screenshots/videos for failed specs along with summary artifacts
- Uses Firebase env secrets so the dev server behaves like local
- Emits job summaries + downloadable artifacts for every run

#### **E2E Coverage Snapshot**
- **Specs**: 8 primary flows (`01-signup` … `07-logout` + `smoke`)
- **User journeys covered**: auth (happy/error), dashboard navigation, expenses & categories CRUD, reports/charts export, logout, smoke verification.
- **Artifacts & Logs**:
  - Screenshots: `cypress/screenshots/<spec>/<test>.png`
  - Videos: `cypress/videos/<spec>.mp4`
  - Summary docs: `Documents/CI_e2e_run_docs_screenshots`, `Cypress_Testing_Guide.md`, `Cypress_E2E_Testing_Report.md`
  - GitHub Actions artifacts: `cypress-screenshots-*`, `cypress-videos-*`, `cypress-results-*`

#### **View Test Results in CI**
1. Go to the **Actions** tab in GitHub
2. Select the **E2E Tests with Cypress** workflow
3. Click on a specific run to see results
4. Download artifacts (screenshots/videos) if tests fail

---

## 🎯 CI/CD Pipeline & Test Results

Our project uses **GitHub Actions** for continuous integration and continuous deployment. All tests (unit tests and E2E tests) run automatically on every push and pull request to ensure code quality.

### ✅ Workflow Status

The badges at the top of this README show the current status of our CI/CD pipelines:
- **CI Tests Badge**: Shows the status of unit tests (Jest) and build verification
- **E2E Tests Badge**: Shows the status of end-to-end tests (Cypress) across multiple browsers

### 📸 CI Workflow (Unit Tests & Build)

The CI workflow runs on every push and includes:
- Unit tests with Jest
- Code coverage reporting
- Production build verification

![CI Workflow Run](Documents/CI_e2e_run_docs_screenshots/CI_Workflow_run.png)

**Key Results:**
- ✅ **102 unit tests passing** across all components
- ✅ Build completes successfully
- ✅ Coverage reports generated and uploaded as artifacts

### 📸 E2E Workflow (Cypress Tests)

The E2E workflow runs comprehensive browser-based tests across Chrome, Firefox, and Edge:
- **102 E2E tests** covering all user journeys
- Multi-browser testing (Chrome, Firefox, Edge)
- Screenshots and videos captured for debugging

![E2E Workflow Run](Documents/CI_e2e_run_docs_screenshots/E2E_Workflow_run.png)

**Key Results:**
- ✅ **All 102 Cypress tests passing**
- ✅ Cross-browser compatibility verified
- ✅ Videos available as artifacts under `cypress/videos/`
- ✅ Test execution time: ~18-20 minutes across all browsers

### 📊 Test Coverage Summary

| Test Type | Count | Status | Coverage |
|-----------|-------|--------|----------|
| **Unit Tests (Jest)** | 102 | ✅ Passing | Component logic, authentication, database operations |
| **E2E Tests (Cypress)** | 102 | ✅ Passing | Complete user journeys across signup, login, expenses, categories, reports, and logout |
| **Browser Coverage** | 3 browsers | ✅ Passing | Chrome, Firefox, Edge |

### 🔗 Accessing CI/CD Results

1. **View Live Status**: Check the badges at the top of this README
2. **View Detailed Results**: Go to the [Actions tab](https://github.com/JasleenMinhas578/BudgetBuddy/actions)
3. **Download Artifacts**: Each workflow run includes downloadable artifacts (coverage reports, screenshots, videos)
4. **Review Test Reports**: Check the `Documents/CI_e2e_run_docs_screenshots/` directory for detailed test documentation

---

## 🎯 Lighthouse Performance & Quality Report

We use **Google Lighthouse** to ensure our application meets high standards for performance, accessibility, best practices, and SEO. The live production deployment on Vercel is regularly audited.

### 📊 Lighthouse Scores

| Category | Score | Status |
|----------|-------|--------|
| **⚡ Performance** | **99/100** | 🟢 Excellent |
| **♿ Accessibility** | **100/100** | 🟢 Excellent |
| **✅ Best Practices** | **100/100** | 🟢 Excellent |
| **🔍 SEO** | **91/100** | 🟢 Excellent |

### 🎉 Overall Assessment

Budget Buddy achieves **excellent scores across all categories**, demonstrating:

✅ **Outstanding Performance (99%)** 
- Fast load times and optimal resource loading
- Efficient rendering and minimal blocking resources
- Optimized images and assets

✅ **Strong Accessibility (100%)**
- WCAG compliance for users with disabilities
- Proper ARIA labels and semantic HTML
- Screen reader friendly implementation
- Good color contrast and keyboard navigation

✅ **Perfect Best Practices (100%)**
- Secure HTTPS deployment
- No console errors or warnings
- Proper asset optimization
- Modern web standards compliance

✅ **Excellent SEO (91%)**
- Mobile-friendly and responsive design
- Proper meta tags and structured data
- Fast page load for better search rankings
- Semantic HTML structure

### 📱 Key Performance Metrics

- **First Contentful Paint (FCP)**: Fast initial render
- **Largest Contentful Paint (LCP)**: Excellent loading performance
- **Time to Interactive (TTI)**: Quick user interaction readiness
- **Cumulative Layout Shift (CLS)**: Stable visual layout
- **Speed Index**: Rapid content visibility

### 🔗 View Full Report

The complete Lighthouse audit report is available in the repository:
- **Report File**: [`Lighthouse_Report.html`](Documents/Lighthouse_Metrics/Lighthouse_metric_report.html)
- **Live URL Tested**: [https://budget-buddy-mun.vercel.app/](https://budget-buddy-mun.vercel.app/)
- **Test Date**: November 18, 2025
- **How to View**: Download and open the HTML file in any web browser for the interactive Lighthouse report

- **Snapshot of the Report**
![`Lighthouse_Report.png`](Documents/Lighthouse_Metrics/Lighthouse_metric_img.png)

---

## 📂 Deliverables
- Requirements and Design Documentation  
- UML diagrams (use case, class, sequence)  
- Functional web application (React + Firebase)  
- CI Workflow Runs (GitHub Actions)
- Test Coverage Reports and Screenshots under `Documents`
- Unit tests & E2E tests  
- Final project Report  
- Presentation + Demo 
- Vercel Deployment
- Live Project: https://budget-buddy-mun.vercel.app/ 

---

## 🚀 Future Improvements & Enhancements

While Budget Buddy successfully meets all requirements for the Fall 2025 academic project, there are several exciting features and improvements we would like to implement in future iterations:

### 🤖 AI-Powered Features
- **Smart Expense Categorization**: Implement machine learning models to automatically categorize expenses based on description patterns
- **Predictive Analytics**: Use LLMs to predict future spending patterns and suggest budget adjustments
- **Natural Language Input**: Allow users to add expenses using natural language (e.g., "Spent $50 on groceries yesterday")

### 💰 Advanced Financial Features
- **Budget Goals & Tracking**: Set monthly/yearly budget goals with progress tracking and alerts
- **Bill Reminders**: Automated notifications for upcoming bill payments
- **Multi-Currency Support**: Handle expenses in different currencies with real-time conversion
- **Split Expenses**: Share and split expenses with friends/family members
- **Income Tracking**: Track income sources alongside expenses for complete financial overview
- **Savings Goals**: Set and track savings goals with visualization

### 🔔 Notifications & Alerts
- **Email Notifications**: Send email summaries and alerts
- **Push Notifications**: Real-time alerts for budget limits and bill reminders
- **SMS Integration**: Text message reminders for critical financial events
- **Weekly/Monthly Summaries**: Automated spending summaries delivered to users

### 🔐 Security & Privacy Enhancements
- **Two-Factor Authentication (2FA)**: Add an extra layer of security for user accounts
- **Biometric Authentication**: Support for fingerprint/face ID on mobile devices
- **Data Encryption**: End-to-end encryption for sensitive financial data

---


## 📚 References

### Development & Frameworks
- **React Documentation**: https://react.dev/  
- **React Router Documentation**: https://reactrouter.com/  
- **Create React App**: https://create-react-app.dev/  
- **Firebase Documentation**: https://firebase.google.com/docs  
- **Firebase Authentication Guide**: https://firebase.google.com/docs/auth  
- **Firestore Database Guide**: https://firebase.google.com/docs/firestore  
- **Chart.js Documentation**: https://www.chartjs.org/docs/latest/  
- **React-ChartJS-2**: https://react-chartjs-2.js.org/  
- **Framer Motion (Animations)**: https://www.framer.com/motion/  
- **date-fns Documentation**: https://date-fns.org/docs/Getting-Started  

### Testing & Quality Assurance
- **Jest Documentation**: https://jestjs.io/docs/getting-started  
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro/  
- **Cypress Documentation**: https://docs.cypress.io/  
- **Cypress Best Practices**: https://docs.cypress.io/guides/references/best-practices  
- **GitHub Actions CI/CD**: https://docs.github.com/en/actions  
- **Testing Best Practices**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library  

### Design & UI/UX
- **CSS Modules**: https://github.com/css-modules/css-modules  
- **Responsive Design Principles**: https://web.dev/responsive-web-design-basics/  
- **Accessibility Guidelines (WCAG)**: https://www.w3.org/WAI/WCAG21/quickref/  
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/  
- **Material Design Guidelines**: https://m3.material.io/  

### Project Management & Agile
- **GitHub Project Management Guide**: https://guides.github.com/features/issues/  
- **Agile User Stories**: https://www.mountaingoatsoftware.com/agile/user-stories  
- **Scrum Guide**: https://scrumguides.org/scrum-guide.html  
- **GitHub Flow**: https://docs.github.com/en/get-started/quickstart/github-flow  
- **Writing Good Commit Messages**: https://chris.beams.io/posts/git-commit/  

### PDF & Report Generation
- **jsPDF Documentation**: https://github.com/parallax/jsPDF  
- **html2canvas Documentation**: https://html2canvas.hertzen.com/documentation  
- **PDF Generation Tutorial**: https://blog.logrocket.com/generating-pdf-react/  

### Deployment & Hosting
- **Vercel Documentation**: https://vercel.com/docs  
- **Environment Variables in React**: https://create-react-app.dev/docs/adding-custom-environment-variables/  
- **React Production Build**: https://create-react-app.dev/docs/production-build/  

### Security & Best Practices
- **Firebase Security Rules**: https://firebase.google.com/docs/rules  
- **React Security Best Practices**: https://pragmaticwebsecurity.com/articles/reactsecurity  
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/  
- **Content Security Policy**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP  

### Code Quality & Tools
- **ESLint**: https://eslint.org/docs/latest/  
- **Prettier**: https://prettier.io/docs/en/  
- **Git Best Practices**: https://git-scm.com/book/en/v2  
- **Semantic Versioning**: https://semver.org/  

### Learning Resources
- **MDN Web Docs**: https://developer.mozilla.org/  
- **Web.dev by Google**: https://web.dev/  
- **JavaScript.info**: https://javascript.info/  
- **React Patterns**: https://reactpatterns.com/  
- **CSS Tricks**: https://css-tricks.com/  

### Academic Resources
- **Software Engineering Best Practices**: https://www.geeksforgeeks.org/software-engineering/  
- **System Design Primer**: https://github.com/donnemartin/system-design-primer  
- **Code Review Best Practices**: https://google.github.io/eng-practices/review/  

--- 

## 📝 Contributing

While this is an academic project, we welcome suggestions and feedback! If you have ideas for improvements or notice any issues:

1. Open an issue on GitHub with your suggestion or bug report
2. Follow the issue template and provide as much detail as possible
3. For major changes, please open an issue first to discuss what you would like to change

---

## 📄 License

This project is for academic purposes as part of COMP6905 - Software Engineering at Memorial University of Newfoundland.

---

## 🙏 Acknowledgments

- **Dr. Liao** - Course Instructor, COMP6905
- **Mr. Syed** - TA
- **Memorial University of Newfoundland** - Computer Science Department

---

**Made with ❤️ by Group 6 | Memorial University of Newfoundland | Fall 2025**

---

