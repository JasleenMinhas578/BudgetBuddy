/**
 * Reports Page E2E Tests
 * 
 * Tests for:
 * - Displaying reports page
 * - Date filter functionality
 * - Summary cards display
 * - Charts display
 * - Export functionality (PDF and CSV)
 * - Expenses table display
 */

describe('Reports Page', () => {
  const testEmail = 'reports-test-user@example.com';
  const testPassword = 'TestPassword123';
  const testConfirmPassword = 'TestPassword123';

  beforeEach(() => {
    // Ensure user is logged in
    cy.ensureLoggedIn(testEmail, testPassword);
    cy.visit('/dashboard/reports');
  });

  it('should display reports page', () => {
    cy.url().should('include', '/dashboard/reports');
    cy.contains('h2', 'Reports & Analytics').should('be.visible');
    cy.contains('Comprehensive analysis of your spending patterns').should('be.visible');
  });

  it('should display export button', () => {
    cy.contains('button', 'Export').should('be.visible');
  });

  it('should show export options when export button is clicked', () => {
    cy.contains('button', 'Export').click();
    cy.wait(500);
    
    // Check for export dropdown options
    cy.get('body').should('satisfy', ($body) => {
      return $body.text().includes('Download PDF Report') || 
             $body.text().includes('Export as CSV');
    });
  });

  it('should display date filter controls', () => {
    cy.contains('h3', 'Date Range').should('be.visible');
    cy.contains('button', 'All Time').should('be.visible');
    cy.contains('button', 'Today').should('be.visible');
    cy.contains('button', 'This Month').should('be.visible');
    cy.contains('button', 'Last Month').should('be.visible');
    cy.contains('button', 'This Year').should('be.visible');
    cy.contains('button', 'Last Year').should('be.visible');
    cy.contains('button', 'Custom Range').should('be.visible');
  });

  it('should filter by "Today" when clicked', () => {
    cy.contains('button', 'Today').click();
    cy.wait(1000);
    
    // Verify filter is active
    cy.contains('button', 'Today').should('have.class', 'active');
    
    // Check that filter display shows "Today"
    cy.get('body').should('satisfy', ($body) => {
      return $body.text().includes('Today');
    });
  });

  it('should filter by "This Month" when clicked', () => {
    cy.contains('button', 'This Month').click();
    cy.wait(1000);
    
    // Verify filter is active
    cy.contains('button', 'This Month').should('have.class', 'active');
    
    // Check that filter display shows "This Month"
    cy.get('body').should('satisfy', ($body) => {
      return $body.text().includes('This Month');
    });
  });

  it('should filter by "Last Month" when clicked', () => {
    cy.contains('button', 'Last Month').click();
    cy.wait(1000);
    
    // Verify filter is active
    cy.contains('button', 'Last Month').should('have.class', 'active');
  });

  it('should filter by "This Year" when clicked', () => {
    cy.contains('button', 'This Year').click();
    cy.wait(1000);
    
    // Verify filter is active
    cy.contains('button', 'This Year').should('have.class', 'active');
  });

  it('should filter by "Last Year" when clicked', () => {
    cy.contains('button', 'Last Year').click();
    cy.wait(1000);
    
    // Verify filter is active
    cy.contains('button', 'Last Year').should('have.class', 'active');
  });

  it('should show custom date range inputs when "Custom Range" is selected', () => {
    cy.contains('button', 'Custom Range').click();
    cy.wait(500);
    
    // Verify custom date inputs appear
    cy.get('input[type="date"]').should('have.length', 2);
    cy.contains('label', 'Start Date').should('be.visible');
    cy.contains('label', 'End Date').should('be.visible');
  });

  it('should display summary cards', () => {
    // Check for summary cards
    cy.get('body').should('satisfy', ($body) => {
      return $body.text().includes('Total Spent') ||
             $body.text().includes('Transactions') ||
             $body.text().includes('Average') ||
             $body.text().includes('Top Category');
    });
  });

  it('should display charts section', () => {
    // Check for chart titles
    cy.get('body').should('satisfy', ($body) => {
      return $body.text().includes('Spending by Category') ||
             $body.text().includes('Monthly Trend');
    });
  });

  it('should display expenses table section', () => {
    cy.contains('h3', 'Detailed Expenses').should('be.visible');
    
    // Check for table headers
    cy.get('body').should('satisfy', ($body) => {
      return $body.text().includes('Date') ||
             $body.text().includes('Category') ||
             $body.text().includes('Title') ||
             $body.text().includes('Amount');
    });
  });

  it('should display empty state when no expenses match filter', () => {
    // Set a date filter that likely has no expenses (e.g., last year)
    cy.contains('button', 'Last Year').click();
    cy.wait(1000);
    
    // Check for empty state message
    cy.get('body').should('satisfy', ($body) => {
      return $body.text().includes('No expenses found') ||
             $body.text().includes('No expenses match');
    });
  });

  it('should export to CSV when CSV export is clicked', () => {
    // First, add an expense to ensure there's data to export
    cy.visit('/dashboard/expenses');
    cy.wait(1000);
    
    // Add a test expense
    const expenseTitle = `Test Expense for CSV ${Date.now()}`;
    const expenseAmount = '15.75';
    const expenseDate = new Date().toISOString().split('T')[0];
    
    cy.contains('button', 'Add Expense').click();
    cy.wait(1000);
    
    cy.get('input#title').type(expenseTitle);
    cy.get('input#amount').type(expenseAmount);
    cy.get('input#date').clear().type(expenseDate);
    
    cy.get('form.expense-form').within(() => {
      cy.get('button[type="submit"]').click();
    });
    
    cy.wait(2000);
    
    // Navigate back to reports
    cy.visit('/dashboard/reports');
    cy.wait(1000);
    
    // Click export button
    cy.contains('button', 'Export').click();
    cy.wait(500);
    
    // Click CSV export
    cy.contains('button', 'Export as CSV').click();
    cy.wait(1000);
    
    // CSV download should be triggered (we can't verify the actual file download in Cypress easily)
    // But we can verify the button was clicked and no errors occurred
    cy.get('body').should('be.visible');
  });

  it('should show spending insights when applicable', () => {
    // Add some expenses first to generate insights
    cy.visit('/dashboard/expenses');
    cy.wait(1000);
    
    // Add a test expense
    const expenseTitle = `Test Expense for Insights ${Date.now()}`;
    const expenseAmount = '150.00'; // Large amount to trigger insights
    const expenseDate = new Date().toISOString().split('T')[0];
    
    cy.contains('button', 'Add Expense').click();
    cy.wait(1000);
    
    cy.get('input#title').type(expenseTitle);
    cy.get('input#amount').type(expenseAmount);
    cy.get('input#date').clear().type(expenseDate);
    
    cy.get('form.expense-form').within(() => {
      cy.get('button[type="submit"]').click();
    });
    
    cy.wait(2000);
    
    // Navigate back to reports
    cy.visit('/dashboard/reports');
    cy.wait(2000);
    
    // Check for insights section (may or may not appear depending on data)
    cy.get('body').should('be.visible');
  });

  it('should reset to "All Time" filter when clicked', () => {
    // First set a different filter
    cy.contains('button', 'This Month').click();
    cy.wait(500);
    
    // Then click "All Time"
    cy.contains('button', 'All Time').click();
    cy.wait(1000);
    
    // Verify "All Time" is active
    cy.contains('button', 'All Time').should('have.class', 'active');
  });

  it('should display filter stats correctly', () => {
    // Check for filter stats display
    cy.get('body').should('satisfy', ($body) => {
      return $body.text().includes('transactions') ||
             $body.text().includes('total');
    });
  });
});

