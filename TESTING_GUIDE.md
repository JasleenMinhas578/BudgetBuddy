# 🧪 Quick Testing Guide - Cypress E2E Tests

## Method 1: Interactive Mode (Recommended for First Time)

This opens the Cypress Test Runner GUI where you can see tests run in real-time.

### Steps:

1. **Start the development server** (if not already running):
   ```bash
   npm start
   ```
   Wait until you see "Compiled successfully!" and the app is running on `http://localhost:3000`

2. **Open a new terminal** and run:
   ```bash
   npm run cypress:open
   ```

3. **In the Cypress Test Runner:**
   - Click "E2E Testing"
   - Select a browser (Chrome recommended)
   - Click on a test file (e.g., `smoke.spec.js`) to run it
   - Watch the tests execute in real-time!

---

## Method 2: Headless Mode (Quick Test Run)

Runs all tests in the background without opening a browser window.

### Steps:

1. **Start the development server** (if not already running):
   ```bash
   npm start
   ```

2. **In a new terminal**, run:
   ```bash
   npm run cypress:run
   ```

3. **View results** in the terminal - you'll see:
   - ✅ Passing tests
   - ❌ Failing tests (if any)
   - Screenshots saved to `cypress/screenshots/` on failures
   - Videos saved to `cypress/videos/` for all runs

---

## Method 3: Run Specific Test File

To run only one test file:

```bash
# Run only smoke tests
npx cypress run --spec "cypress/e2e/smoke.spec.js"

# Run only auth tests
npx cypress run --spec "cypress/e2e/auth.spec.js"
```

---

## What to Expect

### ✅ Successful Test Run:
- All tests should pass (or show expected failures if Firebase isn't configured)
- You'll see green checkmarks for passing tests
- Terminal output shows test summary

### ⚠️ Common Issues:

1. **"Can't connect to localhost:3000"**
   - Make sure `npm start` is running
   - Wait a few seconds for the server to fully start

2. **Firebase Authentication Errors**
   - Tests use real Firebase - ensure your `.env` file has valid Firebase credentials
   - Tests create unique users, so they shouldn't conflict

3. **Tests Timeout**
   - Firebase operations can take time
   - Tests have 10-second timeouts, but you can increase if needed

---

## Test Files Overview

- **smoke.spec.js** - Start here! Basic health checks (fastest)
- **auth.spec.js** - Authentication flows (signup, login, logout)
- **expense.spec.js** - Expense management
- **dashboard.spec.js** - Dashboard display and navigation

---

## Tips

- **Start with smoke tests** - They're the fastest and verify basic functionality
- **Use interactive mode first** - It's easier to debug issues
- **Check videos** - If a test fails, check `cypress/videos/` to see what happened
- **Check screenshots** - Failed tests save screenshots to `cypress/screenshots/`

---

## Next Steps After Testing

1. ✅ Verify all tests pass locally
2. ✅ Push to GitHub to trigger CI/CD
3. ✅ Check GitHub Actions workflow for automated test results
4. ✅ Upload test artifacts to `Documents/CI_e2e_run/` if needed

