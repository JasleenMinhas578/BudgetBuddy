# 📑 Requirements Document — Budget Buddy

**Course**: COMP6905 — Software Engineering  
**Project**: Budget Buddy  
**Team**: Group 6  
**Date**: September 22, 2025  
**Status**: ✅ Complete — All requirements implemented and tested

---

## 1. Introduction

Budget Buddy is a personal finance tracking web application aimed at helping users manage their expenses effectively.  
The system provides functionalities for user authentication, expense and category management, visualization of financial data, and generation of reports.  
This project follows the **Agile Methodology** with incremental delivery across five iterations.

---

## 2. Functional Requirements (FR)

### FR1 — User Authentication
- **FR1.1**: Users shall be able to sign up and log in securely using email and password.  
- **FR1.2**: Only authenticated users shall access their own data (session-based protection).  

### FR2 — Expense Management
- **FR2.1**: Users shall be able to add an expense with title, amount, category, and date.  
- **FR2.2**: Users shall be able to edit or delete an expense.  
- **FR2.3**: Users shall be able to view all expenses in list or card format.  

### FR3 — Category Management
- **FR3.1**: Users shall be able to create and manage custom categories (e.g., Food, Travel).  
- **FR3.2**: Expenses shall be filterable by category.  

### FR4 — Visualization & Reports
- **FR4.1**: Users shall view expense trends via Pie, Bar, and Line charts.  
- **FR4.2**: Users shall generate and export PDF summaries and charts.  
- **FR4.3**: Users shall filter expenses by date, month, year.  

### FR5 — Responsive Design
- **FR5.1**: The app shall adapt to desktop, tablet, and mobile devices.  

**Total Functional Requirements**: 11 (FR1.1, FR1.2, FR2.1, FR2.2, FR2.3, FR3.1, FR3.2, FR4.1, FR4.2, FR4.3, FR5.1)

---

## 3. Extended Functional Requirements (Future Scope)

The following features are documented for future implementation beyond the current semester scope:

- AI-driven insights using LLMs (e.g., spending pattern suggestions).  
- OCR support for expense extraction from uploaded bills.  
- Notifications/reminders for budget goals or overspending.  
- Import transactions via CSV (Export CSV is implemented).  
- Shared budgeting with family/friends.  

---

## 4. Non-Functional Requirements (NFR)

### NFR1 — Security
- **NFR1.1**: Firebase rules shall ensure each user can only access their own data.  
- **NFR1.2**: Authentication credentials shall be encrypted.  

### NFR2 — Usability
- **NFR2.1**: UI shall be intuitive and simple, minimizing the user learning curve.  
- **NFR2.2**: The system shall provide clear error messages and confirmations.  

### NFR3 — Performance
- **NFR3.1**: Expense addition and retrieval operations shall complete in under 2 seconds.  
- **NFR3.2**: Charts shall load within 3 seconds for datasets up to 1,000 records.  

### NFR4 — Reliability
- **NFR4.1**: The app shall maintain real-time sync with Firestore.  
- **NFR4.2**: Data shall persist across refreshes and logouts.  

### NFR5 — Process-Oriented
- **NFR5.1**: GitHub shall be used for commits, issues, documentation, and project tracking.  
- **NFR5.2**: Agile methodology (sprint planning, backlog, retrospectives) shall be followed and documented.  

**Total Non-Functional Requirements**: 10 (NFR1.1, NFR1.2, NFR2.1, NFR2.2, NFR3.1, NFR3.2, NFR4.1, NFR4.2, NFR5.1, NFR5.2)

---

## 5. Constraints

- **Timeframe**: September 22, 2025 – November 30, 2025 (5 iterations, 10 weeks)
- **Team Size**: 6 members
- **Tech Stack**: React.js, Firebase (Auth + Firestore), Chart.js, date-fns, jsPDF, html2canvas
- **Scope**: Core features to be completed within this semester; extended features considered as future work

---

## 6. Deliverables

- ✅ Requirements and design documentation (this file, UML diagrams, README.md)
- ✅ A working finance tracker web application with implemented core features
- ✅ Test cases (unit/system) with verification & validation reports
- ✅ Final presentation and demo
- ✅ CI/CD pipeline with automated testing
- ✅ Code quality reports (ESLint, Lighthouse)

---

## 7. Requirements Traceability

All requirements have been implemented and verified through comprehensive testing:

| Requirement Type | Total | Implemented | Tested | Status |
|------------------|-------|-------------|--------|--------|
| **Functional Requirements** | 11 | 11 | 11 | ✅ Complete |
| **Non-Functional Requirements** | 10 | 10 | 10 | ✅ Complete |
| **Total Requirements** | **21** | **21** | **21** | ✅ **100% Complete** |

### Test Coverage
- **E2E Tests (Cypress)**: 102 tests covering all user stories
- **Unit Tests (Jest)**: 295 tests with 100% code coverage
- **Total Tests**: 397 tests (100% passing)

### User Stories Implementation
- **7 User Stories**: All implemented (55 story points)
- **38 Acceptance Criteria**: All tested and verified
- **100 GitHub Issues**: All completed (211 total story points)

> 📋 **Detailed traceability**: See [`Documents/Acceptance_Tests.md`](Documents/Acceptance_Tests.md)  
> 📋 **Planning details**: See [`Documents/Planning_Mapping.md`](Documents/Planning_Mapping.md)

---

## 8. Requirements Status Summary

### ✅ Completed Requirements

**Functional Requirements (11/11)**:
- ✅ FR1.1: User signup and login
- ✅ FR1.2: Session-based protection
- ✅ FR2.1: Add expenses
- ✅ FR2.2: Edit/delete expenses
- ✅ FR2.3: View expenses
- ✅ FR3.1: Create/manage categories
- ✅ FR3.2: Filter by category
- ✅ FR4.1: View charts (Pie, Bar, Line)
- ✅ FR4.2: Export PDF reports
- ✅ FR4.3: Filter by date/month/year
- ✅ FR5.1: Responsive design

**Non-Functional Requirements (10/10)**:
- ✅ NFR1.1: Firebase security rules
- ✅ NFR1.2: Encrypted credentials
- ✅ NFR2.1: Intuitive UI
- ✅ NFR2.2: Clear error messages
- ✅ NFR3.1: Performance (< 2 seconds)
- ✅ NFR3.2: Chart loading (< 3 seconds)
- ✅ NFR4.1: Real-time sync
- ✅ NFR4.2: Data persistence
- ✅ NFR5.1: GitHub usage
- ✅ NFR5.2: Agile methodology

---

**Status**: ✅ **ALL REQUIREMENTS COMPLETE**  
**Last Updated**: November 26, 2025  
**Verification**: See [`Documents/Acceptance_Tests.md`](Documents/Acceptance_Tests.md) for complete test coverage
