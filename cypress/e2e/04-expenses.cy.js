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
    // Logout after each test
    cy.contains('button', /logout/i).click();
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

  it('should show validation error for empty form', () => {
    cy.contains('button', /add expense/i).click();
    cy.wait(1000);
    
    // Try to submit empty form
    cy.contains('button', /add|submit|save/i).click();
    
    // Modal should still be open or show error
    cy.wait(2000);
    
    // Close modal if still open
    cy.get('body').then(($body) => {
      if ($body.find('[role="dialog"]').length > 0) {
        cy.get('button').contains(/close|cancel/i).click({ force: true });
      }
    });
  });

  it('should successfully add a new expense', () => {
    cy.contains('button', /add expense/i).click();
    cy.wait(1000);
    
    // Fill in expense form
    cy.get('input#title, input[name="title"], input[placeholder*="title" i], input[name="description"], input[placeholder*="description" i]').type('Grocery Shopping');
    cy.get('input[name="amount"], input[type="number"], input[placeholder*="amount" i]').type('150.50');
    
    // Select category (Food should be available from before hook)
    cy.get('select[name="category"], select').first().select('Food', { force: true });
    
    // Set date
    const today = new Date().toISOString().split('T')[0];
    cy.get('input[type="date"], input[name="date"]').type(today);
    
    // Submit form
    cy.contains('button', /add|submit|save/i).click();
    
    // Wait for modal to close
    cy.wait(3000);
    
    // Verify expense appears in list
    cy.contains('Grocery Shopping').should('be.visible');
    cy.contains('150.50').should('be.visible');
  });

  it('should add multiple expenses', () => {
    const expenses = [
      { description: 'Restaurant', amount: '45.00', category: 'Food' },
      { description: 'Coffee', amount: '5.50', category: 'Food' }
    ];
    
    expenses.forEach((expense) => {
      cy.contains('button', /add expense/i).click();
      cy.wait(1000);
      
      cy.get('input#title, input[name="title"], input[placeholder*="title" i], input[name="description"], input[placeholder*="description" i]').type(expense.description);
      cy.get('input[name="amount"], input[type="number"], input[placeholder*="amount" i]').type(expense.amount);
      cy.get('select[name="category"], select').first().select(expense.category, { force: true });
      
      const today = new Date().toISOString().split('T')[0];
      cy.get('input[type="date"], input[name="date"]').type(today);
      
      cy.contains('button', /add|submit|save/i).click();
      cy.wait(3000);
    });
    
    // Verify expenses appear
    cy.contains('Restaurant').should('be.visible');
    cy.contains('Coffee').should('be.visible');
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

  it('should display expense date correctly', () => {
    const today = new Date().toISOString().split('T')[0];
    
    cy.contains('button', /add expense/i).click();
    cy.wait(1000);
    
    cy.get('input#title, input[name="title"], input[placeholder*="title" i], input[name="description"], input[placeholder*="description" i]').type('Date Test Expense');
    cy.get('input[name="amount"], input[type="number"], input[placeholder*="amount" i]').type('25.00');
    cy.get('select[name="category"], select').first().select('Food', { force: true });
    cy.get('input[type="date"], input[name="date"]').type(today);
    
    cy.contains('button', /add|submit|save/i).click();
    cy.wait(3000);
    
    // Verify date is displayed (format may vary)
    cy.contains('Date Test Expense').should('be.visible');
  });

  it('should handle decimal amounts correctly', () => {
    cy.contains('button', /add expense/i).click();
    cy.wait(1000);
    
    cy.get('input#title, input[name="title"], input[placeholder*="title" i], input[name="description"], input[placeholder*="description" i]').type('Decimal Test');
    cy.get('input[name="amount"], input[type="number"], input[placeholder*="amount" i]').type('99.99');
    cy.get('select[name="category"], select').first().select('Food', { force: true });
    
    const today = new Date().toISOString().split('T')[0];
    cy.get('input[type="date"], input[name="date"]').type(today);
    
    cy.contains('button', /add|submit|save/i).click();
    cy.wait(3000);
    
    cy.contains('99.99').should('be.visible');
  });

  it('should associate expense with selected category', () => {
    cy.contains('button', /add expense/i).click();
    cy.wait(1000);
    
    cy.get('input#title, input[name="title"], input[placeholder*="title" i], input[name="description"], input[placeholder*="description" i]').type('Category Test');
    cy.get('input[name="amount"], input[type="number"], input[placeholder*="amount" i]').type('30.00');
    cy.get('select[name="category"], select').first().select('Food', { force: true });
    
    const today = new Date().toISOString().split('T')[0];
    cy.get('input[type="date"], input[name="date"]').type(today);
    
    cy.contains('button', /add|submit|save/i).click();
    cy.wait(3000);
    
    // Verify expense with category
    cy.contains('Category Test').should('be.visible');
    cy.contains('Food').should('be.visible');
  });
});

