# 📌 Acceptance Tests & Requirements Traceability - Budget Buddy

**Course**: COMP6905 — Software Engineering  
**Project**: Budget Buddy  
**Team**: Group 6  
**Purpose**: Comprehensive acceptance tests documentation with complete traceability from requirements to issues (user stories) to acceptance criteria to tests  
**Status**: ✅ 100% Complete Coverage | ✅ 102/102 E2E Tests Passing | ✅ 295/295 Unit Tests Passing

> 📋 **Related Documents**:  
> - [`Documents/Requirements.md`](Documents/Requirements.md) - Functional and non-functional requirements (28 requirements)  
> - [`Documents/Planning_Mapping.md`](Documents/Planning_Mapping.md) - Issue mapping, story points, and team contributions (211 SP total)  
> - [`README.md`](../README.md) - Project overview and documentation  

---

## 📊 Executive Summary

### Overall Coverage

| Category | Total | Tested/Verified | Coverage | Status |
|----------|-------|-----------------|----------|--------|
| **Functional Requirements** | 18 | 18 | 100% | ✅ Complete |
| **Non-Functional Requirements** | 10 | 10 | 100% | ✅ Complete |
| **Feature Issues** | 29 | 29 | 100% | ✅ Complete |
| **Story Points for Feature Issues** | 113 | 113 | 100% | ✅ Complete |
| **Infrastructure Issues** | 24 | 24 | 100% | ✅ Complete |
| **Story Points for Infrastructure** | 98 | 98 | 100% | ✅ Complete |
| **GitHub Issues** | 53 | 53 | 100% | ✅ Complete |
| **Story Points for Total Project** | 211 | 211 | 100% | ✅ Complete |
| **Acceptance Criteria** | 48 | 48 | 100% | ✅ Complete |
| **E2E Tests (Cypress)** | 102 | 102 | 100% | ✅ Passing |
| **Unit Tests (Jest)** | 295 | 295 | 100% | ✅ Passing |

### Test Execution Summary

| Test Suite | Test Files | Test Count | Status | Execution Time |
|------------|-----------|------------|--------|----------------|
| **E2E Tests (Cypress)** | 8 files | 102 tests | ✅ 102 passing | ~20 min (3 browsers) |
| **Unit Tests (Jest)** | 42 files | 295 tests | ✅ 295 passing | ~45 sec |
| **Total** | **50 files** | **397 tests** | ✅ **100% passing** | **~21 min** |

### Feature Issues Summary

> 📌 **Note**: The GitHub Issues themselves serve as the user stories. Issues are organized into 7 feature categories (US-001 through US-007) for better tracking and planning.

| Issue Category | Story Points | Sprint | Issues | Acceptance Criteria | E2E Tests | Status |
|----------------|--------------|--------|--------|---------------------|-----------|--------|
| **US-001**: User Registration | 16 | Iteration 2 | 4 | 6 | 11 | ✅ Complete |
| **US-002**: User Login | 18 | Iteration 2 | 5 | 3 | 13 | ✅ Complete |
| **US-003**: View Dashboard | 18 | Iteration 3-4 | 4 | 2 | 16 | ✅ Complete |
| **US-004**: Manage Expenses | 21 | Iteration 3 | 5 | 9 | 12 | ✅ Complete |
| **US-005**: Manage Categories | 16 | Iteration 3 | 5 | 6 | 12 | ✅ Complete |
| **US-006**: Generate Reports | 19 | Iteration 4 | 4 | 7 | 16 | ✅ Complete |
| **US-007**: User Logout | 5 | Iteration 2 | 2 | 3 | 18 | ✅ Complete |
| **Smoke Tests** | - | All | - | - | 10 | ✅ Complete |
| **TOTAL** | **113 SP** | **5 Sprints** | **29** | **38** | **102** | ✅ **Complete** |

---

## Table of Contents

1. [Traceability Approach](#1-traceability-approach)
2. [Feature Issues & Acceptance Criteria](#2-feature-issues--acceptance-criteria)
3. [Functional Requirements Traceability](#3-functional-requirements-traceability)
4. [Non-Functional Requirements Traceability](#4-non-functional-requirements-traceability)
5. [Test File Mapping](#5-test-file-mapping)
6. [GitHub Issues Mapping](#6-github-issues-mapping)
7. [Team Contributions](#7-team-contributions)
8. [How to Run Tests](#8-how-to-run-tests)
9. [Compliance Statement](#9-compliance-statement)

---

## 1. Traceability Approach

### 1.1 Traceability Flow

```
Requirements (Requirements.md)
        ↓
Issues (User Stories) - Organized into Categories (US-XXX)
        ↓
Acceptance Criteria (AC-XXX)
        ↓
GitHub Issues (#XXX)
        ↓
Acceptance Tests (cypress/e2e/*.cy.js)
        ↓
Test Results (102/102 PASSING)
```

### 1.2 Document References

| Document | Location | Purpose |
|----------|----------|---------|
| **Requirements** | `Documents/Requirements.md` | Functional & non-functional requirements |
| **Planning** | `Documents/Planning_Mapping.md` | Sprint planning, issues, story points |
| **Architecture** | `Documents/Architecture_Diagrams.md` | System architecture & UML diagrams |
| **Naming Conventions** | `Documents/Naming_Conventions_Summary.md` | Code style guide |
| **E2E Tests** | `cypress/e2e/*.cy.js` | Acceptance tests (102 tests) |
| **Unit Tests** | `src/__tests__/*.test.jsx` | Component tests (295 tests) |

### 1.3 Identifier Definitions

| Identifier | Format | Example | Description |
|------------|--------|---------|-------------|
| **FR** | FR#.# | FR1.1 | Functional Requirement |
| **NFR** | NFR# | NFR1.1 | Non-Functional Requirement |
| **US** | US-### | US-001 | Issue Category Label (groups related issues) |
| **AC** | AC-### | AC-001 | Acceptance Criteria |
| **Issue** | #### | #20 | GitHub Issue |
| **Test** | filename.cy.js | 01-signup.cy.js | Cypress Test File |

---

## 2. Feature Issues & Acceptance Criteria

> 📌 **Note**: The GitHub Issues themselves serve as the user stories. US-001 through US-007 are category labels that group related issues together.

### 2.1 US-001: User Registration (4 Issues, 16 SP)

**As a** new user,  
**I want to** create an account with email and password,  
**So that** I can securely access the expense tracking system.

| Property | Value |
|----------|-------|
| **Priority** | High |
| **Story Points** | 16 |
| **Sprint** | Iteration 2 |
| **Requirements** | FR1.1 |
| **GitHub Issues** | [#10](https://github.com/JasleenMinhas578/BudgetBuddy/issues/10), [#45](https://github.com/JasleenMinhas578/BudgetBuddy/issues/45), [#46](https://github.com/JasleenMinhas578/BudgetBuddy/issues/46), [#47](https://github.com/JasleenMinhas578/BudgetBuddy/issues/47) |
| **Test File** | `01-signup.cy.js` |
| **Test Count** | 11 tests |
| **Status** | ✅ Complete |

#### Acceptance Criteria

| ID | Criteria | Test Coverage |
|----|----------|---------------|
| **AC-001** | User can access signup page | ✅ `it('should display the signup page')` |
| **AC-002** | User can enter email and password fields | ✅ `it('should have email and password input fields')` |
| **AC-003** | Password must meet strength requirements (8+ chars, uppercase, lowercase, number, special char) | ✅ `it('should validate password strength requirements')` |
| **AC-004** | User receives validation errors for invalid input (weak password, invalid email, mismatched passwords) | ✅ `it('should show error for weak password')`, `it('should show error for mismatched passwords')`, `it('should show error for invalid email format')` |
| **AC-005** | User is redirected to dashboard after successful signup | ✅ `it('should successfully create a new user account')`, `it('should redirect to dashboard after signup')` |
| **AC-006** | User account is created in Firebase Authentication | ✅ `it('should store user in Firebase Authentication')` |

---

### 2.2 US-002: User Login

**As a** registered user,  
**I want to** log in with my email and password,  
**So that** I can access my personal expense data.

| Property | Value |
|----------|-------|
| **Priority** | High |
| **Story Points** | 18 |
| **Sprint** | Iteration 2 |
| **Requirements** | FR1.1, FR1.2 |
| **GitHub Issues** | [#9](https://github.com/JasleenMinhas578/BudgetBuddy/issues/9), [#42](https://github.com/JasleenMinhas578/BudgetBuddy/issues/42), [#43](https://github.com/JasleenMinhas578/BudgetBuddy/issues/43), [#44](https://github.com/JasleenMinhas578/BudgetBuddy/issues/44), [#87](https://github.com/JasleenMinhas578/BudgetBuddy/issues/87) |
| **Test File** | `02-login.cy.js` |
| **Test Count** | 13 tests |
| **Status** | ✅ Complete |

#### Acceptance Criteria

| ID | Criteria | Test Coverage |
|----|----------|---------------|
| **AC-007** | User session is maintained after login | ✅ `it('should maintain session after login')` |
| **AC-008** | User cannot access protected pages without authentication | ✅ `it('should redirect unauthenticated users to login')` |
| **AC-009** | User session is cleared after logout | ✅ `it('should clear user session on logout')` (in `07-logout.cy.js`) |

---

### 2.3 US-003: View Dashboard

**As a** logged-in user,  
**I want to** see an overview of my expenses on a dashboard,  
**So that** I can quickly understand my spending patterns.

| Property | Value |
|----------|-------|
| **Priority** | High |
| **Story Points** | 18 |
| **Sprint** | Iteration 3-4 |
| **Requirements** | FR2.3, FR4.1 |
| **GitHub Issues** | [#30](https://github.com/JasleenMinhas578/BudgetBuddy/issues/30), [#31](https://github.com/JasleenMinhas578/BudgetBuddy/issues/31), [#33](https://github.com/JasleenMinhas578/BudgetBuddy/issues/33), [#58](https://github.com/JasleenMinhas578/BudgetBuddy/issues/58) |
| **Test File** | `03-dashboard.cy.js` |
| **Test Count** | 16 tests |
| **Status** | ✅ Complete |

#### Acceptance Criteria

| ID | Criteria | Test Coverage |
|----|----------|---------------|
| **AC-019** | Expenses displayed in list format with title, amount, category, date | ✅ `it('should display all expenses in list format')` |
| **AC-020** | Recent expenses shown on dashboard with "View All" link | ✅ `it('should display recent expenses list')`, `it('should display "View All" link to expenses page')` |

---

### 2.4 US-004: Manage Expenses

**As a** logged-in user,  
**I want to** add, edit, and delete expenses,  
**So that** I can keep an accurate record of my spending.

| Property | Value |
|----------|-------|
| **Priority** | High |
| **Story Points** | 21 |
| **Sprint** | Iteration 3 |
| **Requirements** | FR2.1, FR2.2, FR2.3, FR3.2 |
| **GitHub Issues** | [#20](https://github.com/JasleenMinhas578/BudgetBuddy/issues/20), [#21](https://github.com/JasleenMinhas578/BudgetBuddy/issues/21), [#22](https://github.com/JasleenMinhas578/BudgetBuddy/issues/22), [#23](https://github.com/JasleenMinhas578/BudgetBuddy/issues/23), [#24](https://github.com/JasleenMinhas578/BudgetBuddy/issues/24) |
| **Test File** | `04-expenses.cy.js` |
| **Test Count** | 12 tests |
| **Status** | ✅ Complete |

#### Acceptance Criteria

| ID | Criteria | Test Coverage |
|----|----------|---------------|
| **AC-010** | User can view expenses page | ✅ `it('should display the expenses page')` |
| **AC-011** | User can click "Add Expense" button | ✅ `it('should display "Add Expense" button')` |
| **AC-012** | User can fill expense form with all required fields (title, amount, category, date) | ✅ `it('should display expense form with all required fields')` |
| **AC-013** | User receives validation errors for invalid input | ✅ `it('should show validation error for missing title')`, `it('should show validation error for missing amount')` |
| **AC-014** | User can successfully add a new expense | ✅ `it('should successfully add a new expense')` |
| **AC-015** | New expense appears in the expense list | ✅ `it('should display new expense in the list')` |
| **AC-016** | User can edit existing expenses | ✅ `it('should display edit button for each expense')`, `it('should successfully update expense')` |
| **AC-017** | User can delete expenses with confirmation | ✅ `it('should display delete button for each expense')`, `it('should successfully delete expense')` |
| **AC-018** | Changes are persisted to Firebase database | ✅ `it('should persist changes to Firebase')` |

---

### 2.5 US-005: Manage Categories

**As a** logged-in user,  
**I want to** create and manage custom expense categories,  
**So that** I can organize my expenses according to my needs.

| Property | Value |
|----------|-------|
| **Priority** | Medium |
| **Story Points** | 16 |
| **Sprint** | Iteration 3 |
| **Requirements** | FR3.1 |
| **GitHub Issues** | [#25](https://github.com/JasleenMinhas578/BudgetBuddy/issues/25), [#26](https://github.com/JasleenMinhas578/BudgetBuddy/issues/26), [#28](https://github.com/JasleenMinhas578/BudgetBuddy/issues/28), [#29](https://github.com/JasleenMinhas578/BudgetBuddy/issues/29), [#78](https://github.com/JasleenMinhas578/BudgetBuddy/issues/78) |
| **Test File** | `05-categories.cy.js` |
| **Test Count** | 12 tests |
| **Status** | ✅ Complete |

#### Acceptance Criteria

| ID | Criteria | Test Coverage |
|----|----------|---------------|
| **AC-021** | User can view categories page | ✅ `it('should display the categories page')` |
| **AC-022** | User can add new categories with name | ✅ `it('should successfully add a new category')` |
| **AC-023** | User can set category budget | ✅ `it('should have budget input field')`, `it('should display category with budget information')` |
| **AC-024** | User can delete categories | ✅ `it('should successfully delete category')` |
| **AC-025** | User receives validation errors for invalid input | ✅ `it('should show validation error for missing name')` |
| **AC-026** | Category statistics displayed (total spent, budget remaining) | ✅ `it('should display category statistics')` |

---

### 2.6 US-006: Generate Reports

**As a** logged-in user,  
**I want to** view charts and export reports of my expenses,  
**So that** I can analyze my spending patterns and share financial data.

| Property | Value |
|----------|-------|
| **Priority** | Medium |
| **Story Points** | 19 |
| **Sprint** | Iteration 4 |
| **Requirements** | FR3.2, FR4.1, FR4.2, FR4.3 |
| **GitHub Issues** | [#30](https://github.com/JasleenMinhas578/BudgetBuddy/issues/30), [#32](https://github.com/JasleenMinhas578/BudgetBuddy/issues/32), [#34](https://github.com/JasleenMinhas578/BudgetBuddy/issues/34), [#35](https://github.com/JasleenMinhas578/BudgetBuddy/issues/35) |
| **Test File** | `06-reports.cy.js` |
| **Test Count** | 16 tests |
| **Status** | ✅ Complete |

#### Acceptance Criteria

| ID | Criteria | Test Coverage |
|----|----------|---------------|
| **AC-027** | User can filter expenses by category | ✅ `it('should filter expenses by selected category')` (in `04-expenses.cy.js`) |
| **AC-028** | Reports can be filtered by category | ✅ `it('should allow filtering reports by category')` |
| **AC-029** | User can view Pie chart (category distribution) | ✅ `it('should display Pie chart for category distribution')` |
| **AC-030** | User can view Bar chart (monthly comparison) | ✅ `it('should display Bar chart for monthly expenses')` |
| **AC-031** | User can view Line chart (trend analysis) | ✅ `it('should display Line chart for expense trends')` |
| **AC-032** | User can export report as PDF | ✅ `it('should have "Export PDF" button')`, `it('should generate PDF with charts and data')` |
| **AC-033** | User can export data as CSV | ✅ `it('should have "Export CSV" button')`, `it('should export CSV with expense data')` |

---

### 2.7 US-007: User Logout

**As a** logged-in user,  
**I want to** log out of my account,  
**So that** my data remains secure when I'm done using the application.

| Property | Value |
|----------|-------|
| **Priority** | Medium |
| **Story Points** | 5 |
| **Sprint** | Iteration 2 |
| **Requirements** | FR1.2, NFR1.1 |
| **GitHub Issues** | [#11](https://github.com/JasleenMinhas578/BudgetBuddy/issues/11), [#59](https://github.com/JasleenMinhas578/BudgetBuddy/issues/59) |
| **Test File** | `07-logout.cy.js` |
| **Test Count** | 18 tests |
| **Status** | ✅ Complete |

#### Acceptance Criteria

| ID | Criteria | Test Coverage |
|----|----------|---------------|
| **AC-034** | Logout button is visible to authenticated users in the navigation | ✅ `it('should show logout button when authenticated')` (in `07-logout.cy.js`) |
| **AC-035** | Clicking logout ends the session and redirects user to login/landing page | ✅ `it('should log out successfully and redirect to login')` (in `07-logout.cy.js`) |
| **AC-036** | After logout, attempting to access protected dashboard routes redirects to login | ✅ `it('should redirect to login when accessing dashboard after logout')` (in `07-logout.cy.js`) |

> **Note**: Date-range filtering criteria (previously mislabeled here) belong to US-006. Responsiveness criteria (AC-037 to AC-039) appear in the "Extra: Responsiveness" section below.

--- 

### Extra: Responsiveness

**As a** user,  
**I want to** the application to be Responsive,  
**So that** my I can use the application on Desktop, Tablet, and Mobile too.

| Property | Value |
|----------|-------|
| **Priority** | High |
| **Story Points** | 5 |
| **Sprint** | Iteration 2 |
| **Requirements** | FR5.1 |
| **Test File** | `smoke.cy.js` |
| **Test Count** | 10 tests |
| **Status** | ✅ Complete |

#### Acceptance Criteria

| ID | Criteria | Test Coverage |
|----|----------|---------------|
| **AC-037** | UI adapts to desktop viewport (1920x1080) | ✅ Tested across all test files with viewport changes |
| **AC-038** | UI adapts to tablet viewport (768x1024) | ✅ Tested across all test files with viewport changes |
| **AC-039** | UI adapts to mobile viewport (375x667) | ✅ Tested across all test files with viewport changes |

---

### US-008: AI Chat Assistant

**As a** logged-in user,  
**I want to** manage my expenses and query my spending using natural language,  
**So that** I can interact with the app conversationally without navigating menus.

| Property | Value |
|----------|-------|
| **Priority** | High |
| **Story Points** | — (post-semester addition) |
| **Requirements** | FR6.1, FR6.2, FR6.3, FR6.4 |
| **Component** | `src/components/AI/AIChat.jsx`, `src/services/aiService.js` |
| **Status** | ✅ Implemented |

#### Acceptance Criteria

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-040** | AI chat widget is visible on all dashboard routes | ✅ Manual — floating button appears in bottom-right corner |
| **AC-041** | Typing "add $X for Y today" creates a confirmation card before writing to Firestore | ✅ Manual — confirmation card requires explicit user click |
| **AC-042** | User can edit an expense via natural language (e.g., "change my coffee to $6") | ✅ Manual — edit confirmation card shown, Firestore updated on confirm |
| **AC-043** | User can delete an expense via natural language | ✅ Manual — delete confirmation card shown, Firestore deleted on confirm |
| **AC-044** | User can query spending totals, averages, and highest expense in plain English | ✅ Manual — AI computes from expense history and returns answer |
| **AC-045** | Typing a date range (e.g., "show me last month") updates the dashboard date filter | ✅ Manual — `DateRangeContext` updates, all dashboard views reflect change |

---

### US-009: User Settings

**As a** logged-in user,  
**I want to** update my profile and save preferences,  
**So that** the app remembers my settings across sessions.

| Property | Value |
|----------|-------|
| **Priority** | Medium |
| **Story Points** | — (post-semester addition) |
| **Requirements** | FR7.1, FR7.2, FR7.3 |
| **Component** | `src/components/Dashboard/Settings.jsx` |
| **Status** | ✅ Implemented |

#### Acceptance Criteria

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-046** | User can update their display name from the Settings page | ✅ Manual — Firebase Auth `updateProfile` called, success message shown |
| **AC-047** | User can trigger a password-reset email from Settings without logging out | ✅ Manual — email sent to registered address, confirmation shown |
| **AC-048** | User can set a default date-range preference that is applied on next login | ✅ Manual — preference saved to Firestore; `DateRangeContext` loads it on login |

---

## 3. Functional Requirements Traceability

### 3.1 Complete FR Mapping

| Requirement | Description | Issue Categories | Acceptance Criteria | Test Files | Test Count | Status |
|-------------|-------------|------------------|---------------------|------------|------------|--------|
| **FR1.1** | Users shall sign up and log in securely using email and password | US-001, US-002 | AC-001 to AC-006 | `01-signup.cy.js`, `02-login.cy.js` | 24 | ✅ Pass |
| **FR1.2** | Only authenticated users shall access their own data (session protection) | US-002, US-007 | AC-007 to AC-009 | `02-login.cy.js`, `07-logout.cy.js` | 31 | ✅ Pass |
| **FR2.1** | Users shall add expense with title, amount, category, date | US-004 | AC-010 to AC-015 | `04-expenses.cy.js` | 12 | ✅ Pass |
| **FR2.2** | Users shall edit or delete expenses | US-004 | AC-016 to AC-018 | `04-expenses.cy.js` | 12 | ✅ Pass |
| **FR2.3** | Users shall view all expenses in list/card format | US-003, US-004 | AC-019 to AC-020 | `03-dashboard.cy.js`, `04-expenses.cy.js` | 28 | ✅ Pass |
| **FR3.1** | Users shall create and manage custom categories | US-005 | AC-021 to AC-026 | `05-categories.cy.js` | 12 | ✅ Pass |
| **FR3.2** | Expenses shall be filterable by category | US-004, US-006 | AC-027 to AC-028 | `04-expenses.cy.js`, `06-reports.cy.js` | 16 | ✅ Pass |
| **FR4.1** | Users shall view expense trends via Pie, Bar, Line charts | US-006 | AC-029 to AC-031 | `06-reports.cy.js` | 16 | ✅ Pass |
| **FR4.2** | Users shall generate and export PDF summaries and charts | US-006 | AC-032 to AC-033 | `06-reports.cy.js` | 16 | ✅ Pass |
| **FR4.3** | Users shall filter expenses by date, month, year | US-006 | AC-034 to AC-035 | `06-reports.cy.js` | 16 | ✅ Pass |
| **FR5.1** | App shall adapt to desktop, tablet, mobile devices | All Categories | AC-037 to AC-039 | `smoke.cy.js` | 10 | ✅ Pass |
| **FR6.1** | Add, edit, delete expenses via AI chat | US-008 | AC-041 to AC-043 | Manual (AI widget) | — | ✅ Pass |
| **FR6.2** | Add and manage categories via AI chat | US-008 | AC-041 | Manual (AI widget) | — | ✅ Pass |
| **FR6.3** | Query spending data in plain English | US-008 | AC-044 | Manual (AI widget) | — | ✅ Pass |
| **FR6.4** | Change dashboard date filter via chat | US-008 | AC-045 | Manual (AI widget) | — | ✅ Pass |
| **FR7.1** | Update display name from Settings page | US-009 | AC-046 | Manual (Settings page) | — | ✅ Pass |
| **FR7.2** | Send password-reset email from Settings | US-009 | AC-047 | Manual (Settings page) | — | ✅ Pass |
| **FR7.3** | Save default date-range preference persistently | US-009 | AC-048 | Manual (Settings page) | — | ✅ Pass |

### 3.2 FR Coverage Summary

| Category | Requirements | Tested | Coverage | Status |
|----------|--------------|--------|----------|--------|
| **FR1 - Authentication** | 2 | 2 | 100% | ✅ Complete |
| **FR2 - Expense Management** | 3 | 3 | 100% | ✅ Complete |
| **FR3 - Category Management** | 2 | 2 | 100% | ✅ Complete |
| **FR4 - Visualization & Reports** | 3 | 3 | 100% | ✅ Complete |
| **FR5 - Responsive Design** | 1 | 1 | 100% | ✅ Complete |
| **FR6 - AI Chat Assistant** | 4 | 4 | 100% | ✅ Complete |
| **FR7 - User Settings** | 3 | 3 | 100% | ✅ Complete |
| **TOTAL** | **18** | **18** | **100%** | ✅ **Complete** |

---

## 4. Non-Functional Requirements Traceability

### 4.1 Complete NFR Mapping

| Requirement | Description | Verification Method | Test Evidence | Status |
|-------------|-------------|---------------------|---------------|--------|
| **NFR1.1** | Firebase rules ensure users can only access their own data | E2E Tests | `07-logout.cy.js` - Data isolation test | ✅ Pass |
| **NFR1.2** | Authentication credentials shall be encrypted | Manual Verification | Firebase Auth handles encryption | ✅ Pass |
| **NFR2.1** | UI shall be intuitive and simple | E2E Tests | All test files - UI interaction tests | ✅ Pass |
| **NFR2.2** | System shall provide clear error messages | E2E Tests | Validation error tests in all forms | ✅ Pass |
| **NFR3.1** | Expense operations shall complete in under 2 seconds | E2E Tests | Cypress test execution times | ✅ Pass |
| **NFR3.2** | Charts shall load within 3 seconds for datasets up to 1,000 records | E2E Tests | `06-reports.cy.js` - Chart rendering tests | ✅ Pass |
| **NFR4.1** | App shall maintain real-time sync with Firestore | E2E Tests | Real-time update tests | ✅ Pass |
| **NFR4.2** | Data shall persist across refreshes and logouts | E2E Tests | Data persistence tests | ✅ Pass |
| **NFR5.1** | GitHub shall be used for commits, issues, documentation | Manual Verification | GitHub repository inspection | ✅ Pass |
| **NFR5.2** | Agile methodology shall be followed and documented | Manual Verification | Sprint docs, Planning Board | ✅ Pass |

### 4.2 NFR Coverage Summary

| Category | Requirements | Verified | Coverage | Status |
|----------|--------------|----------|----------|--------|
| **NFR1 - Security** | 2 | 2 | 100% | ✅ Complete |
| **NFR2 - Usability** | 2 | 2 | 100% | ✅ Complete |
| **NFR3 - Performance** | 2 | 2 | 100% | ✅ Complete |
| **NFR4 - Reliability** | 2 | 2 | 100% | ✅ Complete |
| **NFR5 - Process-Oriented** | 2 | 2 | 100% | ✅ Complete |
| **TOTAL** | **10** | **10** | **100%** | ✅ **Complete** |

---

## 5. Test File Mapping

### 5.1 E2E Test Files (Cypress)

| Test File | Purpose | Requirements | Issue Categories | Test Count | Status |
|-----------|---------|--------------|------------------|------------|--------|
| **smoke.cy.js** | Smoke tests for core functionality | All FR | All Categories | 10 | ✅ Pass |
| **01-signup.cy.js** | User registration flow | FR1.1 | US-001 | 11 | ✅ Pass |
| **02-login.cy.js** | User authentication flow | FR1.1, FR1.2 | US-002 | 13 | ✅ Pass |
| **03-dashboard.cy.js** | Dashboard display & navigation | FR2.3, FR4.1 | US-003 | 16 | ✅ Pass |
| **04-expenses.cy.js** | Expense CRUD operations | FR2.1, FR2.2, FR2.3, FR3.2 | US-004 | 12 | ✅ Pass |
| **05-categories.cy.js** | Category management | FR3.1 | US-005 | 12 | ✅ Pass |
| **06-reports.cy.js** | Report generation & export | FR3.2, FR4.1, FR4.2, FR4.3 | US-006 | 16 | ✅ Pass |
| **07-logout.cy.js** | Logout & session management | FR1.2, NFR1.1 | US-007 | 18 | ✅ Pass |
| **TOTAL** | **Complete acceptance coverage** | **All 21 Requirements** | **All 7 Categories** | **102** | ✅ **Pass** |

### 5.2 Test Location

```
cypress/e2e/
├── smoke.cy.js               # Smoke tests (10 tests)
├── 01-signup.cy.js           # User registration (11 tests)
├── 02-login.cy.js            # User authentication (13 tests)
├── 03-dashboard.cy.js        # Dashboard functionality (16 tests)
├── 04-expenses.cy.js         # Expense management (12 tests)
├── 05-categories.cy.js       # Category management (12 tests)
├── 06-reports.cy.js          # Report generation (16 tests)
└── 07-logout.cy.js           # Logout functionality (18 tests)
```

---

## 6. GitHub Issues Mapping

### 6.1 Feature Issues

> 📌 **Note**: The GitHub Issues themselves serve as the user stories. US-001 through US-007 are category labels that group related issues together.

| Issue Category | GitHub Issues | Story Points | Status |
|---------------|---------------|--------------|--------|
| **US-001: User Registration** | [#10](https://github.com/JasleenMinhas578/BudgetBuddy/issues/10), [#45](https://github.com/JasleenMinhas578/BudgetBuddy/issues/45), [#46](https://github.com/JasleenMinhas578/BudgetBuddy/issues/46), [#47](https://github.com/JasleenMinhas578/BudgetBuddy/issues/47) | 16 | ✅ Complete |
| **US-002: User Login** | [#9](https://github.com/JasleenMinhas578/BudgetBuddy/issues/9), [#42](https://github.com/JasleenMinhas578/BudgetBuddy/issues/42), [#43](https://github.com/JasleenMinhas578/BudgetBuddy/issues/43), [#44](https://github.com/JasleenMinhas578/BudgetBuddy/issues/44), [#87](https://github.com/JasleenMinhas578/BudgetBuddy/issues/87) | 18 | ✅ Complete |
| **US-003: View Dashboard** | [#30](https://github.com/JasleenMinhas578/BudgetBuddy/issues/30), [#31](https://github.com/JasleenMinhas578/BudgetBuddy/issues/31), [#33](https://github.com/JasleenMinhas578/BudgetBuddy/issues/33), [#58](https://github.com/JasleenMinhas578/BudgetBuddy/issues/58) | 18 | ✅ Complete |
| **US-004: Manage Expenses** | [#20](https://github.com/JasleenMinhas578/BudgetBuddy/issues/20), [#21](https://github.com/JasleenMinhas578/BudgetBuddy/issues/21), [#22](https://github.com/JasleenMinhas578/BudgetBuddy/issues/22), [#23](https://github.com/JasleenMinhas578/BudgetBuddy/issues/23), [#24](https://github.com/JasleenMinhas578/BudgetBuddy/issues/24) | 21 | ✅ Complete |
| **US-005: Manage Categories** | [#25](https://github.com/JasleenMinhas578/BudgetBuddy/issues/25), [#26](https://github.com/JasleenMinhas578/BudgetBuddy/issues/26), [#28](https://github.com/JasleenMinhas578/BudgetBuddy/issues/28), [#29](https://github.com/JasleenMinhas578/BudgetBuddy/issues/29), [#78](https://github.com/JasleenMinhas578/BudgetBuddy/issues/78) | 16 | ✅ Complete |
| **US-006: Generate Reports** | [#30](https://github.com/JasleenMinhas578/BudgetBuddy/issues/30), [#32](https://github.com/JasleenMinhas578/BudgetBuddy/issues/32), [#34](https://github.com/JasleenMinhas578/BudgetBuddy/issues/34), [#35](https://github.com/JasleenMinhas578/BudgetBuddy/issues/35) | 19 | ✅ Complete |
| **US-007: User Logout** | [#11](https://github.com/JasleenMinhas578/BudgetBuddy/issues/11), [#59](https://github.com/JasleenMinhas578/BudgetBuddy/issues/59) | 5 | ✅ Complete |
| **TOTAL** | **29 Issues** | **113 SP** | ✅ **Complete** |

### 6.2 Infrastructure Issues

| Category | GitHub Issues | Story Points | Status |
|----------|---------------|--------------|--------|
| **Project Setup & Planning** | [#1](https://github.com/JasleenMinhas578/BudgetBuddy/issues/1), [#2](https://github.com/JasleenMinhas578/BudgetBuddy/issues/2), [#3](https://github.com/JasleenMinhas578/BudgetBuddy/issues/3), [#4](https://github.com/JasleenMinhas578/BudgetBuddy/issues/4), [#5](https://github.com/JasleenMinhas578/BudgetBuddy/issues/5), [#6](https://github.com/JasleenMinhas578/BudgetBuddy/issues/6), [#7](https://github.com/JasleenMinhas578/BudgetBuddy/issues/7), [#16](https://github.com/JasleenMinhas578/BudgetBuddy/issues/16) | 33 | ✅ Complete |
| **Landing Page** | [#8](https://github.com/JasleenMinhas578/BudgetBuddy/issues/8), [#36](https://github.com/JasleenMinhas578/BudgetBuddy/issues/36), [#38](https://github.com/JasleenMinhas578/BudgetBuddy/issues/38), [#40](https://github.com/JasleenMinhas578/BudgetBuddy/issues/40) | 16 | ✅ Complete |
| **Testing Infrastructure** | [#12](https://github.com/JasleenMinhas578/BudgetBuddy/issues/12), [#13](https://github.com/JasleenMinhas578/BudgetBuddy/issues/13), [#50](https://github.com/JasleenMinhas578/BudgetBuddy/issues/50), [#49](https://github.com/JasleenMinhas578/BudgetBuddy/issues/49), [#91](https://github.com/JasleenMinhas578/BudgetBuddy/issues/91), [#94](https://github.com/JasleenMinhas578/BudgetBuddy/issues/94) | 14 | ✅ Complete |
| **CI/CD & Deployment** | [#62](https://github.com/JasleenMinhas578/BudgetBuddy/issues/62), [#66](https://github.com/JasleenMinhas578/BudgetBuddy/issues/66) | 9 | ✅ Complete |
| **Documentation & Quality** | [#81](https://github.com/JasleenMinhas578/BudgetBuddy/issues/81), [#85](https://github.com/JasleenMinhas578/BudgetBuddy/issues/85), [#98](https://github.com/JasleenMinhas578/BudgetBuddy/issues/98), [#100](https://github.com/JasleenMinhas578/BudgetBuddy/issues/100), [#102](https://github.com/JasleenMinhas578/BudgetBuddy/issues/102) | 14 | ✅ Complete |
| **TOTAL** | **24 Issues** | **98 SP** | ✅ **Complete** |

### 6.3 Project Totals

| Category | Issues | Story Points | Status |
|----------|--------|--------------|--------|
| **Feature Issues** | 29 | 113 | ✅ Complete |
| **Infrastructure Issues** | 24 | 98 | ✅ Complete |
| **Total Project (All Issues)** | **53** | **211** | ✅ **Complete** |

> 📋 **Note**: The total project includes 53 issues with 211 story points as documented in [`Documents/Planning_Mapping.md`](Documents/Planning_Mapping.md). 

---

## 7. Team Contributions

### 7.1 Story Point Contribution Per Member

| Team Member | Total Story Points | Primary Responsibilities |
|-------------|-------------------|--------------------------|
| **Jasleen Minhas** | ≈ 198 SP | Project Lead, Frontend Architecture, Firebase Auth, Expense Management, Dashboard, Unit Tests, E2E Testing, CI/CD, Documentation |
| **Mashroor Rahman** | ≈ 147 SP | Firebase Setup, Authentication Logic, Database Integration, Categories & Expenses, Cypress Tests, Deployment |
| **Sumaiya** | ≈ 104 SP | Signup/Login UI, Categories UI, Landing Page, Dashboard Widgets, Testing |
| **Joel George Sam** | ≈ 92 SP | Unit Testing (Auth, Dashboard, Expenses), Requirements, UML, Architecture, Database Integration |
| **Kaustubh** | ≈ 95 SP | Expense Management UI, Dashboard Charts, Category UI, Landing Page, Frontend Styling |
| **Ronit** | ≈ 95 SP | Add Expense UI, CRUD Operations, Firebase Syncing, Dashboard Charting, Categories |

**Note**: Each contributor receives full story points for any issue they worked on (standard Agile contribution analysis). The cumulative total (731 SP) is higher than the total project story points (211 SP) because multiple team members collaborated on the same issues. See [`Documents/Planning_Mapping.md`](Documents/Planning_Mapping.md) for detailed breakdown.

### 7.2 Sprint Velocity

| Sprint | Story Points Completed | Key Deliverables |
|--------|------------------------|------------------|
| **Sprint 1** | 35 SP | Requirements, UML Diagrams, GitHub Setup, React/Firebase Initialization |
| **Sprint 2** | 76 SP | Landing Page, Authentication (Signup/Login/Logout), Unit Tests, CI/CD Setup |
| **Sprint 3** | 46 SP | Expense Management (CRUD), Category Management, Dashboard UI, Firebase Integration |
| **Sprint 4** | 28 SP | Dashboard & Reporting, Charts (Pie/Bar/Line), PDF/CSV Export, Forgot Password |
| **Sprint 5** | 26 SP | Cypress E2E Testing, Cross-Browser Testing, Lighthouse Audit, ESLint Report, Final Checklist |
| **TOTAL** | **211 SP** | **All Features Complete** |

**Average Velocity**: ≈ 42 SP per Sprint

---

## 8. How to Run Tests

### 8.1 E2E Tests (Cypress)

#### Interactive Mode (Development)
```bash
# Open Cypress Test Runner
npm run cypress:open

# Or with server auto-start
npm run test:e2e:dev
```

#### Headless Mode (CI/CD)
```bash
# Run all E2E tests
npm run cypress:run

# Run specific test file
npx cypress run --spec "cypress/e2e/04-expenses.cy.js"

# Run with specific browser
npm run cypress:run:chrome
npm run cypress:run:firefox
npm run cypress:run:edge
```

### 8.2 Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- ExpenseForm.test.jsx

# Watch mode
npm test -- --watch
```

### 8.3 CI/CD Execution

Tests run automatically on:
- ✅ Push to `main` or `develop` branches
- ✅ Pull requests to `main` or `develop`
- ✅ Manual workflow dispatch

**Workflows**:
- `.github/workflows/ci.yml` - Unit tests & build
- `.github/workflows/e2e.yml` - E2E tests (Chrome, Firefox, Edge)

### 8.4 Test Results Location

**Local**:
- E2E Screenshots: `cypress/screenshots/`
- E2E Videos: `cypress/videos/`
- Coverage Reports: `coverage/`

**CI/CD**:
- GitHub Actions: [Actions tab](https://github.com/JasleenMinhas578/BudgetBuddy/actions)
- Artifacts: Downloadable from workflow runs
- E2E Testing Documentation: `Documents/Cypress_E2E_Testing/Cypress_E2E_Testing.md`

---

## 9. Compliance Statement

### 9.1 Requirements Compliance

**Statement**: Budget Buddy fully complies with all functional and non-functional requirements specified in `Documents/Requirements.md`.

**Evidence**:
- ✅ 100% functional requirements coverage (11/11)
- ✅ 100% non-functional requirements verification (10/10)
- ✅ 102 E2E acceptance tests all passing
- ✅ 295 unit tests all passing
- ✅ Comprehensive traceability matrix
- ✅ Continuous verification through CI/CD

### 9.2 Acceptance Criteria Compliance

**Statement**: All acceptance criteria derived from requirements are satisfied by the acceptance tests.

**Evidence**:
- ✅ 38 acceptance criteria defined
- ✅ 38 acceptance criteria tested (100%)
- ✅ All tests passing (102/102 E2E, 295/295 unit)
- ✅ Multi-browser verification (Chrome, Firefox, Edge)
- ✅ Real-world scenario testing

### 9.3 Quality Assurance

**Statement**: The system meets all quality standards defined in requirements.

**Evidence**:
- ✅ **Security**: Firebase rules enforced, data isolation verified
- ✅ **Usability**: Intuitive UI, clear error messages
- ✅ **Performance**: Operations complete within specified time limits
- ✅ **Reliability**: Real-time sync, data persistence verified
- ✅ **Process**: Agile methodology followed, documented in GitHub

### 9.4 Traceability Verification

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
│  Total Feature Issues:            29                    │
│  Feature Issues Implemented:      29                    │
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

---

## 10. Conclusion

### 10.1 Summary

The Requirements Traceability Matrix demonstrates:
- ✅ **Complete Coverage**: All 21 requirements (11 FR + 10 NFR) are tested/verified
- ✅ **Full Traceability**: Clear mapping from requirements → issues (user stories) → acceptance criteria → tests
- ✅ **Zero Gaps**: No critical requirements are missing tests
- ✅ **High Quality**: 397 total tests passing (102 E2E + 295 unit) = 100%
- ✅ **Continuous Verification**: Automated testing in CI/CD pipeline
- ✅ **Multi-Browser Support**: Chrome, Firefox, Edge
- ✅ **Complete Documentation**: All artifacts properly documented

### 10.2 Confidence Level

**Overall Confidence**: ✅ **VERY HIGH**

The acceptance tests fully satisfy all requirements in `Documents/Requirements.md`.

### 10.3 Project Metrics

| Metric | Value |
|--------|-------|
| **Total Requirements** | 21 (11 FR + 10 NFR) |
| **Feature Issues** | 29 |
| **Acceptance Criteria** | 38 |
| **GitHub Issues** | 53 |
| **Story Points (Feature Issues)** | 113 SP |
| **Story Points (Total Project)** | 211 SP |
| **E2E Tests** | 102 (100% passing) |
| **Unit Tests** | 295 (100% passing) |
| **Total Tests** | 397 (100% passing) |
| **Sprints** | 5 |
| **Average Velocity** | 42 SP/sprint |
| **Team Members** | 6 |
| **Test Coverage** | 100% |

### 10.4 References

- **Requirements**: [`Documents/Requirements.md`](https://github.com/JasleenMinhas578/BudgetBuddy/blob/main/Documents/Requirements.md)
- **Planning**: [`Documents/Planning_Mapping.md`](https://github.com/JasleenMinhas578/BudgetBuddy/blob/main/Documents/Planning_Mapping.md)
- **Architecture**: [`Documents/Architecture_Diagrams.md`](https://github.com/JasleenMinhas578/BudgetBuddy/blob/main/Documents/Architecture_Diagrams.md)
- **Naming Conventions**: [`Documents/Naming_Conventions_Summary.md`](https://github.com/JasleenMinhas578/BudgetBuddy/blob/main/Documents/Naming_Conventions_Summary.md)
- **GitHub Project Board**: [Sprint Board](https://github.com/users/JasleenMinhas578/projects/4/views/4)
- **Burnup Chart**: [`Documents/Burn_up_chart.png`](https://github.com/JasleenMinhas578/BudgetBuddy/blob/main/Documents/Burn_up_chart.png)

---

**Last Updated**: December 10, 2025  
**Project**: Budget Buddy | Group 6 | Memorial University of Newfoundland

**Traceability Status**: ✅ **100% COMPLETE**  
**Requirements Coverage**: ✅ **21/21 (100%)**  
**Test Coverage**: ✅ **397/397 PASSING (100%)**  
**Project Status**: ✅ **ALL DELIVERABLES COMPLETE**
