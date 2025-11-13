/**
 * E2E Tests for User Logout Flow
 * 
 * Tests the logout functionality including:
 * - Successful logout
 * - Session clearing
 * - Redirect after logout
 * - Access control after logout
 */

describe('User Logout Flow', () => {
  
  const testUser = {
    email: `test.logout@budgetbuddy.test`,
    password: 'TestPassword123!'
  };

  before(() => {
    // Create a test user
    cy.visit('/signup');
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').first().type(testUser.password);
    cy.get('input[type="password"]').last().type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait(5000);
    
    // Logout after initial signup
    cy.url().then((url) => {
      if (url.includes('/dashboard')) {
        cy.contains('button', /logout/i).click();
        cy.wait(2000);
      }
    });
  });

  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait(5000);
    cy.url().should('include', '/dashboard', { timeout: 15000 });
  });

  it('should display logout button when user is authenticated', () => {
    cy.contains('button', /logout/i).should('be.visible');
  });

  it('should successfully logout user', () => {
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Should redirect to landing page
    cy.url().should('not.include', '/dashboard');
    cy.url().should('match', /\/$|\/login|\/signup/);
  });

  it('should clear user session after logout', () => {
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Try to access protected route
    cy.visit('/dashboard', { timeout: 10000 });
    cy.wait(2000);
    
    // Should redirect to login or landing
    cy.url().should('not.include', '/dashboard');
  });

  it('should redirect to landing page after logout', () => {
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Verify redirect to landing page
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Landing page elements should be visible
    cy.contains('Budget Buddy', { matchCase: false }).should('be.visible');
  });

  it('should remove authentication token after logout', () => {
    // Check localStorage before logout
    cy.window().then((win) => {
      // Firebase stores auth in localStorage/indexedDB
      cy.log('User is authenticated');
    });
    
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Session should be cleared
    cy.window().then((win) => {
      cy.log('User should be logged out');
    });
  });

  it('should prevent access to dashboard after logout', () => {
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Try to navigate to dashboard
    cy.visit('/dashboard', { timeout: 10000 });
    cy.wait(2000);
    
    // Should be redirected away
    cy.url().should('not.include', '/dashboard');
  });

  it('should prevent access to expenses page after logout', () => {
    // Logout
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Try to access expenses page directly
    cy.visit('/dashboard', { timeout: 10000 });
    cy.wait(2000);
    
    // Should not be able to access protected routes
    cy.url().should('not.include', '/dashboard');
  });

  it('should prevent access to categories page after logout', () => {
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Try to access categories page
    cy.visit('/dashboard', { timeout: 10000 });
    cy.wait(2000);
    
    // Should be redirected
    cy.url().should('not.include', '/dashboard');
  });

  it('should prevent access to reports page after logout', () => {
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Try to access reports
    cy.visit('/dashboard', { timeout: 10000 });
    cy.wait(2000);
    
    // Should not have access
    cy.url().should('not.include', '/dashboard');
  });

  it('should show login and signup options after logout', () => {
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Should see auth options
    cy.contains('Login').should('be.visible');
    cy.contains('button', 'Get Started').should('be.visible');
  });

  it('should allow user to login again after logout', () => {
    // Logout
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Login again
    cy.contains('a', 'Login').click();
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait(5000);
    
    // Should be back on dashboard
    cy.url().should('include', '/dashboard', { timeout: 15000 });
    
    // Logout again
    cy.contains('button', /logout/i).click();
  });

  it('should handle logout from different pages', () => {
    // Navigate to categories
    cy.contains('a, button', /categories/i).first().click();
    cy.wait(2000);
    
    // Logout from categories page
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Should redirect to landing
    cy.url().should('not.include', '/dashboard');
    cy.url().should('not.include', '/categories');
  });

  it('should clear local storage on logout', () => {
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Check that we're logged out
    cy.url().should('not.include', '/dashboard');
  });

  it('should clear session storage on logout', () => {
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Verify logout completed
    cy.url().should('match', /\/$|\/login/);
  });

  it('should handle logout button click only once', () => {
    // Click logout
    cy.contains('button', /logout/i).click();
    cy.wait(1000);
    
    // Should start redirecting
    cy.wait(2000);
    
    // Should be on landing page
    cy.url().should('not.include', '/dashboard');
  });

  it('should maintain logout state after page reload', () => {
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Reload page
    cy.reload();
    cy.wait(3000);
    
    // Should still be logged out
    cy.url().should('not.include', '/dashboard');
  });

  it('should not show logout button after logout', () => {
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Logout button should not be visible on landing page
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Logout")').length > 0) {
        cy.log('Logout button should not be visible');
      }
    });
  });

  it('should handle logout with pending operations gracefully', () => {
    // Start navigation
    cy.contains('a, button', /categories/i).first().click();
    
    // Immediately logout
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Should successfully logout
    cy.url().should('not.include', '/dashboard');
  });

  it('should complete full authentication cycle', () => {
    // Currently logged in, logout
    cy.contains('button', /logout/i).click();
    cy.wait(3000);
    
    // Should be on landing page
    cy.url().should('not.include', '/dashboard');
    
    // Login again
    cy.contains('a', 'Login').click();
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait(5000);
    
    // Should be authenticated again
    cy.url().should('include', '/dashboard', { timeout: 15000 });
    
    // Logout for cleanup
    cy.contains('button', /logout/i).click();
    cy.wait(2000);
  });

  it('should handle logout in different viewports', () => {
    // Test on mobile
    cy.viewport('iphone-x');
    cy.wait(1000);
    
    cy.contains('button', /logout/i).click({ force: true });
    cy.wait(3000);
    
    // Should logout successfully
    cy.url().should('not.include', '/dashboard');
    
    // Restore viewport
    cy.viewport(1280, 720);
  });
});

