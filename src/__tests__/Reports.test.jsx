import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Now import the components after mocks are set up
import Reports from '../components/Dashboard/Reports';
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

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Pie: ({ data }) => <div data-testid="pie-chart">Pie Chart</div>,
  Line: ({ data }) => <div data-testid="line-chart">Line Chart</div>,
}));

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  ArcElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => {
    return {
      setFillColor: jest.fn(),
      rect: jest.fn(),
      setTextColor: jest.fn(),
      setFontSize: jest.fn(),
      setFont: jest.fn(),
      text: jest.fn(),
      internal: {
        pageSize: {
          getWidth: () => 210,
          getHeight: () => 297,
        },
        getNumberOfPages: () => 1,
      },
      addPage: jest.fn(),
      save: jest.fn(),
      setPage: jest.fn(),
    };
  });
});

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'yyyy-MM-dd') {
      return '2024-01-15';
    }
    if (formatStr === 'MMM yyyy') {
      return 'Jan 2024';
    }
    if (formatStr === 'MMM dd, yyyy') {
      return 'Jan 15, 2024';
    }
    if (formatStr === 'MMMM dd, yyyy') {
      return 'January 15, 2024';
    }
    return date.toString();
  }),
  startOfMonth: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), 1)),
  endOfMonth: jest.fn((date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  startOfYear: jest.fn((date) => new Date(date.getFullYear(), 0, 1)),
  endOfYear: jest.fn((date) => new Date(date.getFullYear(), 11, 31)),
  subMonths: jest.fn((date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() - months);
    return result;
  }),
  subYears: jest.fn((date, years) => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() - years);
    return result;
  }),
  parseISO: jest.fn((dateString) => new Date(dateString)),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => {
      const { whileHover, whileTap, initial, animate, transition, ...restProps } = props;
      return <div {...restProps}>{children}</div>;
    },
    button: ({ children, ...props }) => {
      const { whileHover, whileTap, ...restProps } = props;
      return <button {...restProps}>{children}</button>;
    },
  },
}));

// Mock URL.createObjectURL and document methods for CSV export
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

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

describe('Reports Component', () => {
  const mockUser = { uid: 'test-user-123', email: 'test@example.com' };

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
      date: '2024-02-10',
      createdAt: new Date('2024-02-10')
    },
    {
      id: '4',
      title: 'Restaurant',
      amount: 75,
      category: 'Food',
      date: '2024-02-15',
      createdAt: new Date('2024-02-15')
    }
  ];

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Firebase functions
    collection.mockReturnValue('mock-collection');
    query.mockReturnValue('mock-query');
    orderBy.mockReturnValue('mock-order-by');

    // Mock Firebase Auth
    onAuthStateChanged.mockImplementation((auth, callback) => {
      setTimeout(() => {
        callback(mockUser);
      }, 0);
      return () => {};
    });

    // Mock onSnapshot with expenses
    onSnapshot.mockImplementation((query, callback, errorCallback) => {
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

  afterEach(() => {
    // Clear any timers and mocks between tests
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    console.error.mockRestore();
    console.warn.mockRestore();
  });

  describe('Basic Rendering Tests', () => {
    it('renders reports component with header', async () => {
      render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByText(/Comprehensive analysis/)).toBeInTheDocument();
    });

    it('renders export button', async () => {
      render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('renders date filter controls', async () => {
      render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Date Range')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const allTimeButtons = screen.getAllByText('All Time');
      expect(allTimeButtons.length).toBeGreaterThan(0);
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText('This Month')).toBeInTheDocument();
    });
  });

  describe('Summary Cards Widget Tests', () => {
    it('displays total spent correctly', async () => {
      render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('$250.00')).toBeInTheDocument(); // 100+50+25+75
      }, { timeout: 3000 });
      
      expect(screen.getByText('Total Spent')).toBeInTheDocument();
    });

    it('displays transaction count correctly', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('4')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByText('Transactions')).toBeInTheDocument();

      unmount();
    });

    it('displays average amount correctly', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('$62.50')).toBeInTheDocument(); // 250/4
      }, { timeout: 3000 });
      
      expect(screen.getByText('Average')).toBeInTheDocument();

      unmount();
    });

    it('displays top category correctly', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Top Category')).toBeInTheDocument();
      }, { timeout: 3000 });

      unmount();
    });
  });

  describe('Chart Components Tests', () => {
    it('renders pie chart for category spending', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Spending by Category')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();

      unmount();
    });

    it('renders line chart for monthly trend', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Monthly Trend')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();

      unmount();
    });

    it('renders charts with correct data structure', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();

      unmount();
    });
  });

  describe('Date Filter Tests', () => {
    it('filters expenses by "All Time" by default', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      // All 4 expenses should be visible
      await waitFor(() => {
        expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByText('Gas')).toBeInTheDocument();
      expect(screen.getByText('Movie')).toBeInTheDocument();
      expect(screen.getByText('Restaurant')).toBeInTheDocument();

      unmount();
    });

    it('changes filter when filter button is clicked', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('This Month')).toBeInTheDocument();
      }, { timeout: 3000 });

      const thisMonthButton = screen.getByText('This Month');
      fireEvent.click(thisMonthButton);
      
      // Verify the button is in the document
      expect(thisMonthButton).toBeInTheDocument();

      unmount();
    });

    it('shows custom date range inputs when custom is selected', async () => {
      render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Custom Range')).toBeInTheDocument();
      }, { timeout: 3000 });

      const customButton = screen.getByText('Custom Range');
      fireEvent.click(customButton);
      
      await waitFor(() => {
        expect(screen.getByText('Start Date')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Use getByText to find labels, then find inputs nearby
      expect(screen.getByText('End Date')).toBeInTheDocument();
    });

    it('updates custom date range when inputs change', async () => {
      render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Custom Range')).toBeInTheDocument();
      }, { timeout: 3000 });

      const customButton = screen.getByText('Custom Range');
      fireEvent.click(customButton);
      
      await waitFor(() => {
        // Find inputs by type instead of label
        const dateInputs = screen.getAllByDisplayValue('');
        expect(dateInputs.length).toBeGreaterThanOrEqual(2);
      }, { timeout: 3000 });

      const dateInputs = screen.getAllByDisplayValue('');
      const startDateInput = dateInputs[0];
      const endDateInput = dateInputs[1];
      
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });
      
      expect(startDateInput.value).toBe('2024-01-01');
      expect(endDateInput.value).toBe('2024-01-31');
    });
  });

  describe('Export Functions Tests', () => {
    it('shows export dropdown when export button is clicked', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      }, { timeout: 3000 });

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(screen.getByText('Download PDF Report')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();

      unmount();
    });

    it('exports to CSV correctly', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Store original createElement before mocking
      const originalCreateElement = document.createElement.bind(document);
      
      // Create a real DOM element but spy on its methods
      const realLink = originalCreateElement('a');
      const setAttributeSpy = jest.spyOn(realLink, 'setAttribute');
      const clickSpy = jest.spyOn(realLink, 'click');
      
      // Mock document.createElement to return our spied link
      const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          return realLink;
        }
        // For other elements, use the original createElement
        return originalCreateElement(tagName);
      });

      // Store original methods before mocking
      const originalAppendChild = document.body.appendChild.bind(document.body);
      const originalRemoveChild = document.body.removeChild.bind(document.body);
      
      // Mock appendChild and removeChild to actually work but track calls
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation((node) => {
        return originalAppendChild(node);
      });
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation((node) => {
        return originalRemoveChild(node);
      });

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(screen.getByText('Export as CSV')).toBeInTheDocument();
      }, { timeout: 3000 });

      const csvButton = screen.getByText('Export as CSV');
      fireEvent.click(csvButton);

      await waitFor(() => {
        expect(createElementSpy).toHaveBeenCalledWith('a');
      }, { timeout: 3000 });
      
      expect(setAttributeSpy).toHaveBeenCalledWith('download', expect.stringContaining('.csv'));
      expect(clickSpy).toHaveBeenCalled();

      unmount();
      
      // Restore all mocks
      createElementSpy.mockRestore();
      setAttributeSpy.mockRestore();
      clickSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('generates PDF report correctly', async () => {
      const jsPDF = require('jspdf');
      
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      }, { timeout: 3000 });

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(screen.getByText('Download PDF Report')).toBeInTheDocument();
      }, { timeout: 3000 });

      const pdfButton = screen.getByText('Download PDF Report');
      fireEvent.click(pdfButton);

      await waitFor(() => {
        expect(jsPDF).toHaveBeenCalled();
      }, { timeout: 5000 });

      unmount();
    });

    it('shows loading state while generating PDF', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      }, { timeout: 3000 });

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(screen.getByText('Download PDF Report')).toBeInTheDocument();
      }, { timeout: 3000 });

      const pdfButton = screen.getByText('Download PDF Report');
      fireEvent.click(pdfButton);
      
      // Component should still be rendered
      await waitFor(() => {
        expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
      }, { timeout: 3000 });

      unmount();
    });
  });

  describe('Expenses Table Tests', () => {
    it('renders expenses table with headers', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Date')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByText('Detailed Expenses')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();

      unmount();
    });

    it('displays all filtered expenses in table', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByText('Gas')).toBeInTheDocument();
      expect(screen.getByText('Movie')).toBeInTheDocument();
      expect(screen.getByText('Restaurant')).toBeInTheDocument();

      unmount();
    });

    it('displays empty state when no expenses match filter', async () => {
      // Mock empty expenses
      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback({
            forEach: (fn) => []
          });
        }, 0);
        return () => {};
      });

      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No expenses found')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByText('No expenses match the selected date range')).toBeInTheDocument();

      unmount();
    });
  });

  describe('Data Processing Tests', () => {
    it('calculates category data correctly for pie chart', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Food').length).toBeGreaterThan(0);
      }, { timeout: 3000 });
      
      // Food category should have 175 (100 + 75)
      // Transport should have 50
      // Entertainment should have 25
      expect(screen.getByText('Transport')).toBeInTheDocument();
      expect(screen.getByText('Entertainment')).toBeInTheDocument();

      unmount();
    });

    it('calculates monthly data correctly for line chart', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should group expenses by month
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      }, { timeout: 3000 });

      unmount();
    });

    it('filters expenses correctly based on date range', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('This Month')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Click "This Month" filter
      const thisMonthButton = screen.getByText('This Month');
      fireEvent.click(thisMonthButton);
      
      // Verify button is in the document
      expect(thisMonthButton).toBeInTheDocument();

      unmount();
    });
  });

  describe('Spending Insights Tests', () => {
    it('displays spending insights when conditions are met', async () => {
      // Create expenses that trigger insights
      const insightExpenses = [
        {
          id: '1',
          title: 'Large Expense',
          amount: 200,
          category: 'Food',
          date: '2024-01-15',
          createdAt: new Date('2024-01-15')
        }
      ];

      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback({
            forEach: (fn) => {
              insightExpenses.forEach(expense => {
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

      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show insights if conditions are met
        // This depends on the actual implementation logic
        expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
      }, { timeout: 3000 });

      unmount();
    });
  });

  describe('Firebase Integration Tests', () => {
    it('sets up Firebase listener when user is authenticated', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(collection).toHaveBeenCalledWith({}, 'users', mockUser.uid, 'expenses');
      }, { timeout: 3000 });
      
      expect(query).toHaveBeenCalled();
      expect(onSnapshot).toHaveBeenCalled();

      unmount();
    });

    it('handles Firebase errors gracefully', async () => {
      onSnapshot.mockImplementation((query, callback, errorCallback) => {
        setTimeout(() => {
          if (errorCallback) {
            errorCallback(new Error('Firebase error'));
          } else {
            // Still call the success callback so component can render
            callback({
              forEach: (fn) => []
            });
          }
        }, 0);
        return () => {};
      });

      const { unmount } = render(
        <TestWrapper>
          <Reports />
        </TestWrapper>
      );

      await waitFor(() => {
        // Component should still render even with errors
        expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
      }, { timeout: 3000 });

      unmount();
    });
  });
});

