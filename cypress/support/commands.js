// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Custom command for user signup
 * @param {string} email - User email
 * @param {string} password - User password
 */
Cypress.Commands.add('signup', (email, password) => {
  cy.visit('/');
  cy.contains('Get Started').first().click();
  cy.url().should('include', '/signup');
  
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').first().type(password);
  cy.get('input[type="password"]').last().type(password);
  
  cy.get('button[type="submit"]').click();
  
  // Wait for navigation to dashboard
  cy.url().should('include', '/dashboard', { timeout: 15000 });
});

/**
 * Custom command for user login
 * @param {string} email - User email
 * @param {string} password - User password
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/');
  cy.contains('Login').first().click();
  cy.url().should('include', '/login');
  
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  
  cy.get('button[type="submit"]').click();
  
  // Wait for navigation to dashboard
  cy.url().should('include', '/dashboard', { timeout: 15000 });
});

/**
 * Custom command for user logout
 */
Cypress.Commands.add('logout', () => {
  cy.contains('button', /logout/i, { timeout: 10000 }).click({ force: true });
  // Dismiss the logout confirmation dialog
  cy.get('.cd-btn-confirm', { timeout: 5000 }).click();
  cy.url().should('not.include', '/dashboard', { timeout: 15000 });
});

/**
 * Custom command to add an expense
 * @param {Object} expense - Expense details
 */
Cypress.Commands.add('addExpense', (expense) => {
  const { description, amount, category, date } = expense;
  
  // Click the "Add Expense" button
  cy.contains('button', /add expense/i).click();
  
  // Wait for modal to open
  cy.get('[role="dialog"]').should('be.visible');
  
  // Fill in the form
  if (description) {
    cy.get('input[name="description"], input[placeholder*="description" i]').type(description);
  }
  
  if (amount) {
    cy.get('input[name="amount"], input[type="number"], input[placeholder*="amount" i]').type(amount.toString());
  }
  
  if (category) {
    cy.get('select[name="category"], select').first().select(category);
  }
  
  if (date) {
    cy.get('input[type="date"], input[name="date"]').type(date);
  }
  
  // Submit the form
  cy.contains('button', /add|submit|save/i).click();
  
  // Wait for modal to close
  cy.get('[role="dialog"]').should('not.exist');
});

/**
 * Custom command to add a category
 * @param {Object} category - Category details
 */
Cypress.Commands.add('addCategory', (category) => {
  const { name, budget } = category;
  
  // Navigate to Categories page
  cy.contains('a', /categories/i).click();
  
  // Click the "Add Category" button
  cy.contains('button', /add category/i).click();
  
  // Wait for modal to open
  cy.get('[role="dialog"]').should('be.visible');
  
  // Fill in the form
  if (name) {
    cy.get('input[name="name"], input[placeholder*="name" i]').first().type(name);
  }
  
  if (budget) {
    cy.get('input[name="budget"], input[type="number"]').type(budget.toString());
  }
  
  // Submit the form
  cy.contains('button', /add|submit|save/i).click();
  
  // Wait for modal to close and success message
  cy.get('[role="dialog"]').should('not.exist');
});

/**
 * Custom command to wait for Firebase
 */
Cypress.Commands.add('waitForFirebase', () => {
  cy.wait(2000); // Give Firebase time to initialize
});

/**
 * Custom command to clear all authentication data including IndexedDB
 */
Cypress.Commands.add('clearAuth', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Clear IndexedDB (used by Firebase for auth persistence)
  cy.window().then((win) => {
    if (win.indexedDB && win.indexedDB.databases) {
      win.indexedDB.databases().then((databases) => {
        databases.forEach((db) => {
          win.indexedDB.deleteDatabase(db.name);
        });
      });
    }
  });
  
  cy.wait(500); // Give time for cleanup
});

/**
 * Custom command to generate unique email for testing
 */
Cypress.Commands.add('generateEmail', () => {
  const timestamp = Date.now();
  return `test.user.${timestamp}@budgetbuddy.test`;
});

/**
 * Custom command to check if element exists in viewport
 */
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const rect = subject[0].getBoundingClientRect();
  
  expect(rect.top).to.be.at.least(0);
  expect(rect.left).to.be.at.least(0);
  expect(rect.bottom).to.be.at.most(Cypress.config().viewportHeight);
  expect(rect.right).to.be.at.most(Cypress.config().viewportWidth);
  
  return subject;
});

/**
 * Custom command to take a screenshot with timestamp
 */
Cypress.Commands.add('screenshotWithTimestamp', (name) => {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  cy.screenshot(`${name}-${timestamp}`);
});

