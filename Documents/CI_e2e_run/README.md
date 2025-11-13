# CI E2E Test Run Artifacts

This directory contains artifacts from Cypress E2E test runs, including screenshots, videos, and reports.

## Directory Structure

```
CI_e2e_run/
├── screenshots/     # Screenshots captured during test failures
├── videos/         # Video recordings of test executions
├── reports/        # Test execution reports and summaries
└── README.md       # This file
```

## Usage

### Local Test Runs

After running Cypress tests locally, copy the artifacts here for documentation:

```bash
# Copy screenshots
cp -r cypress/screenshots/* Documents/CI_e2e_run/screenshots/

# Copy videos
cp -r cypress/videos/* Documents/CI_e2e_run/videos/
```

### CI/CD Test Runs

When tests run in GitHub Actions:
1. Go to the Actions tab in GitHub
2. Select the E2E Tests workflow run
3. Download the artifacts (screenshots and videos)
4. Extract and place them in this directory for documentation

## Test Artifacts

### Screenshots
- Automatically captured when a test fails
- Helps identify the state of the application at failure
- Named after the test spec and test case
- Format: `spec-name -- test-name (failed).png`

### Videos
- Recorded for all test runs (passing and failing)
- Shows complete test execution
- Useful for debugging flaky tests
- Format: `spec-name.cy.js.mp4`

### Reports
- Test execution summaries
- Pass/fail statistics
- Execution time metrics
- Browser and environment details

## Viewing Artifacts

### Screenshots
Open screenshot files directly or use an image viewer:
```bash
open Documents/CI_e2e_run/screenshots/
```

### Videos
Play video files using any media player:
```bash
open Documents/CI_e2e_run/videos/
```

### Reports
View HTML reports in a browser:
```bash
open Documents/CI_e2e_run/reports/index.html
```

## Best Practices

1. **Regular Cleanup**: Remove old artifacts to save space
2. **Documentation**: Keep artifacts from significant test runs
3. **Failed Tests**: Always review screenshots/videos of failed tests
4. **CI Artifacts**: Download and archive CI artifacts for important releases
5. **Version Control**: Don't commit artifacts to Git (add to .gitignore)

## Troubleshooting

### No Artifacts Generated
- Ensure Cypress is configured to capture screenshots and videos
- Check `cypress.config.js` settings:
  ```javascript
  {
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots'
  }
  ```

### Large File Sizes
- Videos can be large; compress if needed
- Set video compression in Cypress config:
  ```javascript
  {
    videoCompression: 32,  // 0-51, lower = better quality but larger size
  }
  ```

### Missing CI Artifacts
- Check GitHub Actions workflow configuration
- Verify artifact upload step in `.github/workflows/e2e.yml`
- Ensure retention period hasn't expired (default: 7 days)

## Artifact Retention

### Local
- Keep artifacts for recent test runs
- Archive important test runs separately
- Clean up periodically to free disk space

### CI/CD
- GitHub Actions retention: 7 days (configurable)
- Download important artifacts before expiration
- Consider using external storage for long-term retention

## Integration with Test Results

Artifacts are linked to test results:
- Failed test → Screenshot shows failure state
- All tests → Video shows complete execution
- Test reports → Link to specific artifacts

This documentation helps in:
- Debugging test failures
- Understanding test behavior
- Verifying application state during tests
- Demonstrating test coverage to stakeholders

---

**Last Updated**: November 2024  
**Project**: Budget Buddy - Group 6  
**Course**: COMP6905 — Software Engineering

