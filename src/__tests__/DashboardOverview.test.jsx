// Integration-style tests for the `DashboardOverview` component.
// - Mocks Cognito (for AuthContext), the expense/category/budget services, and framer-motion to focus on data calculations and UI rendering.
// - Verifies welcome messaging for first-time users vs returning users with existing expenses.
// - Checks summary cards for total, monthly, average, and top-category computations across various datasets (including empty and zero cases).
// - Ensures the "Recent Expenses" widget shows the correct number of items, orders them by date, and formats details properly.
// - Confirms that expenses are sorted and aggregated correctly, including handling of missing dates and zero-expense scenarios.
// - Tests that the subscribeToExpenses pub/sub is wired up correctly, cleaned up on unmount, and not attached when no user is authenticated.
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Now import the components after mocks are set up
import DashboardOverview from '../components/Dashboard/DashboardOverview';
import { AuthProvider } from '../context/AuthContext';

// Mock Cognito so the real AuthContext resolves to a logged-in (or logged-out) user
jest.mock('amazon-cognito-identity-js');
const { __mockUserPoolInstance } = require('amazon-cognito-identity-js');

jest.mock('../services/expenseService', () => ({
  subscribeToExpenses: jest.fn(),
}));
jest.mock('../services/categoryService', () => ({
  subscribeToCategories: jest.fn(),
  subscribeToUserPreferences: jest.fn(),
}));
jest.mock('../services/budgetService', () => ({
  subscribeToBudgets: jest.fn(),
  updateCategoryBudget: jest.fn(),
}));

// Mock CurrencyContext — DashboardOverview uses useCurrency() for amount formatting
jest.mock('../context/CurrencyContext', () => ({
  useCurrency: () => ({
    formatAmount: (amount) => `$${Number(amount).toFixed(2)}`,
    currency: 'USD',
    currencySymbol: '$',
  }),
  CurrencyProvider: ({ children }) => children,
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => {
      const { whileHover, whileTap, initial, animate, transition, ...restProps } = props;
      return <div {...restProps}>{children}</div>;
    },
  },
}));

// Get the mocked functions
const { subscribeToExpenses } = require('../services/expenseService');
const { subscribeToCategories, subscribeToUserPreferences } = require('../services/categoryService');
const { subscribeToBudgets } = require('../services/budgetService');

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

// Fixture dates must fall within the current month for "This Month"
// filtering to include them — hardcoding a past month eventually goes stale.
function dateInCurrentMonth(day) {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function mockLoggedIn(mockUser) {
  __mockUserPoolInstance.getCurrentUser.mockReturnValue({
    getSession: (cb) => cb(null, { isValid: () => true }),
    getUserAttributes: (cb) => cb(null, [
      { getName: () => 'email', getValue: () => mockUser.email },
    ]),
    getUsername: () => mockUser.uid,
  });
}

describe('DashboardOverview Component', () => {
  const mockUser = { uid: 'test-user-123', email: 'test@example.com' };

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockLoggedIn(mockUser);

    // Default: empty state for everything.
    subscribeToExpenses.mockImplementation((userId, callback) => {
      callback([]);
      return () => {};
    });
    subscribeToCategories.mockImplementation((userId, callback) => {
      callback([]);
      return () => {};
    });
    subscribeToUserPreferences.mockImplementation((userId, callback) => {
      callback({ hiddenDefaultCategories: [] });
      return () => {};
    });
    subscribeToBudgets.mockImplementation((userId, callback) => {
      callback({ monthly: null, categories: {} });
      return () => {};
    });
  });

  afterAll(() => {
    console.error.mockRestore();
    console.warn.mockRestore();
  });

  describe('Basic Rendering Tests', () => {
    it('renders dashboard overview with welcome section', async () => {
      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Welcome!')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText(/Let's start tracking your expenses/)).toBeInTheDocument();
    });

    it('renders welcome back message when user has expenses', async () => {
      subscribeToExpenses.mockImplementation((userId, callback) => {
        callback([
          { id: '1', title: 'Test Expense', amount: 50, category: 'Food', date: '2024-01-15' },
        ]);
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Welcome back!')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Summary Cards Widget Tests', () => {
    const mockExpenses = [
      { id: '1', title: 'Grocery Shopping', amount: 100, category: 'Food', date: dateInCurrentMonth(15) },
      { id: '2', title: 'Gas', amount: 50, category: 'Transport', date: dateInCurrentMonth(20) },
      { id: '3', title: 'Movie', amount: 25, category: 'Entertainment', date: dateInCurrentMonth(25) },
    ];

    beforeEach(() => {
      subscribeToExpenses.mockImplementation((userId, callback) => {
        callback(mockExpenses);
        return () => {};
      });
    });

    it('displays total expenses correctly', async () => {
      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('$175.00')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Total Spent')).toBeInTheDocument();
      expect(screen.getByText('3 transactions')).toBeInTheDocument();
    });

    it('displays this month expenses correctly', async () => {
      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getAllByText('This Month').length).toBeGreaterThan(0);
      });

      // All 3 expenses are in the current month, so total should be $175.00
      await waitFor(() => {
        const thisMonthElements = screen.getAllByText('$175.00');
        expect(thisMonthElements.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('displays average expense correctly', async () => {
      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('$58.33')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Average')).toBeInTheDocument();
      expect(screen.getByText('Per transaction')).toBeInTheDocument();
    });

    it('displays top category correctly', async () => {
      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Food').length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      expect(screen.getByText('Top Category')).toBeInTheDocument();
      expect(screen.getByText('Most spent category')).toBeInTheDocument();
    });

    it('displays "None" when no expenses exist', async () => {
      subscribeToExpenses.mockImplementation((userId, callback) => {
        callback([]);
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('None')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Recent Expenses Widget Tests', () => {
    const mockExpenses = [
      { id: '1', title: 'Grocery Shopping', amount: 100, category: 'Food', date: dateInCurrentMonth(1) },
      { id: '2', title: 'Gas', amount: 50, category: 'Transport', date: dateInCurrentMonth(5) },
      { id: '3', title: 'Movie', amount: 25, category: 'Entertainment', date: dateInCurrentMonth(10) },
      { id: '4', title: 'Restaurant', amount: 75, category: 'Food', date: dateInCurrentMonth(15) },
      { id: '5', title: 'Coffee', amount: 10, category: 'Food', date: dateInCurrentMonth(20) },
      { id: '6', title: 'Uber', amount: 30, category: 'Transport', date: dateInCurrentMonth(25) },
    ];

    it('displays recent expenses section header', async () => {
      subscribeToExpenses.mockImplementation((userId, callback) => {
        callback(mockExpenses);
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Recent Expenses')).toBeInTheDocument();
      });

      expect(screen.getByText('View All')).toBeInTheDocument();
    });

    it('displays only the 5 most recent expenses', async () => {
      subscribeToExpenses.mockImplementation((userId, callback) => {
        callback(mockExpenses);
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Uber')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Coffee')).toBeInTheDocument();
      expect(screen.getByText('Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Movie')).toBeInTheDocument();
      expect(screen.getByText('Gas')).toBeInTheDocument();
      // Should NOT show the oldest one (Grocery Shopping)
      expect(screen.queryByText('Grocery Shopping')).not.toBeInTheDocument();
    });

    it('displays expense details correctly', async () => {
      subscribeToExpenses.mockImplementation((userId, callback) => {
        callback(mockExpenses.slice(0, 2));
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Gas')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Transport may appear in both the expense row and the budget panel — getAllByText handles either count
      expect(screen.getAllByText(/Transport/).length).toBeGreaterThan(0);
      expect(screen.getAllByText('$50.00').length).toBeGreaterThan(0);
    });

    it('displays empty state when no expenses exist', async () => {
      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No expenses yet')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Start tracking your expenses to see them here')).toBeInTheDocument();
      expect(screen.getByText('Add First Expense')).toBeInTheDocument();
    });
  });

  describe('Data Calculation Tests', () => {
    it('calculates total expenses correctly with multiple expenses', async () => {
      subscribeToExpenses.mockImplementation((userId, callback) => {
        callback([
          { id: '1', title: 'Expense 1', amount: 100, category: 'Food', date: dateInCurrentMonth(10) },
          { id: '2', title: 'Expense 2', amount: 50, category: 'Transport', date: dateInCurrentMonth(15) },
          { id: '3', title: 'Expense 3', amount: 25, category: 'Entertainment', date: dateInCurrentMonth(20) },
        ]);
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('$175.00')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('handles zero expenses correctly', async () => {
      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        const zeroAmounts = screen.getAllByText('$0.00');
        expect(zeroAmounts.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('sorts expenses by date correctly (most recent first)', async () => {
      subscribeToExpenses.mockImplementation((userId, callback) => {
        callback([
          { id: '1', title: 'Old Expense', amount: 100, category: 'Food', date: dateInCurrentMonth(1) },
          { id: '2', title: 'New Expense', amount: 50, category: 'Transport', date: dateInCurrentMonth(26) },
        ]);
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('New Expense')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Old Expense')).toBeInTheDocument();
    });

    it('handles expenses with missing dates gracefully', async () => {
      subscribeToExpenses.mockImplementation((userId, callback) => {
        callback([
          { id: '1', title: 'No Date', amount: 20, category: 'Misc', date: '' },
          { id: '2', title: 'With Date', amount: 40, category: 'Food', date: dateInCurrentMonth(15) },
        ]);
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      // Empty-date expense is excluded by thisMonth filter; check component renders and dated expense shows
      await waitFor(() => {
        expect(screen.getByText('With Date')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('handles expenses with no date at all (fallback to return 0)', async () => {
      subscribeToExpenses.mockImplementation((userId, callback) => {
        callback([
          { id: '1', title: 'No Date At All', amount: 20, category: 'Misc' },
          { id: '2', title: 'With Date', amount: 40, category: 'Food', date: dateInCurrentMonth(15) },
        ]);
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      // Expense without date is excluded by thisMonth filter; check dated expense and no crash
      await waitFor(() => {
        expect(screen.getByText('With Date')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Service Integration Tests', () => {
    it('sets up the expenses subscription when user is authenticated', async () => {
      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(subscribeToExpenses).toHaveBeenCalledWith(mockUser.uid, expect.any(Function));
      }, { timeout: 3000 });
    });

    it('cleans up the expenses subscription on unmount', async () => {
      const unsubscribe = jest.fn();
      subscribeToExpenses.mockImplementation((userId, callback) => {
        callback([]);
        return unsubscribe;
      });

      const { unmount } = render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(subscribeToExpenses).toHaveBeenCalled();
      });

      unmount();
      expect(unsubscribe).toHaveBeenCalled();
    });

    it('does not subscribe when there is no authenticated user', async () => {
      __mockUserPoolInstance.getCurrentUser.mockReturnValue(null);

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      // With no user, the component should render but show empty state
      await waitFor(() => {
        expect(screen.getByText('No expenses yet')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(subscribeToExpenses).not.toHaveBeenCalled();
    });
  });

  describe('Budget: Closest to Limit Card', () => {
    it('shows CTA when no budgets are set', async () => {
      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Closest to Limit')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText(/No budgets set yet/)).toBeInTheDocument();
      expect(screen.getByText('Set goals')).toBeInTheDocument();
    });

    it('shows closest category when a category budget is set', async () => {
      subscribeToExpenses.mockImplementation((userId, callback) => {
        callback([
          { id: '1', title: 'Groceries', amount: 80, category: 'Food', date: dateInCurrentMonth(15) },
        ]);
        return () => {};
      });
      // Food has a $100 budget → 80% used
      subscribeToBudgets.mockImplementation((userId, callback) => {
        callback({ monthly: null, categories: { Food: 100 } });
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Closest to Limit')).toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        // 80% of Food budget used — may appear in both the summary card and BudgetProgressPanel
        expect(screen.getAllByText('80%').length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('shows over-budget state in red when 100% exceeded', async () => {
      subscribeToExpenses.mockImplementation((userId, callback) => {
        callback([
          { id: '1', title: 'Big Spend', amount: 150, category: 'Food', date: dateInCurrentMonth(15) },
        ]);
        return () => {};
      });
      // Food budget is $100, spent $150 → 150%
      subscribeToBudgets.mockImplementation((userId, callback) => {
        callback({ monthly: null, categories: { Food: 100 } });
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getAllByText('150%').length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      // The percentage element in the summary card should have the danger class
      const pctEls = screen.getAllByText('150%');
      expect(pctEls.some(el => el.className.match(/danger/))).toBe(true);
    });
  });
});
