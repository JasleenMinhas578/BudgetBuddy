const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 60000,
    chromeWebSecurity: false,
    experimentalRunAllSpecs: true,
    // Specify test isolation
    testIsolation: true,
    // Video and screenshot configuration
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0
    },
    // Exclude example specs
    excludeSpecPattern: ['**/examples/**', '**/1-getting-started/**', '**/2-advanced-examples/**'],
    // Environment variables
    env: {
      // Add any environment-specific variables here
      apiUrl: 'http://localhost:3000'
    }
  },
});

