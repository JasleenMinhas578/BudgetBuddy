# Cypress Testing Guide

## Why Tests Are Failing

If you see `ECONNREFUSED 127.0.0.1:3000`, it means the development server isn't running. Cypress needs the app to be running to test it.

## How to Run Tests Correctly

### Option 1: Use the Combined Script (Recommended) ✅

This automatically starts the server, waits for it to be ready, runs tests, then stops the server:

```bash
npm run test:e2e
```

### Option 2: Start Server Manually

**Terminal 1** - Start the server:
```bash
npm start
```

**Terminal 2** - Run tests (once server is ready):
```bash
npm run cypress:run
```

### Option 3: Open Cypress UI (For Development)

**Terminal 1** - Start the server:
```bash
npm start
```

**Terminal 2** - Open Cypress UI:
```bash
npm run cypress:open
```

Then select and run tests from the UI.

## In GitHub Actions

The workflow automatically handles starting the server using the `start: npm start` parameter in the Cypress action. You don't need to do anything special - it's already configured correctly.

## Common Issues

### Issue: "ECONNREFUSED 127.0.0.1:3000"
**Solution**: Make sure the server is running or use `npm run test:e2e`

### Issue: "Port 3000 already in use"
**Solution**: 
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
PORT=3001 npm start
```

### Issue: Tests timeout waiting for elements
**Solution**: 
- Check that `data-testid` attributes are present (already fixed)
- Verify page loads completely
- Check screenshots/videos in `cypress/screenshots` and `cypress/videos`

### Issue: Firebase authentication errors
**Solution**: 
- Verify `.env.local` file exists with Firebase credentials
- Check Firebase project is active
- Ensure Firebase Authentication is enabled

## Quick Test Commands

```bash
# Run all tests (auto-starts server)
npm run test:e2e

# Run tests in headless mode (auto-starts server)
npm run test:e2e

# Open Cypress UI (requires server running separately)
npm run cypress:open

# Run specific test file
npm run cypress:run -- --spec "cypress/e2e/auth.spec.js"
```

## Workflow Status

Your GitHub Actions workflow is correctly configured to:
- ✅ Start the server automatically
- ✅ Wait for server to be ready
- ✅ Run all Cypress tests
- ✅ Upload screenshots/videos on failure
- ✅ Handle environment variables

## Next Steps

1. **Test locally first**: `npm run test:e2e`
2. **Fix any local failures** before pushing
3. **Push to GitHub** - workflow will run automatically
4. **Check Actions tab** for results

