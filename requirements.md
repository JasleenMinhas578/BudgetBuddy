# 📑 Requirements Document — Budget Buddy

**Course**: COMP6905 — Software Engineering  
**Project**: Budget Buddy  
**Team**: Group 6  
**Date**: September 22, 2025  

---

## 1. Introduction

Budget Buddy is a personal finance tracking web application aimed at helping users manage their expenses effectively.  
The system will provide functionalities for user authentication, expense and category management, visualization of financial data, and generation of reports.  
This project follows the Agil# 📑 Requirements Document — Budget Buddy

**Course**: COMP6905 — Software Engineering  
**Project**: Budget Buddy  
**Team**: Group 6  
**Date**: September 24, 2025  

---

## 1. Introduction

Budget Buddy is a personal finance tracking web application aimed at helping users manage their expenses effectively.  
The system will provide functionalities for user authentication, expense and category management, visualization of financial data, and generation of reports.  
This project follows the **Agile Methodology** with incremental delivery across five iterations.

---

## 2. Functional Requirements (FR)

### FR1 — User Authentication
- FR1.1: Users shall be able to sign up and log in securely using email and password.  
- FR1.2: Only authenticated users shall access their own data (session-based protection).  

### FR2 — Expense Management
- FR2.1: Users shall be able to add an expense with title, amount, category, and date.  
- FR2.2: Users shall be able to edit or delete an expense.  
- FR2.3: Users shall be able to view all expenses in list or card format.  

### FR3 — Category Management
- FR3.1: Users shall be able to create and manage custom categories (e.g., Food, Travel).  

### FR4 — Visualization & Reports
- FR4.1: Users shall view expense trends via Pie, Bar, and Line charts.  
- FR4.2: Users shall generate and export PDF summaries and charts.  
- FR4.3: Users shall filter expanses by date, month, year.

### FR5 — Responsive Design
- FR5.1: The app shall adapt to desktop, tablet, and mobile devices.  

---

## 3. Extended Functional Requirements (Future Scope)

- AI-driven insights using LLMs (e.g., spending pattern suggestions).  
- OCR support for expense extraction from uploaded bills.  
- Notifications/reminders for budget goals or overspending.  
- Import/export transactions via CSV.  

---

## 4. Non-Functional Requirements (NFR)

### NFR1 — Security
- Firebase rules shall ensure each user can only access their own data.  
- Authentication credentials shall be encrypted.  

### NFR2 — Usability
- UI shall be intuitive and simple, minimizing the user learning curve.  
- The system shall provide clear error messages and confirmations.  

### NFR3 — Performance
- Expense addition and retrieval operations shall complete in under 2 seconds.  
- Charts shall load within 3 seconds for datasets up to 1,000 records.  

### NFR4 — Reliability
- The app shall maintain real-time sync with Firestore.  
- Data shall persist across refreshes and logouts.  

### NFR5 — Process-Oriented
- GitHub shall be used for commits, issues, documentation, and project tracking.  
- Agile methodology (sprint planning, backlog, retrospectives) shall be followed and documented.  

---

## 5. Constraints

- **Timeframe**: 22nd September – 30th November, 2025.  
- **Team Size**: 6 members.  
- **Tech Stack**: React.js, Firebase (Auth + Firestore), Chart.js, date-fns, jsPDF, html2canvas.  
- **Scope**: Core features to be completed within this semester; extended features considered as future work.  

---

## 6. Deliverables

- Requirements and design documentation (requirements.md, README.md, UML diagrams).  
- A working finance tracker web application with implemented core features.  
- Test cases (unit/system) with verification & validation reports.  
- Final presentation and demo.  

---

✅ **Status**: Drafted for Iteration 1 (Sprint 1).

e methodology with incremental delivery across five iterations.

---

## 2. Functional Requirements (FR)

### FR1 — User Authentication
- FR1.1: Users shall be able to sign up and log in securely using email and password.  
- FR1.2: Only authenticated users shall access their own data (session-based protection).  

### FR2 — Expense Management
- FR2.1: Users shall be able to add an expense with title, amount, category, and date.  
- FR2.2: Users shall be able to edit or delete an expense.  
- FR2.3: Users shall be able to view all expenses in list or card format.  

### FR3 — Category Management
- FR3.1: Users shall be able to create and manage custom categories (e.g., Food, Travel).  
- FR3.2: Expenses shall be filterable by category.  

### FR4 — Visualization & Reports
- FR4.1: Users shall view expense trends via Pie, Bar, and Line charts.  
- FR4.2: Users shall generate and export PDF summaries and charts.  

### FR5 — Responsive Design
- FR5.1: The app shall adapt to desktop, tablet, and mobile devices.  

---

## 3. Extended Functional Requirements (Future Scope)

- AI-driven insights using LLMs (e.g., spending pattern suggestions).  
- OCR support for expense extraction from uploaded bills.  
- Notifications/reminders for budget goals or overspending.  
- Import/export transactions via CSV.  
- Shared budgeting with family/friends.  

---

## 4. Non-Functional Requirements (NFR)

### NFR1 — Security
- Firebase rules shall ensure each user can only access their own data.  
- Authentication credentials shall be encrypted.  

### NFR2 — Usability
- UI shall be intuitive and simple, minimizing the user learning curve.  
- The system shall provide clear error messages and confirmations.  

### NFR3 — Performance
- Expense addition and retrieval operations shall complete in under 2 seconds.  
- Charts shall load within 3 seconds for datasets up to 1,000 records.  

### NFR4 — Reliability
- The app shall maintain real-time sync with Firestore.  
- Data shall persist across refreshes and logouts.  

### NFR5 — Process-Oriented
- GitHub shall be used for commits, issues, documentation, and project tracking.  
- Agile methodology (sprint planning, backlog, retrospectives) shall be followed and documented.  

---

## 5. Constraints

- **Timeframe**: 22nd September – 28th November, 2025.  
- **Team Size**: 6 members.  
- **Tech Stack**: React.js, Firebase (Auth + Firestore), Chart.js, date-fns, jsPDF, html2canvas.  
- **Scope**: Core features to be completed within this semester; extended features considered as future work.  

---

## 6. Deliverables

- Requirements and design documentation (this file, UML diagrams).  
- A working finance tracker web application with implemented core features.  
- Test cases (unit/system) with verification & validation reports.  
- Final presentation and demo.  

---

✅ **Status**: Drafted for Iteration 1 (Sprint 1) — To be validated by team and TA.  

