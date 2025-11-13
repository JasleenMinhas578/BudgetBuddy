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
 * Custom command to login a user
 * Usage: cy.login('user@example.com', 'password123')
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  // Wait for page to load and Firebase to initialize
  cy.wait(2000); // Give Firebase time to initialize
  cy.get('body').should('be.visible');
  // Wait for auth form to be visible with longer timeout
  cy.get('form.auth-form', { timeout: 20000 }).should('be.visible');
  cy.get('[data-testid="email-input"], input[type="email"]', { timeout: 20000 }).should('be.visible').type(email);
  cy.get('[data-testid="password-input"], input[type="password"]', { timeout: 20000 }).should('be.visible').type(password);
  cy.get('form').submit();
  // Wait for navigation to dashboard
  cy.url().should('include', '/dashboard');
});

/**
 * Custom command to signup a new user
 * Usage: cy.signup('user@example.com', 'Password123', 'Password123')
 * Note: If user already exists, this will attempt to login instead.
 */
Cypress.Commands.add('signup', (email, password, confirmPassword) => {
  cy.visit('/signup');
  // Wait for page to load and Firebase to initialize
  cy.wait(2000); // Give Firebase time to initialize
  cy.get('body').should('be.visible');
  // Wait for auth form to be visible with longer timeout
  cy.get('form.auth-form', { timeout: 20000 }).should('be.visible');
  cy.get('[data-testid="email-input"], input[type="email"]', { timeout: 20000 }).should('be.visible').type(email);
  cy.get('[data-testid="password-input"], input#password', { timeout: 20000 }).should('be.visible').type(password);
  cy.get('[data-testid="confirm-password-input"], input#confirmPassword', { timeout: 20000 }).should('be.visible').type(confirmPassword);
  cy.get('form').submit();
  
  // Wait for either success (redirect to dashboard) or error message
  cy.wait(3000);
  
  // Check current URL
  cy.url().then((url) => {
    if (url.includes('/dashboard')) {
      // Success - already on dashboard
      return;
    }
    
    // Still on signup page - check for error message
    cy.get('body').should('exist').then(($body) => {
      // Check if error message exists
      const errorElement = $body.find('.auth-error');
      const errorExists = errorElement.length > 0;
      
      if (errorExists) {
        // Get error text
        const errorText = errorElement.text();
        cy.log('Signup error: ' + errorText);
        
        // If error indicates user already exists, try to login instead
        if (errorText.includes('already exists') || errorText.includes('already in use')) {
          cy.log('User already exists, attempting login instead');
          cy.visit('/login');
          cy.wait(2000); // Give Firebase time to initialize
          cy.get('body').should('be.visible');
          cy.get('form.auth-form', { timeout: 20000 }).should('be.visible');
          cy.get('[data-testid="email-input"], input[type="email"]', { timeout: 20000 }).should('be.visible').type(email);
          cy.get('[data-testid="password-input"], input[type="password"]', { timeout: 20000 }).should('be.visible').type(password);
          cy.get('form').submit();
          
          // Wait for login to complete
          cy.wait(3000);
          cy.url().should('include', '/dashboard', { timeout: 10000 });
        } else {
          // Other error - fail the command
          throw new Error('Signup failed: ' + errorText);
        }
      } else {
        // No error message but still on signup page - wait a bit more and check again
        cy.wait(2000);
        cy.url().then((currentUrl) => {
          if (!currentUrl.includes('/dashboard')) {
            throw new Error('Signup failed - still on signup page. User may already exist or Firebase restrictions apply.');
          }
        });
      }
    });
  });
});

/**
 * Custom command to logout
 * Usage: cy.logout()
 */
Cypress.Commands.add('logout', () => {
  // Look for logout button - adjust selector based on your navbar
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="logout-button"]').length > 0) {
      cy.get('[data-testid="logout-button"]').click();
    } else if ($body.find('button:contains("Logout")').length > 0) {
      cy.contains('button', 'Logout').click();
    } else {
      // Try to find any logout link/button
      cy.get('a, button').contains(/logout/i).click();
    }
  });
  // Wait for navigation to landing page
  cy.url().should('not.include', '/dashboard');
});

/**
 * Custom command to ensure user is logged in
 * Tries login first, then signup if login fails
 * Usage: cy.ensureLoggedIn('user@example.com', 'Password123')
 */
Cypress.Commands.add('ensureLoggedIn', (email, password) => {
  cy.visit('/login');
  // Wait for page to load and Firebase to initialize
  cy.wait(2000); // Give Firebase time to initialize
  cy.get('body').should('be.visible');
  // Wait for auth form to be visible with longer timeout
  cy.get('form.auth-form', { timeout: 20000 }).should('be.visible');
  cy.get('[data-testid="email-input"], input[type="email"]', { timeout: 20000 }).should('be.visible').type(email);
  cy.get('[data-testid="password-input"], input[type="password"]', { timeout: 20000 }).should('be.visible').type(password);
  cy.get('form').submit();
  
  // Wait and check if login succeeded
  cy.wait(3000);
  cy.url().then((url) => {
    if (!url.includes('/dashboard')) {
      // Login failed, try signup
      cy.log('Login failed, attempting signup');
      cy.visit('/signup');
      cy.wait(2000); // Give Firebase time to initialize
      cy.get('body').should('be.visible');
      cy.get('form.auth-form', { timeout: 20000 }).should('be.visible');
      cy.get('[data-testid="email-input"], input[type="email"]', { timeout: 20000 }).should('be.visible').type(email);
      cy.get('[data-testid="password-input"], input#password', { timeout: 20000 }).should('be.visible').type(password);
      cy.get('[data-testid="confirm-password-input"], input#confirmPassword', { timeout: 20000 }).should('be.visible').type(password);
      cy.get('form').submit();
      
      // Wait for signup result
      cy.wait(3000);
      
      // Check if signup succeeded
      cy.url().then((signupUrl) => {
        if (!signupUrl.includes('/dashboard')) {
          // Both login and signup failed
          cy.log('Both login and signup failed. User may need to be created manually in Firebase Console.');
          // Try one more time with a longer wait
          cy.wait(2000);
          cy.url().should('include', '/dashboard', { timeout: 10000 });
        }
      });
    }
  });
  
  // Ensure we're on dashboard
  cy.url().should('include', '/dashboard', { timeout: 15000 });
});

/**
 * Custom command to add an expense
 * Usage: cy.addExpense('Coffee', '5.50', 'Food', '2025-11-15')
 */
Cypress.Commands.add('addExpense', (title, amount, category, date) => {
  // Open add expense modal/form
  cy.contains('button', 'Add Expense').click();
  cy.wait(1000);
  
  // Fill in the form using actual IDs from ExpenseForm
  cy.get('input#title').type(title);
  cy.get('input#amount').type(amount);
  
  // Select category if provided
  if (category) {
    cy.get('select#category').select(category);
  }
  
  // Set date if provided
  if (date) {
    cy.get('input#date').clear().type(date);
  }
  
  // Submit the form
  cy.get('form.expense-form').within(() => {
    cy.get('button[type="submit"]').click();
  });
  
  // Wait for success message or expense to appear
  cy.wait(2000);
});

