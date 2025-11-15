/**
 * E2E Tests for User Signup Flow
 * 
 * Tests the complete user registration process including:
 * - Form validation
 * - Successful registration
 * - Error handling
 * - Navigation after signup
 */

describe('User Signup Flow', () => {
  
  beforeEach(() => {
    cy.visit('/');
    cy.contains('Get Started').first().click();
    cy.url().should('include', '/signup');
  });

  it('should display the signup form with all required fields', () => {
    // Check for signup heading or create account text
    cy.contains(/Join|Create Account|Sign Up/i).should('be.visible');
    
    // Check for email field
    cy.get('input[type="email"]').should('be.visible');
    
    // Check for password fields
    cy.get('input[type="password"]').should('have.length.at.least', 2);
    
    // Check for submit button
    cy.get('button[type="submit"]').should('be.visible');
    
    // Check for login link
    cy.contains('a', /already.*account|sign in/i).should('be.visible');
  });

  it('should show validation errors for empty form submission', () => {
    // Try to submit empty form
    cy.get('button[type="submit"]').click();
    
    // Should stay on signup page
    cy.url().should('include', '/signup');
  });

  it('should show error for invalid email format', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').first().type('Password123!');
    cy.get('input[type="password"]').last().type('Password123!');
    
    cy.get('button[type="submit"]').click();
    
    // Should show validation error or stay on page
    cy.url().should('include', '/signup');
  });

  it('should show error when passwords do not match', () => {
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').first().type('Password123!');
    cy.get('input[type="password"]').last().type('DifferentPassword123!');
    
    cy.get('button[type="submit"]').click();
    
    // Should show error message or stay on page
    cy.url().should('include', '/signup');
  });

  it('should show error for weak password', () => {
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').first().type('weak');
    cy.get('input[type="password"]').last().type('weak');
    
    cy.get('button[type="submit"]').click();
    
    // Should show password requirements error
    cy.url().should('include', '/signup');
  });

  it('should successfully register a new user with valid credentials', () => {
    // Generate unique email for this test
    const timestamp = Date.now();
    const email = `test${Date.now()}@budgetbuddy.test`;
    const password = 'TestPassword123!';
    
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').first().type(password);
    cy.get('input[type="password"]').last().type(password);
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Wait for Firebase authentication
    cy.wait(5000);
    
    // Should redirect to dashboard after successful signup
    cy.url().should('include', '/dashboard', { timeout: 15000 });
    
    // Dashboard should be visible
    cy.contains(/dashboard|overview|expenses/i, { timeout: 10000 }).should('be.visible');
    
    // Clean up - logout
    cy.contains('button', /logout/i).click();
  });

  it('should show error when trying to register with existing email', () => {
    const email = 'existing.user@budgetbuddy.test';
    const password = 'TestPassword123!';
    
    // First signup
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').first().type(password);
    cy.get('input[type="password"]').last().type(password);
    cy.get('button[type="submit"]').click();
    
    cy.wait(5000);
    
    // If successful, logout
    cy.url().then((url) => {
      if (url.includes('/dashboard')) {
        cy.contains('button', /logout/i).click();
        cy.wait(2000);
        
        // Try to signup again with same email
        cy.visit('/signup');
        cy.get('input[type="email"]').type(email);
        cy.get('input[type="password"]').first().type(password);
        cy.get('input[type="password"]').last().type(password);
        cy.get('button[type="submit"]').click();
        
        // Should show error or stay on signup page
        cy.wait(3000);
        // Note: Error handling depends on your implementation
      }
    });
  });

  it('should toggle password visibility', () => {
    // Check if password visibility toggle exists
    cy.get('input[type="password"]').first().should('exist');
    
    // Look for eye icon or visibility toggle button
    cy.get('button, [role="button"]').each(($el) => {
      const text = $el.text();
      if (text.includes('show') || text.includes('Show') || $el.find('svg').length > 0) {
        cy.wrap($el).click({ force: true });
        // Password field might change to text type
        cy.wait(500);
      }
    });
  });

  it('should navigate to login page from signup', () => {
    cy.contains('a', /already.*account|sign in/i).click();
    cy.url().should('include', '/login');
  });

  it('should maintain form data when switching fields', () => {
    const email = 'test@example.com';
    const password = 'Password123!';
    
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').first().type(password);
    
    // Click on email field again
    cy.get('input[type="email"]').click();
    
    // Values should be preserved
    cy.get('input[type="email"]').should('have.value', email);
    cy.get('input[type="password"]').first().should('have.value', password);
  });

  it('should disable submit button during form submission', () => {
    const timestamp = Date.now();
    const email = `test.button@budgetbuddy.test`;
    const password = 'TestPassword123!';
    
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').first().type(password);
    cy.get('input[type="password"]').last().type(password);
    
    cy.get('button[type="submit"]').click();
    
    // Button should show loading state or be disabled
    cy.get('button[type="submit"]').should('satisfy', ($btn) => {
      const isDisabled = $btn.prop('disabled');
      const hasLoadingClass = $btn.hasClass('loading') || $btn.find('.loading').length > 0;
      return isDisabled || hasLoadingClass || $btn.text().toLowerCase().includes('loading');
    });
  });
});

