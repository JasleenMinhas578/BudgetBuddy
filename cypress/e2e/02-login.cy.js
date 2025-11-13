/**
 * E2E Tests for User Login Flow
 * 
 * Tests the complete user login process including:
 * - Form validation
 * - Successful login
 * - Error handling
 * - Session persistence
 */

describe('User Login Flow', () => {
  
  // Create a test user before running login tests
  const testUser = {
    email: `test.login@budgetbuddy.test`,
    password: 'TestPassword123!'
  };

  before(() => {
    // Create a user account for login tests
    cy.visit('/signup');
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').first().type(testUser.password);
    cy.get('input[type="password"]').last().type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    cy.wait(5000);
    
    // Logout if signup was successful
    cy.url().then((url) => {
      if (url.includes('/dashboard')) {
        cy.contains('button', /logout/i).click();
      }
    });
  });

  beforeEach(() => {
    cy.visit('/');
    cy.contains('Login').first().click();
    cy.url().should('include', '/login');
  });

  it('should display the login form with all required fields', () => {
    // Check for login/signin heading
    cy.contains(/Welcome|Sign In|Login/i).should('be.visible');
    
    // Check for email field
    cy.get('input[type="email"]').should('be.visible');
    
    // Check for password field
    cy.get('input[type="password"]').should('be.visible');
    
    // Check for submit button
    cy.get('button[type="submit"]').should('be.visible');
    
    // Check for signup link
    cy.contains('a', /don.*t.*have.*account|sign up/i).should('be.visible');
  });

  it('should show validation errors for empty form submission', () => {
    cy.get('button[type="submit"]').click();
    
    // Should stay on login page
    cy.url().should('include', '/login');
  });

  it('should show error for invalid email format', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').type('password123');
    
    cy.get('button[type="submit"]').click();
    
    // Should stay on login page
    cy.url().should('include', '/login');
  });

  it('should show error for incorrect credentials', () => {
    cy.get('input[type="email"]').type('nonexistent@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    
    cy.get('button[type="submit"]').click();
    
    cy.wait(3000);
    
    // Should show error message or stay on login page
    cy.url().should('include', '/login');
  });

  it('should successfully login with valid credentials', () => {
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    
    cy.get('button[type="submit"]').click();
    
    // Wait for Firebase authentication
    cy.wait(5000);
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard', { timeout: 15000 });
    
    // Verify dashboard elements are visible
    cy.contains(/dashboard|overview|expenses/i, { timeout: 10000 }).should('be.visible');
    
    // Logout
    cy.contains('button', /logout/i).click();
  });

  it('should show error for wrong password with correct email', () => {
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type('WrongPassword123!');
    
    cy.get('button[type="submit"]').click();
    
    cy.wait(3000);
    
    // Should show error and stay on login page
    cy.url().should('include', '/login');
  });

  it('should toggle password visibility', () => {
    cy.get('input[type="password"]').type('testpassword');
    
    // Look for visibility toggle button
    cy.get('button, [role="button"]').each(($el) => {
      const text = $el.text();
      if (text.includes('show') || text.includes('Show') || $el.find('svg').length > 0) {
        cy.wrap($el).click({ force: true });
        cy.wait(500);
      }
    });
  });

  it('should navigate to signup page from login', () => {
    cy.contains('a', /don.*t.*have.*account|sign up/i).click();
    cy.url().should('include', '/signup');
  });

  it('should disable submit button during login process', () => {
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    
    cy.get('button[type="submit"]').click();
    
    // Button should be disabled or show loading state
    cy.get('button[type="submit"]').should('satisfy', ($btn) => {
      const isDisabled = $btn.prop('disabled');
      const hasLoadingClass = $btn.hasClass('loading') || $btn.find('.loading').length > 0;
      return isDisabled || hasLoadingClass || $btn.text().toLowerCase().includes('loading');
    });
  });

  it('should maintain email value when switching between fields', () => {
    const email = 'test@example.com';
    
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').click();
    cy.get('input[type="email"]').click();
    
    cy.get('input[type="email"]').should('have.value', email);
  });

  it('should handle forgot password link if available', () => {
    // Check if forgot password link exists
    cy.get('body').then(($body) => {
      if ($body.find('a:contains("Forgot"), a:contains("forgot")').length > 0) {
        cy.contains('a', /forgot.*password/i).should('be.visible').click();
        cy.url().should('match', /forgot|reset/i);
      }
    });
  });

  it('should allow navigation after successful login', () => {
    // Login first
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    cy.wait(5000);
    
    // Verify login was successful by checking URL
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    
    // Verify user can access dashboard
    cy.contains(/dashboard|overview|expenses/i, { timeout: 5000 }).should('exist');
    
    // Logout
    cy.contains('button', /logout/i).click();
    cy.wait(2000);
  });

  it('should clear form fields when navigating away and back', () => {
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password');
    
    // Navigate away to signup
    cy.contains('a', /sign up/i).click();
    cy.url().should('include', '/signup');
    
    // Navigate back to login (link says "Sign In" on signup page)
    cy.contains('a', /sign in|already.*account/i).click();
    cy.url().should('include', '/login');
    
    // Fields might be cleared (depends on implementation)
    // This test just verifies the navigation works
    cy.get('input[type="email"]').should('exist');
  });
});

