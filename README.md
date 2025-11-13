# 💸 Budget Buddy (Group 6)

**Budget Buddy** is a responsive personal finance tracker built as an academic project for the course **COMP6905 — Software Engineering**.  
The goal of this project is to apply **software engineering practices** (Agile, documentation, testing, CI/CD) while developing a full-stack web application.

- **Course**: COMP6905 — Software Engineering  
- **Purpose**: Academic use; demonstrates SE process from requirements → design → implementation → testing  
- **Tech Stack**: React, React Router, Chart.js, Firebase (Auth + Firestore), date-fns, Framer Motion, Jest  

---

## 🚀 Project Overview

Budget Buddy is your **Budget Companion** — a free, easy-to-use web app for managing personal expenses.  
Unlike many market apps that become paid after trial, Budget Buddy focuses on **cost-effectiveness, accessibility, and simplicity**.  

**Core features: (Fall 2025 Scope)**
- Secure authentication (login/signup with Firebase)  
- Expense and category management  
- Data visualization with charts  
- Report generation (PDF export)  
- Responsive design for desktop, tablet, and mobile  

**Extended scope: (In Future)**
- AI-driven insights (LLMs)  
- CSV import/export  
- Notifications/reminders  

---

## 👥 Team

- **Group**: 6  

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

---

## Methodology

We are following the **Agile Software Development** methodology, using an iterative sprint-based approach.  
- Work is divided into 5 sprints (2 weeks each), with clear milestones.  
- GitHub Projects, Issues, and Milestones are used for sprint planning and tracking.  
- Each feature is implemented incrementally, tested with unit/system tests, and refined based on feedback.  
- Continuous Integration (CI) is set up to ensure all commits are validated before merging.  

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
- System testing, bug fixing, performance optimization  
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
- 🧪 **System Test** — End-to-end testing  


---

## Technologies & Tools  

| **Technology / Tool**       | **Purpose**              | **Reason for Choice**                                                                 |
|------------------------------|--------------------------|----------------------------------------------------------------------------------------|
| **React.js**                | Frontend UI              | Popular, component-based, scalable, and supports responsive web design.                 |
| **React Context API**       | State management         | Lightweight alternative to Redux; perfect for global state like authentication and expense data. |
| **Firebase Authentication** | User login/signup        | Secure, easy-to-integrate, with session handling built-in.                             |
| **Firebase Firestore**      | Database                 | Cloud-based, real-time NoSQL DB, ideal for expense data storage and synchronization.   |
| **Chart.js**                | Visualization            | Widely used, customizable, and integrates easily with React.                           |
| **date-fns**                | Date handling            | Lightweight and faster than Moment.js for parsing and formatting dates.                |
| **jsPDF + html2canvas**     | Report generation        | Allows exporting dashboard summaries into PDF easily.                                  |
| **Jest + React Testing Library** | Testing             | Industry standard for ensuring reliability and maintainability.                        |
| **GitHub (Projects, Issues, PRs)** | Collaboration     | Central hub for version control, Agile sprint tracking, and documentation.             |


---

## 🚀 How to Run the Project

### Prerequisites
- **Node.js** (version 16 or higher)
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
├── public/
├── src/
│   ├── components/
│   │   ├── Auth/          # Login, Signup components
│   │   ├── Dashboard/     # Categories, Expenses, Reports
│   │   ├── Charts/        # PieChart, BarChart, LineChart
│   │   ├── Expense/       # ExpenseForm, ExpenseList
│   │   ├── Layout/        # Navbar, Sidebar, Navigation
│   │   └── UI/            # Modal, Toast components
│   ├── context/           # AuthContext
│   ├── services/          # Database services
│   ├── styles/            # CSS files
│   ├── __tests__/         # Test files
│   └── firebaseConfig.js  # Firebase configuration
├── .env                   # Environment variables (included)
├── package.json
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

## 🧪 Test Cases Summary (Till Now)

Our comprehensive test suite ensures reliability and maintainability of the Budget Buddy application. We follow industry best practices with **Jest** and **React Testing Library** for unit testing.

### 📊 Test Coverage Overview (Till Iteration 3)
- **Total Test Files**: 5
- **Total Tests**: 99 tests
- **Overall Coverage**: 24.6%
- **Status**: All tests passing ✅

![Test Cases Passing](Documents/TestCasesPassing.png)
*Screenshot showing all 99 tests passing across 5 test suites*

### 🔬 Test Files Breakdown (More to be added for other components in coming Iterations)

#### **1. Categories.test.jsx** (26 tests)
**Component**: Categories management with charts and CRUD operations
- **Basic Rendering** (2 tests) - Component structure and UI elements
- **Modal Interactions** (3 tests) - Add category modal open/close functionality
- **Form Interactions** (3 tests) - Input handling and form validation
- **Category Addition** (4 tests) - CRUD operations and success feedback
- **Error Handling** (4 tests) - Firebase errors and edge cases
- **Firebase Integration** (3 tests) - Database operations and real-time sync
- **Data Loading** (2 tests) - Categories and expenses data fetching
- **Form Validation** (2 tests) - Input validation and requirements
- **Toast Notifications** (1 test) - User feedback system
- **Component Lifecycle** (2 tests) - Mount/unmount and re-render handling

#### **2. Login.test.jsx** (16 tests)
**Component**: User authentication login
- **Rendering** (3 tests) - UI elements and accessibility
- **Form Interactions** (2 tests) - Input field updates and loading states
- **Navigation** (3 tests) - Route changes and redirects
- **Error Handling** (4 tests) - Authentication error scenarios
- **Form Validation** (2 tests) - Input validation and submission
- **Loading States** (2 tests) - Button states and spinners

#### **3. Signup.test.jsx** (23 tests)
**Component**: User registration
- **Rendering** (3 tests) - UI elements and accessibility
- **Form Interactions** (4 tests) - Input handling and password visibility
- **Password Validation** (4 tests) - Password strength requirements
- **Navigation** (3 tests) - Route changes and redirects
- **Error Handling** (4 tests) - Registration error scenarios
- **Form Validation** (1 test) - Input validation and submission
- **Loading States** (2 tests) - Button states and spinners
- **Password Visibility Toggle** (2 tests) - UI interaction testing

#### **4. Expenses.test.jsx** (7 tests)
**Component**: Expense management and display
- **Basic Rendering** (3 tests) - Component structure and empty states
- **Add Expense** (2 tests) - Modal opening and form interaction
- **Error Handling** (1 test) - Firebase connection errors
- **Component Integration** (2 tests) - Summary statistics and data display

#### **5. AuthFlow.test.jsx** (27 tests)
**Component**: Complete authentication flow integration
- **End-to-End Authentication Flow** - Complete login/signup integration
- **User Session Management** - Authentication state handling
- **Route Protection** - Private route access control

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

### 📈 Coverage Analysis

| Component | Coverage | Status |
|-----------|----------|--------|
| **Authentication** | 96.55% | ✅ Excellent |
| **Categories** | 69.04% | ✅ Good |
| **Charts** | 60% | ✅ Good |
| **Expenses** | 45.71% | 🔄 Needs Improvement |
| **Dashboard Overview** | 0% | 🔄 Needs Testing |
| **UI Components** | 0% | 🔄 Needs Testing |

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

### 🔧 Test Configuration

Our test setup includes:
- **Jest** as the testing framework
- **React Testing Library** for component testing
- **@testing-library/jest-dom** for custom matchers
- **@testing-library/user-event** for user interaction simulation
- **jsdom** environment for DOM testing

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
│   ├── 07-charts.cy.js        # View charts flow tests
│   └── 08-logout.cy.js        # User logout flow tests
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
| **Signup Flow** | 12 | User registration and validation |
| **Login Flow** | 14 | Authentication and error handling |
| **Dashboard** | 15 | Navigation and data display |
| **Expenses** | 13 | CRUD operations for expenses |
| **Categories** | 15 | Category management |
| **Reports** | 15 | Report generation and export |
| **Charts** | 20 | Data visualization |
| **Logout** | 18 | Session management |
| **Total** | **132** | **Complete E2E coverage** |

### 🎯 Custom Cypress Commands

We've created custom commands to simplify test writing:

```javascript
// Login command
cy.login('user@example.com', 'password123');

// Signup command
cy.signup('newuser@example.com', 'password123');

// Add expense command
cy.addExpense({
  description: 'Groceries',
  amount: 150.50,
  category: 'Food',
  date: '2024-11-10'
});

// Add category command
cy.addCategory({
  name: 'Transportation',
  budget: 300
});

// Logout command
cy.logout();
```

### 📊 Test Results and Artifacts

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
- Runs tests on multiple browsers (Chrome, Firefox, Edge)
- Executes tests in parallel for faster feedback
- Uploads screenshots and videos as artifacts
- Generates test summary reports

#### **View Test Results in CI**
1. Go to the **Actions** tab in GitHub
2. Select the **E2E Tests with Cypress** workflow
3. Click on a specific run to see results
4. Download artifacts (screenshots/videos) if tests fail

### 🐛 Debugging Tests

#### **Debug in Interactive Mode**
```bash
npm run cypress:open
```
- Click on a test file to run it
- Use browser DevTools to inspect elements
- Add `cy.pause()` to pause test execution
- Use `cy.debug()` to log debug information

#### **Debug Failed Tests**
```bash
# Run failed tests with verbose output
npx cypress run --spec "cypress/e2e/failing-test.cy.js" --headed --no-exit
```

#### **Common Debug Commands**
```javascript
// Pause test execution
cy.pause();

// Print debug info
cy.debug();

// Take screenshot
cy.screenshot('debug-screenshot');

// Log to console
cy.log('Debug message');
```

### ⚙️ Cypress Configuration

Key configuration in `cypress.config.js`:

```javascript
{
  baseUrl: 'http://localhost:3000',
  viewportWidth: 1280,
  viewportHeight: 720,
  video: true,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 10000,
  retries: {
    runMode: 2,    // Retry failed tests in CI
    openMode: 0    // No retries in interactive mode
  }
}
```

### 📈 Best Practices

#### **Writing Tests**
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Use custom commands for repeated actions
- ✅ Keep tests independent and isolated
- ✅ Use fixtures for test data

#### **Running Tests**
- ✅ Run tests locally before committing
- ✅ Use interactive mode during development
- ✅ Run full suite before creating PRs
- ✅ Check CI results after pushing

#### **Maintaining Tests**
- ✅ Update tests when features change
- ✅ Fix flaky tests immediately
- ✅ Keep test data in fixtures
- ✅ Document complex test scenarios

### 🔧 Troubleshooting

#### **Tests Timing Out**
Increase timeout in test or config:
```javascript
cy.get('.element', { timeout: 15000 });
```

#### **Firebase Connection Issues**
Ensure `.env` file has correct Firebase credentials:
```bash
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
# ... other Firebase config
```

#### **Port Already in Use**
Kill existing processes:
```bash
lsof -ti:3000 | xargs kill -9
```

#### **Tests Failing in CI but Passing Locally**
- Check environment variables in GitHub Secrets
- Review CI logs and artifacts
- Ensure dependencies are correctly installed
- Verify timeout settings

### 📚 Cypress Resources

- **Official Docs**: https://docs.cypress.io
- **Best Practices**: https://docs.cypress.io/guides/references/best-practices
- **Examples**: https://example.cypress.io
- **API Reference**: https://docs.cypress.io/api/table-of-contents

### 🎓 Learning Cypress

#### **For Beginners**
1. Run `npm run cypress:open`
2. Explore the test files in `cypress/e2e/`
3. Watch tests execute in the browser
4. Try modifying simple tests
5. Read the custom commands in `cypress/support/commands.js`

#### **For Advanced Users**
- Create custom commands for repeated patterns
- Implement page object models for complex pages
- Add visual regression testing
- Integrate with test reporting tools
- Optimize test execution time

---

## 📂 Deliverables
- Requirements and Design Documentation  
- UML diagrams (use case, class, sequence)  
- Functional web application (React + Firebase)  
- Unit tests & system tests  
- Final project report  
- Presentation + Demo  

---

## 📚 References
- GitHub Project Management Guide: https://guides.github.com/features/issues/  
- Firebase Documentation: https://firebase.google.com/docs  
- React Docs: https://react.dev/  
- Chart.js Docs: https://www.chartjs.org/docs/latest/  
- Agile User Stories: https://www.mountaingoatsoftware.com/agile/user-stories  

---
