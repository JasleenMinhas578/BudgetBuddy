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

# Cypress E2E Testing
npm run cypress:open          # Open Cypress Test Runner (interactive)
npm run cypress:run           # Run Cypress tests in headless mode
npm run cypress:run:headless  # Run Cypress tests in headless mode (explicit)
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

## 🧪 End-to-End (E2E) Testing with Cypress

We use **Cypress** for comprehensive end-to-end testing to verify critical user flows work correctly in a real browser environment.

### 📊 E2E Test Coverage

Our Cypress test suite covers:

#### **1. Smoke Tests** (`smoke.spec.js`)
- Application health check
- Basic page loading and navigation
- Form element visibility

#### **2. Authentication Flow** (`auth.spec.js`)
- **Signup Flow**: New user registration, validation, error handling
- **Login Flow**: User authentication, error scenarios
- **Logout Flow**: Session termination and redirect
- **Forgot Password Flow**: Password reset functionality

#### **3. Expense Management** (`expense.spec.js`)
- Adding new expenses
- Expense form validation
- Expense list display

#### **4. Dashboard Display** (`dashboard.spec.js`)
- Dashboard overview and widgets
- Navigation between sections (Expenses, Categories, Reports)
- Route protection for authenticated users

### 🚀 Running Cypress Tests

#### **Interactive Mode (Recommended for Development)**
```bash
# Start the development server in one terminal
npm start

# Open Cypress Test Runner in another terminal
npm run cypress:open
```

This opens the Cypress Test Runner where you can:
- Select and run individual test files
- Watch tests execute in real-time
- Debug tests with browser DevTools
- See screenshots and videos of test runs

#### **Headless Mode (CI/CD)**
```bash
# Run all tests in headless mode
npm run cypress:run

# Or explicitly
npm run cypress:run:headless
```

### 🔄 CI/CD Integration

Cypress tests run automatically on:
- **Push to main/develop branches**
- **Pull requests to main/develop**
- **Manual workflow dispatch**

The GitHub Actions workflow (`.github/workflows/e2e.yml`) will:
1. Build the application
2. Start the development server
3. Run all Cypress tests
4. Upload screenshots and videos as artifacts (on failure/always)

### 📁 Test Artifacts

Test artifacts (screenshots, videos, test results) are automatically uploaded to GitHub Actions and can be found in:
- **GitHub Actions**: Workflow run → Artifacts section
- **Local runs**: `cypress/screenshots/` and `cypress/videos/`

### 🎯 Test Structure

```
cypress/
├── e2e/
│   ├── smoke.spec.js      # Basic health checks
│   ├── auth.spec.js       # Authentication flows
│   ├── expense.spec.js    # Expense management
│   └── dashboard.spec.js   # Dashboard display
├── support/
│   ├── commands.js        # Custom Cypress commands
│   └── e2e.js            # Global configuration
├── fixtures/              # Test data fixtures
└── screenshots/           # Screenshots on failure
└── videos/               # Test execution videos
```

### 🛠️ Custom Commands

We've created custom Cypress commands for common operations:

```javascript
// Login a user
cy.login('user@example.com', 'password123');

// Signup a new user
cy.signup('user@example.com', 'Password123', 'Password123');

// Logout
cy.logout();

// Add an expense
cy.addExpense('Coffee', '5.50', 'Food', '2025-11-15');
```

### 📝 Writing New Tests

When adding new E2E tests:

1. Create a new test file in `cypress/e2e/`
2. Follow the existing test structure and naming conventions
3. Use custom commands when possible for consistency
4. Test both success and error scenarios
5. Ensure tests are independent and can run in any order

### ⚠️ Important Notes

- **Firebase Configuration**: Tests use the same Firebase project as development
- **Test Data**: Tests create unique users with timestamps to avoid conflicts
- **Cleanup**: Tests clear localStorage and cookies between runs
- **Timeouts**: Tests have extended timeouts for Firebase operations

### 🔍 Debugging Failed Tests

If a test fails:

1. Check the Cypress video in `cypress/videos/`
2. Review screenshots in `cypress/screenshots/`
3. Run the test in interactive mode: `npm run cypress:open`
4. Use `cy.pause()` or `cy.debug()` in your test code
5. Check browser console for errors

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
