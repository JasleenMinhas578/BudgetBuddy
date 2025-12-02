/**
 * E2E Smoke Tests: Application Health and Basic Functionality
 * 
 * This test suite contains smoke tests that verify the fundamental health and basic functionality
 * of the Budget Buddy application. These tests run quickly and serve as a sanity check to ensure
 * the application is in a deployable state before running more comprehensive test suites.
 * 
 * Acceptance Criteria Tested:
 * - AC1: Application loads successfully without errors
 * - AC2: Landing page displays with key branding elements (BudgetBuddy logo/heading)
 * - AC3: Primary navigation links (Get Started, Login) are visible and functional
 * - AC4: Users can navigate to signup page from landing page
 * - AC5: Users can navigate to login page from landing page
 * - AC6: Application is responsive across different viewport sizes (mobile, tablet, desktop)
 * - AC7: Protected routes require authentication (redirect unauthenticated users)
 * - AC8: Page metadata (charset, viewport) is properly configured
 * - AC9: Application loads without critical console errors
 * - AC10: Critical resources (favicon, manifest) are loaded
 * - AC11: Navigation between authentication pages works correctly
 * 
 * User Flows Covered:
 * 1. Application Load: Visit root URL → Landing page displays
 * 2. Navigation: Landing → Signup → Login → Signup (round-trip navigation)
 * 3. Access Control: Attempt to access protected route → Redirected
 * 4. Responsive Design: View application on different screen sizes
 * 
 * Test Purpose:
 * These smoke tests are designed to run quickly (typically < 30 seconds) and catch critical
 * regressions that would prevent the application from functioning at a basic level. They should
 * be run as part of CI/CD pipelines before deploying to staging or production environments.
 * 
 * Note: These tests do not require authentication and test only public-facing functionality.
 */

describe('Budget Buddy - Smoke Tests', () => {
  
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the application successfully', () => {
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.title().should('exist');
  });

  it('should display the landing page with key elements', () => {
    // Check for main heading or logo
    cy.contains('BudgetBuddy', { matchCase: false }).should('be.visible');
    
    // Check for Get Started link
    cy.contains('Get Started').should('be.visible');
    
    // Check for Login link
    cy.contains('Login').should('be.visible');
  });

  it('should navigate to signup page', () => {
    cy.contains('Get Started').click();
    cy.url().should('include', '/signup');
    cy.contains(/Join|Create Account|Sign Up/i, { matchCase: false }).should('be.visible');
  });

  it('should navigate to login page', () => {
    cy.contains('Login').first().click();
    cy.url().should('include', '/login');
    cy.contains(/Welcome|Sign In|Login/i, { matchCase: false }).should('be.visible');
  });

  it('should have responsive navigation', () => {
    // Check viewport responsiveness
    cy.viewport('iphone-x');
    cy.contains('BudgetBuddy', { matchCase: false }).should('exist');
    
    cy.viewport('ipad-2');
    cy.contains('BudgetBuddy', { matchCase: false }).should('exist');
    
    cy.viewport(1920, 1080);
    cy.contains('BudgetBuddy', { matchCase: false }).should('be.visible');
  });

  it('should not allow access to protected routes without authentication', () => {
    // Clear all storage including IndexedDB (used by Firebase)
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Clear IndexedDB for Firebase
    cy.window().then((win) => {
      win.indexedDB.databases().then((databases) => {
        databases.forEach((db) => {
          win.indexedDB.deleteDatabase(db.name);
        });
      });
    });
    
    cy.wait(1000); // Wait for storage to clear
    
    cy.visit('/dashboard', { failOnStatusCode: false });
    cy.wait(2000); // Wait for redirect logic
    
    // Should redirect to login or landing page
    cy.url().should('not.include', '/dashboard');
  });

  it('should have proper page metadata', () => {
    cy.document().should('have.property', 'charset', 'UTF-8');
    cy.get('head meta[name="viewport"]').should('exist');
  });

  it('should load without console errors', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'error').as('consoleError');
      }
    });
    
    cy.wait(2000);
    
    // Check that no critical console errors occurred
    cy.get('@consoleError').should('not.be.called');
  });

  it('should have all critical resources loaded', () => {
    // Check for favicon
    cy.get('link[rel="icon"]').should('exist');
    
    // Check for manifest
    cy.get('link[rel="manifest"]').should('exist');
  });

  it('should handle navigation between auth pages', () => {
    // Go to signup
    cy.contains('Get Started').first().click();
    cy.url().should('include', '/signup');
    
    // Navigate to login from signup
    cy.contains('a', /already.*account|sign in/i).click();
    cy.url().should('include', '/login');
    
    // Navigate back to signup from login
    cy.contains('a', /don.*t.*have.*account|sign up/i).click();
    cy.url().should('include', '/signup');
  });
});

