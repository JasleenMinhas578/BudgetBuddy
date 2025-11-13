/**
 * Authentication Flow E2E Tests
 * 
 * Tests for:
 * - User signup flow
 * - User login flow
 * - User logout flow
 * - Password reset (forgot password) flow
 */

describe('Authentication Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123';
  const testConfirmPassword = 'TestPassword123';

  beforeEach(() => {
    // Clear any existing session
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Signup Flow', () => {
    it('should successfully sign up a new user', () => {
      cy.visit('/signup');
      
      // Fill in signup form
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input#password').type(testPassword);
      cy.get('input#confirmPassword').type(testConfirmPassword);
      
      // Submit form
      cy.get('form').submit();
      
      // Should redirect to dashboard after successful signup
      cy.url().should('include', '/dashboard', { timeout: 10000 });
      
      // Verify user is logged in by checking dashboard elements
      // Wait for the welcome section to load (it contains "Welcome" text)
      cy.contains(/welcome/i, { timeout: 10000 }).should('be.visible');
    });

    it('should show error for invalid email format', () => {
      cy.visit('/signup');
      
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('input#password').type(testPassword);
      cy.get('input#confirmPassword').type(testConfirmPassword);
      
      cy.get('form').submit();
      
      // Should show validation error - wait for error message to appear
      cy.get('.auth-error', { timeout: 5000 }).should('be.visible');
      // Check for the error message text - the text should contain "valid email"
      cy.get('.auth-error').should('contain.text', 'valid email');
    });

    it('should show error for weak password', () => {
      cy.visit('/signup');
      
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input#password').type('weak');
      cy.get('input#confirmPassword').type('weak');
      
      cy.get('form').submit();
      
      // Should show password strength error - wait for error message to appear
      cy.get('.auth-error', { timeout: 5000 }).should('be.visible');
      // Check for the error message text - should contain password-related validation message
      cy.get('.auth-error').then(($error) => {
        const errorText = $error.text();
        expect(errorText).to.match(/password|8 characters|uppercase|lowercase|number/i);
      });
    });

    it('should show error when passwords do not match', () => {
      cy.visit('/signup');
      
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input#password').type(testPassword);
      cy.get('input#confirmPassword').type('DifferentPassword123');
      
      cy.get('form').submit();
      
      // Should show password mismatch error - wait for error message to appear
      cy.get('.auth-error', { timeout: 5000 }).should('be.visible');
      // Check for the error message text - should contain "do not match" or "match"
      cy.get('.auth-error').should('contain.text', 'do not match');
    });

    it('should show error for existing email', () => {
      // First, create a user
      cy.signup(testEmail, testPassword, testConfirmPassword);
      cy.logout();
      
      // Try to signup again with same email
      cy.visit('/signup');
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input#password').type(testPassword);
      cy.get('input#confirmPassword').type(testConfirmPassword);
      
      cy.get('form').submit();
      
      // Should show email already exists error - wait for error message to appear
      cy.get('.auth-error', { timeout: 10000 }).should('be.visible');
      // Check for the error message text - should contain "already exists"
      cy.get('.auth-error').should('contain.text', 'already exists');
    });
  });

  describe('Login Flow', () => {
    beforeEach(() => {
      // Create a test user before login tests
      cy.signup(testEmail, testPassword, testConfirmPassword);
      cy.logout();
    });

    it('should successfully log in with valid credentials', () => {
      cy.visit('/login');
      
      // Fill in login form
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type(testPassword);
      
      // Submit form
      cy.get('form').submit();
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard', { timeout: 10000 });
      
      // Verify user is logged in - wait for welcome section to load
      cy.contains(/welcome/i, { timeout: 10000 }).should('be.visible');
    });

    it('should show error for incorrect password', () => {
      cy.visit('/login');
      
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type('WrongPassword123');
      
      cy.get('form').submit();
      
      // Should show error message - wait for error to appear
      cy.get('.auth-error', { timeout: 10000 }).should('be.visible');
      cy.get('.auth-error').should('contain.text', 'Incorrect password');
      cy.url().should('include', '/login');
    });

    // it('should show error for non-existent user', () => {
    //   cy.visit('/login');
      
    //   cy.get('input[type="email"]').type('nonexistent@example.com');
    //   cy.get('input[type="password"]').type(testPassword);
      
    //   cy.get('form').submit();
      
    //   // Should show error message - wait for error to appear
    //   cy.get('.auth-error', { timeout: 10000 }).should('be.visible');
    //   cy.get('.auth-error').should('contain.text', 'No account found');
    //   cy.url().should('include', '/login');
    // });

    it('should navigate to forgot password page', () => {
      cy.visit('/login');
      
      cy.contains('a', /forgot password/i).click();
      cy.url().should('include', '/forgot-password');
    });
  });

  describe('Logout Flow', () => {
    beforeEach(() => {
      // Login before logout tests
      cy.signup(testEmail, testPassword, testConfirmPassword);
    });

    it('should successfully log out and redirect to landing page', () => {
      // Verify we're on dashboard
      cy.url().should('include', '/dashboard');
      
      // Find and click logout button
      cy.get('body').then(($body) => {
        // Try different possible logout button selectors
        if ($body.find('button:contains("Logout")').length > 0) {
          cy.contains('button', 'Logout').click();
        } else if ($body.find('a:contains("Logout")').length > 0) {
          cy.contains('a', 'Logout').click();
        } else if ($body.find('[data-testid="logout"]').length > 0) {
          cy.get('[data-testid="logout"]').click();
        } else {
          // Look for any element containing logout text
          cy.get('*').contains(/logout/i).click();
        }
      });
      
      // Should redirect to landing page
      cy.url().should('not.include', '/dashboard');
      cy.url().should('match', /\/(login|signup|$)/);
    });
  });

  describe('Forgot Password Flow', () => {
    beforeEach(() => {
      // Create a test user
      cy.signup(testEmail, testPassword, testConfirmPassword);
      cy.logout();
    });

    it('should navigate to forgot password page', () => {
      cy.visit('/login');
      cy.contains('a', /forgot password/i).click();
      cy.url().should('include', '/forgot-password');
    });

    it('should display forgot password form', () => {
      cy.visit('/forgot-password');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    // it('should submit forgot password form', () => {
    //   cy.visit('/forgot-password');
    //   cy.get('input[type="email"]').type(testEmail);
    //   cy.get('form').submit();
      
    //   // Should show success message or redirect
    //   cy.wait(2000);
    //   cy.get('body').should('contain', /email|sent|reset|password/i);
    // });
  });
});

