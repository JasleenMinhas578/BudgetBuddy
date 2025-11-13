# Workflow Verification Checklist

Use this checklist to ensure your Cypress tests work correctly in GitHub Actions.

## ✅ Pre-Flight Checks

### 1. GitHub Secrets Configuration
- [ ] Go to your repository → **Settings** → **Secrets and variables** → **Actions**
- [ ] Verify all 6 Firebase secrets are set:
  - [ ] `REACT_APP_FIREBASE_API_KEY`
  - [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN`
  - [ ] `REACT_APP_FIREBASE_PROJECT_ID`
  - [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET`
  - [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `REACT_APP_FIREBASE_APP_ID`

### 2. Local Testing
- [ ] Tests pass locally: `npm run cypress:run`
- [ ] Or use the test script: `./scripts/test-workflow.sh`
- [ ] Verify all test files are in `cypress/e2e/` directory

### 3. Workflow File
- [ ] `.github/workflows/e2e.yml` exists and is valid YAML
- [ ] No syntax errors (check with a YAML validator)
- [ ] Workflow triggers are correct (push, PR, manual)

## 🧪 Testing the Workflow

### Method 1: Manual Trigger (Recommended for First Test)
1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **E2E Tests with Cypress** workflow
4. Click **Run workflow** button (top right)
5. Select branch and click **Run workflow**
6. Monitor the execution

### Method 2: Push to Test Branch
1. Create a test branch: `git checkout -b test-cypress-workflow`
2. Make a small change (e.g., update README)
3. Commit and push: `git push origin test-cypress-workflow`
4. Create a PR to `main` or `develop`
5. Workflow will run automatically

### Method 3: Direct Push
1. Push to `main` or `develop` branch
2. Workflow runs automatically on push

## 📊 Verifying Results

### Success Indicators
- ✅ All workflow steps show green checkmarks
- ✅ "Run Cypress tests" step completes successfully
- ✅ Test summary shows all tests passing
- ✅ No error messages in logs

### Failure Indicators
- ❌ Red X on any step
- ❌ Error messages in workflow logs
- ❌ Test failures reported

## 🔍 Debugging Failed Workflows

### Step 1: Check Workflow Logs
1. Click on the failed workflow run
2. Click on the failed job
3. Expand failed step to see error messages
4. Look for:
   - Missing environment variables
   - Build errors
   - Test failures
   - Timeout errors

### Step 2: Download Artifacts
1. Scroll to bottom of workflow run page
2. Download available artifacts:
   - **cypress-screenshots**: See what pages looked like when tests failed
   - **cypress-videos**: Watch test execution
   - **cypress-test-results**: Detailed test results

### Step 3: Common Issues

#### Issue: "Missing environment variable"
**Fix**: Add missing secret to GitHub Secrets

#### Issue: "Server failed to start"
**Fix**: 
- Check if port 3000 is available
- Verify `npm start` works locally
- Increase `wait-on-timeout` if needed

#### Issue: "Tests timeout"
**Fix**:
- Check if elements have `data-testid` attributes
- Verify page loads completely
- Increase timeouts in test files

#### Issue: "Firebase authentication error"
**Fix**:
- Verify all Firebase secrets are correct
- Check Firebase project settings
- Ensure Firebase project is active

## 📝 Quick Test Commands

```bash
# Test locally (simulates CI)
./scripts/test-workflow.sh

# Or manually:
npm ci
npm run build
npm start &  # In background
npm run cypress:run

# Check workflow syntax
# Use online YAML validator or:
yamllint .github/workflows/e2e.yml
```

## 🎯 Success Criteria

Your workflow is working correctly when:
- ✅ Workflow runs automatically on push/PR
- ✅ All tests pass consistently
- ✅ Artifacts are uploaded on failure
- ✅ Workflow completes in reasonable time (< 10 minutes)
- ✅ No false positives/negatives

## 📞 Need Help?

1. Check workflow logs for specific errors
2. Review `.github/workflows/TESTING_GUIDE.md` for detailed info
3. Test locally first to isolate issues
4. Check Cypress documentation: https://docs.cypress.io

