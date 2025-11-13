# Cypress Workflow Testing Guide

This guide helps you verify that your Cypress tests are working correctly in GitHub Actions.

## Quick Checklist

### 1. ✅ Fixed Workflow Issues
- [x] Removed invalid `headless: true` parameter (Cypress runs headless by default in CI)
- [x] Workflow uses correct Cypress GitHub Action v6 syntax
- [x] Environment variables are properly configured

### 2. Required GitHub Secrets

Make sure these secrets are set in your GitHub repository:
- Go to: **Settings → Secrets and variables → Actions**

Required secrets:
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

### 3. Test Locally First

Before pushing to GitHub, test your Cypress tests locally:

```bash
# Install dependencies (if not already done)
npm ci

# Start the app in one terminal
npm start

# In another terminal, run Cypress tests
npm run cypress:run

# Or use the combined command
npm run test:e2e
```

### 4. Verify Workflow Triggers

The workflow runs on:
- ✅ Push to `main` or `develop` branches
- ✅ Pull requests to `main` or `develop` branches
- ✅ Manual trigger via GitHub Actions UI

### 5. Monitor Workflow Execution

1. Go to your repository on GitHub
2. Click on **Actions** tab
3. Select the **E2E Tests with Cypress** workflow
4. Check the latest run status

### 6. Check Workflow Artifacts

If tests fail, download artifacts:
- **cypress-screenshots**: Screenshots of failed tests
- **cypress-videos**: Video recordings of test runs
- **cypress-test-results**: Test result files

### 7. Common Issues & Solutions

#### Issue: Tests timeout waiting for server
**Solution**: Increase `wait-on-timeout` in workflow (currently 180 seconds)

#### Issue: Firebase authentication errors
**Solution**: Verify all Firebase secrets are set correctly in GitHub Secrets

#### Issue: Tests can't find elements
**Solution**: 
- Check that `data-testid` attributes are present
- Verify page loads completely before tests run
- Check screenshots/videos in artifacts

#### Issue: Build fails
**Solution**: Ensure all environment variables are available during build step

### 8. Debugging Failed Tests

1. **Download artifacts** from failed workflow run
2. **Check screenshots** to see what the page looked like when test failed
3. **Watch videos** to see the test execution
4. **Check workflow logs** for error messages
5. **Run tests locally** with same environment variables

### 9. Best Practices

- ✅ Always test locally before pushing
- ✅ Keep test selectors stable (use `data-testid`)
- ✅ Add proper waits for async operations
- ✅ Use meaningful test descriptions
- ✅ Keep tests independent (no shared state)
- ✅ Clean up test data after tests

### 10. Workflow Status Badge

Add this to your README.md to show workflow status:

```markdown
![Cypress Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/E2E%20Tests%20with%20Cypress/badge.svg)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual values.

