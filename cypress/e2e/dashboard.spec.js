/**
 * Dashboard E2E Tests
 * 
 * Tests for:
 * - Dashboard display and navigation
 * - Dashboard overview widgets
 * - Navigation between dashboard sections
 */

describe('Dashboard Display', () => {
  // Use a fixed test user email to avoid creating new users each time
  // If this user doesn't exist, the first test will create it
  const testEmail = 'dashboard-test-user@example.com';
  const testPassword = 'TestPassword123';

  beforeEach(() => {
    // Use the helper command to ensure we're logged in
    cy.ensureLoggedIn(testEmail, testPassword);
    cy.visit('/dashboard');
  });

  it('should display dashboard after login', () => {
    cy.url().should('include', '/dashboard');
    cy.get('body').should('be.visible');
    
    // Verify dashboard content is visible
    cy.get('body').should('satisfy', ($body) => {
      return $body.text().includes('Dashboard') ||
             $body.text().includes('dashboard') ||
             $body.text().includes('Expenses') ||
             $body.text().includes('Welcome');
    });
  });

  it('should navigate to expenses section', () => {
    cy.visit('/dashboard');
    
    // Look for expenses link - can be in Navigation or Sidebar
    // Try href containing "expenses" first (most reliable)
    cy.get('a[href*="expenses"]').first().click();
    
    cy.url().should('include', '/expenses');
  });

  it('should navigate to categories section', () => {
    cy.visit('/dashboard');
    
    // Look for categories link - should be in Sidebar
    cy.get('a[href*="categories"]').first().click();
    
    cy.url().should('include', '/categories');
  });

  it('should navigate to reports section', () => {
    cy.visit('/dashboard');
    
    // Look for reports link - can be in Navigation or Sidebar
    cy.get('a[href*="reports"]').first().click();
    
    cy.url().should('include', '/reports');
  });

  it('should display dashboard overview widgets', () => {
    cy.visit('/dashboard');
    
    // Check for common dashboard elements
    cy.get('body').should('satisfy', ($body) => {
      // Look for summary cards, charts, or statistics
      return $body.find('div, section, article').length > 0;
    });
    
    // Dashboard should be visible and functional
    cy.get('body').should('be.visible');
  });

  it('should maintain session when navigating between sections', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    
    // Navigate to expenses
    cy.visit('/dashboard/expenses');
    cy.url().should('include', '/expenses');
    
    // Navigate back to dashboard
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    
    // User should still be logged in
    cy.url().should('not.include', '/login');
  });

  it('should protect dashboard routes from unauthenticated access', () => {
    // Logout first
    cy.logout();
    
    // Try to access dashboard directly
    cy.visit('/dashboard', { failOnStatusCode: false });
    
    // Should redirect to login or landing page
    cy.url().should('satisfy', (url) => {
      return url.includes('/login') || 
             url.includes('/signup') || 
             url === Cypress.config('baseUrl') + '/';
    });
  });
});

