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

// Never let a test send a real email. CI points the app at the live Supabase
// project, which emails every signup / resend / password reset through the
// project's Gmail SMTP — fake @budgetbuddy.test addresses then bounce back
// into that inbox. These stubs answer like Supabase does when email
// confirmation is on: the account is "created" with no session, so the app
// shows the "Confirm Your Email" screen.
const fakeSignupUser = (body) => ({
  id: '00000000-0000-4000-8000-000000000000',
  aud: 'authenticated',
  role: 'authenticated',
  email: body.email,
  user_metadata: body.data || {},
  identities: [{ id: 'e2e', provider: 'email' }],
  created_at: new Date().toISOString(),
});

// Matched on pathname, not a URL glob: the app adds ?redirect_to=… to these
// calls, and a glob like '**/auth/v1/signup' silently misses that.
const authPath = (name) => ({ method: 'POST', pathname: `/auth/v1/${name}` });

function stubEmailSendingAuth() {
  cy.intercept(authPath('signup'), (req) => {
    req.reply({ statusCode: 200, body: fakeSignupUser(req.body), delay: 500 });
  }).as('supabaseSignup');
  cy.intercept(authPath('resend'), { statusCode: 200, body: {} }).as('supabaseResend');
  cy.intercept(authPath('recover'), { statusCode: 200, body: {} }).as('supabaseRecover');
  cy.intercept(authPath('otp'), { statusCode: 200, body: {} }).as('supabaseOtp');
}

// Cypress clears intercepts before every test, and specs sign users up in
// their own before() hooks (which run ahead of any beforeEach) — so register
// the stubs at both points.
before(stubEmailSendingAuth);
beforeEach(stubEmailSendingAuth);

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

