/**
 * Smoke Test - Basic Application Health Check
 * 
 * This test verifies that the application loads correctly
 * and basic navigation works without authentication.
 */

describe('Smoke Test - Application Health Check', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the landing page', () => {
    cy.url().should('include', '/');
    cy.get('body').should('be.visible');
  });

  it('should navigate to login page', () => {
    // Wait for page to load, then find link
    cy.get('body').should('be.visible');
    // Try data-testid first, then fallback to href
    cy.get('[data-testid="login-link"], [data-testid="login-link-hero"], a[href*="/login"]').first().click();
    cy.url().should('include', '/login');
    // Wait for login page to load
    cy.get('[data-testid="email-input"], input[type="email"]', { timeout: 10000 }).should('be.visible');
    cy.contains(/welcome back|sign in|budgetbuddy/i).should('be.visible');
  });

  it('should navigate to signup page', () => {
    // Wait for page to load, then find link
    cy.get('body').should('be.visible');
    // Try data-testid first, then fallback to href
    cy.get('[data-testid="signup-link"], [data-testid="signup-link-hero"], a[href*="/signup"]').first().click();
    cy.url().should('include', '/signup');
    // Wait for signup page to load
    cy.get('[data-testid="email-input"], input[type="email"]', { timeout: 10000 }).should('be.visible');
    cy.contains(/join|create account|sign up|finTrack/i).should('be.visible');
  });

  it('should display login form elements', () => {
    cy.visit('/login');
    // Wait for page to be ready and Firebase to initialize
    cy.wait(2000);
    cy.get('body').should('be.visible');
    cy.get('form.auth-form', { timeout: 20000 }).should('be.visible');
    // Wait for form elements with timeout
    cy.get('[data-testid="email-input"], input[type="email"]', { timeout: 20000 }).should('be.visible');
    cy.get('[data-testid="password-input"], input[type="password"]', { timeout: 20000 }).should('be.visible');
    cy.get('button[type="submit"]', { timeout: 20000 }).should('be.visible');
  });

  it('should display signup form elements', () => {
    cy.visit('/signup');
    // Wait for page to be ready and Firebase to initialize
    cy.wait(2000);
    cy.get('body').should('be.visible');
    cy.get('form.auth-form', { timeout: 20000 }).should('be.visible');
    // Wait for form elements with timeout
    cy.get('[data-testid="email-input"], input[type="email"]', { timeout: 20000 }).should('be.visible');
    cy.get('[data-testid="password-input"], input#password', { timeout: 20000 }).should('be.visible');
    cy.get('[data-testid="confirm-password-input"], input#confirmPassword', { timeout: 20000 }).should('be.visible');
    cy.get('button[type="submit"]', { timeout: 20000 }).should('be.visible');
  });
});

