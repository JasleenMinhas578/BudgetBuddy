# CI/CD E2E Test Run Artifacts

This directory contains artifacts from Cypress E2E test runs in CI/CD.

## Contents

- **Screenshots**: Captured on test failures
- **Videos**: Full test execution recordings
- **Test Results**: JSON reports and summaries

## How to Add Artifacts

After running E2E tests in CI/CD:

1. Download artifacts from GitHub Actions workflow run
2. Extract and organize by date/run number
3. Add a brief summary of the test run results

## Example Structure

```
CI_e2e_run/
├── 2025-11-15_run_001/
│   ├── screenshots/
│   ├── videos/
│   └── summary.md
└── README.md
```

## Notes

- Artifacts are automatically uploaded by GitHub Actions
- Local test runs save to `cypress/screenshots/` and `cypress/videos/`
- Keep this directory updated with passing test run evidence

