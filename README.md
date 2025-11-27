# 💸 Budget Buddy (Group 6)

[![CI Tests](https://github.com/JasleenMinhas578/BudgetBuddy/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/JasleenMinhas578/BudgetBuddy/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/JasleenMinhas578/BudgetBuddy/actions/workflows/e2e.yml/badge.svg?branch=main)](https://github.com/JasleenMinhas578/BudgetBuddy/actions/workflows/e2e.yml)

> **Live Application**: [https://budget-buddy-mun.vercel.app/](https://budget-buddy-mun.vercel.app/)

---

## 📑 Table of Contents

- [🚀 Project Overview](#-project-overview)
- [📊 Project Status & Quick Links](#-project-status--quick-links)
- [👥 Team](#-team)
- [🖥️ Methodology & Iterations](#️-methodology--iterations)
- [📋 User Stories](#-user-stories)
- [🛠️ Technologies & Tools](#️-technologies--tools)
- [🏗️ Architecture](#️-architecture)
- [🚀 Getting Started](#-getting-started)
- [🧪 Testing](#-testing)
- [🔄 CI/CD Pipeline](#-cicd-pipeline)
- [📊 Quality Reports](#-quality-reports)
- [📂 Deliverables](#-deliverables)
- [🎯 Challenges Faced & Lessons Learned](#-challenges-faced--lessons-learned)
- [🚀 Future Enhancements](#-future-enhancements)
- [📚 References](#-references)
- [📎 Appendices](#-appendices)

---

## 🚀 Project Overview

Budget Buddy is a **free, easy-to-use web application** for managing personal expenses. Unlike many market apps that become paid after trial, Budget Buddy focuses on **cost-effectiveness, accessibility, and simplicity**.

### Core Features
- ✅ Secure authentication (Firebase Auth)
- ✅ Expense and category management (CRUD operations)
- ✅ Data visualization (Pie, Bar, Line charts)
- ✅ Report generation (PDF & CSV export)
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Real-time data synchronization

### Testing & Quality Assurance
- **Unit Testing**: Jest + React Testing Library (295 tests, 100% coverage)
- **E2E Testing**: Cypress (102 tests across 8 test files)
- **Code Quality**: ESLint (0 errors, 0 warnings)
- **Acceptance Testing**: User Stories coverage
- **Performance**: Lighthouse (99% performance, 100% accessibility)
- **CI/CD**: GitHub Actions + Vercel deployment

---

## 📊 Project Status & Quick Links

### ✅ Current Status
- **All Tests Passing**: 295 unit tests + 102 E2E tests
- **Code Quality**: 100% (0 ESLint errors/warnings)
- **Test Coverage**: 100% (statements, branches, functions, lines)
- **Acceptance Testing**: 100% (requirements and user stories coverage)
- **Performance**: 99/100 (Lighthouse)
- **Accessibility**: 100/100 (WCAG 2.1 compliant)

### 🔗 Quick Links

| Resource | Link |
|----------|------|
| **Live Application** | [budget-buddy-mun.vercel.app](https://budget-buddy-mun.vercel.app/) |
| **CI/CD Results** | [GitHub Actions](https://github.com/JasleenMinhas578/BudgetBuddy/actions) |
| **Deployments** | [Vercel Deployments](https://github.com/JasleenMinhas578/BudgetBuddy/deployments/Production) |
| **Planning Board** | [GitHub Projects](https://github.com/users/JasleenMinhas578/projects/4/views/1) |
| **ESLint Report** | [`eslint-report/ESLint_Report.md`](eslint-report/ESLint_Report.md) |
| **Lighthouse Report** | [`Documents/Lighthouse_Metrics/`](Documents/Lighthouse_Metrics/) |
| **Acceptance Tests & Requirements** | [`Documents/Acceptance_Tests.md`](Documents/Acceptance_Tests.md) |
| **E2E Test Docs** | [`Documents/Cypress_E2E_Testing/`](Documents/Cypress_E2E_Testing/) |
| **Unit Test Docs** | [`Documents/Jest_Unit_Testing/`](Documents/Jest_Unit_Testing/) |

---

## 👥 Team

**Group**: 6 | **Course**: COMP6905 — Software Engineering | **Institution**: Memorial University of Newfoundland

### Team Members

| Member | ID | Email | Role |
|--------|-----|-------|------|
| **Jasleen Minhas** (Lead) | 202481225 | jminhas@mun.ca | Project Lead / Full-Stack |
| **Sumaiya Khan** | 202480995 | sumaiyak@mun.ca | Frontend (UI/UX) |
| **Kaustubh Patil** | 202580621 | kspatil@mun.ca | Frontend (Expenses) |
| **Joel George Sam** | 202483190 | jgeorgesam@mun.ca | QA/Testing |
| **Mashroor Rahman** | 202482239 | masroorr@mun.ca | Backend/Database |
| **Ronit Gajjar** | 202488048 | rhgajjar@mun.ca | Reporting/Features |

### Team Responsibilities

**Jasleen Minhas (Project Lead)**
- Led frontend architecture & Firebase authentication flow
- Implemented Login, Signup, Logout pages with UI, routing, error handling
- Built Expense Management CRUD UI and Firebase integration
- Led Dashboard UI, charts, PDF/CSV reporting
- Wrote majority of unit tests (Auth, Dashboard, Expense modules)
- Implemented Cypress E2E testing & cross-browser verification
- Set up Vercel CI/CD pipeline and deployment troubleshooting
- Managed GitHub boards, issues, story points & documentation

**Mashroor Rahman (Backend/Database)**
- Set up Firebase initialization, configuration & .env
- Contributed to Login/Signup Firebase authentication logic
- Worked on Landing Page, Logout flow, UI fixes
- Implemented Categories & Expenses database integration
- Assisted in Cypress tests, Vercel deployment debugging
- Bug fixing and troubleshooting

**Joel George Sam (QA/Testing)**
- Contributed heavily to unit testing across Authentication, Dashboard, Expenses
- Worked on requirements, UML, architecture & backlog planning
- Helped with Dashboard visualizations, test coverage improvement
- Assisted in Firebase database integrations

**Kaustubh Patil (Frontend - Expenses)**
- Implemented parts of Expense Management UI
- Assisted in Dashboard charts & summary widgets
- Contributed to Category UI, Landing Page content
- Helped with frontend styling & UX consistency

**Sumaiya Khan (Frontend - UI/UX)**
- Signup/Login styling, content, error handling
- Categories UI, Landing Page content
- Assisted in Dashboard widgets & testing tasks

**Ronit Gajjar (Reporting/Features)**
- Implemented Add Expense UI
- Worked on CRUD operations and Firebase syncing
- Helped with Dashboard charting
- Contributed to Categories and Landing Page

### Story Point Contributions

| Member | Story Points |
|--------|--------------|
| **Jasleen** | ≈ 198 SP |
| **Mashroor** | ≈ 147 SP |
| **Sumaiya** | ≈ 104 SP |
| **Joel** | ≈ 92 SP |
| **Kaustubh** | ≈ 95 SP |
| **Ronit** | ≈ 95 SP |

**Total Completed**: 211 Story Points | **Average Velocity**: 42 SP per Sprint

> 📌 **Detailed contribution report**: [`Documents/Planning_Mapping.md`](Documents/Planning_Mapping.md)

---

## 🖥️ Methodology & Iterations

### Methodology
We follow **Agile Software Development** with an iterative sprint-based approach, complemented by key practices from **Extreme Programming (XP)**:
- 5 sprints (2 weeks each) with clear milestones
- GitHub Projects, Issues, and Milestones for planning
- Incremental feature implementation with testing
- Continuous Integration (CI) and Continuous Deployment (CD)
  
In particular, we adopted **four core XP practices** throughout the project:
- **User Stories**: All functionality was captured and planned as user stories with clear acceptance criteria.
- **Pair Programming**: **Most of the production code was written in pairs**, with two developers collaborating at one workstation to improve design quality, knowledge sharing, and defect detection.
- **Test-Driven Development (TDD)**: Many modules (especially authentication, dashboard, and expense management) were developed with tests written first or in very tight red‑green‑refactor loops.
- **Refactoring**: We continuously refactored code (e.g., during ESLint fixes, test improvements, and architecture cleanup) to improve readability, maintainability, and adherence to our naming and style conventions.

#### Visual: How We Worked Each Sprint

![Development Methodology Flow](Documents/Methodology.svg)

### Iterations Summary

| Iteration | Dates | Story Points | Key Deliverables | GitHub Issues |
|-----------|-------|--------------|------------------|--------------|
| **Iteration 1** | Sept 22 – Oct 5 | 35 SP | Requirements, UML diagrams, repo setup, CI/CD | [#1](https://github.com/JasleenMinhas578/BudgetBuddy/issues/1), [#2](https://github.com/JasleenMinhas578/BudgetBuddy/issues/2), [#3](https://github.com/JasleenMinhas578/BudgetBuddy/issues/3), [#4](https://github.com/JasleenMinhas578/BudgetBuddy/issues/4), [#5](https://github.com/JasleenMinhas578/BudgetBuddy/issues/5), [#6](https://github.com/JasleenMinhas578/BudgetBuddy/issues/6), [#7](https://github.com/JasleenMinhas578/BudgetBuddy/issues/7), [#16](https://github.com/JasleenMinhas578/BudgetBuddy/issues/16) |
| **Iteration 2** | Oct 6 – Oct 19 | 76 SP | React setup, Landing/Login/Signup, Firebase Auth | [#8](https://github.com/JasleenMinhas578/BudgetBuddy/issues/8), [#9](https://github.com/JasleenMinhas578/BudgetBuddy/issues/9), [#10](https://github.com/JasleenMinhas578/BudgetBuddy/issues/10), [#11](https://github.com/JasleenMinhas578/BudgetBuddy/issues/11), [#12](https://github.com/JasleenMinhas578/BudgetBuddy/issues/12), [#13](https://github.com/JasleenMinhas578/BudgetBuddy/issues/13), [#36](https://github.com/JasleenMinhas578/BudgetBuddy/issues/36), [#38](https://github.com/JasleenMinhas578/BudgetBuddy/issues/38), [#40](https://github.com/JasleenMinhas578/BudgetBuddy/issues/40), [#42](https://github.com/JasleenMinhas578/BudgetBuddy/issues/42), [#43](https://github.com/JasleenMinhas578/BudgetBuddy/issues/43), [#44](https://github.com/JasleenMinhas578/BudgetBuddy/issues/44), [#45](https://github.com/JasleenMinhas578/BudgetBuddy/issues/45), [#46](https://github.com/JasleenMinhas578/BudgetBuddy/issues/46), [#47](https://github.com/JasleenMinhas578/BudgetBuddy/issues/47), [#49](https://github.com/JasleenMinhas578/BudgetBuddy/issues/49), [#50](https://github.com/JasleenMinhas578/BudgetBuddy/issues/50), [#58](https://github.com/JasleenMinhas578/BudgetBuddy/issues/58), [#59](https://github.com/JasleenMinhas578/BudgetBuddy/issues/59), [#62](https://github.com/JasleenMinhas578/BudgetBuddy/issues/62) |
| **Iteration 3** | Oct 20 – Nov 2 | 46 SP | Expense & category management, Firestore integration | [#20](https://github.com/JasleenMinhas578/BudgetBuddy/issues/20), [#21](https://github.com/JasleenMinhas578/BudgetBuddy/issues/21), [#22](https://github.com/JasleenMinhas578/BudgetBuddy/issues/22), [#23](https://github.com/JasleenMinhas578/BudgetBuddy/issues/23), [#24](https://github.com/JasleenMinhas578/BudgetBuddy/issues/24), [#25](https://github.com/JasleenMinhas578/BudgetBuddy/issues/25), [#26](https://github.com/JasleenMinhas578/BudgetBuddy/issues/26), [#28](https://github.com/JasleenMinhas578/BudgetBuddy/issues/28), [#29](https://github.com/JasleenMinhas578/BudgetBuddy/issues/29), [#66](https://github.com/JasleenMinhas578/BudgetBuddy/issues/66), [#78](https://github.com/JasleenMinhas578/BudgetBuddy/issues/78), [#81](https://github.com/JasleenMinhas578/BudgetBuddy/issues/81), [#85](https://github.com/JasleenMinhas578/BudgetBuddy/issues/85) |
| **Iteration 4** | Nov 3 – Nov 16 | 28 SP | Charts, reports (PDF/CSV), dashboard, responsive design | [#30](https://github.com/JasleenMinhas578/BudgetBuddy/issues/30), [#31](https://github.com/JasleenMinhas578/BudgetBuddy/issues/31), [#32](https://github.com/JasleenMinhas578/BudgetBuddy/issues/32), [#33](https://github.com/JasleenMinhas578/BudgetBuddy/issues/33), [#34](https://github.com/JasleenMinhas578/BudgetBuddy/issues/34), [#35](https://github.com/JasleenMinhas578/BudgetBuddy/issues/35), [#87](https://github.com/JasleenMinhas578/BudgetBuddy/issues/87) |
| **Iteration 5** | Nov 17 – Nov 30 | 26 SP | E2E testing, ESLint fixes, documentation, finalization | [#91](https://github.com/JasleenMinhas578/BudgetBuddy/issues/91), [#94](https://github.com/JasleenMinhas578/BudgetBuddy/issues/94), [#98](https://github.com/JasleenMinhas578/BudgetBuddy/issues/98), [#100](https://github.com/JasleenMinhas578/BudgetBuddy/issues/100), [#102](https://github.com/JasleenMinhas578/BudgetBuddy/issues/102) |

**Total**: 211 Story Points across 5 iterations

---

## 📋 User Stories

### 📌 **Primary User Stories (Features)**  
**Total**: 7 primary user stories (features), decomposed into **29 GitHub feature issues** (55 allocated story points, 113 total feature story points)

#### Iteration 1 (Sept 22 – Oct 5)
*No Primary user stories - Just Setup and planning phase*

#### Iteration 2 (Oct 6 – Oct 19) - 3 user stories, 13 story points
- **US-001**: User Registration [5 points] [Status: Done]
  - **GitHub Issues**: [#10](https://github.com/JasleenMinhas578/BudgetBuddy/issues/10), [#45](https://github.com/JasleenMinhas578/BudgetBuddy/issues/45), [#46](https://github.com/JasleenMinhas578/BudgetBuddy/issues/46), [#47](https://github.com/JasleenMinhas578/BudgetBuddy/issues/47)
- **US-002**: User Login [5 points] [Status: Done]
  - **GitHub Issues**: [#9](https://github.com/JasleenMinhas578/BudgetBuddy/issues/9), [#42](https://github.com/JasleenMinhas578/BudgetBuddy/issues/42), [#43](https://github.com/JasleenMinhas578/BudgetBuddy/issues/43), [#44](https://github.com/JasleenMinhas578/BudgetBuddy/issues/44), [#87](https://github.com/JasleenMinhas578/BudgetBuddy/issues/87)
- **US-007**: User Logout [3 points] [Status: Done]
  - **GitHub Issues**: [#11](https://github.com/JasleenMinhas578/BudgetBuddy/issues/11), [#59](https://github.com/JasleenMinhas578/BudgetBuddy/issues/59)

#### Iteration 3 (Oct 20 – Nov 2) - 3 user stories, 29 story points
- **US-003**: View Dashboard [8 points] [Status: Done]
  - **GitHub Issues**: [#30](https://github.com/JasleenMinhas578/BudgetBuddy/issues/30), [#31](https://github.com/JasleenMinhas578/BudgetBuddy/issues/31), [#33](https://github.com/JasleenMinhas578/BudgetBuddy/issues/33), [#58](https://github.com/JasleenMinhas578/BudgetBuddy/issues/58)
- **US-004**: Manage Expenses [13 points] [Status: Done]
  - **GitHub Issues**: [#20](https://github.com/JasleenMinhas578/BudgetBuddy/issues/20), [#21](https://github.com/JasleenMinhas578/BudgetBuddy/issues/21), [#22](https://github.com/JasleenMinhas578/BudgetBuddy/issues/22), [#23](https://github.com/JasleenMinhas578/BudgetBuddy/issues/23), [#24](https://github.com/JasleenMinhas578/BudgetBuddy/issues/24)
- **US-005**: Manage Categories [8 points] [Status: Done]
  - **GitHub Issues**: [#25](https://github.com/JasleenMinhas578/BudgetBuddy/issues/25), [#26](https://github.com/JasleenMinhas578/BudgetBuddy/issues/26), [#28](https://github.com/JasleenMinhas578/BudgetBuddy/issues/28), [#29](https://github.com/JasleenMinhas578/BudgetBuddy/issues/29), [#78](https://github.com/JasleenMinhas578/BudgetBuddy/issues/78)

#### Iteration 4 (Nov 3 – Nov 16) - 1 user story, 13 story points
- **US-006**: Generate Reports [13 points] [Status: Done]
  - **GitHub Issues**: [#30](https://github.com/JasleenMinhas578/BudgetBuddy/issues/30), [#32](https://github.com/JasleenMinhas578/BudgetBuddy/issues/32), [#34](https://github.com/JasleenMinhas578/BudgetBuddy/issues/34), [#35](https://github.com/JasleenMinhas578/BudgetBuddy/issues/35)

#### Iteration 5 (Nov 17 – Nov 30)
*No new primary user stories - Testing, quality assurance, and documentation (covered by infrastructure/support issues such as testing, CI/CD, documentation, and quality tasks)*

### 📌 **Infrastructure & Supporting User Stories**  
In addition to the 7 primary user stories, the project includes **infrastructural/supporting work** that enabled those features:

- **Project Setup & Planning**: 8 issues, 35 SP (e.g., requirements, UML, repo setup, Firebase/React initialization)  
- **Landing Page & Navigation**: 4 issues, 16 SP (marketing/entry UX, routing, responsiveness)  
- **Testing Infrastructure**: 6 issues, 29 SP (unit test infrastructure, E2E setup, cross-browser coverage)  
- **CI/CD & Deployment**: 2 issues, 9 SP (Vercel deployment, CI workflows, preview fixes)  
- **Documentation & Quality**: 5 issues, 17 SP (README/docs, UI/UX polish, ESLint/Lighthouse work)

## 📌 **Overall Summary of User Stories**  
All **7 primary user stories** completed (55 allocated story points) and implemented through **29 feature issues**.  
Infrastructure/support work adds **25 issues** and **98 story points**, for a total of **54 core issues** and **211 story points** across **5 iterations** (plus additional overhead issues as detailed in `Documents/Planning_Mapping.md`).  
Status: ✅ **100% feature + infrastructure scope complete**

> 📋 **Detailed user stories with acceptance criteria**: [`Documents/Acceptance_Tests.md`](Documents/Acceptance_Tests.md)  
> 📋 **Complete issue mapping**: [`Documents/Planning_Mapping.md`](Documents/Planning_Mapping.md#3-github-issues-mapping-by-category)

---

## 🛠️ Technologies & Tools

| Technology | Link | Why We Use It | Alternatives Considered |
|------------|------|---------------|-------------------------|
| **React.js** | [React.dev](https://react.dev/) | Component-based architecture, virtual DOM for efficient rendering, extensive ecosystem, strong community support. Ideal for rapid development with declarative syntax and unidirectional data flow. | Vue.js (smaller ecosystem), Angular (steeper learning curve) |
| **React Context API** | [React Context](https://react.dev/reference/react/createContext) | Lightweight global state management without external dependencies. Perfect for authentication state, eliminates prop drilling, zero bundle size impact. | Redux (too complex), Zustand (unnecessary dependency) |
| **React Router** | [React Router](https://reactrouter.com/) | Industry standard for React routing. Provides declarative routing, protected routes, and seamless React integration. | Next.js (requires migration), Reach Router (merged into React Router) |
| **Firebase Auth** | [Firebase Auth](https://firebase.google.com/docs/auth) | Production-ready authentication with minimal setup. Handles password hashing, JWT tokens, session management automatically. Seamless React integration with real-time auth state. | Auth0 (cost/complexity), AWS Cognito (complex setup), Custom (security risks) |
| **Cloud Firestore** | [Firestore](https://firebase.google.com/docs/firestore) | NoSQL database with real-time sync, automatic scaling, offline support. Real-time listeners eliminate polling. Security rules enable fine-grained access control. | MongoDB Atlas (no real-time), PostgreSQL (no real-time), Realtime DB (worse querying) |
| **Chart.js** | [Chart.js](https://www.chartjs.org/) | Simple, flexible charting with excellent React integration. Supports Pie/Bar/Line charts, responsive design, extensive customization. Lightweight with large community. | D3.js (steep learning curve), Recharts (less customization), Victory (heavier) |
| **date-fns** | [date-fns](https://date-fns.org/) | Modern, tree-shakeable date utilities. Immutable functions, smaller bundle size than Moment.js, excellent TypeScript support. | Moment.js (maintenance mode, large bundle), Luxon (larger), Day.js (fewer features) |
| **jsPDF + html2canvas** | [jsPDF](https://github.com/parallax/jsPDF) / [html2canvas](https://html2canvas.hertzen.com/) | Client-side PDF generation without server. Captures DOM elements as images for charts. Simple, no backend required. | Server-side (Puppeteer/PDFKit - adds complexity), pdfmake (poor chart support) |
| **Jest + RTL** | [Jest](https://jestjs.io/) / [RTL](https://testing-library.com/docs/react-testing-library/intro/) | Industry standard React testing. Jest provides test runner, mocking, coverage. RTL encourages behavior-based testing for maintainable tests. | Mocha (more setup), Jasmine (older), Vitest (less ecosystem) |
| **Cypress** | [Cypress](https://www.cypress.io/) | E2E testing in real browsers with excellent DX. Time-travel debugging, automatic waiting, screenshot/video capture. Multi-browser support with CI/CD integration. | Selenium (slower, complex), Playwright (less community), Puppeteer (Chrome-only) |
| **ESLint** | [ESLint](https://eslint.org/) | Industry standard JavaScript linter. Maintains code quality, catches bugs early, enforces standards. Seamless React integration with extensive rule set. | Prettier (formatting only), JSHint (deprecated), TSLint (deprecated) |
| **Vercel** | [Vercel](https://vercel.com/) | Zero-config React deployment. Automatic Git deployments, preview URLs, global CDN, built-in SSL. Excellent React optimization with generous free tier. | Netlify (less React optimization), AWS Amplify (more config), Traditional hosting (no CDN/scaling) |
| **GitHub Actions** | [GitHub Actions](https://docs.github.com/en/actions) | CI/CD integrated with GitHub. Matrix builds, artifact management, workflow automation. Version-controlled YAML config with generous free tier. | Jenkins (server setup), CircleCI/Travis (external services) |
| **npm** | [npm](https://www.npmjs.com/) | Default Node.js package manager, pre-installed. Largest registry, excellent docs, lock file ensures consistency. | Yarn (adds tool), pnpm (compatibility issues) |

> 📋 **Detailed justifications**: See [`Documents/Architecture_Diagrams.md`](Documents/Architecture_Diagrams.md#7-infrastructure--technology-choices) for complete technology choice rationale.

## 🏗️ Architecture

### System Architecture Overview

Budget Buddy follows a **Client-Server Architecture** with **Layered Architecture** within the client application:

**Primary Architecture Pattern: Client-Server**
- **Client**: React Single Page Application (SPA) running in the browser
- **Server**: Firebase cloud services (Authentication, Firestore Database)

**Secondary Architecture Pattern: Layered Architecture (within Client)**
- **Presentation Layer**: React components, pages, UI elements
- **Business Logic Layer**: Services, utilities, validation, context
- **Data Access Layer**: Firebase SDK integration, API calls

```
┌─────────────────────────────────────┐
│      CLIENT (React SPA)              │
│  ┌────────────────────────────────┐ │
│  │  Presentation Layer            │ │
│  │  - Pages, Components, UI       │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  Business Logic Layer          │ │
│  │  - Services, Context, Utils   │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  Data Access Layer              │ │
│  │  - Firebase SDK, API calls     │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
                              ↕ HTTPS/REST
┌─────────────────────────────────────┐
│   SERVER (Firebase Cloud)            │
│  - Authentication (Email/Password)   │
│  - Firestore (NoSQL Database)       │
│  - Real-time Sync                    │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│   DEPLOYMENT & CI/CD                │
│  - Vercel (Hosting + CDN)            │
│  - GitHub Actions (CI/CD)            │
└─────────────────────────────────────┘
```

**Architecture Pattern Justification**:
- **Client-Server**: Clear separation between client (React) and server (Firebase), enabling scalability, security, and independent deployment
- **Layered Architecture (Client)**: Separation of concerns within the client application promotes maintainability, testability, and code organization

### Component Structure

```
src/
├── components/
│   ├── Auth/          # Login, Signup
│   ├── Dashboard/     # Overview, Expenses, Categories, Reports
│   ├── Expense/       # ExpenseForm, ExpenseList
│   ├── Charts/        # PieChart, BarChart, LineChart
│   ├── Layout/        # Navbar, Sidebar
│   └── UI/            # Modal, Toast
├── context/           # AuthContext
├── services/          # database.js (Firebase CRUD)
└── firebaseConfig.js  # Firebase initialization
```

### Firebase Architecture

**Authentication**: Email/Password with JWT tokens, automatic refresh, protected routes

**Firestore Structure**:
- `users/` - User profiles
- `expenses/` - Expense records (userId, title, amount, category, date)
- `categories/` - Category records (userId, name)

**Security Rules**: User-level data isolation, authenticated access only

**Real-time Sync**: `onSnapshot()` listeners for automatic UI updates

### State Management
- **React Context API** for global authentication state
- **Local component state** for UI interactions
- **Firestore real-time listeners** for data state

> 📋 **Detailed Architecture**: [`Documents/Architecture_Diagrams.md`](Documents/Architecture_Diagrams.md)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20 LTS or newer
- **npm** (comes with Node.js)
- **Git**

### Installation

   ```bash
# 1. Clone repository
   git clone https://github.com/JasleenMinhas578/BudgetBuddy.git
   cd BudgetBuddy

# 2. Install dependencies
   npm install

# 3. Start development server
   npm start
   ```

The application will open at `http://localhost:3000`

> ✅ **Note**: The `.env` file with Firebase configuration is included in this repository.

### Available Scripts

```bash
# Development
npm start              # Start dev server
npm run build          # Production build

# Testing
npm test               # Run unit tests
npm test -- --coverage # Run with coverage
npm run cypress:open   # Open Cypress (interactive)
npm run cypress:run    # Run Cypress (headless)
npm run test:e2e       # Run E2E tests with server

# Code Quality
npx eslint src/ --ext .js,.jsx  # Run ESLint
```

### Project Structure

```
budget-buddy/
├── src/                    # Source code
│   ├── components/        # React components
│   ├── context/           # AuthContext
│   ├── services/          # Firebase services
│   └── __tests__/         # Unit tests
├── cypress/               # E2E tests
│   ├── e2e/              # Test specs
│   ├── fixtures/         # Test data
│   └── support/          # Custom commands
├── Documents/            # Documentation
│   ├── Cypress_E2E_Testing/
│   ├── Jest_Unit_Testing/
│   └── ...
├── .github/workflows/    # CI/CD workflows
└── eslint-report/        # ESLint reports
```

### Troubleshooting

- **Port 3000 in use**: App will suggest alternative port
- **Dependencies issues**: Run `npm install` again
- **Firebase errors**: Check internet connection
- **Test failures**: Run `npm test -- --watchAll=false` for detailed errors

---

## 🧪 Testing

### Unit Testing (Jest)

**Coverage**: 100% (Statements, Branches, Functions, Lines)

| Metric | Value |
|--------|-------|
| **Test Files** | 26 files |
| **Total Tests** | 295 tests |
| **Status** | ✅ All passing |

**Test Categories**:
- Application shell & routing (App, Navigation, Navbar, Sidebar)
- Authentication flows (Login, Signup, AuthFlow)
- Dashboard & data (DashboardOverview, Expenses, Categories)
- Charts & visualization (PieChart, BarChart, LineChart)
- UI components (Modal, Toast)
- Utilities (database, firebaseConfig)

> 📋 **Detailed Test Catalog**: [`Documents/Jest_Unit_Testing/Jest_Unit_Test_Catalog.md`](Documents/Jest_Unit_Testing/Jest_Unit_Test_Catalog.md)

![Unit Tests Coverage](Documents/Jest_Unit_Testing/Unit_Tests_Coverage.png)

### Acceptance Testing & Requirements Traceability

**Goal**: Verify that every functional and non-functional requirement is covered by user stories, acceptance criteria, and automated tests.

**Coverage**: 100% requirements and user stories coverage

| Category | Total | Tested/Verified | Coverage | Status |
|----------|-------|-----------------|----------|--------|
| **Functional Requirements** | 11 | 11 | 100% | ✅ Complete |
| **Non-Functional Requirements** | 10 | 10 | 100% | ✅ Complete |
| **User Stories** | 7 | 7 | 100% | ✅ Complete |
| **Acceptance Criteria** | 38 | 38 | 100% | ✅ Complete |
| **GitHub Issues** | 100 | 100 | 100% | ✅ Complete |

Acceptance testing is implemented primarily via **Cypress E2E tests** and mapped end‑to‑end from requirements → user stories → acceptance criteria → GitHub issues → automated tests.

> 📋 **Detailed Acceptance Tests & Traceability**: [`Documents/Acceptance_Tests.md`](Documents/Acceptance_Tests.md)

### Traceability Verification

**Requirements Coverage Summary**:

```
┌─────────────────────────────────────────────────────────┐
│         Requirements Coverage Summary                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Total Requirements:              21                    │
│  Requirements Tested/Verified:    21                    │
│  Coverage Percentage:             100%                  │
│                                                          │
│  Functional Requirements:         11/11  ✅             │
│  Non-Functional Requirements:     10/10  ✅             │
│                                                          │
│  Total User Stories:              7                     │
│  User Stories Implemented:        7                     │
│                                                          │
│  Total Acceptance Criteria:       38                    │
│  Acceptance Criteria Tested:      38                    │
│                                                          │
│  Total E2E Tests:                 102                   │
│  Passing Tests:                   102 (100%)            │
│  Failing Tests:                   0 (0%)                │
│                                                          │
│  Total Unit Tests:                295                   │
│  Passing Tests:                   295 (100%)            │
│  Failing Tests:                   0 (0%)                │
│                                                          │
│  Status:                          ✅ COMPLETE           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### E2E Testing (Cypress)

**Coverage**: Complete user journey coverage

| Test Suite | # Tests | Coverage |
|------------|---------|----------|
| Smoke Tests | 10 | Basic functionality |
| Signup Flow | 11 | User registration |
| Login Flow | 13 | Authentication |
| Dashboard | 16 | Navigation & display |
| Expenses | 12 | CRUD operations |
| Categories | 12 | Category management |
| Reports | 16 | Report generation |
| Logout | 18 | Session management |
| **Total** | **102** | **Complete E2E** |

**Test Files**: `cypress/e2e/`
- `smoke.cy.js`, `01-signup.cy.js`, `02-login.cy.js`, `03-dashboard.cy.js`
- `04-expenses.cy.js`, `05-categories.cy.js`, `06-reports.cy.js`, `07-logout.cy.js`

> 📋 **Detailed E2E Guide**: [`Documents/Cypress_E2E_Testing/Cypress_E2E_Testing.md`](Documents/Cypress_E2E_Testing/Cypress_E2E_Testing.md)

![E2E Tests](Documents/Cypress_E2E_Testing/Cypress_Tests_Passing.png)

---

## 🔄 CI/CD Pipeline

### Workflow Overview

```mermaid
flowchart LR
  Dev[Developer Push / PR] --> GA[GitHub Actions CI]
  GA --> UT[Run Unit Tests\n+ Coverage]
  UT --> B[Build React App]
  B --> E2E[Cypress E2E\n(Chrome / Firefox / Edge)]
  E2E --> V[Vercel Deploy\nPreview/Prod]
  V --> Badge[Status Badges\nin README]
```

### CI Workflow (`ci.yml`)

**Triggers**: Push to `main`/`develop`, Pull requests

**Steps**:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (`npm ci`)
4. Run unit tests (295 tests)
5. Generate coverage reports
6. Build production bundle
7. Upload artifacts

**Duration**: ~3-5 minutes | **Success Rate**: 100%

### E2E Workflow (`e2e.yml`)

**Multi-Job Strategy**:
- **Job 1**: Unit tests & build (prerequisite)
- **Job 2**: E2E tests (matrix: Chrome, Firefox, Edge)

**Features**:
- Parallel browser execution
- Screenshot/video capture
- Artifact upload (7-day retention)

**Duration**: ~20 minutes (parallel) | **Success Rate**: 100%

### Continuous Deployment (Vercel)

**Automatic Deployment**:
- Push to `main` → Production deployment
- Push to `develop` → Preview deployment
- Pull requests → Preview URLs

**Features**:
- Zero-downtime deployments
- Global CDN (100+ edge locations)
- Automatic HTTPS/SSL
- Instant rollback

### CI/CD Metrics

| Metric | Value |
|--------|-------|
| **CI Execution Time** | 3-5 minutes |
| **E2E Execution Time** | ~20 minutes (parallel) |
| **Total Tests** | 397 (295 unit + 102 E2E) |
| **Success Rate** | 100% |
| **Browser Coverage** | Chrome, Firefox, Edge |

### Accessing Results

1. **Status Badges**: Top of README (real-time status)
2. **GitHub Actions**: [Actions tab](https://github.com/JasleenMinhas578/BudgetBuddy/actions)
3. **Artifacts**: Downloadable from workflow runs
4. **Vercel Dashboard**: Deployment history and preview URLs

---

## 📊 Quality Reports

### ESLint Code Quality

**Status**: ✅ **PERFECT** (0 errors, 0 warnings)

| Metric | Value |
|--------|-------|
| **Files Analyzed** | 50+ JavaScript/JSX files |
| **Current Issues** | 0 errors, 0 warnings |
| **Code Quality Score** | 100% |
| **Historical Fixes** | 200 issues → 0 issues |

**Key Improvements**:
- Fixed 200 ESLint violations (196 errors, 4 warnings)
- Enforced React & Testing Library best practices
- 100% compliance with 170+ rules

> 📋 **Full Report**: [`eslint-report/ESLint_Report.md`](eslint-report/ESLint_Report.md)

![ESLint Before](eslint-report/Eslint_Report_Before_Fixes.png)
![ESLint After](eslint-report/Eslint_Report_After_Fixes.png)

### Lighthouse Performance

**Scores**:

| Category | Score | Status |
|----------|-------|--------|
| **Performance** | 99/100 | 🟢 Excellent |
| **Accessibility** | 100/100 | 🟢 Excellent |
| **Best Practices** | 100/100 | 🟢 Excellent |
| **SEO** | 91/100 | 🟢 Excellent |

**Key Metrics**:
- Fast load times and optimal resource loading
- WCAG 2.1 compliance (100% accessibility)
- Secure HTTPS deployment
- Mobile-friendly responsive design

> 📋 **Full Report**: [`Documents/Lighthouse_Metrics/Lighthouse_metric_report.html`](Documents/Lighthouse_Metrics/Lighthouse_metric_report.html)

![Lighthouse Report](Documents/Lighthouse_Metrics/Lighthouse_metric_img.png)

---

## 📂 Deliverables

✅ **Requirements & Design Documentation**  
✅ **UML Diagrams** (use case, class, sequence)  
✅ **Functional Web Application** (React + Firebase)  
✅ **CI/CD Workflows** (GitHub Actions)  
✅ **Test Coverage Reports** (100% coverage)  
✅ **Unit Tests** (295 tests)  
✅ **E2E Tests** (102 tests)  
✅ **Code Quality Reports** (ESLint, Lighthouse)  
✅ **Final Project Report**  
✅ **Presentation & Demo**  
✅ **Vercel Deployment**  
✅ **Live Application**: [budget-buddy-mun.vercel.app](https://budget-buddy-mun.vercel.app/)

---

## 🎯 Challenges Faced & Lessons Learned

### 1. Code Quality & ESLint Compliance
**Challenge**: 200 ESLint violations (196 errors, 4 warnings) causing inconsistent code style and potential bugs.  
**Solution**: Comprehensive ESLint config, CI/CD integration, systematic refactoring by category.  
**Lesson**: Early linting integration prevents technical debt. Enforcing in CI/CD ensures consistent quality.  
**Result**: ✅ 0 errors, 0 warnings — 100% compliance

### 2. Firebase Security Rules & Data Isolation
**Challenge**: Ensuring users only access their own data while maintaining performance.  
**Solution**: Firestore structure with `userId` as primary field, security rules with auth checks, optimized indexes, E2E testing.  
**Lesson**: Security-first design in data model enables both security and performance. Test security rules like functionality.  
**Result**: ✅ Secure, performant data access with user isolation

### 3. Real-Time Data Synchronization
**Challenge**: Memory leaks, unnecessary re-renders, and race conditions with Firestore listeners.  
**Solution**: Proper `useEffect` cleanup with unsubscribe functions, query constraints, debouncing, centralized data service layer.  
**Lesson**: Always clean up subscriptions. Centralized data access improves management and testing.  
**Result**: ✅ Efficient real-time sync with no memory leaks

### 4. Vercel Preview Deployment Failures
**Challenge**: Preview deployments failing, blocking PR reviews and testing.  
**Solution**: Diagnosed Firebase env variable issues, fixed `.env` structure, added deployment verification in CI/CD, created troubleshooting guide.  
**Lesson**: Environment variables must be configured in all deployment environments. Documentation prevents silent failures.  
**Result**: ✅ Reliable preview deployments for all PRs

### 5. Test Coverage & E2E Testing Complexity
**Challenge**: Achieving 100% coverage with maintainable tests, reliable cross-browser E2E tests.  
**Solution**: React Testing Library best practices, async testing with `waitFor`, Cypress with fixtures, matrix strategy for cross-browser testing, proper test isolation.  
**Lesson**: Test quality over quantity. Focus on user behavior and critical paths. Proper setup prevents flaky tests.  
**Result**: ✅ 295 unit + 102 E2E tests, all passing

### 6. State Management & Context API
**Challenge**: Managing global auth state and local component state without prop drilling or unnecessary re-renders.  
**Solution**: `AuthContext` for global state, local state for UI data, Firestore listeners for data state, split context providers, `useMemo`/`useCallback` optimization.  
**Lesson**: Not all state needs to be global. Context for global state, local state for components, real-time DB can replace some state management.  
**Result**: ✅ Clean state management with minimal re-renders

### 7. Performance Optimization & Bundle Size
**Challenge**: Slow load times, large bundles, poor mobile performance, slow chart rendering.  
**Solution**: Code splitting with lazy loading, optimized Chart.js imports, `date-fns` over Moment.js, pagination/virtualization, loading states, Vercel CDN.  
**Lesson**: Performance is a feature. Regular audits and bundle monitoring catch issues early. Fast load times improve UX.  
**Result**: ✅ 99/100 Lighthouse score, fast load times

### 8. Team Collaboration & Git Workflow
**Challenge**: Managing 6 team members with merge conflicts and integration issues.  
**Solution**: Clear Git workflow with feature branches, PR review process, GitHub Projects, coding standards, automated CI/CD testing, regular sync meetings.  
**Lesson**: Clear processes and communication are essential. Workflows, standards, and regular communication prevent conflicts.  
**Result**: ✅ Smooth collaboration, 100 issues completed

### 9. Responsive Design & Cross-Device Testing
**Challenge**: Consistent UX across desktop, tablet, mobile with different screen sizes and input methods.  
**Solution**: Mobile-first design, CSS Grid/Flexbox, responsive breakpoints, real device testing, E2E tests with viewport sizes, optimized touch targets, responsive charts.  
**Lesson**: Mobile-first design saves time. Testing on real devices and responsive patterns from the start prevents costly redesigns.  
**Result**: ✅ 100% accessibility, responsive on all devices

### 10. Documentation & Knowledge Sharing
**Challenge**: Maintaining comprehensive, up-to-date documentation accessible to all team members.  
**Solution**: Centralized `Documents/` structure, documentation standards, regular reviews, README as entry point, architecture/UML diagrams, API/testing/deployment docs.  
**Lesson**: Good documentation is an investment. Well-maintained docs accelerate onboarding and reduce questions.  
**Result**: ✅ Comprehensive, up-to-date documentation

---

## 📊 Key Lessons Summary

| Lesson | Impact |
|--------|--------|
| **Early tooling setup** | Prevents technical debt and ensures consistency |
| **Security-first design** | Protects user data and prevents vulnerabilities |
| **Proper cleanup** | Prevents memory leaks and performance issues |
| **Test behavior, not implementation** | Creates maintainable, reliable tests |
| **Performance is a feature** | Improves user experience and engagement |
| **Clear processes** | Enables smooth team collaboration |
| **Mobile-first design** | Ensures accessibility across all devices |
| **Documentation investment** | Accelerates development and knowledge sharing |

---

## 🎓 Overall Project Learnings

1. **Agile methodology works**: Regular sprints and retrospectives enable quick adaptation to challenges
2. **Automation is essential**: CI/CD pipelines, automated testing, and linting catch issues early
3. **User experience matters**: Performance, accessibility, and responsive design significantly impact satisfaction
4. **Team communication is critical**: Regular standups, clear documentation, and shared understanding prevent conflicts
5. **Quality over speed**: Good tests, linting fixes, and optimization pay off long-term
6. **Learning from challenges**: Each challenge provided valuable learning opportunities that improved skills and project quality

---

## 🚀 Future Enhancements

### AI-Powered Features
- Smart expense categorization using ML
- Predictive analytics for spending patterns
- Natural language expense input

### Advanced Financial Features
- Budget goals & tracking
- Bill reminders & notifications
- Multi-currency support
- Split expenses with friends/family
- Income tracking
- Savings goals

### Notifications & Alerts
- Email notifications
- Push notifications
- SMS integration
- Weekly/monthly summaries

### Security Enhancements
- Two-factor authentication (2FA)
- Biometric authentication
- End-to-end encryption

---

## 📚 References

### Development & Frameworks
- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Router](https://reactrouter.com/)
- [Chart.js](https://www.chartjs.org/docs/latest/)

### Testing & Quality
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [ESLint Documentation](https://eslint.org/docs/latest/)

### Deployment & CI/CD
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)

### Design & Accessibility
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Responsive Design](https://web.dev/responsive-web-design-basics/)

---

## 📎 Appendices

### Appendix A: Static Analysis Report
**📋 [ESLint Static Analysis Report](eslint-report/ESLint_Report.md)**

Comprehensive static code analysis using ESLint v8.57.1. Includes executive summary, before/after comparison, detailed issue breakdown, rule compliance, security analysis, and accessibility compliance.

**Key Statistics**: 50 files analyzed, 0 errors/warnings, 100% compliance

---

### Appendix B: Naming Conventions
**📝 [Naming Conventions Guide](Documents/Naming_Conventions_Summary.md)**

Complete documentation of all naming conventions used throughout the codebase. Includes file naming, component naming, variable naming, function naming, CSS classes, test files, and database collections.

**Key Conventions**: PascalCase (components), camelCase (variables/functions), kebab-case (CSS), UPPER_SNAKE_CASE (constants)

---

### Appendix C: Acceptance Tests & Requirements
**✅ [Acceptance Tests & Requirements Traceability](Documents/Acceptance_Tests.md)**

Comprehensive acceptance tests, user stories, acceptance criteria, and requirements traceability. Includes 7 user stories, 38 acceptance criteria, 11 functional requirements, 10 non-functional requirements, and complete test mapping.

**Key Metrics**: 100% requirements coverage, 100% test coverage, 397 tests passing

---

### Appendix D: Architecture Diagrams
**🏗️ [Architecture Diagrams & 4+1 Model](Documents/Architecture_Diagrams.md)**

Complete system architecture documentation following the 4+1 architectural view model. Includes logical view, process view, development view, physical view, and scenarios with 15+ comprehensive diagrams.

--- 

## 📝 Contributing

While this is an academic project, we welcome suggestions and feedback! If you have ideas for improvements or notice any issues:

1. Open an issue on GitHub with your suggestion or bug report
2. Follow the issue template and provide as much detail as possible
3. For major changes, please open an issue first to discuss

---

## 📄 License

This project is for academic purposes as part of **COMP6905 - Software Engineering** at Memorial University of Newfoundland.

---

## 🙏 Acknowledgments

- **Dr. Liao** - Course Instructor, COMP6905
- **Mr. Syed** - TA
- **Memorial University of Newfoundland** - Computer Science Department

---

**Made with ❤️ by Group 6 | Memorial University of Newfoundland | Fall 2025**

