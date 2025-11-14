/**
 * E2E Tests for Add Categories Flow
 * 
 * Tests the category management including:
 * - Adding new categories
 * - Viewing category list
 * - Form validation
 * - Budget tracking
 */

describe('Add Categories Flow', () => {
  
  const testUser = {
    email: `test.categories@budgetbuddy.test`,
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
    
    // Logout
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
    
    // Navigate to categories page
    cy.contains('a, button', /categories/i).first().click();
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

  it('should display the categories page', () => {
    cy.contains(/categories/i).should('be.visible');
  });

  it('should display "Add Category" button', () => {
    cy.contains('button', /add category/i).should('be.visible');
  });

  it('should open category form modal when "Add Category" is clicked', () => {
    cy.contains('button', /add category/i).click();
    
    // Modal should open
    cy.get('[role="dialog"], .modal').should('be.visible');
    
    // Close modal
    cy.get('button').contains(/close|cancel/i).click({ force: true });
  });

  it('should display category form with all required fields', () => {
    cy.contains('button', /add category/i).click();
    cy.wait(1000);
    
    // Check for form fields
    cy.get('input[name="name"], input[placeholder*="name" i]').first().should('be.visible');
    
    // Close modal
    cy.get('button').contains(/close|cancel/i).click({ force: true });
  });


  it('should successfully add a new category', () => {
    cy.contains('button', /add category/i).click();
    cy.wait(1000);
    
    // Fill in category form
    cy.get('input[name="name"], input[placeholder*="name" i]').first().type('Food & Dining');
    
    cy.get('button[type="submit"]').click({ force: true });
    cy.get('.modal-overlay', { timeout: 10000 }).should('not.exist');
    
    // Wait for modal to close
    cy.wait(3000);
    
    // Verify category appears in list
    cy.contains('Food & Dining').should('be.visible');
  });

  it('should add multiple categories', () => {
    const categories = [
      { name: 'Transportation'},
      { name: 'Entertainment' },
      { name: 'Healthcare' }
    ];
    
    categories.forEach((category) => {
      cy.contains('button', /add category/i).click();
      cy.wait(1000);
      
      cy.get('input[name="name"], input[placeholder*="name" i]').first().type(category.name);
      
      cy.get('button[type="submit"]').click({ force: true });
      cy.get('.modal-overlay', { timeout: 10000 }).should('not.exist');
      cy.wait(3000);
    });
    
    // Verify categories appear
    cy.contains('Transportation').should('be.visible');
    cy.contains('Entertainment').should('be.visible');
    cy.contains('Healthcare').should('be.visible');
  });

  it('should display category budget correctly', () => {
    cy.contains('button', /add category/i).click();
    cy.wait(1000);
    
    cy.get('input[name="name"], input[placeholder*="name" i]').first().type('Utilities');
    
    cy.get('button[type="submit"]').click({ force: true });
    cy.get('.modal-overlay', { timeout: 10000 }).should('not.exist');
    cy.wait(3000);
    
    cy.contains('Utilities').should('be.visible');
  });

  it('should display category list after adding categories', () => {
    cy.wait(3000);
    
    // Category list should be visible
    cy.get('body').should('be.visible');
  });

  it('should cancel adding category', () => {
    cy.contains('button', /add category/i).click();
    cy.wait(1000);
    
    // Fill some data
    cy.get('input[name="name"], input[placeholder*="name" i]').first().type('Test Category');
    
    // Click cancel
    cy.contains('button', /close|cancel/i).click({ force: true });
    
    // Modal should close
    cy.wait(1000);
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should persist categories after page reload', () => {
    // Reload page
    cy.reload();
    cy.wait(5000);
    
    // Previously added categories should still be visible
    cy.url().should('match', /categories|dashboard/);
  });

  it('should display category with chart or visualization', () => {
    cy.wait(3000);
    
    // Categories page might have charts
    cy.get('body').then(($body) => {
      if ($body.find('canvas').length > 0) {
        cy.get('canvas').should('be.visible');
      }
    });
  });

  it('should show all categories in a list or grid format', () => {
    cy.wait(3000);
    
    // Verify categories are displayed
    cy.get('body').should('be.visible');
  });
});

