# 💸 Budget Buddy

**Budget Buddy** is a responsive personal finance tracker built as an academic project for the course **COMP6905 — Software Engineering**.  
The goal of this project is to apply **software engineering practices** (Agile, documentation, testing, CI/CD) while developing a full-stack web application.

- **Course**: COMP6905 — Software Engineering  
- **Purpose**: Academic use; demonstrates SE process from requirements → design → implementation → testing  
- **Tech Stack**: React (CRA), React Router, Chart.js, Firebase (Auth + Firestore), date-fns, Framer Motion, Jest/RTL  

---

## 🚀 Project Overview

Budget Buddy is your **Budget Companion** — a free, easy-to-use web app for managing personal expenses.  
Unlike many market apps that become paid after trial, Budget Buddy focuses on **cost-effectiveness, accessibility, and simplicity**.  

Core features:  
- Secure authentication (login/signup with Firebase)  
- Expense and category management  
- Data visualization with charts  
- Report generation (PDF export)  
- Responsive design for desktop, tablet, and mobile  

Future extended scope:  
- AI-driven insights (LLMs)  
- OCR-based expense extraction from bills  
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
- **Jasleen Minhas** — Project Lead / Full-Stack: Leads sprints, manages GitHub/CI, authentication & security modules.  
- **Sumaiya Khan** — Frontend (UI/UX): Page layout and user-friendly interface design.  
- **Mashroor Rahman** — Backend/Database: Firestore structure, CRUD logic, and data validation.  
- **Kaustubh Patil** — Frontend (Expenses): Expense management UI and category integration.  
- **Joel George Sam** — QA/Testing: Test cases, automated/system testing, V&V compliance.  
- **Ronit Gajjar** — Reporting/Features: Charts, analytics, and PDF export module.  

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

| Label | Color | Description |
|-------|--------|-------------|
| **Authentication** | `#1f77b4` | Login, signup, session handling |
| **Expense Management** | `#ff7f0e` | Add, edit, delete, list expenses |
| **Category Management** | `#2ca02c` | Manage expense categories |
| **Visualization using Charts** | `#9467bd` | Analytics with Pie/Bar/Line charts |
| **Dashboard** | `#8c564b` | Summary view with insights |
| **Login** | `#17becf` | Stories for login functionality |
| **Sign up** | `#bcbd22` | Stories for signup functionality |
| **Report Generation** | `#e377c2` | Export reports to PDF |
| **Documentation** | `#7f7f7f` | Reports, diagrams, meeting notes |
| **Bug Fixing** | `#d62728` | Fixing defects/issues |
| **Responsive Design** | `#17a589` | Mobile/tablet/desktop support |
| **Firebase/Database Setup** | `#ff9896` | Firestore integration and rules |
| **Unit Test** | `#aec7e8` | Writing/running unit tests |
| **System Test** | `#c49c94` | End-to-end/system testing |

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


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
