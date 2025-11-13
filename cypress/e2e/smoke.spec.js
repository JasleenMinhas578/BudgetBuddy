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
    // Find link that goes to /login (more reliable than text matching)
    cy.get('a[href*="/login"]').first().click();
    cy.url().should('include', '/login');
    cy.contains(/welcome back|sign in|budgetbuddy/i).should('be.visible');
  });

  it('should navigate to signup page', () => {
    // Find link that goes to /signup (more reliable than text matching)
    cy.get('a[href*="/signup"]').first().click();
    cy.url().should('include', '/signup');
    cy.contains(/join|create account|sign up|finTrack/i).should('be.visible');
  });

  it('should display login form elements', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should display signup form elements', () => {
    cy.visit('/signup');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input#password').should('be.visible');
    cy.get('input#confirmPassword').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });
});

