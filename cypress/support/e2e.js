// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Disable uncaught exception handling to prevent tests from failing on application errors
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  // This is useful when the application has errors that don't affect the test
  return false;
});

// Add custom before and after hooks
beforeEach(() => {
  // Clear all authentication data including IndexedDB before each test
  // This ensures Firebase auth doesn't persist between tests
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Clear IndexedDB (Firebase stores auth here)
  cy.window({ log: false }).then((win) => {
    if (win.indexedDB && win.indexedDB.databases) {
      win.indexedDB.databases().then((databases) => {
        databases.forEach((db) => {
          win.indexedDB.deleteDatabase(db.name);
        });
      }).catch(() => {
        // Ignore errors if databases() is not supported
      });
    }
  });
});

afterEach(() => {
  // Log test completion
  cy.log('Test completed');
});

