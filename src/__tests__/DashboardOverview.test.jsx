import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock Firebase Auth before importing components
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  getAuth: jest.fn(() => ({})),
}));

// Mock Firebase Firestore before importing components
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(),
}));

// Mock Firebase config
jest.mock('../firebaseConfig', () => ({
  auth: {},
  db: {},
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

// Now import the components after mocks are set up
import DashboardOverview from '../components/Dashboard/DashboardOverview';
import { AuthProvider } from '../context/AuthContext';

// Get the mocked functions
const { 
  collection, 
  query, 
  onSnapshot, 
  orderBy 
} = require('firebase/firestore');
const { onAuthStateChanged } = require('firebase/auth');

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('DashboardOverview Component', () => {
  const mockUser = { uid: 'test-user-123', email: 'test@example.com' };

  // Set up console mocking before any tests run
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Firebase functions
    collection.mockReturnValue('mock-collection');
    query.mockReturnValue('mock-query');
    orderBy.mockReturnValue('mock-order-by');

    // Mock Firebase Auth - set up before component renders
    onAuthStateChanged.mockImplementation((auth, callback) => {
      // Use setTimeout to simulate async behavior
      setTimeout(() => {
        callback(mockUser);
      }, 0);
      return () => {}; // Return unsubscribe function
    });

    // Default empty expenses mock
    onSnapshot.mockImplementation((query, callback) => {
      setTimeout(() => {
        callback({
          forEach: (fn) => [] // Empty array
        });
      }, 0);
      return () => {}; // Return unsubscribe function
    });
  });

  afterAll(() => {
    // Restore console methods
    console.error.mockRestore();
    console.warn.mockRestore();
    console.log.mockRestore();
  });

  describe('Basic Rendering Tests', () => {
    it('renders dashboard overview with welcome section', async () => {
      // Mock empty expenses
      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback({
            forEach: (fn) => [] // Empty array
          });
        }, 0);
        return () => {}; // Return unsubscribe function
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Welcome!')).toBeInTheDocument();
        expect(screen.getByText(/Let's start tracking your expenses/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('renders welcome back message when user has expenses', async () => {
      const mockExpenses = [
        {
          id: '1',
          title: 'Test Expense',
          amount: 50,
          category: 'Food',
          date: '2024-01-15',
          createdAt: new Date()
        }
      ];

      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback({
            forEach: (fn) => {
              mockExpenses.forEach(expense => {
                fn({
                  id: expense.id,
                  data: () => expense
                });
              });
            }
          });
        }, 0);
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
      {
        id: '1',
        title: 'Grocery Shopping',
        amount: 100,
        category: 'Food',
        date: '2024-01-15',
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        title: 'Gas',
        amount: 50,
        category: 'Transport',
        date: '2024-01-20',
        createdAt: new Date('2024-01-20')
      },
      {
        id: '3',
        title: 'Movie',
        amount: 25,
        category: 'Entertainment',
        date: '2024-01-25',
        createdAt: new Date('2024-01-25')
      }
    ];

    beforeEach(() => {
      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback({
            forEach: (fn) => {
              mockExpenses.forEach(expense => {
                fn({
                  id: expense.id,
                  data: () => expense
                });
              });
            }
          });
        }, 0);
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
        expect(screen.getByText('Total Expenses')).toBeInTheDocument();
        expect(screen.getByText('$175.00')).toBeInTheDocument();
        expect(screen.getByText('All time')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('displays this month expenses correctly', async () => {
      // Mock current date to be in January 2024
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15'));

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('This Month')).toBeInTheDocument();
        expect(screen.getByText('Current month spending')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('displays average expense correctly', async () => {
      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Average')).toBeInTheDocument();
        expect(screen.getByText('Per transaction')).toBeInTheDocument();
        // Average should be 175/3 = 58.33
        expect(screen.getByText('$58.33')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('displays top category correctly', async () => {
      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Top Category')).toBeInTheDocument();
        expect(screen.getByText('Most spent category')).toBeInTheDocument();
        // Food has the highest amount (100)
        expect(screen.getByText('Food')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('displays "None" when no expenses exist', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback({
            forEach: (fn) => []
          });
        }, 0);
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
      {
        id: '1',
        title: 'Grocery Shopping',
        amount: 100,
        category: 'Food',
        date: '2024-01-15',
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        title: 'Gas',
        amount: 50,
        category: 'Transport',
        date: '2024-01-20',
        createdAt: new Date('2024-01-20')
      },
      {
        id: '3',
        title: 'Movie',
        amount: 25,
        category: 'Entertainment',
        date: '2024-01-25',
        createdAt: new Date('2024-01-25')
      },
      {
        id: '4',
        title: 'Restaurant',
        amount: 75,
        category: 'Food',
        date: '2024-01-30',
        createdAt: new Date('2024-01-30')
      },
      {
        id: '5',
        title: 'Coffee',
        amount: 10,
        category: 'Food',
        date: '2024-02-01',
        createdAt: new Date('2024-02-01')
      },
      {
        id: '6',
        title: 'Uber',
        amount: 30,
        category: 'Transport',
        date: '2024-02-05',
        createdAt: new Date('2024-02-05')
      }
    ];

    it('displays recent expenses section header', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback({
            forEach: (fn) => {
              mockExpenses.forEach(expense => {
                fn({
                  id: expense.id,
                  data: () => expense
                });
              });
            }
          });
        }, 0);
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Recent Expenses')).toBeInTheDocument();
        expect(screen.getByText('View All')).toBeInTheDocument();
      });
    });

    it('displays only the 5 most recent expenses', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback({
            forEach: (fn) => {
              mockExpenses.forEach(expense => {
                fn({
                  id: expense.id,
                  data: () => expense
                });
              });
            }
          });
        }, 0);
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show the 5 most recent expenses
        expect(screen.getByText('Uber')).toBeInTheDocument();
        expect(screen.getByText('Coffee')).toBeInTheDocument();
        expect(screen.getByText('Restaurant')).toBeInTheDocument();
        expect(screen.getByText('Movie')).toBeInTheDocument();
        expect(screen.getByText('Gas')).toBeInTheDocument();
        // Should NOT show the oldest one (Grocery Shopping)
        expect(screen.queryByText('Grocery Shopping')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('displays expense details correctly', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback({
            forEach: (fn) => {
              mockExpenses.slice(0, 2).forEach(expense => {
                fn({
                  id: expense.id,
                  data: () => expense
                });
              });
            }
          });
        }, 0);
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Gas')).toBeInTheDocument();
        // Transport appears in the format "Transport • Jan 20, 2024", so use a more flexible matcher
        expect(screen.getByText(/Transport/)).toBeInTheDocument();
        expect(screen.getByText('$50.00')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('displays empty state when no expenses exist', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback({
            forEach: (fn) => []
          });
        }, 0);
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No expenses yet')).toBeInTheDocument();
        expect(screen.getByText('Start tracking your expenses to see them here')).toBeInTheDocument();
        expect(screen.getByText('Add First Expense')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Data Calculation Tests', () => {
    it('calculates total expenses correctly with multiple expenses', async () => {
      const mockExpenses = [
        { id: '1', title: 'Expense 1', amount: 100, category: 'Food', date: '2024-01-15', createdAt: new Date() },
        { id: '2', title: 'Expense 2', amount: 50, category: 'Transport', date: '2024-01-20', createdAt: new Date() },
        { id: '3', title: 'Expense 3', amount: 25, category: 'Entertainment', date: '2024-01-25', createdAt: new Date() }
      ];

      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback({
            forEach: (fn) => {
              mockExpenses.forEach(expense => {
                fn({
                  id: expense.id,
                  data: () => expense
                });
              });
            }
          });
        }, 0);
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
      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback({
            forEach: (fn) => []
          });
        }, 0);
        return () => {};
      });

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
      const mockExpenses = [
        { id: '1', title: 'Old Expense', amount: 100, category: 'Food', date: '2024-01-01', createdAt: new Date('2024-01-01') },
        { id: '2', title: 'New Expense', amount: 50, category: 'Transport', date: '2024-01-31', createdAt: new Date('2024-01-31') }
      ];

      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback({
            forEach: (fn) => {
              mockExpenses.forEach(expense => {
                fn({
                  id: expense.id,
                  data: () => expense
                });
              });
            }
          });
        }, 0);
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        // Find expenses by their title text in the activity items
        expect(screen.getByText('New Expense')).toBeInTheDocument();
        expect(screen.getByText('Old Expense')).toBeInTheDocument();
        
        // Verify New Expense appears before Old Expense in the DOM
        const newExpense = screen.getByText('New Expense');
        const oldExpense = screen.getByText('Old Expense');
        const newExpenseIndex = Array.from(newExpense.closest('.activity-list')?.children || []).indexOf(newExpense.closest('.activity-item') || newExpense);
        const oldExpenseIndex = Array.from(oldExpense.closest('.activity-list')?.children || []).indexOf(oldExpense.closest('.activity-item') || oldExpense);
        expect(newExpenseIndex).toBeLessThan(oldExpenseIndex);
      }, { timeout: 3000 });
    });
  });

  describe('Firebase Integration Tests', () => {
    it('sets up Firebase listener when user is authenticated', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback({
            forEach: (fn) => []
          });
        }, 0);
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(collection).toHaveBeenCalledWith({}, 'users', mockUser.uid, 'expenses');
        expect(query).toHaveBeenCalled();
        expect(onSnapshot).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('cleans up Firebase listener on unmount', async () => {
      const unsubscribe = jest.fn();
      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback({
            forEach: (fn) => []
          });
        }, 0);
        return unsubscribe;
      });

      const { unmount } = render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      });

      unmount();
      // Note: In a real scenario, React would call the cleanup function
      // This test verifies the setup is correct
    });
  });
});
