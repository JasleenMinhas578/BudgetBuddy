# Naming Conventions - Budget Buddy Project

**Project**: Budget Buddy  
**Date**: November 25, 2025  
**Purpose**: Document all naming conventions used throughout the codebase  

---

## Table of Contents

1. [File and Directory Naming](#1-file-and-directory-naming)
2. [Component Naming](#2-component-naming)
3. [Variable Naming](#3-variable-naming)
4. [Function Naming](#4-function-naming)
5. [Constant Naming](#5-constant-naming)
6. [CSS Class Naming](#6-css-class-naming)
7. [Test File Naming](#7-test-file-naming)
8. [Database Collection Naming](#8-database-collection-naming)
9. [Props and Parameters Naming](#9-props-and-parameters-naming)
10. [Event Handler Naming](#10-event-handler-naming)

---

## 1. File and Directory Naming

### 1.1 Component Files

**Convention**: **PascalCase** with `.jsx` or `.js` extension

**Examples**:
```
✅ Login.jsx
✅ Signup.jsx
✅ DashboardOverview.jsx
✅ ExpenseForm.jsx
✅ ExpenseList.jsx
✅ PieChart.jsx
✅ BarChart.jsx
✅ LineChart.jsx
✅ PrivateRoute.jsx
```

**Rationale**: 
- Matches React component naming convention
- Easy to distinguish components from utility files
- Industry standard for React projects

### 1.2 Utility and Service Files

**Convention**: **camelCase** with `.js` extension

**Examples**:
```
✅ database.js
✅ aiService.js
✅ firebaseConfig.js
✅ reportWebVitals.js
✅ setupTests.js
✅ getCategoryIcon.js
✅ getCategoryColor.js
✅ formatDate.js
✅ validatePassword.js
```

**Rationale**:
- Distinguishes utility files from components
- Follows JavaScript module naming standards

### 1.3 Context Files

**Convention**: **PascalCase** with `Context` suffix

**Examples**:
```
✅ AuthContext.js
✅ DateRangeContext.js
```

**Rationale**:
- Clearly identifies context providers
- Matches React Context API naming patterns

### 1.4 Directory Names

**Convention**: **PascalCase** for component directories, **lowercase** for utility directories

**Examples**:
```
✅ src/components/AI/        ← AIChat widget (Gemini)
✅ src/components/Auth/
✅ src/components/Dashboard/
✅ src/components/Expense/
✅ src/components/Charts/
✅ src/components/Layout/
✅ src/components/UI/
✅ src/context/
✅ src/hooks/
✅ src/services/
✅ src/styles/
✅ src/utils/
✅ src/__tests__/
```

**Rationale**:
- Component directories use PascalCase to match component names
- Utility directories use lowercase for standard conventions
- Clear organization by feature/functionality

---

## 2. Component Naming

### 2.1 React Components

**Convention**: **PascalCase** (also called UpperCamelCase)

**Examples**:
```javascript
✅ function Login() { }
✅ function DashboardOverview() { }
✅ function ExpenseForm() { }
✅ function PieChart() { }
✅ export default function Toast() { }
✅ const TestWrapper = ({ children }) => ( )
```

**Rationale**:
- React convention for component names
- Distinguishes components from regular functions
- Required for JSX syntax recognition

### 2.2 Component Export

**Convention**: Default export with same name as file

**Examples**:
```javascript
// Login.jsx
export default function Login() { }

// DashboardOverview.jsx
export default function DashboardOverview() { }

// Toast.jsx
export default function Toast() { }
```

**Rationale**:
- Consistent import/export pattern
- Easy to locate component definitions
- Standard React practice

---

## 3. Variable Naming

### 3.1 State Variables

**Convention**: **camelCase** with descriptive names

**Examples**:
```javascript
✅ const [email, setEmail] = useState('');
✅ const [password, setPassword] = useState('');
✅ const [loading, setLoading] = useState(false);
✅ const [error, setError] = useState('');
✅ const [expenses, setExpenses] = useState([]);
✅ const [currentUser, setCurrentUser] = useState(null);
✅ const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
✅ const [recentExpenses, setRecentExpenses] = useState([]);
```

**Pattern for State Setters**:
- State variable: `variableName`
- Setter function: `setVariableName`

**Rationale**:
- React Hooks convention
- Clear indication of state management
- Descriptive and self-documenting

### 3.2 Local Variables

**Convention**: **camelCase** with descriptive names

**Examples**:
```javascript
✅ const expenseData = { ... };
✅ const totalExpenses = expenses.reduce(...);
✅ const thisMonthExpenses = expenses.filter(...);
✅ const averageExpense = totalExpenses / expenses.length;
✅ const topCategory = expenses.reduce(...);
✅ const sortedExpenses = expensesData.sort(...);
```

**Rationale**:
- JavaScript standard convention
- Readable and self-explanatory
- Consistent with industry practices

### 3.3 Boolean Variables

**Convention**: Prefix with `is`, `has`, `should`, or `can`

**Examples**:
```javascript
✅ const [isVisible, setIsVisible] = useState(false);
✅ const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
✅ const [loading, setLoading] = useState(false);
✅ const hasExpenses = expenses.length > 0;
✅ const shouldShowModal = isOpen && !loading;
```

**Rationale**:
- Clearly indicates boolean nature
- Improves code readability
- Standard naming pattern for predicates

### 3.4 Array Variables

**Convention**: Use plural nouns

**Examples**:
```javascript
✅ const expenses = [];
✅ const categories = [];
✅ const recentExpenses = [];
✅ const sortedExpenses = [];
✅ const expensesData = [];
```

**Rationale**:
- Indicates collection/array
- Natural language pattern
- Easy to understand in loops

---

## 4. Function Naming

### 4.1 Event Handlers

**Convention**: Prefix with `handle` + action in **camelCase**

**Examples**:
```javascript
✅ function handleSubmit(e) { }
✅ function handleExpenseAdded() { }
✅ function handleDelete(id) { }
✅ function handleEdit(expense) { }
✅ function handleCategoryChange(e) { }
✅ async function handleSubmit(e) { }
```

**Rationale**:
- Clear indication of event handling
- Distinguishes handlers from other functions
- React community standard

### 4.2 Utility Functions

**Convention**: Verb + noun in **camelCase**

**Examples**:
```javascript
✅ function getIcon(toastType) { }
✅ function getToastClass(toastType) { }
✅ function formatCurrency(amount) { }
✅ function calculateTotal(expenses) { }
✅ function validateEmail(email) { }
```

**Rationale**:
- Action-oriented naming
- Self-documenting code
- Clear function purpose

### 4.3 Database Functions

**Convention**: CRUD operation + entity in **camelCase**

**Examples**:
```javascript
// Expenses
✅ export const addExpense = async (userId, expenseData) => { }
✅ export const getExpenses = async (userId) => { }
✅ export const updateExpense = async (userId, expenseId, updateData) => { }
✅ export const deleteExpense = async (userId, expenseId) => { }
✅ export const subscribeToExpenses = (userId, callback) => { }
✅ export const subscribeToExpensesByCategory = (userId, category, callback) => { }

// Categories
✅ export const addCategory = async (userId, categoryData) => { }
✅ export const getCategories = async (userId) => { }
✅ export const updateCategory = async (userId, categoryId, updateData) => { }
✅ export const deleteCategory = async (userId, categoryId) => { }
✅ export const subscribeToCategories = (userId, callback) => { }

// User settings
✅ export const getUserSettings = async (userId) => { }
✅ export const saveUserSettings = async (userId, settings) => { }
```

**Pattern**:
- `add` + entity (create)
- `get` + entity (read)
- `update` + entity (update)
- `delete` + entity (delete)
- `subscribeTo` + entity (real-time listener)
- `get`/`save` + entity + `Settings` (persisted user preferences)

**Rationale**:
- Consistent CRUD naming
- Clear database operation intent
- Easy to locate and understand

### 4.4 Authentication Functions

**Convention**: Action verb in **camelCase**

**Examples**:
```javascript
✅ function signup(email, password) { }
✅ function login(email, password) { }
✅ function logout() { }
✅ function resetPassword(email) { }
✅ function updatePassword(oobCode, newPassword) { }
```

**Rationale**:
- Simple, action-oriented names
- Matches Firebase Auth API patterns
- Clear authentication actions

### 4.5 Async Functions

**Convention**: Same as regular functions, with `async` keyword

**Examples**:
```javascript
✅ async function handleSubmit(e) { }
✅ export const addExpense = async (userId, expenseData) => { }
✅ export const getExpenses = async (userId) => { }
```

**Rationale**:
- `async` keyword clearly indicates asynchronous nature
- No need for special naming prefix
- Modern JavaScript standard

---

## 5. Constant Naming

### 5.1 Configuration Constants

**Convention**: **UPPER_SNAKE_CASE** for true constants

**Examples**:
```javascript
✅ const DEFAULT_DURATION = 3000;
✅ const MAX_FILE_SIZE = 5242880;
✅ const API_BASE_URL = 'https://api.example.com';
```

**Note**: In this project, most "constants" are actually variables that may change (like `const expenses = []`), so they use camelCase.

### 5.2 CSS Custom Properties (CSS Variables)

**Convention**: **kebab-case** with `--` prefix

**Examples**:
```css
✅ --bg-dark: #0f172a;
✅ --bg-darker: #020617;
✅ --bg-light: #1e293b;
✅ --text-primary: #f8fafc;
✅ --text-secondary: #94a3b8;
✅ --accent-teal: #4fd1c5;
✅ --accent-coral: #f687b3;
✅ --accent-violet: #b794f4;
✅ --border-radius: 8px;
```

**Rationale**:
- CSS standard for custom properties
- Descriptive and semantic names
- Easy to maintain and update

---

## 6. CSS Class Naming

### 6.1 Component Classes

**Convention**: **kebab-case** (lowercase with hyphens)

**Examples**:
```css
✅ .landing-container
✅ .landing-bg
✅ .floating-shapes
✅ .auth-container
✅ .form-group
✅ .input-field
✅ .btn-primary
✅ .dashboard-overview
✅ .expense-form
✅ .expense-list
✅ .modal-overlay
✅ .toast-message
```

**Rationale**:
- CSS standard convention
- Easy to read and type
- Avoids camelCase issues in CSS

### 6.2 Modifier Classes

**Convention**: Base class + modifier with hyphen

**Examples**:
```css
✅ .toast-success
✅ .toast-error
✅ .toast-warning
✅ .toast-info
✅ .btn-primary
✅ .btn-secondary
✅ .btn-danger
```

**Pattern**: `{component}-{modifier}`

**Rationale**:
- Clear relationship to base class
- BEM-like methodology
- Consistent styling patterns

### 6.3 State Classes

**Convention**: Prefix with `is-` or `has-`

**Examples**:
```css
✅ .is-active
✅ .is-open
✅ .is-loading
✅ .has-error
```

**Rationale**:
- Clearly indicates state
- Distinguishes from component classes
- Common CSS pattern

---

## 7. Test File Naming

### 7.1 Test Files

**Convention**: Same name as component + `.test.jsx` or `.test.js`

**Examples**:
```
✅ Login.test.jsx
✅ Signup.test.jsx
✅ DashboardOverview.test.jsx
✅ ExpenseForm.test.jsx
✅ ExpenseList.test.jsx
✅ database.test.js
✅ firebaseConfig.test.js
```

**Rationale**:
- Easy to locate corresponding test file
- Jest default pattern recognition
- Industry standard

### 7.2 Test Wrapper Components

**Convention**: **PascalCase** with descriptive name

**Examples**:
```javascript
✅ const TestWrapper = ({ children }) => ( ... );
```

**Rationale**:
- Follows component naming convention
- Clear purpose in test context
- Reusable across test files

### 7.3 Test Describe Blocks

**Convention**: Component or function name

**Examples**:
```javascript
✅ describe('Login', () => { ... });
✅ describe('ExpenseForm', () => { ... });
✅ describe('addExpense', () => { ... });
✅ describe('Toast Component', () => { ... });
```

**Rationale**:
- Clear test organization
- Matches component/function being tested
- Jest best practices

### 7.4 Test Cases

**Convention**: Descriptive sentence starting with "should"

**Examples**:
```javascript
✅ it('should render login form', () => { ... });
✅ it('should display error for invalid email', () => { ... });
✅ it('should successfully add a new expense', () => { ... });
✅ it('should call onClose when dismiss button is clicked', () => { ... });
```

**Rationale**:
- Behavior-driven testing approach
- Self-documenting tests
- Clear test intent

---

## 8. Database Collection Naming

### 8.1 Firestore Collections

**Convention**: **lowercase plural** nouns

**Examples**:
```
✅ users         ← top-level collection; each document = one user
✅ expenses      ← subcollection under users/{userId}/expenses/
✅ categories    ← subcollection under users/{userId}/categories/
✅ settings      ← subcollection under users/{userId}/settings/ (single "preferences" doc)
```

**Note**: In this project, `expenses`, `categories`, and `settings` are **subcollections** nested under `users/{userId}/`, not top-level Firestore collections. The full paths are `users/{uid}/expenses`, `users/{uid}/categories`, and `users/{uid}/settings/preferences`.

**Rationale**:
- Firestore best practices
- Indicates collection (multiple documents)
- Standard database naming

### 8.2 Firestore Document Fields

**Convention**: **camelCase**

**Examples**:
```javascript
✅ userId
✅ title
✅ amount
✅ category
✅ date
✅ createdAt
✅ updatedAt
```

**Rationale**:
- JavaScript object property convention
- Consistent with code variables
- Easy to destructure

---

## 9. Props and Parameters Naming

### 9.1 Component Props

**Convention**: **camelCase** with descriptive names

**Examples**:
```javascript
✅ function Toast({ message, type, isVisible, onClose, duration }) { }
✅ function Modal({ isOpen, onClose, title, children }) { }
✅ function ExpenseList({ refreshTrigger }) { }
✅ function PrivateRoute({ children, redirectTo }) { }
```

**Rationale**:
- React props convention
- Clear prop purpose
- Consistent with JavaScript variables

### 9.2 Callback Props

**Convention**: Prefix with `on` + action

**Examples**:
```javascript
✅ onClose
✅ onSubmit
✅ onExpenseAdded
✅ onDelete
✅ onEdit
✅ onChange
```

**Rationale**:
- Clear indication of callback function
- React community standard
- Matches HTML event naming (onClick, onChange)

### 9.3 Boolean Props

**Convention**: Prefix with `is`, `has`, `should`, or `can`

**Examples**:
```javascript
✅ isOpen
✅ isVisible
✅ isLoading
✅ hasError
✅ shouldAutoClose
```

**Rationale**:
- Clearly indicates boolean nature
- Improves prop readability
- Standard React pattern

### 9.4 Function Parameters

**Convention**: **camelCase** with descriptive names

**Examples**:
```javascript
✅ function addExpense(userId, expenseData) { }
✅ function updateExpense(userId, expenseId, updateData) { }
✅ function handleSubmit(e) { }
✅ function getIcon(toastType) { }
```

**Rationale**:
- JavaScript standard
- Self-documenting parameters
- Consistent with variable naming

---

## 10. Event Handler Naming

### 10.1 Component Event Handlers

**Convention**: `handle` + action in **camelCase**

**Examples**:
```javascript
✅ const handleSubmit = async (e) => { };
✅ const handleExpenseAdded = () => { };
✅ const handleDelete = (id) => { };
✅ const handleEdit = (expense) => { };
✅ const handleCategoryChange = (e) => { };
✅ const handleClose = () => { };
```

**Rationale**:
- Clear indication of event handling
- Distinguishes from callback props
- React community standard

### 10.2 Inline Event Handlers

**Convention**: Arrow functions with descriptive actions

**Examples**:
```javascript
✅ onClick={handleClose}
✅ onClick={() => setIsOpen(false)}
✅ onClick={(e) => { e.stopPropagation(); onClose(); }}
✅ onChange={(e) => setEmail(e.target.value)}
```

**Rationale**:
- Concise for simple actions
- Clear event handling
- Modern JavaScript syntax

---

## 11. Hook Naming

### 11.1 Custom Hooks

**Convention**: Prefix with `use` + descriptive name in **camelCase**

**Examples**:
```javascript
// React built-ins
✅ useState()
✅ useEffect()
✅ useCallback()
✅ useNavigate()
✅ useLocation()

// Project-specific custom hooks
✅ useAuth()                 ← exported from AuthContext.js
✅ useDateRangeContext()     ← exported from DateRangeContext.js
✅ useDateFilter()           ← src/hooks/useDateFilter.js
```

**Rationale**:
- React Hooks naming rule
- Required by React linting rules
- Clear indication of hook usage

---

## 12. Import/Export Naming

### 12.1 Named Imports

**Convention**: Use original exported name

**Examples**:
```javascript
✅ import { useState, useEffect } from 'react';
✅ import { useAuth } from '../../context/AuthContext';
✅ import { addExpense, getExpenses } from '../../services/database';
✅ import { signInWithEmailAndPassword } from 'firebase/auth';
```

**Rationale**:
- Maintains consistency across codebase
- Easy to trace import sources
- Standard ES6 module practice

### 12.2 Default Imports

**Convention**: Use same name as exported component

**Examples**:
```javascript
✅ import Login from './components/Auth/Login';
✅ import DashboardOverview from './components/Dashboard/DashboardOverview';
✅ import ExpenseForm from './components/Expense/ExpenseForm';
```

**Rationale**:
- Consistency with file and component names
- Easy to locate component definitions
- Standard React practice

---

## 13. Comment Naming and Documentation

### 13.1 JSDoc Comments

**Convention**: Use JSDoc format for functions and components

**Examples**:
```javascript
/**
 * Add a new expense to the database
 * 
 * @param {string} userId - User's unique identifier
 * @param {Object} expenseData - Expense data object
 * @param {string} expenseData.title - Expense title
 * @param {number} expenseData.amount - Expense amount
 * @returns {Promise<string>} Document ID of the created expense
 */
export const addExpense = async (userId, expenseData) => { };
```

**Rationale**:
- Standard JavaScript documentation
- IDE auto-completion support
- Clear function contracts

### 13.2 Inline Comments

**Convention**: Descriptive sentences with proper capitalization

**Examples**:
```javascript
✅ // Clear any previous error messages
✅ // Set loading state to show spinner
✅ // Cleanup function to remove listeners when component unmounts
✅ // Calculate this month's expenses
```

**Rationale**:
- Readable and professional
- Explains intent, not just what code does
- Improves code maintainability

---

## 14. Summary Table

| Category | Convention | Example |
|----------|-----------|---------|
| **Component Files** | PascalCase.jsx | `Login.jsx`, `ExpenseForm.jsx` |
| **Utility Files** | camelCase.js | `database.js`, `firebaseConfig.js` |
| **Components** | PascalCase | `function Login()`, `function Toast()` |
| **Variables** | camelCase | `const expenses`, `const totalAmount` |
| **State Variables** | camelCase | `const [email, setEmail]` |
| **Boolean Variables** | is/has/should prefix | `isOpen`, `hasError`, `shouldShow` |
| **Functions** | camelCase | `handleSubmit`, `getExpenses` |
| **Event Handlers** | handle + action | `handleSubmit`, `handleClose` |
| **Constants** | UPPER_SNAKE_CASE | `DEFAULT_DURATION`, `MAX_SIZE` |
| **CSS Classes** | kebab-case | `.landing-container`, `.btn-primary` |
| **CSS Variables** | --kebab-case | `--bg-dark`, `--text-primary` |
| **Test Files** | Component.test.jsx | `Login.test.jsx` |
| **Database Collections** | lowercase plural | `users`, `expenses`, `categories` |
| **Props** | camelCase | `isOpen`, `onClose`, `message` |
| **Callback Props** | on + action | `onClose`, `onSubmit`, `onChange` |
| **Custom Hooks** | use + name | `useAuth`, `useNavigate` |

---

## 15. Key Principles

### 15.1 Consistency
- Follow the same naming pattern throughout the codebase
- Use established conventions from React and JavaScript communities
- Maintain consistency within similar types of code

### 15.2 Clarity
- Use descriptive, self-documenting names
- Avoid abbreviations unless widely understood
- Make names long enough to be clear, but not unnecessarily verbose

### 15.3 Conventions
- Follow industry-standard conventions (React, JavaScript, CSS)
- Use established patterns (camelCase for JS, kebab-case for CSS)
- Respect framework-specific requirements (React Hooks must start with `use`)

### 15.4 Readability
- Names should read like natural language
- Boolean variables should form questions (`isOpen`, `hasError`)
- Functions should be action-oriented (`handleSubmit`, `getExpenses`)

---


## 16. Conclusion

These naming conventions ensure:
- ✅ **Consistency** across the entire codebase
- ✅ **Readability** for all team members
- ✅ **Maintainability** for future development
- ✅ **Industry Standards** compliance
- ✅ **Self-Documenting Code** that's easy to understand

By following these conventions, the Budget Buddy project maintains a professional, clean, and easily maintainable codebase that aligns with React and JavaScript best practices.

---

**Document Version**: 1.1  
**Last Updated**: August 26, 2026  
**Project**: Budget Buddy | Group 6 | Memorial University of Newfoundland

