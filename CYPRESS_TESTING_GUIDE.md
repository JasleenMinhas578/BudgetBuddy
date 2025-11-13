# 🎭 Cypress E2E Testing Guide - Budget Buddy

## 📋 Overview

This guide provides comprehensive instructions for running and managing Cypress E2E tests for the Budget Buddy application.

## ✅ Prerequisites

Before running Cypress tests, ensure:

1. **Node.js** is installed (v16 or higher)
   ```bash
   node --version
   ```

2. **Dependencies are installed**
   ```bash
   npm install
   ```

3. **Firebase credentials** are configured in `.env` file
   ```bash
   # Check .env file exists and contains Firebase config
   cat .env
   ```

4. **Application builds successfully**
   ```bash
   npm run build
   ```

## 🚀 Quick Start

### Option 1: Interactive Mode (Recommended for Development)

```bash
# Terminal 1: Start the development server
npm start

# Terminal 2: Open Cypress Test Runner
npm run cypress:open
```

**Benefits:**
- Visual interface to select and run tests
- Live browser view of test execution
- Easy debugging with DevTools
- Test selection and filtering

### Option 2: Headless Mode (For CI/CD)

```bash
# Run all tests in headless mode (starts server automatically)
npm run test:e2e

# Or run Cypress directly (requires server to be running)
npm run cypress:run
```

**Benefits:**
- Faster execution
- Suitable for CI/CD pipelines
- Generates videos and screenshots
- No GUI overhead

### Option 3: Specific Test Execution

```bash
# Run a specific test file
npx cypress run --spec "cypress/e2e/smoke.cy.js"

# Run tests in a specific folder
npx cypress run --spec "cypress/e2e/**/*"

# Run with specific browser
npx cypress run --browser chrome
npx cypress run --browser firefox
npx cypress run --browser edge
```

## 📝 Test Execution Checklist

### Before Running Tests

- [ ] Ensure Firebase project is accessible
- [ ] Verify `.env` file has correct credentials
- [ ] Check no other instances of the app are running on port 3000
- [ ] Clear browser cache if tests were recently updated
- [ ] Ensure stable internet connection

### During Test Execution

- [ ] Monitor test progress in terminal or Cypress GUI
- [ ] Watch for any authentication errors
- [ ] Note any flaky tests for investigation
- [ ] Check for timeout warnings

### After Test Execution

- [ ] Review test results summary
- [ ] Check screenshots for any failures
- [ ] Watch videos of failed tests
- [ ] Document any issues found
- [ ] Update test documentation if needed

## 🧪 Test Suite Breakdown

### 1. Smoke Tests (`smoke.cy.js`)
**Purpose**: Verify basic application functionality

**Tests:**
- Application loads successfully
- Landing page displays correctly
- Navigation to signup/login works
- Responsive design functions
- Protected routes are secured

**Expected Duration**: ~2 minutes

**Run Command**:
```bash
npx cypress run --spec "cypress/e2e/smoke.cy.js"
```

### 2. Signup Flow Tests (`01-signup.cy.js`)
**Purpose**: Test user registration process

**Tests:**
- Form validation (email, password)
- Successful user registration
- Error handling (existing user, weak password)
- Password visibility toggle
- Navigation between auth pages

**Expected Duration**: ~3-5 minutes

**Run Command**:
```bash
npx cypress run --spec "cypress/e2e/01-signup.cy.js"
```

### 3. Login Flow Tests (`02-login.cy.js`)
**Purpose**: Test user authentication

**Tests:**
- Form validation
- Successful login
- Error handling (wrong credentials)
- Session persistence
- Redirect logic

**Expected Duration**: ~3-4 minutes

**Run Command**:
```bash
npx cypress run --spec "cypress/e2e/02-login.cy.js"
```

### 4. Dashboard Tests (`03-dashboard.cy.js`)
**Purpose**: Verify dashboard display and navigation

**Tests:**
- Dashboard components render
- Navigation menu works
- Statistics display correctly
- Responsive design
- Session persistence

**Expected Duration**: ~4-5 minutes

**Run Command**:
```bash
npx cypress run --spec "cypress/e2e/03-dashboard.cy.js"
```

### 5. Expense Management Tests (`04-expenses.cy.js`)
**Purpose**: Test expense CRUD operations

**Tests:**
- Add expense form
- Form validation
- Multiple expense creation
- Data persistence
- Category association

**Expected Duration**: ~5-6 minutes

**Run Command**:
```bash
npx cypress run --spec "cypress/e2e/04-expenses.cy.js"
```

### 6. Category Management Tests (`05-categories.cy.js`)
**Purpose**: Test category CRUD operations

**Tests:**
- Add category form
- Budget allocation
- Multiple categories
- Data persistence
- Chart display

**Expected Duration**: ~5-6 minutes

**Run Command**:
```bash
npx cypress run --spec "cypress/e2e/05-categories.cy.js"
```

### 7. Reports Tests (`06-reports.cy.js`)
**Purpose**: Test report generation and export

**Tests:**
- Report display
- Data accuracy
- PDF export (if applicable)
- Date filtering
- Summary calculations

**Expected Duration**: ~4-5 minutes

**Run Command**:
```bash
npx cypress run --spec "cypress/e2e/06-reports.cy.js"
```

### 8. Charts Tests (`07-charts.cy.js`)
**Purpose**: Test data visualization

**Tests:**
- Chart rendering
- Multiple chart types
- Data accuracy
- Interactive features
- Responsive behavior

**Expected Duration**: ~5-6 minutes

**Run Command**:
```bash
npx cypress run --spec "cypress/e2e/07-charts.cy.js"
```

### 9. Logout Tests (`08-logout.cy.js`)
**Purpose**: Test logout and session management

**Tests:**
- Logout functionality
- Session clearing
- Route protection after logout
- Re-authentication

**Expected Duration**: ~4-5 minutes

**Run Command**:
```bash
npx cypress run --spec "cypress/e2e/08-logout.cy.js"
```

## ⏱️ Total Test Execution Time

- **Full Suite (Headless)**: ~35-45 minutes
- **Full Suite (Interactive)**: ~40-50 minutes
- **Smoke Tests Only**: ~2 minutes
- **Critical Path Tests**: ~15-20 minutes (signup, login, expense, logout)

## 🎯 Testing Strategies

### 1. Development Testing
Run tests frequently during development:
```bash
# Quick smoke test
npx cypress run --spec "cypress/e2e/smoke.cy.js"

# Test specific feature you're working on
npx cypress run --spec "cypress/e2e/04-expenses.cy.js"
```

### 2. Pre-Commit Testing
Before committing changes:
```bash
# Run critical path tests
npx cypress run --spec "cypress/e2e/{01-signup,02-login,04-expenses,08-logout}.cy.js"
```

### 3. Pre-PR Testing
Before creating a pull request:
```bash
# Run full test suite
npm run test:e2e
```

### 4. CI/CD Testing
Automated in GitHub Actions:
- Triggers on push to main/develop
- Runs on multiple browsers
- Uploads artifacts (screenshots/videos)

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Port 3000 Already in Use
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm start
# Update cypress.config.js baseUrl accordingly
```

#### 2. Firebase Authentication Errors
```bash
# Verify .env file
cat .env

# Check Firebase console for project status
# Ensure internet connection is stable
```

#### 3. Tests Timeout
```javascript
// Increase timeout in specific test
cy.get('.element', { timeout: 15000 });

// Or update cypress.config.js
{
  defaultCommandTimeout: 15000
}
```

#### 4. Flaky Tests
```bash
# Run test multiple times
npx cypress run --spec "cypress/e2e/flaky-test.cy.js" --headed

# Enable retries in cypress.config.js
{
  retries: {
    runMode: 2,
    openMode: 0
  }
}
```

#### 5. Browser Not Found
```bash
# List available browsers
npx cypress info

# Install missing browser or specify available one
npm run cypress:run:chrome
```

## 📊 Test Results

### Understanding Test Output

**Terminal Output:**
```
✓ Test Suite Name
  ✓ Test case 1 (1234ms)
  ✓ Test case 2 (5678ms)
  ✗ Test case 3 (2345ms)
```

**Artifacts:**
- ✅ **Green check**: Test passed
- ❌ **Red X**: Test failed
- ⏭️ **Skipped**: Test was skipped
- ⏸️ **Pending**: Test not yet implemented

### Reviewing Failed Tests

1. **Check Terminal Output**
   - Error message
   - Stack trace
   - Failure location

2. **View Screenshots**
   ```bash
   open cypress/screenshots/
   ```
   - Shows application state at failure

3. **Watch Videos**
   ```bash
   open cypress/videos/
   ```
   - Complete test execution recording

4. **Debug Interactively**
   ```bash
   npm run cypress:open
   ```
   - Re-run failed test with DevTools

## 📈 Best Practices

### Writing Tests
1. Use descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Keep tests independent
4. Use custom commands for repeated actions
5. Store test data in fixtures

### Running Tests
1. Run smoke tests first
2. Run locally before pushing
3. Check all tests before merging
4. Review artifacts for failures
5. Document flaky tests

### Maintaining Tests
1. Update tests with feature changes
2. Fix broken tests immediately
3. Refactor duplicated code
4. Keep documentation current
5. Review test coverage regularly

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Tests automatically run when:
- Code is pushed to `main` or `develop`
- Pull request is created
- Manually triggered

### Viewing CI Results

1. Go to GitHub repository
2. Click "Actions" tab
3. Select "E2E Tests with Cypress"
4. View test results and download artifacts

### Configuring CI Tests

Edit `.github/workflows/e2e.yml` to:
- Change trigger branches
- Modify browser matrix
- Adjust timeout values
- Configure artifact retention

## 📚 Additional Resources

- **Cypress Documentation**: https://docs.cypress.io
- **Budget Buddy README**: See main README.md
- **Test Results**: See `Documents/CI_e2e_run/`
- **GitHub Issues**: Report test issues on GitHub

## 🆘 Getting Help

If you encounter issues:

1. Check this guide for troubleshooting steps
2. Review Cypress documentation
3. Check GitHub issues for similar problems
4. Contact team lead: jminhas@mun.ca
5. Create a GitHub issue with:
   - Test file name
   - Error message
   - Screenshots/videos
   - Steps to reproduce

---

**Last Updated**: November 2024  
**Version**: 1.0  
**Project**: Budget Buddy - Group 6  
**Course**: COMP6905 — Software Engineering

