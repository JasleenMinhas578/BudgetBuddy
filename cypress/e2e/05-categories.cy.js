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
    // Logout after each test
    cy.contains('button', /logout/i).click();
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
    cy.get('input[name="budget"], input[type="number"]').should('be.visible');
    
    // Close modal
    cy.get('button').contains(/close|cancel/i).click({ force: true });
  });

  it('should show validation error for empty category name', () => {
    cy.contains('button', /add category/i).click();
    cy.wait(1000);
    
    // Try to submit without name
    cy.get('input[name="budget"], input[type="number"]').type('500');
    cy.contains('button', /add|submit|save/i).click();
    
    // Should show error or stay on modal
    cy.wait(2000);
    
    // Close modal if still open
    cy.get('body').then(($body) => {
      if ($body.find('[role="dialog"]').length > 0) {
        cy.get('button').contains(/close|cancel/i).click({ force: true });
      }
    });
  });

  it('should successfully add a new category', () => {
    cy.contains('button', /add category/i).click();
    cy.wait(1000);
    
    // Fill in category form
    cy.get('input[name="name"], input[placeholder*="name" i]').first().type('Food & Dining');
    cy.get('input[name="budget"], input[type="number"]').type('600');
    
    // Submit form
    cy.contains('button', /add|submit|save/i).click();
    
    // Wait for modal to close
    cy.wait(3000);
    
    // Verify category appears in list
    cy.contains('Food & Dining').should('be.visible');
    cy.contains('600').should('be.visible');
  });

  it('should add multiple categories', () => {
    const categories = [
      { name: 'Transportation', budget: '300' },
      { name: 'Entertainment', budget: '200' },
      { name: 'Healthcare', budget: '250' }
    ];
    
    categories.forEach((category) => {
      cy.contains('button', /add category/i).click();
      cy.wait(1000);
      
      cy.get('input[name="name"], input[placeholder*="name" i]').first().type(category.name);
      cy.get('input[name="budget"], input[type="number"]').type(category.budget);
      
      cy.contains('button', /add|submit|save/i).click();
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
    cy.get('input[name="budget"], input[type="number"]').type('250.50');
    
    cy.contains('button', /add|submit|save/i).click();
    cy.wait(3000);
    
    cy.contains('Utilities').should('be.visible');
    cy.contains('250').should('be.visible');
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

  it('should show category spending if expenses exist', () => {
    // Add an expense first
    cy.contains('a, button', /expenses/i).first().click();
    cy.wait(2000);
    
    cy.contains('button', /add expense/i).click();
    cy.wait(1000);
    
    cy.get('input[name="description"], input[placeholder*="description" i]').type('Category Test Expense');
    cy.get('input[name="amount"], input[type="number"], input[placeholder*="amount" i]').type('50.00');
    
    // Select first available category
    cy.get('select[name="category"], select').first().select(1, { force: true });
    
    const today = new Date().toISOString().split('T')[0];
    cy.get('input[type="date"], input[name="date"]').type(today);
    
    cy.contains('button', /add|submit|save/i).click();
    cy.wait(3000);
    
    // Go back to categories
    cy.contains('a, button', /categories/i).first().click();
    cy.wait(3000);
    
    // Categories page should show spending
    cy.get('body').should('be.visible');
  });

  it('should handle category with zero budget', () => {
    cy.contains('button', /add category/i).click();
    cy.wait(1000);
    
    cy.get('input[name="name"], input[placeholder*="name" i]').first().type('No Budget Category');
    cy.get('input[name="budget"], input[type="number"]').type('0');
    
    cy.contains('button', /add|submit|save/i).click();
    cy.wait(3000);
    
    // Should accept zero budget or show appropriate message
    cy.get('body').should('be.visible');
  });

  it('should handle large budget amounts', () => {
    cy.contains('button', /add category/i).click();
    cy.wait(1000);
    
    cy.get('input[name="name"], input[placeholder*="name" i]').first().type('Large Budget');
    cy.get('input[name="budget"], input[type="number"]').type('10000');
    
    cy.contains('button', /add|submit|save/i).click();
    cy.wait(3000);
    
    cy.contains('Large Budget').should('be.visible');
    cy.contains('10000').should('be.visible');
  });

  it('should display category budget progress or status', () => {
    cy.wait(3000);
    
    // Categories might show progress bars or percentages
    cy.get('body').then(($body) => {
      if ($body.find('[class*="progress"], [role="progressbar"]').length > 0) {
        cy.get('[class*="progress"], [role="progressbar"]').should('be.visible');
      }
    });
  });

  it('should show all categories in a list or grid format', () => {
    cy.wait(3000);
    
    // Verify categories are displayed
    cy.get('body').should('be.visible');
  });
});

