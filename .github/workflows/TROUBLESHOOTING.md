# GitHub Actions Cypress Workflow Troubleshooting

## Common Issues and Solutions

### Issue 1: Tests Fail with "ECONNREFUSED" or "Connection Refused"

**Symptoms:**
- Error: `connect ECONNREFUSED 127.0.0.1:3000`
- Tests fail immediately with connection errors

**Causes:**
- Server not starting properly
- Server taking too long to start
- Port conflicts

**Solutions:**
1. ✅ **Increased wait-on-timeout** to 300 seconds (5 minutes)
2. ✅ **Removed build step** - not needed for dev server
3. ✅ **Added CI environment variable** to optimize for CI environment
4. Check workflow logs to see if server starts successfully

### Issue 2: Tests Timeout Waiting for Elements

**Symptoms:**
- Tests fail with "Timed out retrying after 10000ms"
- Elements not found

**Solutions:**
1. ✅ **Increased timeouts** in `cypress.config.js`:
   - `defaultCommandTimeout`: 15000ms
   - `pageLoadTimeout`: 60000ms
   - `responseTimeout`: 30000ms
2. ✅ **Tests already use data-testid** attributes for reliable selectors
3. ✅ **Tests wait for page load** before interacting

### Issue 3: Firebase Authentication Errors

**Symptoms:**
- Tests fail with Firebase errors
- "Missing environment variable" errors

**Solutions:**
1. ✅ **All Firebase secrets are set** in workflow env
2. Verify secrets are set in GitHub:
   - Go to: Settings → Secrets and variables → Actions
   - Check all 6 Firebase secrets exist:
     - `REACT_APP_FIREBASE_API_KEY`
     - `REACT_APP_FIREBASE_AUTH_DOMAIN`
     - `REACT_APP_FIREBASE_PROJECT_ID`
     - `REACT_APP_FIREBASE_STORAGE_BUCKET`
     - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
     - `REACT_APP_FIREBASE_APP_ID`

### Issue 4: Server Starts But Tests Don't Run

**Symptoms:**
- Server starts successfully in logs
- Tests never execute
- Workflow hangs

**Solutions:**
1. ✅ **wait-on-timeout increased** to handle slow starts
2. ✅ **config-file specified** explicitly
3. Check if `wait-on` is detecting server correctly
4. Verify `baseUrl` in `cypress.config.js` matches server URL

### Issue 5: Tests Pass Locally But Fail in CI

**Symptoms:**
- All tests pass when run locally
- Same tests fail in GitHub Actions

**Common Causes:**
1. **Environment differences** - CI is slower
   - ✅ Increased timeouts for CI
   - ✅ Added `CI: true` environment variable
2. **Missing environment variables**
   - ✅ All Firebase vars are set in workflow
3. **Different Node.js versions**
   - ✅ Workflow uses Node 18 (matches local)
4. **Network/firewall issues**
   - Check if Firebase is accessible from GitHub Actions

## Debugging Steps

### Step 1: Check Workflow Logs

1. Go to your repository → **Actions** tab
2. Click on the failed workflow run
3. Expand each step to see detailed logs
4. Look for:
   - Server startup messages
   - Test execution logs
   - Error messages

### Step 2: Download Artifacts

1. Scroll to bottom of workflow run
2. Download available artifacts:
   - **cypress-screenshots**: See what pages looked like
   - **cypress-videos**: Watch test execution
   - **cypress-test-results**: Detailed test results

### Step 3: Test Locally with CI Settings

```bash
# Set CI environment variable
export CI=true

# Run tests (simulates CI)
npm run test:e2e
```

### Step 4: Check Server Startup

Look for these in workflow logs:
```
Compiled successfully!
You can now view budget-buddy in the browser.
  Local:            http://localhost:3000
```

If you don't see this, the server isn't starting properly.

## Workflow Configuration Checklist

- [x] Node.js version specified (18)
- [x] Dependencies installed with `npm ci`
- [x] Server starts with `npm start`
- [x] Wait-on configured with proper timeout (300s)
- [x] All Firebase secrets set in env
- [x] Cypress config file specified
- [x] Browser specified (chrome)
- [x] Artifacts uploaded on failure
- [x] Timeouts increased for CI environment

## Recent Fixes Applied

1. ✅ **Removed build step** - unnecessary for dev server
2. ✅ **Removed CYPRESS_baseUrl** - already set in config
3. ✅ **Increased wait-on-timeout** from 180s to 300s
4. ✅ **Added CI environment variable**
5. ✅ **Increased Cypress timeouts** for slower CI
6. ✅ **Explicitly set config-file**

## Still Having Issues?

1. **Check workflow logs** for specific error messages
2. **Download artifacts** to see screenshots/videos
3. **Test locally** with `CI=true npm run test:e2e`
4. **Verify secrets** are set correctly
5. **Check Firebase project** is active and accessible

## Useful Commands

```bash
# Test locally (simulates CI)
CI=true npm run test:e2e

# Check if server starts
npm start

# Run Cypress with verbose logging
DEBUG=cypress:* npm run cypress:run

# Check environment variables
printenv | grep REACT_APP
```

