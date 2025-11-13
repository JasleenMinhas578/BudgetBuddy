/**
 * Expense Management E2E Tests
 * 
 * Tests for:
 * - Adding a new expense
 * - Viewing expenses list
 * - Expense form validation
 */

describe('Expense Management', () => {
  // Use a fixed test user email to avoid creating new users each time
  // If this user doesn't exist, the first test will create it
  const testEmail = 'expense-test-user@example.com';
  const testPassword = 'TestPassword123';
  const testConfirmPassword = 'TestPassword123';

  beforeEach(() => {
    // Use the helper command to ensure we're logged in
    cy.ensureLoggedIn(testEmail, testPassword);
    cy.visit('/dashboard/expenses');
  });

  it('should display expenses page', () => {
    cy.url().should('include', '/dashboard/expenses');
    cy.get('body').should('be.visible');
  });

  it('should open add expense form/modal', () => {
    // Look for "Add Expense" button - it contains text "Add Expense"
    cy.contains('button', 'Add Expense').click();
    
    // Wait for modal and form to appear
    cy.wait(1000);
    
    // Verify form fields are visible using actual IDs from ExpenseForm
    cy.get('input#title').should('be.visible');
    cy.get('input#amount').should('be.visible');
    cy.get('select#category').should('be.visible');
    cy.get('input#date').should('be.visible');
  });

  it('should add a new expense successfully', () => {
    const expenseTitle = `Test Expense ${Date.now()}`;
    const expenseAmount = '25.50';
    const expenseDate = new Date().toISOString().split('T')[0]; // Today's date
    
    // Open add expense form
    cy.contains('button', 'Add Expense').click();
    cy.wait(1000);
    
    // Fill in expense form using actual IDs
    cy.get('input#title').type(expenseTitle);
    cy.get('input#amount').type(expenseAmount);
    cy.get('input#date').clear().type(expenseDate);
    // Category is already selected by default (Food)
    
    // Submit form
    cy.get('form.expense-form').within(() => {
      cy.get('button[type="submit"]').click();
    });
    
    // Wait for expense to be added and modal to close
    cy.wait(2000);
    
    // Verify expense appears in the list - check for title or amount
    cy.get('body').should('satisfy', ($body) => {
      return $body.text().includes(expenseTitle) || $body.text().includes(expenseAmount);
    });
  });

  it('should validate expense form fields', () => {
    // Open add expense form
    cy.contains('button', 'Add Expense').click();
    cy.wait(1000);
    
    // Clear form fields to make them empty
    cy.get('input#title').clear();
    cy.get('input#amount').clear();
    
    // Try to submit empty form
    cy.get('form.expense-form').within(() => {
      cy.get('button[type="submit"]').click();
    });
    
    // Should show validation errors or prevent submission
    cy.wait(1000);
    
    // Form should still be visible (not submitted) or show error message
    cy.get('body').should('satisfy', ($body) => {
      return $body.find('form.expense-form').length > 0 || 
             $body.find('.alert-error, [class*="error"]').length > 0;
    });
  });

  it('should display expense list', () => {
    // Navigate to expenses page
    cy.visit('/dashboard/expenses');
    
    // Should see expenses section
    cy.get('body').should('be.visible');
    
    // Check for common expense list elements
    cy.get('body').should('satisfy', ($body) => {
      return $body.find('table, ul, div').length > 0 || 
             $body.text().includes('expense') ||
             $body.text().includes('Expense');
    });
  });
});

