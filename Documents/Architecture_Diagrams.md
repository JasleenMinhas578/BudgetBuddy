# Architecture Diagrams - Budget Buddy

**Course**: COMP6905 — Software Engineering  
**Project**: Budget Buddy  
**Team**: Group 6  
**Date**: November 26, 2025  
**Purpose**: Overall system architecture and 4+1 architectural view model  
**Status**: ✅ Complete — All diagrams documented

This document provides comprehensive architecture documentation following the 4+1 architectural view model, including UML diagrams, component interactions, and deployment architecture.

> 📋 **Related Documents**:  
> - [`Documents/Requirements.md`](Documents/Requirements.md) - Functional and non-functional requirements  
> - [`Documents/Acceptance_Tests.md`](Documents/Acceptance_Tests.md) - Requirements traceability and test coverage  
> - [`Documents/Planning_Mapping.md`](Documents/Planning_Mapping.md) - Issue mapping and team contributions  
> - [`Documents/UML/`](Documents/UML/) - All UML diagram source files  

---

## Table of Contents

1. [Overall System Architecture](#1-overall-system-architecture)
2. [4+1 Architectural View Model](#2-41-architectural-view-model)
   - [Logical View](#21-logical-view)
   - [Process View](#22-process-view)
   - [Development View](#23-development-view)
   - [Physical View](#24-physical-view)
   - [Scenarios (Use Case View)](#25-scenarios-use-case-view)
3. [UML Diagrams](#3-uml-diagrams)
   - [Use Case Diagram](#31-use-case-diagram)
   - [Class Diagram](#32-class-diagram)
   - [Class Diagram Relationships](#33-class-diagram---relationships)
   - [Sequence Diagrams](#34-sequence-diagrams)
4. [Component Interaction Diagrams](#4-component-interaction-diagrams)
5. [Summary](#5-summary)
6. [UML Diagrams Location](#6-uml-diagrams-location)
7. [Infrastructure & Technology Choices](#7-infrastructure--technology-choices)

---

## 1. Overall System Architecture

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT TIER (Frontend)                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    React Single Page Application                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │  │
│  │  │ Presentation │  │  Business    │  │   State Management       │ │  │
│  │  │    Layer     │  │    Logic     │  │   (React Context)        │ │  │
│  │  │              │  │              │  │                          │ │  │
│  │  │ • Pages      │  │ • Services   │  │ • AuthContext            │ │  │
│  │  │ • Components │  │ • Utilities  │  │ • User Session           │ │  │
│  │  │ • UI Elements│  │ • Validation │  │ • Global State           │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕ HTTPS/REST
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND TIER (Firebase Services)                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Firebase Authentication                         │  │
│  │  • Email/Password Authentication                                  │  │
│  │  • Session Management (JWT Tokens)                                │  │
│  │  • User Registration & Login                                      │  │
│  │  • Password Reset                                                 │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    ↕                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Cloud Firestore (NoSQL Database)               │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │  │
│  │  │   Collections   │  │    Documents    │  │   Real-time      │ │  │
│  │  │                 │  │                 │  │   Listeners      │ │  │
│  │  │ • users/        │  │ • user data     │  │                  │ │  │
│  │  │ • expenses/     │  │ • expense rec   │  │ • onSnapshot()   │ │  │
│  │  │ • categories/   │  │ • category rec  │  │ • Auto-sync      │ │  │
│  │  └─────────────────┘  └─────────────────┘  └──────────────────┘ │  │
│  │                                                                   │  │
│  │  Security Rules: User-level data isolation                       │  │
│  │  Indexes: Optimized queries for userId + date/category           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT & CI/CD TIER                               │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐   │
│  │   Vercel Hosting     │  │       GitHub Actions                 │   │
│  │                      │  │                                      │   │
│  │  • CDN Distribution  │  │  • CI Pipeline (Jest Tests)          │   │
│  │  • Auto Deployment   │  │  • E2E Pipeline (Cypress)            │   │
│  │  • SSL/HTTPS         │  │  • Build Verification                │   │
│  │  • Edge Functions    │  │  • Code Quality (ESLint)             │   │
│  │  • Preview URLs      │  │  • Artifact Management               │   │
│  └──────────────────────┘  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                         END USERS (Clients)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   Desktop    │  │    Tablet    │  │    Mobile    │                 │
│  │   Browsers   │  │   Browsers   │  │   Browsers   │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack Mapping

```
┌─────────────────────────────────────────────────────────────┐
│                    Technology Stack                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend Layer                                              │
│  ├─ React 18.2.0        (UI Framework)                      │
│  ├─ React Router 6.8.0  (Client-side Routing)               │
│  ├─ React Context API   (State Management)                  │
│  ├─ Chart.js 4.5.0      (Data Visualization)                │
│  ├─ Framer Motion       (Animations)                        │
│  └─ CSS3                (Styling)                           │
│                                                              │
│  Backend Services (Firebase)                                 │
│  ├─ Firebase Auth       (Authentication)                    │
│  ├─ Cloud Firestore     (NoSQL Database)                    │
│  └─ Firebase SDK 11.10  (Client Library)                    │
│                                                              │
│  Testing & Quality                                           │
│  ├─ Jest                (Unit Testing)                       │
│  ├─ React Testing Lib   (Component Testing)                 │
│  ├─ Cypress 15.6.0      (E2E Testing)                       │
│  ├─ ESLint 8.57.1       (Code Quality)                      │
│  └─ Lighthouse          (Performance)                       │
│                                                              │
│  CI/CD & Deployment                                          │
│  ├─ GitHub Actions      (CI/CD Pipeline)                    │
│  ├─ Vercel              (Hosting & CDN)                     │
│  └─ npm                 (Package Management)                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 4+1 Architectural View Model

The 4+1 architectural view model describes the architecture using five concurrent views:
1. **Logical View** - Functionality provided to end users
2. **Process View** - Dynamic aspects (concurrency, synchronization)
3. **Development View** - Programmer's perspective (software management)
4. **Physical View** - System deployment (network, servers)
5. **Scenarios (Use Case View)** - Ties all views together

---

## 2.1 Logical View

**Purpose**: Shows the key abstractions in the system as objects or object classes.

### 2.1.1 Class Diagram Overview

The logical view is best represented by the Class Diagram, which shows the core domain model:

![Class Diagram](Documents/UML/Class_Diagram.png)

For detailed relationships, see the [Class Diagram Relationships](#33-class-diagram---relationships) section.

### 2.1.2 Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Budget Buddy System                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           Presentation Components                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │    │
│  │  │  Auth    │  │Dashboard │  │   Expense Mgmt       │ │    │
│  │  │  Pages   │  │  Pages   │  │   Components         │ │    │
│  │  │          │  │          │  │                      │ │    │
│  │  │ • Login  │  │ • Overview│  │ • ExpenseForm       │ │    │
│  │  │ • Signup │  │ • Reports│  │ • ExpenseList       │ │    │
│  │  └──────────┘  └──────────┘  └──────────────────────┘ │    │
│  │         ↓              ↓                ↓              │    │
│  └─────────┼──────────────┼────────────────┼──────────────┘    │
│            │              │                │                    │
│            ↓              ↓                ↓                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Business Logic Layer                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │    │
│  │  │ AuthContext  │  │   Services   │  │  Utilities  │  │    │
│  │  │              │  │              │  │             │  │    │
│  │  │ • login()    │  │ • database.js│  │ • Validators│  │    │
│  │  │ • signup()   │  │ • addExpense │  │ • Formatters│  │    │
│  │  │ • logout()   │  │ • getExpenses│  │ • Helpers   │  │    │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │    │
│  │         ↓                   ↓                          │    │
│  └─────────┼───────────────────┼──────────────────────────┘    │
│            │                   │                                │
│            ↓                   ↓                                │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Data Access Layer                          │    │
│  │  ┌──────────────────┐  ┌──────────────────────────┐   │    │
│  │  │ Firebase Auth    │  │  Cloud Firestore         │   │    │
│  │  │                  │  │                          │   │    │
│  │  │ • Authentication │  │ • CRUD Operations        │   │    │
│  │  │ • Session Mgmt   │  │ • Real-time Listeners    │   │    │
│  │  │ • JWT Tokens     │  │ • Query Execution        │   │    │
│  │  └──────────────────┘  └──────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1.3 Class Diagram (Core Domain Model)

The Class Diagram shows the complete domain model with all classes, attributes, and methods. See the detailed diagram above in [Section 3.2](#32-class-diagram).

**Key Domain Entities**:
- **User**: Authentication and user management
- **Expense**: Core expense records with CRUD operations
- **Category**: Expense categorization
- **CategoryStats**: Calculated statistics
- **Report**: Report generation and export

### 2.1.4 Package Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Budget Buddy Packages                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  «package»                                                    │
│  components                                                   │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │   Auth     │  │ Dashboard  │  │      Expense         │  │
│  │            │  │            │  │                      │  │
│  │ • Login    │  │ • Overview │  │ • ExpenseForm        │  │
│  │ • Signup   │  │ • Reports  │  │ • ExpenseList        │  │
│  │            │  │ • Categories│  │                      │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │  Charts    │  │  Layout    │  │         UI           │  │
│  │            │  │            │  │                      │  │
│  │ • PieChart │  │ • Navbar   │  │ • Modal              │  │
│  │ • BarChart │  │ • Sidebar  │  │ • Toast              │  │
│  │ • LineChart│  │ • Navigation│  │                      │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                        ↓ uses
┌──────────────────────────────────────────────────────────────┐
│  «package»                                                    │
│  context                                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AuthContext                                          │   │
│  │  • AuthProvider                                       │   │
│  │  • useAuth hook                                       │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                        ↓ uses
┌──────────────────────────────────────────────────────────────┐
│  «package»                                                    │
│  services                                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  database.js                                          │   │
│  │  • addExpense()                                       │   │
│  │  • getExpenses()                                      │   │
│  │  • updateExpense()                                    │   │
│  │  • deleteExpense()                                    │   │
│  │  • subscribeToExpenses()                              │   │
│  │  • addCategory()                                      │   │
│  │  • getCategories()                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                        ↓ uses
┌──────────────────────────────────────────────────────────────┐
│  «external»                                                   │
│  Firebase SDK                                                 │
│  ┌──────────────────────┐  ┌──────────────────────────┐     │
│  │  firebase/auth       │  │  firebase/firestore      │     │
│  └──────────────────────┘  └──────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

---

## 2.2 Process View

**Purpose**: Shows the dynamic aspects of the system, processes, and how they communicate.

### 2.2.1 Activity Diagram - Add Expense Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Add Expense Process Flow                        │
└─────────────────────────────────────────────────────────────┘

    [Start]
       │
       ↓
   ┌─────────────────────┐
   │ User clicks         │
   │ "Add Expense"       │
   └─────────────────────┘
       │
       ↓
   ┌─────────────────────┐
   │ Open Expense Form   │
   │ Modal               │
   └─────────────────────┘
       │
       ↓
   ┌─────────────────────┐
   │ User fills form:    │
   │ • Title             │
   │ • Amount            │
   │ • Category          │
   │ • Date              │
   └─────────────────────┘
       │
       ↓
   ┌─────────────────────┐
   │ User clicks Submit  │
   └─────────────────────┘
       │
       ↓
   ┌─────────────────────┐
   │ Validate Form Data  │
   └─────────────────────┘
       │
       ├─────────────────────────┐
       │                         │
   [Valid?]                  [Invalid?]
       │                         │
       ↓                         ↓
   ┌─────────────────────┐   ┌─────────────────────┐
   │ Set Loading State   │   │ Display Error       │
   └─────────────────────┘   │ Message             │
       │                     └─────────────────────┘
       ↓                         │
   ┌─────────────────────┐       │
   │ Call addExpense()   │       │
   │ Service             │       │
   └─────────────────────┘       │
       │                         │
       ↓                         │
   ┌─────────────────────┐       │
   │ Firebase Firestore  │       │
   │ • Add document      │       │
   │ • Generate ID       │       │
   │ • Add timestamps    │       │
   └─────────────────────┘       │
       │                         │
       ├─────────────────────────┤
       │                         │
   [Success?]              [Error?]
       │                         │
       ↓                         ↓
   ┌─────────────────────┐   ┌─────────────────────┐
   │ Real-time Listener  │   │ Display Error       │
   │ Triggers            │   │ Toast               │
   └─────────────────────┘   └─────────────────────┘
       │                         │
       ↓                         │
   ┌─────────────────────┐       │
   │ Update UI with      │       │
   │ New Expense         │       │
   └─────────────────────┘       │
       │                         │
       ↓                         │
   ┌─────────────────────┐       │
   │ Close Modal         │       │
   └─────────────────────┘       │
       │                         │
       ↓                         │
   ┌─────────────────────┐       │
   │ Show Success Toast  │       │
   └─────────────────────┘       │
       │                         │
       └─────────────────────────┘
                 │
                 ↓
              [End]
```

### 2.2.2 Sequence Diagrams - User Authentication

The authentication flows are detailed in the following sequence diagrams:

#### Sign Up Flow
See [Section 3.4.1](#341-user-authentication---sign-up) for the complete Sign Up sequence diagram.

#### Log In Flow
See [Section 3.4.2](#342-user-authentication---log-in) for the complete Log In sequence diagram.

#### Log Out Flow
See [Section 3.4.3](#343-user-authentication---log-out) for the complete Log Out sequence diagram.

### 2.2.3 State Diagram - Expense Management

```
┌─────────────────────────────────────────────────────────────┐
│              Expense State Transitions                       │
└─────────────────────────────────────────────────────────────┘

                    [Initial State]
                          │
                          ↓
                  ┌───────────────┐
                  │  No Expenses  │
                  └───────────────┘
                          │
                  User adds expense
                          │
                          ↓
                  ┌───────────────┐
                  │   Loading     │
                  │   (Saving)    │
                  └───────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
            Success              Error
                │                   │
                ↓                   ↓
        ┌───────────────┐   ┌───────────────┐
        │  Expense      │   │  Error State  │
        │  Saved        │   │               │
        └───────────────┘   └───────────────┘
                │                   │
                │             Retry/Cancel
                │                   │
                ↓                   ↓
        ┌───────────────┐   ┌───────────────┐
        │  Expense      │   │  No Expenses  │
        │  List View    │   │               │
        └───────────────┘   └───────────────┘
                │
        ┌───────┼───────┐
        │       │       │
     View     Edit   Delete
        │       │       │
        ↓       ↓       ↓
    ┌─────┐ ┌─────┐ ┌─────────┐
    │View │ │Edit │ │Confirm  │
    │Mode │ │Mode │ │Delete   │
    └─────┘ └─────┘ └─────────┘
                │         │
             Save      Confirm
                │         │
                ↓         ↓
        ┌───────────────────────┐
        │   Updated List        │
        │   (Real-time sync)    │
        └───────────────────────┘
```

---

## 2.3 Development View

**Purpose**: Describes the system from a programmer's perspective (software management).

### 2.3.1 Component Organization

```
┌─────────────────────────────────────────────────────────────┐
│              Development Structure                           │
└─────────────────────────────────────────────────────────────┘

budget-buddy/
│
├── public/                    # Static assets
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
│
├── src/                       # Source code
│   │
│   ├── components/            # React components
│   │   ├── Auth/             # Authentication components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   │
│   │   ├── Dashboard/        # Dashboard components
│   │   │   ├── DashboardOverview.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Categories.jsx
│   │   │   └── Reports.jsx
│   │   │
│   │   ├── Expense/          # Expense management
│   │   │   ├── ExpenseForm.jsx
│   │   │   └── ExpenseList.jsx
│   │   │
│   │   ├── Charts/           # Data visualization
│   │   │   ├── PieChart.jsx
│   │   │   ├── BarChart.jsx
│   │   │   └── LineChart.jsx
│   │   │
│   │   ├── Layout/           # Layout components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navigation.jsx
│   │   │   └── PrivateRoute.jsx
│   │   │
│   │   └── UI/               # Reusable UI components
│   │       ├── Modal.jsx
│   │       └── Toast.jsx
│   │
│   ├── context/              # React Context
│   │   └── AuthContext.js
│   │
│   ├── services/             # Business logic
│   │   └── database.js       # Firestore operations
│   │
│   ├── styles/               # CSS stylesheets
│   │   └── main.css
│   │
│   ├── __tests__/            # Test files
│   │   ├── *.test.jsx        # Component tests
│   │   └── *.test.js         # Service tests
│   │
│   ├── firebaseConfig.js     # Firebase configuration
│   ├── setupTests.js         # Test setup
│   ├── App.js                # Root component
│   └── index.js              # Entry point
│
├── cypress/                   # E2E tests
│   ├── e2e/                  # Test specs
│   ├── fixtures/             # Test data
│   └── support/              # Test utilities
│
├── .github/                   # GitHub configuration
│   └── workflows/            # CI/CD workflows
│       ├── ci.yml
│       └── e2e.yml
│
├── Documents/                 # Project documentation
├── coverage/                  # Test coverage reports
├── build/                     # Production build
│
├── package.json              # Dependencies
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation
```

### 2.3.2 Module Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                  Module Dependency Graph                     │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   index.js   │
                    │  (Entry)     │
                    └──────────────┘
                           │
                           ↓
                    ┌──────────────┐
                    │    App.js    │
                    │  (Root)      │
                    └──────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ↓              ↓              ↓
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ AuthContext  │ │   Router     │ │   Styles     │
    └──────────────┘ └──────────────┘ └──────────────┘
            │              │
            │              ↓
            │      ┌──────────────┐
            │      │    Pages     │
            │      └──────────────┘
            │              │
            │      ┌───────┼───────┐
            │      │       │       │
            ↓      ↓       ↓       ↓
    ┌──────────────────────────────────┐
    │        Components                 │
    │  ┌────────┐  ┌────────┐  ┌────┐ │
    │  │  Auth  │  │Dashboard│  │ UI │ │
    │  └────────┘  └────────┘  └────┘ │
    └──────────────────────────────────┘
            │
            ↓
    ┌──────────────┐
    │   Services   │
    │  (database)  │
    └──────────────┘
            │
            ↓
    ┌──────────────┐
    │   Firebase   │
    │     SDK      │
    └──────────────┘
```

---

## 2.4 Physical View

**Purpose**: Shows the system from a system engineer's perspective (deployment).

### 2.4.1 Deployment Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Deployment Architecture                         │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                        Client Devices                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Desktop    │  │   Tablet    │  │   Mobile    │              │
│  │  Browser    │  │   Browser   │  │   Browser   │              │
│  │             │  │             │  │             │              │
│  │ Chrome/     │  │ Safari/     │  │ Chrome/     │              │
│  │ Firefox/    │  │ Chrome      │  │ Safari      │              │
│  │ Edge/Safari │  │             │  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└───────────────────────────────────────────────────────────────────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │ HTTPS
                            ↓
┌───────────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network (CDN)                       │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Global CDN Nodes (100+ locations worldwide)                 │ │
│  │  • Static Asset Caching                                      │ │
│  │  • SSL/TLS Termination                                       │ │
│  │  • DDoS Protection                                           │ │
│  │  • Load Balancing                                            │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌───────────────────────────────────────────────────────────────────┐
│                    Vercel Hosting Platform                         │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  «artifact» React Build                                      │ │
│  │  • Optimized JavaScript bundles                              │ │
│  │  • CSS stylesheets                                           │ │
│  │  • Static assets (images, fonts)                             │ │
│  │  • Service Workers (if applicable)                           │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  Environment Variables:                                            │
│  • REACT_APP_FIREBASE_API_KEY                                     │
│  • REACT_APP_FIREBASE_AUTH_DOMAIN                                 │
│  • REACT_APP_FIREBASE_PROJECT_ID                                  │
│  • ... (other Firebase config)                                    │
└───────────────────────────────────────────────────────────────────┘
                            │ Firebase SDK
                            ↓
┌───────────────────────────────────────────────────────────────────┐
│                    Firebase Cloud Platform                         │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  «service» Firebase Authentication                           │ │
│  │  • Multi-region deployment                                   │ │
│  │  • JWT token generation                                      │ │
│  │  • Session management                                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                            │                                       │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  «database» Cloud Firestore                                  │ │
│  │  • Multi-region replication                                  │ │
│  │  • Automatic scaling                                         │ │
│  │  • Real-time synchronization                                 │ │
│  │  • Security Rules enforcement                                │ │
│  │                                                              │ │
│  │  Collections:                                                │ │
│  │  • users/{userId}/expenses                                   │ │
│  │  • users/{userId}/categories                                 │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌───────────────────────────────────────────────────────────────────┐
│                    CI/CD Infrastructure                            │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  «server» GitHub Actions Runners                             │ │
│  │  • Ubuntu Latest                                             │ │
│  │  • Node.js 20 LTS                                            │ │
│  │  • Automated Testing                                         │ │
│  │  • Build Verification                                        │ │
│  │                                                              │ │
│  │  Workflows:                                                  │ │
│  │  • CI Pipeline (Jest Tests)                                 │ │
│  │  • E2E Pipeline (Cypress Tests)                             │ │
│  │  • Deployment Trigger                                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

### 2.4.2 Network Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    Network Architecture                      │
└─────────────────────────────────────────────────────────────┘

Internet
   │
   │ HTTPS (443)
   ↓
┌──────────────────────┐
│  Vercel CDN Edge     │ ← Closest geographic location
│  (Edge Node)         │
└──────────────────────┘
   │
   │ Internal Network
   ↓
┌──────────────────────┐
│  Vercel Origin       │
│  Server              │
└──────────────────────┘
   │
   ├─────────────────────────────┐
   │                             │
   │ Firebase SDK (HTTPS)        │
   ↓                             ↓
┌──────────────────────┐  ┌──────────────────────┐
│ Firebase Auth        │  │ Cloud Firestore      │
│ (us-central1)        │  │ (multi-region)       │
└──────────────────────┘  └──────────────────────┘
```

---

## 2.5 Scenarios (Use Case View)

**Purpose**: Describes the system's functionality as seen by end users.

### 2.5.1 Use Case Diagram

The Use Case Diagram shows all actors and use cases in the Budget Buddy system. See the detailed diagram in [Section 3.1](#31-use-case-diagram).

![Use Case Diagram](Documents/UML/Use_Case_Diagram.png)

### 2.5.2 Key Use Case Descriptions

#### Use Case 1: Add Expense

```
Use Case: Add Expense
Actor: Authenticated User
Preconditions: User is logged in
Postconditions: Expense is saved to database

Main Flow:
1. User navigates to Expenses page
2. User clicks "Add Expense" button
3. System displays expense form modal
4. User enters expense details:
   - Title
   - Amount
   - Category
   - Date
5. User clicks "Submit"
6. System validates input
7. System saves expense to Firestore
8. System updates UI with new expense
9. System displays success message
10. System closes modal

Alternative Flows:
6a. Validation fails:
    - System displays error message
    - User corrects input
    - Resume at step 5

7a. Database error:
    - System displays error toast
    - User can retry
```

#### Use Case 2: View Dashboard

```
Use Case: View Dashboard
Actor: Authenticated User
Preconditions: User is logged in
Postconditions: Dashboard displays user's financial data

Main Flow:
1. User logs in successfully
2. System redirects to Dashboard
3. System fetches user's expenses from Firestore
4. System calculates statistics:
   - Total expenses
   - This month's expenses
   - Average expense
   - Top spending category
5. System displays summary cards
6. System displays recent expenses list
7. System renders charts (if data available)

Alternative Flows:
3a. No expenses found:
    - System displays empty state
    - System prompts user to add first expense
```

---

## 3. UML Diagrams

This section contains the official UML diagrams for the Budget Buddy system. All diagrams are located in the [`Documents/UML/`](Documents/UML/) folder.

### 3.1 Use Case Diagram

The Use Case Diagram illustrates all the use cases and actors in the Budget Buddy system, showing the interactions between guest users, registered users, and the system functionalities.

![Use Case Diagram](Documents/UML/Use_Case_Diagram.png)

**Description**:
- **Actors**: Guest User, Registered User
- **Guest User Use Cases**: Sign Up, Login, View Info
- **Registered User Use Cases**: 
  - Expense Management (Add, Edit, Delete, View, Filter)
  - Category Management (Create, Delete, View)
  - Dashboard & Reports (View Overview, Charts, Generate PDF, Export CSV, Statistics)
  - Logout

---

### 3.2 Class Diagram

The Class Diagram shows the core domain model with classes, their attributes, methods, and relationships.

![Class Diagram](Documents/UML/Class_Diagram.png)

**Key Classes**:
- **User**: Represents authenticated users with authentication methods
- **Expense**: Core entity for expense records with CRUD operations
- **Category**: Expense categorization with management operations
- **CategoryStats**: Calculated statistics for categories
- **Report**: Report generation and export functionality

---

### 3.3 Class Diagram - Relationships

This diagram provides a detailed view of the relationships between classes, including associations, aggregations, and dependencies.

![Class Diagram Relationships](Documents/UML/Class_Diagram_Relationships.png)

**Key Relationships**:
- User **owns** multiple Expenses (1-to-many)
- Expense **belongs to** a Category (many-to-one)
- Category **contains** multiple Expenses (1-to-many)
- Expense **generates** Reports
- CategoryStats **calculated from** Category and Expenses

---

### 3.4 Sequence Diagrams

Sequence diagrams illustrate the dynamic interactions between system components for various user operations.

#### 3.4.1 User Authentication - Sign Up

This sequence diagram shows the complete user registration flow from form submission to account creation.

![Sign Up Sequence Diagram](Documents/UML/Sequence_Diagram_for_Sign_up.png)

**Flow**:
1. User fills signup form
2. Form validation
3. Firebase Authentication creates account
4. User profile creation in Firestore
5. Redirect to dashboard

---

#### 3.4.2 User Authentication - Log In

This sequence diagram illustrates the login process and session management.

![Log In Sequence Diagram](Documents/UML/Sequence_Diagram_for_Log_In.png)

**Flow**:
1. User enters credentials
2. Firebase Authentication validates
3. JWT token generation
4. Session establishment
5. User data retrieval from Firestore
6. Dashboard initialization

---

#### 3.4.3 User Authentication - Log Out

This sequence diagram shows the logout process and session cleanup.

![Log Out Sequence Diagram](Documents/UML/Sequence_Diagram_for_Log_Out.png)

**Flow**:
1. User clicks logout
2. Firebase sign out
3. Session cleanup
4. Firestore listeners cleanup
5. Redirect to login page

---

#### 3.4.4 Expense Management - Adding Expense

This sequence diagram details the process of adding a new expense to the system.

![Add Expense Sequence Diagram](Documents/UML/Sequence_Diagram_for_Adding_Expense.png)

**Flow**:
1. User opens expense form
2. Form validation
3. Expense data submission to Firestore
4. Real-time listener update
5. UI refresh with new expense
6. Success notification

---

#### 3.4.5 Expense Management - Editing Expense

This sequence diagram shows the expense editing workflow.

![Edit Expense Sequence Diagram](Documents/UML/Sequence_Diagram_for_Editing_Expense.png)

**Flow**:
1. User selects expense to edit
2. Form populated with existing data
3. User modifies fields
4. Validation and update to Firestore
5. Real-time sync
6. UI update

---

#### 3.4.6 Expense Management - Deleting Expense

This sequence diagram illustrates the expense deletion process with confirmation.

![Delete Expense Sequence Diagram](Documents/UML/Sequence_Diagram_for_Deleting_an_Expense.png)

**Flow**:
1. User clicks delete button
2. Confirmation dialog
3. User confirms deletion
4. Firestore document deletion
5. Real-time listener update
6. UI refresh
7. Success notification

---

#### 3.4.7 Category Management - Adding Category

This sequence diagram shows the process of creating a new expense category.

![Add Category Sequence Diagram](Documents/UML/Sequence_Diagram_for_Adding_Category.png)

**Flow**:
1. User opens category form
2. Category name validation
3. Category creation in Firestore
4. Real-time listener update
5. Category list refresh
6. Success notification

---

#### 3.4.8 Dashboard - Viewing Dashboard

This sequence diagram illustrates the dashboard initialization and data loading process.

![View Dashboard Sequence Diagram](Documents/UML/Sequence_Diagram_for_Viewing_the_Dashbaord.png)

**Flow**:
1. User navigates to dashboard
2. Authentication check
3. Firestore queries for expenses and categories
4. Statistics calculation
5. Chart data preparation
6. Dashboard rendering with all widgets

---

#### 3.4.9 Reports - Exporting to PDF

This sequence diagram shows the PDF report generation and export process.

![Export PDF Sequence Diagram](Documents/UML/Sequence_Diagram_for_Exporting_Report_to_PDF.png)

**Flow**:
1. User clicks "Export PDF"
2. Data collection from Firestore
3. Chart rendering
4. PDF generation using jsPDF
5. File download
6. Success notification

---

#### 3.4.10 Reports - Filtering Charts by Dates

This sequence diagram illustrates the date-based filtering for charts and reports.

![Filter Charts Sequence Diagram](Documents/UML/Sequence_Diagram_for_Filtering_the_Charts_based_on_Dates.png)

**Flow**:
1. User selects date range
2. Date validation
3. Firestore query with date filters
4. Data aggregation
5. Chart data update
6. Chart re-rendering

---

---

## 4. Component Interaction Diagrams

### 4.1 Real-time Data Synchronization

```
┌─────────────────────────────────────────────────────────────────────┐
│              Real-time Data Synchronization Flow                     │
└─────────────────────────────────────────────────────────────────────┘

Component Mount
      │
      ↓
┌──────────────────┐
│  useEffect()     │
│  Hook Triggered  │
└──────────────────┘
      │
      ↓
┌──────────────────┐
│ Check currentUser│
└──────────────────┘
      │
      ↓ (if authenticated)
┌──────────────────┐
│ Create Firestore │
│ Query            │
│ • collection()   │
│ • where()        │
│ • orderBy()      │
└──────────────────┘
      │
      ↓
┌──────────────────┐
│ Setup onSnapshot │
│ Listener         │
└──────────────────┘
      │
      ├─────────────────────────────┐
      │                             │
      ↓                             ↓
┌──────────────────┐      ┌──────────────────┐
│ Initial Data     │      │ Data Changes     │
│ Received         │      │ (Add/Edit/Delete)│
└──────────────────┘      └──────────────────┘
      │                             │
      └─────────────┬───────────────┘
                    │
                    ↓
            ┌──────────────────┐
            │ Process Snapshot │
            │ • forEach()      │
            │ • Extract data   │
            │ • Add IDs        │
            └──────────────────┘
                    │
                    ↓
            ┌──────────────────┐
            │ Update State     │
            │ • setExpenses()  │
            │ • setCategories()│
            └──────────────────┘
                    │
                    ↓
            ┌──────────────────┐
            │ Re-render UI     │
            │ • Updated list   │
            │ • Updated charts │
            │ • Updated stats  │
            └──────────────────┘
                    │
                    ↓
            Component Unmount
                    │
                    ↓
            ┌──────────────────┐
            │ Cleanup Listener │
            │ • unsubscribe()  │
            └──────────────────┘
```

### 4.2 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                  Authentication Flow Diagram                         │
└─────────────────────────────────────────────────────────────────────┘

App Initialization
      │
      ↓
┌──────────────────┐
│ AuthProvider     │
│ Mounts           │
└──────────────────┘
      │
      ↓
┌──────────────────┐
│ useEffect()      │
│ Setup Auth       │
│ Listener         │
└──────────────────┘
      │
      ↓
┌──────────────────┐
│onAuthStateChanged│
│ (Firebase Auth)  │
└──────────────────┘
      │
      ├─────────────────────────────┐
      │                             │
      ↓                             ↓
┌──────────────────┐      ┌──────────────────┐
│ User Logged In   │      │ No User          │
│ (user object)    │      │ (null)           │
└──────────────────┘      └──────────────────┘
      │                             │
      ↓                             ↓
┌──────────────────┐      ┌──────────────────┐
│setCurrentUser    │      │setCurrentUser    │
│(user)            │      │(null)            │
└──────────────────┘      └──────────────────┘
      │                             │
      ↓                             ↓
┌──────────────────┐      ┌──────────────────┐
│setLoading(false) │      │setLoading(false) │
└──────────────────┘      └──────────────────┘
      │                             │
      ↓                             ↓
┌──────────────────┐      ┌──────────────────┐
│ Render Protected │      │ Redirect to      │
│ Routes           │      │ Login Page       │
└──────────────────┘      └──────────────────┘
      │
      ↓
┌──────────────────┐
│ Dashboard        │
│ Loads            │
└──────────────────┘
      │
      ↓
┌──────────────────┐
│ Initialize       │
│ Firestore        │
│ Listeners        │
└──────────────────┘
```

---

## 5. Summary

This architecture document provides comprehensive views of the Budget Buddy system:

1. **Overall Architecture** - Client-Server architecture with layered client structure
2. **Logical View** - Component diagrams, class diagrams, and package structure
3. **Process View** - Activity diagrams, sequence diagrams, and state machines
4. **Development View** - Code organization and module dependencies
5. **Physical View** - Deployment architecture and network topology
6. **Use Case View** - User interactions and system scenarios

### Key Architectural Decisions

1. **Primary Pattern: Client-Server Architecture**: React SPA (client) communicates with Firebase cloud services (server) via HTTPS/REST APIs. This provides clear separation of concerns, enables scalability, and allows independent deployment of client and server components.

2. **Secondary Pattern: Layered Architecture (within Client)**: The React client application is organized into three layers:
   - **Presentation Layer**: React components, pages, and UI elements
   - **Business Logic Layer**: Services, utilities, validation, and React Context
   - **Data Access Layer**: Firebase SDK integration and API communication
   
   This layered approach promotes separation of concerns, testability, and maintainability within the client application.

3. **Real-time Synchronization**: Firestore onSnapshot listeners for instant data updates
4. **Stateless Frontend**: All state managed in React Context and Firestore
5. **Serverless Backend**: Firebase handles all backend operations (authentication, database, hosting)
6. **CDN Deployment**: Vercel edge network for global distribution
7. **CI/CD Integration**: Automated testing and deployment pipelines

### Architecture Benefits

- ✅ **Scalability**: Firebase auto-scales with user load
- ✅ **Real-time**: Instant data synchronization across devices
- ✅ **Security**: Firebase security rules enforce data isolation
- ✅ **Performance**: CDN distribution ensures fast load times
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Testability**: Comprehensive testing at all levels

---

---

## 6. UML Diagrams Location

All UML diagrams are stored in the [`Documents/UML/`](Documents/UML/) folder:

| Diagram Type | File Name | Description |
|--------------|-----------|-------------|
| **Use Case** | `Use_Case_Diagram.png` | Complete use case diagram with all actors and use cases |
| **Class Diagram** | `Class_Diagram.png` | Core domain model with classes and attributes |
| **Class Relationships** | `Class_Diagram_Relationships.png` | Detailed class relationships and associations |
| **Sequence - Sign Up** | `Sequence_Diagram_for_Sign_up.png` | User registration flow |
| **Sequence - Log In** | `Sequence_Diagram_for_Log_In.png` | User authentication flow |
| **Sequence - Log Out** | `Sequence_Diagram_for_Log_Out.png` | User logout and session cleanup |
| **Sequence - Add Expense** | `Sequence_Diagram_for_Adding_Expense.png` | Adding new expense flow |
| **Sequence - Edit Expense** | `Sequence_Diagram_for_Editing_Expense.png` | Editing existing expense flow |
| **Sequence - Delete Expense** | `Sequence_Diagram_for_Deleting_an_Expense.png` | Deleting expense flow |
| **Sequence - Add Category** | `Sequence_Diagram_for_Adding_Category.png` | Creating new category flow |
| **Sequence - View Dashboard** | `Sequence_Diagram_for_Viewing_the_Dashbaord.png` | Dashboard initialization flow |
| **Sequence - Export PDF** | `Sequence_Diagram_for_Exporting_Report_to_PDF.png` | PDF report generation flow |
| **Sequence - Filter Charts** | `Sequence_Diagram_for_Filtering_the_Charts_based_on_Dates.png` | Date-based filtering flow |

---

**Last Updated**: November 26, 2025  
**Project**: Budget Buddy | Group 6 | Memorial University of Newfoundland

> 📋 **UML Diagrams**: All diagrams are located in [`Documents/UML/`](Documents/UML/)  
> 📋 **Related Documents**: See [`Documents/Requirements.md`](Documents/Requirements.md) and [`Documents/Acceptance_Tests.md`](Documents/Acceptance_Tests.md)

---

## 7. Infrastructure & Technology Choices

This section provides detailed justification for each technology, framework, library, database, and tool used in the Budget Buddy project, including alternatives considered and reasons for rejection.

> 📋 **Note**: For a more detailed version with all technologies, see the [Technologies & Tools section in README.md](../README.md#️-technologies--tools).

### 7.1 Frontend Framework

#### React.js
**Link**: [React.js](https://react.dev/)

**Why we use this framework**:  
React.js was chosen as our frontend framework because it provides a component-based architecture that enables code reusability and maintainability. Its virtual DOM ensures efficient rendering, which is crucial for a real-time application with frequent data updates. React's extensive ecosystem, strong community support, and excellent developer tools make it ideal for rapid development. The declarative syntax simplifies UI development, and React's unidirectional data flow helps prevent bugs and makes the application more predictable.

**Alternatives and why they don't work**:  
We considered Vue.js and Angular, but React was chosen because it has a larger ecosystem, better integration with Firebase, and more team familiarity. Vue.js, while simpler, has a smaller community and fewer third-party integrations. Angular, though powerful, has a steeper learning curve and is more suited for enterprise applications with complex requirements. For a small team project with tight deadlines, React's balance of simplicity and power was optimal.

---

### 7.2 Backend & Database

#### Firebase Authentication
**Link**: [Firebase Auth](https://firebase.google.com/docs/auth)

**Why we use this framework**:  
Firebase Authentication provides secure, production-ready authentication with minimal setup. It handles password hashing, session management, JWT tokens, and email verification out of the box. The SDK integrates seamlessly with React and provides real-time authentication state changes. Firebase Auth supports multiple authentication providers and handles security best practices automatically, reducing development time and security risks.

**Alternatives and why they don't work**:  
We considered Auth0, AWS Cognito, and custom authentication. Auth0 is feature-rich but adds cost and complexity for our simple email/password needs. AWS Cognito requires AWS infrastructure knowledge and is more complex to set up. Custom authentication would require implementing security best practices, password hashing, session management, and token handling - significantly increasing development time and security risks.

---

#### Cloud Firestore
**Link**: [Cloud Firestore](https://firebase.google.com/docs/firestore)

**Why we use this framework**:  
Cloud Firestore is a NoSQL document database that provides real-time synchronization, automatic scaling, and offline support. Its real-time listeners eliminate the need for polling, providing instant UI updates when data changes. Firestore's security rules enable fine-grained access control, and its query capabilities are sufficient for our expense tracking needs. The integration with Firebase Auth provides seamless user-scoped data access.

**Alternatives and why they don't work**:  
We considered MongoDB Atlas, PostgreSQL, and Firebase Realtime Database. MongoDB Atlas requires server setup and doesn't provide real-time sync out of the box. PostgreSQL is a relational database that would require complex schema design and doesn't offer real-time capabilities without additional setup. Firebase Realtime Database was considered but Firestore's better querying, offline support, and scalability make it superior for our use case.

---

### 7.3 Deployment & CI/CD

#### Vercel
**Link**: [Vercel](https://vercel.com/)

**Why we use this platform**:  
Vercel provides seamless deployment for React applications with zero configuration. It offers automatic deployments from Git, preview deployments for pull requests, global CDN distribution, and built-in SSL certificates. Vercel's integration with GitHub provides a smooth workflow, and the platform handles scaling automatically. The free tier is generous for our project needs.

**Alternatives and why they don't work**:  
We considered Netlify, AWS Amplify, and traditional hosting. Netlify is similar but has less React-specific optimization. AWS Amplify requires more configuration and AWS knowledge. Traditional hosting (shared/VPS) requires server management, SSL setup, and doesn't provide CDN or automatic scaling. Vercel's simplicity and React optimization make it ideal.

---

#### GitHub Actions
**Link**: [GitHub Actions](https://docs.github.com/en/actions)

**Why we use this tool**:  
GitHub Actions provides CI/CD directly integrated with our GitHub repository, eliminating the need for external CI services. It supports matrix builds for cross-browser testing, artifact management, and workflow automation. The YAML-based configuration is version-controlled and easy to maintain. GitHub Actions' generous free tier covers our project needs.

**Alternatives and why they don't work**:  
We considered Jenkins, CircleCI, and Travis CI. Jenkins requires server setup and maintenance. CircleCI and Travis CI are external services that add complexity and potential security concerns. GitHub Actions' native integration, zero setup for public repos, and workflow flexibility make it the best choice.

---

**For complete infrastructure documentation including all technologies, frameworks, and tools, see the [Technologies & Tools section in README.md](../README.md#️-technologies--tools).**

---

