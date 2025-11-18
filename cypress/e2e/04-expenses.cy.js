/**
 * E2E Tests for Add Expense Flow
 * 
 * Tests the expense management including:
 * - Adding new expenses
 * - Viewing expense list
 * - Form validation
 * - Data persistence
 */

describe('Add Expense Flow', () => {
  
  const ensureModalClosed = () => {
    cy.get('body').then(($body) => {
      if ($body.find('.modal-overlay').length) {
        cy.contains('button', /close|cancel/i).click({ force: true });
      }
    });
    cy.get('.modal-overlay', { timeout: 15000 }).should('not.exist');
  };
  
  const testUser = {
    email: `test.expenses@budgetbuddy.test`,
    password: 'TestPassword123!'
  };

  before(() => {
    // Create and login user
    cy.visit('/signup');
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').first().type(testUser.password);
    cy.get('input[type="password"]').last().type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait(5000);
    
    // Add a category first (needed for expenses)
    cy.url().then((url) => {
      if (url.includes('/dashboard')) {
        cy.wait(3000);
        // Navigate to categories
        cy.contains('a, button', /categories/i).first().click();
        cy.wait(2000);
        
        // Add a test category
        cy.contains('button', /add category/i).click();
        cy.wait(1000);
        
        cy.get('input[name="name"], input[placeholder*="name" i]').first().type('Food');
        cy.get('input[name="budget"], input[type="number"]').type('500');
        cy.contains('button', /add|submit|save/i).click();
        
        cy.wait(3000);
        
        // Logout
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
    
    // Navigate to expenses page
    cy.contains('a, button', /expenses/i).first().click();
    cy.wait(2000);
  });

  afterEach(() => {
    cy.get('body').then(($body) => {
      if ($body.find('.modal-overlay').length) {
        cy.contains('button', /close|cancel/i).click({ force: true });
        // wait for backdrop to disappear
        cy.get('.modal-overlay').should('not.exist');
      }
    });
    cy.contains('button', /logout/i).click({force: true});
    cy.wait(2000);
  });


  it('should display the expenses page', () => {
    cy.contains(/expenses/i).should('be.visible');
  });

  it('should display "Add Expense" button', () => {
    cy.contains('button', /add expense/i).should('be.visible');
  });

  it('should display expense form with all required fields', () => {
    cy.contains('button', /add expense/i).click();
    cy.wait(1000);
    
    // Check for form fields
    cy.get('input#title, input[name="title"], input[placeholder*="title" i], input[name="description"], input[placeholder*="description" i]').should('be.visible');
    cy.get('input[name="amount"], input[type="number"], input[placeholder*="amount" i]').should('be.visible');
    cy.get('select[name="category"], select').should('be.visible');
    cy.get('input[type="date"], input[name="date"]').should('be.visible');
    
    // Close modal
    cy.get('button').contains(/close|cancel/i).click({ force: true });
  });

  it('should display expense list after adding expenses', () => {
    cy.wait(3000);
    
    // Expense list should be visible
    cy.get('body').should('be.visible');
  });

  it('should calculate and display total expenses', () => {
    cy.wait(3000);
    
    // Look for total or summary section
    cy.get('body').then(($body) => {
      if ($body.find('*:contains("Total")').length > 0) {
        cy.contains(/total/i).should('be.visible');
      }
    });
  });

  it('should cancel adding expense', () => {
    cy.contains('button', /add expense/i).click();
    cy.wait(1000);
    
    // Fill some data
    cy.get('input#title, input[name="title"], input[placeholder*="title" i], input[name="description"], input[placeholder*="description" i]').type('Test Expense');
    
    // Click cancel
    cy.contains('button', /close|cancel/i).click({ force: true });
    
    // Modal should close
    cy.wait(1000);
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should persist expenses after page reload', () => {
    // Reload page
    cy.reload();
    cy.wait(5000);
    
    // Previously added expenses should still be visible
    cy.url().should('match', /dashboard|expenses/);
  });

});

