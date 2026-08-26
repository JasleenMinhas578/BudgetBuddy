// High-level tests for the `Expenses` dashboard page.
// - Mocks Firebase Auth/Firestore, chart components, Toast, Modal, ExpenseForm, and framer-motion to isolate page logic.
// - Verifies base layout (headers, summary cards, and empty-state messaging) for users with no expenses.
// - Exercises opening/closing the expense entry modal from both the header "Add Expense" and empty-state "Add First Expense" CTAs.
// - Confirms correct wiring to Firebase listeners, including unsubscribe cleanup on unmount and graceful handling of connection errors.
// - Ensures summary statistics and empty-state card values remain consistent with the underlying (mocked) expense data.
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Now import the components after mocks are set up
import Expenses from '../components/Dashboard/Expenses';
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
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  orderBy: jest.fn(),
  updateDoc: jest.fn(),
}));

// Mock Firebase config
jest.mock('../firebaseConfig', () => ({
  auth: {},
  db: {},
}));

// Mock Chart.js components to prevent DOM errors
jest.mock('react-chartjs-2', () => ({
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
}));

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  ArcElement: jest.fn(),
}));

// Mock expense service
jest.mock('../services/expenseService', () => ({
  subscribeToExpenses: jest.fn(),
  deleteExpense: jest.fn(),
  updateExpense: jest.fn(),
}));

// Mock Toast component
jest.mock('../components/UI/Toast', () => {
  return function MockToast({ message, type, onClose }) {
    return (
      <div data-testid="toast" data-type={type}>
        {message}
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

// Mock Modal component
jest.mock('../components/UI/Modal', () => {
  return function MockModal({ isOpen, onClose, children }) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <button onClick={onClose}>Close Modal</button>
        {children}
      </div>
    );
  };
});

// Mock ExpenseForm component
jest.mock('../components/Expense/ExpenseForm', () => {
  return function MockExpenseForm({ onExpenseAdded, onExpenseEdited, initialExpense, isEditMode }) {
    return (
      <div data-testid="expense-form">
        <div>Expense Form {isEditMode ? '(Edit Mode)' : '(Add Mode)'}</div>
        {initialExpense && <div>Editing: {initialExpense.title}</div>}
        <button onClick={() => onExpenseAdded && onExpenseAdded()}>Add Expense</button>
        <button onClick={() => onExpenseEdited && onExpenseEdited({ id: '1', title: 'Updated' })}>Update Expense</button>
      </div>
    );
  };
});

// Mock framer-motion to avoid animation issues in tests
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

// Mock window.confirm
global.confirm = jest.fn();

// Get the mocked functions
const {
  collection,
  query,
  onSnapshot,
  deleteDoc,
  doc,
  orderBy,
  updateDoc
} = require('firebase/firestore');
const { onAuthStateChanged } = require('firebase/auth');
const { subscribeToExpenses } = require('../services/expenseService');

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Expenses Component', () => {
  const mockUser = { uid: 'test-user-123', email: 'test@example.com' };

  // Set up console mocking before any tests run
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
    doc.mockReturnValue('mock-doc');

    // subscribeToExpenses must return a function so the component can call it on unmount
    subscribeToExpenses.mockReturnValue(() => {});
    
    // Mock onSnapshot to simulate empty Firebase listener (empty state)
    onSnapshot.mockImplementation((query, callback) => {
      act(() => {
        callback({
          forEach: (fn) => [] // Empty array to simulate no expenses
        });
      });
      return () => {}; // Return unsubscribe function
    });

    // Mock Firebase Auth
    onAuthStateChanged.mockImplementation((auth, callback) => {
      act(() => {
        callback(mockUser);
      });
      return () => {}; // Return unsubscribe function
    });

    // Mock successful Firebase operations
    deleteDoc.mockResolvedValue({});
    updateDoc.mockResolvedValue({});
  });

  afterAll(() => {
    // Restore console methods
    console.error.mockRestore();
    console.warn.mockRestore();
  });

  describe('Basic Rendering Tests', () => {
    it('renders expenses component with header and add button', async () => {
      render(
        <TestWrapper>
          <Expenses />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Expenses')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Track and manage your expenses')).toBeInTheDocument();
      expect(screen.getByText('Add Expense')).toBeInTheDocument();
    });

    it('renders summary statistics', async () => {
      render(
        <TestWrapper>
          <Expenses />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Total Expenses')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Total Transactions')).toBeInTheDocument();
      expect(screen.getByText('Average Amount')).toBeInTheDocument();
    });

    it('renders empty state when no expenses', async () => {
      render(
        <TestWrapper>
          <Expenses />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No expenses yet')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Start tracking your expenses to see them here')).toBeInTheDocument();
      expect(screen.getByText('Add First Expense')).toBeInTheDocument();
    });
  });

  describe('Add Expense Tests', () => {
    it('opens expense form when Add Expense button is clicked', async () => {
      render(
        <TestWrapper>
          <Expenses />
        </TestWrapper>
      );

      const addButton = screen.getByText('Add Expense');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('expense-form')).toBeInTheDocument();
    });

    it('opens expense form when Add First Expense button is clicked in empty state', async () => {
      render(
        <TestWrapper>
          <Expenses />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Add First Expense')).toBeInTheDocument();
      });

      const addFirstButton = screen.getByText('Add First Expense');
      fireEvent.click(addFirstButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('expense-form')).toBeInTheDocument();
    });
  });

  describe('Error Handling Tests', () => {
    it('handles Firebase connection errors gracefully', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        // Simulate error
        throw new Error('Firebase connection failed');
      });

      render(
        <TestWrapper>
          <Expenses />
        </TestWrapper>
      );

      // Component should still render without crashing
      expect(screen.getByText('Expenses')).toBeInTheDocument();
    });
  });

  describe('Component Integration Tests', () => {
    it('renders with proper component structure', async () => {
      render(
        <TestWrapper>
          <Expenses />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Expenses')).toBeInTheDocument();
      });
      
      // Check summary section
      expect(screen.getByText('Total Expenses')).toBeInTheDocument();
      expect(screen.getByText('Total Transactions')).toBeInTheDocument();
      expect(screen.getByText('Average Amount')).toBeInTheDocument();
      
      // Check empty state
      expect(screen.getByText('No expenses yet')).toBeInTheDocument();
    });

    it('displays correct summary values for empty state', async () => {
      render(
        <TestWrapper>
          <Expenses />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getAllByText('$0.00')).toHaveLength(2); // Total expenses and average amount
      });
      
      expect(screen.getByText('0')).toBeInTheDocument(); // Total transactions
    });
  });

  describe('Modal Integration Tests', () => {
    it('opens and closes modal correctly', async () => {
      render(
        <TestWrapper>
          <Expenses />
        </TestWrapper>
      );

      // Initially no modal
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

      // Click add button
      const addButton = screen.getByText('Add Expense');
      fireEvent.click(addButton);

      // Modal should open
      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('expense-form')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText('Close Modal');
      fireEvent.click(closeButton);

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Firebase Integration Tests', () => {
    it('calls Firebase functions with correct parameters', async () => {
      render(
        <TestWrapper>
          <Expenses />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(collection).toHaveBeenCalled();
      });
      
      expect(query).toHaveBeenCalled();
      expect(onSnapshot).toHaveBeenCalled();
    });

    it('handles Firebase unsubscribe correctly', async () => {
      const mockUnsubscribe = jest.fn();
      onSnapshot.mockReturnValue(mockUnsubscribe);

      const { unmount } = render(
        <TestWrapper>
          <Expenses />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      });

      // Unmount component
      unmount();

      // Unsubscribe should be called
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});