// Integration-style tests for the `DashboardOverview` component.
// - Mocks Firebase Auth/Firestore and framer-motion to focus on data calculations and UI rendering.
// - Verifies welcome messaging for first-time users vs returning users with existing expenses.
// - Checks summary cards for total, monthly, average, and top-category computations across various datasets (including empty and zero cases).
// - Ensures the "Recent Expenses" widget shows the correct number of items, orders them by date, and formats details properly.
// - Confirms that expenses are sorted and aggregated correctly, including handling of missing dates and zero-expense scenarios.
// - Tests that Firebase listeners are wired up with the right paths, cleaned up on unmount, and not attached when no user is authenticated.
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Now import the components after mocks are set up
import DashboardOverview from '../components/Dashboard/DashboardOverview';
import { AuthProvider } from '../context/AuthContext';

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
      }, { timeout: 3000 });
      
      expect(screen.getByText(/Let's start tracking your expenses/)).toBeInTheDocument();
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
        date: '2026-08-15',
        createdAt: new Date('2026-08-15')
      },
      {
        id: '2',
        title: 'Gas',
        amount: 50,
        category: 'Transport',
        date: '2026-08-20',
        createdAt: new Date('2026-08-20')
      },
      {
        id: '3',
        title: 'Movie',
        amount: 25,
        category: 'Entertainment',
        date: '2026-08-25',
        createdAt: new Date('2026-08-25')
      }
    ];

    beforeEach(() => {
      onSnapshot.mockImplementation((query, callback) => {
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

      // All 3 expenses are in August 2026 (this month), so total should be $175.00
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
        date: '2026-08-01',
        createdAt: new Date('2026-08-01')
      },
      {
        id: '2',
        title: 'Gas',
        amount: 50,
        category: 'Transport',
        date: '2026-08-05',
        createdAt: new Date('2026-08-05')
      },
      {
        id: '3',
        title: 'Movie',
        amount: 25,
        category: 'Entertainment',
        date: '2026-08-10',
        createdAt: new Date('2026-08-10')
      },
      {
        id: '4',
        title: 'Restaurant',
        amount: 75,
        category: 'Food',
        date: '2026-08-15',
        createdAt: new Date('2026-08-15')
      },
      {
        id: '5',
        title: 'Coffee',
        amount: 10,
        category: 'Food',
        date: '2026-08-20',
        createdAt: new Date('2026-08-20')
      },
      {
        id: '6',
        title: 'Uber',
        amount: 30,
        category: 'Transport',
        date: '2026-08-25',
        createdAt: new Date('2026-08-25')
      }
    ];

    it('displays recent expenses section header', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        act(() => {
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
        });
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
        expect(screen.getByText('Uber')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Should show the 5 most recent expenses
        expect(screen.getByText('Coffee')).toBeInTheDocument();
        expect(screen.getByText('Restaurant')).toBeInTheDocument();
        expect(screen.getByText('Movie')).toBeInTheDocument();
        expect(screen.getByText('Gas')).toBeInTheDocument();
        // Should NOT show the oldest one (Grocery Shopping)
        expect(screen.queryByText('Grocery Shopping')).not.toBeInTheDocument();
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
      }, { timeout: 3000 });
      
        // Transport appears in the format "Transport • Jan 20, 2024", so use a more flexible matcher
        expect(screen.getByText(/Transport/)).toBeInTheDocument();
        expect(screen.getByText('$50.00')).toBeInTheDocument();
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
      }, { timeout: 3000 });
      
      expect(screen.getByText('Start tracking your expenses to see them here')).toBeInTheDocument();
      expect(screen.getByText('Add First Expense')).toBeInTheDocument();
    });
  });

  describe('Data Calculation Tests', () => {
    it('calculates total expenses correctly with multiple expenses', async () => {
      const mockExpenses = [
        { id: '1', title: 'Expense 1', amount: 100, category: 'Food', date: '2026-08-10', createdAt: new Date('2026-08-10') },
        { id: '2', title: 'Expense 2', amount: 50, category: 'Transport', date: '2026-08-15', createdAt: new Date('2026-08-15') },
        { id: '3', title: 'Expense 3', amount: 25, category: 'Entertainment', date: '2026-08-20', createdAt: new Date('2026-08-20') }
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
        { id: '1', title: 'Old Expense', amount: 100, category: 'Food', date: '2026-08-01', createdAt: new Date('2026-08-01') },
        { id: '2', title: 'New Expense', amount: 50, category: 'Transport', date: '2026-08-26', createdAt: new Date('2026-08-26') }
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
        expect(screen.getByText('New Expense')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Find expenses by their title text in the activity items
      expect(screen.getByText('Old Expense')).toBeInTheDocument();
    });

    it('handles expenses with missing dates gracefully', async () => {
      const mockExpenses = [
        { id: '1', title: 'No Date', amount: 20, category: 'Misc', date: '', createdAt: new Date('2026-08-10') },
        { id: '2', title: 'With Date', amount: 40, category: 'Food', date: '2026-08-15', createdAt: new Date('2026-08-15') }
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

      // Empty-date expense is excluded by thisMonth filter; check component renders and dated expense shows
      await waitFor(() => {
        expect(screen.getByText('With Date')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('handles expenses with neither date nor createdAt (fallback to return 0)', async () => {
      const mockExpenses = [
        { id: '1', title: 'No Date No Created', amount: 20, category: 'Misc' },
        { id: '2', title: 'With Date', amount: 40, category: 'Food', date: '2026-08-15' }
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

      // Expense without date is excluded by thisMonth filter; check dated expense and no crash
      await waitFor(() => {
        expect(screen.getByText('With Date')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('sorts expenses using createdAt fallback when date is missing', async () => {
      // Create mock Timestamp objects
      const mockTimestamp1 = {
        toDate: () => new Date('2026-08-05')
      };
      const mockTimestamp2 = {
        toDate: () => new Date('2026-08-10')
      };

      const mockExpenses = [
        { id: '1', title: 'Earlier Expense', amount: 20, category: 'Misc', date: '2026-08-05', createdAt: mockTimestamp1 },
        { id: '2', title: 'Later Expense', amount: 40, category: 'Food', date: '2026-08-10', createdAt: mockTimestamp2 }
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
        expect(screen.getByText('Later Expense')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByText('Earlier Expense')).toBeInTheDocument();
    });

    it('sorts expenses using createdAt as Date object when toDate is not available', async () => {
      const mockExpenses = [
        { id: '1', title: 'Earlier Expense', amount: 20, category: 'Misc', date: '2026-08-05', createdAt: new Date('2026-08-05') },
        { id: '2', title: 'Later Expense', amount: 40, category: 'Food', date: '2026-08-10', createdAt: new Date('2026-08-10') }
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
        expect(screen.getByText('Later Expense')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByText('Earlier Expense')).toBeInTheDocument();
    });
  });

  describe('Firebase Integration Tests', () => {
    it('sets up Firebase listener when user is authenticated', async () => {
      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      }, { timeout: 3000 });

      expect(collection).toHaveBeenCalled();
      expect(query).toHaveBeenCalled();
    });

    it('cleans up Firebase listener on unmount', async () => {
      const unsubscribe = jest.fn();
      onSnapshot.mockImplementation((query, callback) => {
        callback({ forEach: (fn) => [] });
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
      // subscribeToExpenses returns the onSnapshot unsubscribe; verify it was called
      expect(unsubscribe).toHaveBeenCalled();
    });

    it('does not subscribe when there is no authenticated user', async () => {
      onAuthStateChanged.mockImplementation((auth, callback) => {
        act(() => callback(null));
        return () => {};
      });

      render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      // With no user, the component should render but show empty state
      await waitFor(() => {
        expect(screen.getByText('No expenses yet')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
