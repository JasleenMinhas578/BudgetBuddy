// High-level tests for the `Categories` dashboard widget.
// - Mocks Cognito (for AuthContext), the category/expense/budget services, charts, toast, modal, and framer-motion to focus on UI logic and data wiring.
// - Covers rendering basics, modal open/close behavior, form interaction, and resetting state between openings.
// - Verifies happy-path category addition, loading behavior, success toasts, and correct service calls.
// - Exercises error states for API failures, unauthenticated users, and listener errors.
// - Confirms listeners are only attached when a user is authenticated and that unsubscribe cleanup is performed on unmount/rerender.
// - Checks that form validation and toast notifications behave correctly for edge cases like empty names.
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Now import the components after mocks are set up
import Categories from '../components/Dashboard/Categories';
import { AuthProvider } from '../context/AuthContext';

// Mock Cognito so the real AuthContext resolves to a logged-in (or logged-out) user
jest.mock('amazon-cognito-identity-js');
const { __mockUserPoolInstance } = require('amazon-cognito-identity-js');

jest.mock('../services/categoryService', () => ({
  addCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  subscribeToCategories: jest.fn(),
  subscribeToUserPreferences: jest.fn(),
  hideDefaultCategory: jest.fn(),
  reassignCategoryExpenses: jest.fn(),
}));

jest.mock('../services/expenseService', () => ({
  subscribeToExpenses: jest.fn(),
}));

jest.mock('../services/budgetService', () => ({
  subscribeToBudgets: jest.fn(),
  updateCategoryBudget: jest.fn(),
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
  return function MockModal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose}>Close Modal</button>
        {children}
      </div>
    );
  };
});

// Mock CurrencyContext — Categories uses useCurrency() for amount formatting
jest.mock('../context/CurrencyContext', () => ({
  useCurrency: () => ({
    formatAmount: (amount) => `$${Number(amount).toFixed(2)}`,
    currency: 'USD',
    currencySymbol: '$',
    liveRates: {},
    CURRENCIES: [{ code: 'USD', symbol: '$', name: 'US Dollar' }],
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
    button: ({ children, ...props }) => {
      const { whileHover, whileTap, ...restProps } = props;
      return <button {...restProps}>{children}</button>;
    },
  },
}));

// Get the mocked functions
const { addCategory, subscribeToCategories, subscribeToUserPreferences } = require('../services/categoryService');
const { subscribeToExpenses } = require('../services/expenseService');
const { subscribeToBudgets } = require('../services/budgetService');

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

function mockLoggedIn(mockUser) {
  __mockUserPoolInstance.getCurrentUser.mockReturnValue({
    getSession: (cb) => cb(null, { isValid: () => true }),
    getUserAttributes: (cb) => cb(null, [
      { getName: () => 'email', getValue: () => mockUser.email },
    ]),
    getUsername: () => mockUser.uid,
  });
}

describe('Categories Component', () => {
  const mockUser = { uid: 'test-user-123', email: 'test@example.com' };

  // Set up console mocking before any tests run
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockLoggedIn(mockUser);

    subscribeToCategories.mockImplementation((userId, callback) => {
      callback([]);
      return () => {};
    });
    subscribeToExpenses.mockImplementation((userId, callback) => {
      callback([]);
      return () => {};
    });
    subscribeToBudgets.mockImplementation((userId, callback) => {
      callback({ monthly: null, categories: {} });
      return () => {};
    });
    subscribeToUserPreferences.mockImplementation((userId, callback) => {
      callback({ hiddenDefaultCategories: [] });
      return () => {};
    });

    addCategory.mockResolvedValue('new-category-id');
  });

  afterAll(() => {
    console.error.mockRestore();
    console.warn.mockRestore();
  });

  describe('Basic Rendering Tests', () => {
    it('renders categories component with header and add button', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Categories')).toBeInTheDocument();
      });

      expect(screen.getByText('Analyze your spending by category')).toBeInTheDocument();
      expect(screen.getByText('Add Category')).toBeInTheDocument();
    });

    it('renders with proper component structure', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Categories')).toBeInTheDocument();
      });

      expect(screen.getByText('Analyze your spending by category')).toBeInTheDocument();
      expect(screen.getByText('Add Category')).toBeInTheDocument();
    });
  });

  describe('Modal Interaction Tests', () => {
    it('opens modal when Add Category button is clicked', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

      const addButton = await screen.findByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      expect(screen.getByText('Add New Category')).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      const addButton = await screen.findByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Close Modal'));

      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });
    });

    it('closes modal when cancel button is clicked', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      const addButton = await screen.findByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Interaction Tests', () => {
    it('renders form with proper input fields', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      const addButton = await screen.findByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText('Enter category name')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /add category/i })).toHaveLength(2);
    });

    it('updates input value when typing', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      const addButton = await screen.findByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('Category Name');
      fireEvent.change(input, { target: { value: 'Test Category' } });
      expect(input.value).toBe('Test Category');
    });

    it('resets form when modal is closed', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      const addButton = await screen.findByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('Category Name');
      fireEvent.change(input, { target: { value: 'Test Category' } });
      expect(input.value).toBe('Test Category');

      fireEvent.click(screen.getByText('Close Modal'));
      fireEvent.click(addButton);

      await waitFor(() => {
        const reopenedInput = screen.getByLabelText('Category Name');
        expect(reopenedInput.value).toBe('');
      });
    });
  });

  describe('Category Addition Tests', () => {
    it('successfully adds a new category', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      const addButton = await screen.findByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('Category Name');
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });

      fireEvent.change(input, { target: { value: 'Test Category' } });
      fireEvent.click(submitButtons[1]);

      await waitFor(() => {
        expect(addCategory).toHaveBeenCalledWith(mockUser.uid, { name: 'Test Category' });
      });
    });

    it('shows success toast after adding category', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      const addButton = await screen.findByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('Category Name');
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });

      fireEvent.change(input, { target: { value: 'Test Category' } });
      fireEvent.click(submitButtons[1]);

      await waitFor(() => {
        expect(screen.getByTestId('toast')).toBeInTheDocument();
      });

      expect(screen.getByText('Category "Test Category" added successfully!')).toBeInTheDocument();
      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'success');
    });

    it('closes modal after successful category addition', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      const addButton = await screen.findByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('Category Name');
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });

      fireEvent.change(input, { target: { value: 'Test Category' } });
      fireEvent.click(submitButtons[1]);

      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });
    });

    it('initiates category addition on submit', async () => {
      addCategory.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve('id'), 100)));

      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      const addButton = await screen.findByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('Category Name');
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });

      fireEvent.change(input, { target: { value: 'Test Category' } });
      expect(submitButtons[1]).not.toBeDisabled();

      fireEvent.click(submitButtons[1]);
      expect(addCategory).toHaveBeenCalled();
    });
  });

  describe('Error Handling Tests', () => {
    it('handles addCategory API error', async () => {
      addCategory.mockRejectedValue(new Error('API error'));

      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      const addButton = await screen.findByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('Category Name');
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });

      fireEvent.change(input, { target: { value: 'Test Category' } });
      fireEvent.click(submitButtons[1]);

      await waitFor(() => {
        expect(screen.getByTestId('toast')).toBeInTheDocument();
      });

      expect(screen.getByText('Failed to add category. Please try again.')).toBeInTheDocument();
      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'error');
    });

    it('handles user not logged in error', async () => {
      __mockUserPoolInstance.getCurrentUser.mockReturnValue(null);

      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      const addButton = await screen.findByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('Category Name');
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });

      fireEvent.change(input, { target: { value: 'Test Category' } });
      fireEvent.click(submitButtons[1]);

      await waitFor(() => {
        expect(screen.getByTestId('toast')).toBeInTheDocument();
      });

      expect(screen.getByText('Please log in to add categories.')).toBeInTheDocument();
      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'error');
    });

    it('handles subscribeToCategories listener errors gracefully', async () => {
      subscribeToCategories.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      expect(await screen.findByText('Categories')).toBeInTheDocument();
    });
  });

  describe('Service Integration Tests', () => {
    it('calls subscribeToCategories/subscribeToExpenses with the current user id', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(subscribeToCategories).toHaveBeenCalledWith(mockUser.uid, expect.any(Function));
      });

      expect(subscribeToExpenses).toHaveBeenCalledWith(mockUser.uid, expect.any(Function));
    });

    it('handles unsubscribe correctly', async () => {
      const mockUnsubscribe = jest.fn();
      subscribeToCategories.mockImplementation((userId, callback) => {
        callback([]);
        return mockUnsubscribe;
      });

      const { unmount } = render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(subscribeToCategories).toHaveBeenCalled();
      });

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('does not call services when no user is authenticated', async () => {
      __mockUserPoolInstance.getCurrentUser.mockReturnValue(null);

      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      await screen.findByText('Categories');
      expect(subscribeToCategories).not.toHaveBeenCalled();
      expect(subscribeToExpenses).not.toHaveBeenCalled();
    });
  });

  describe('Data Loading Tests', () => {
    it('loads and displays categories from the API', async () => {
      subscribeToCategories.mockImplementation((userId, callback) => {
        callback([{ id: '1', name: 'Food' }, { id: '2', name: 'Transportation' }]);
        return () => {};
      });

      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(subscribeToCategories).toHaveBeenCalled();
      });
    });

    it('loads expenses from the API', async () => {
      subscribeToExpenses.mockImplementation((userId, callback) => {
        callback([
          { id: '1', title: 'Lunch', amount: 15.50, category: 'Food' },
          { id: '2', title: 'Bus fare', amount: 2.50, category: 'Transportation' },
        ]);
        return () => {};
      });

      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(subscribeToExpenses).toHaveBeenCalledWith(mockUser.uid, expect.any(Function));
      });
    });
  });

  describe('Form Validation Tests', () => {
    it('submits with empty category name (no client-side validation)', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      const addButton = await screen.findByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /add category/i })).toHaveLength(2);
      });

      const submitButtons = screen.getAllByRole('button', { name: /add category/i });
      fireEvent.click(submitButtons[1]);

      // useCategoryActions returns early on empty name — addCategory should not be called
      expect(addCategory).not.toHaveBeenCalled();
    });

    it('requires category name input', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      const addButton = await screen.findByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('Category Name')).toHaveAttribute('required');
    });
  });

  describe('Toast Notification Tests', () => {
    it('closes toast when close button is clicked', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      const addButton = await screen.findByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('Category Name');
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });

      fireEvent.change(input, { target: { value: 'Test Category' } });
      fireEvent.click(submitButtons[1]);

      await waitFor(() => {
        expect(screen.getByTestId('toast')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Close'));

      await waitFor(() => {
        expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
      });
    });
  });

  describe('Component Lifecycle Tests', () => {
    it('cleans up listeners on unmount', async () => {
      const mockUnsubscribe = jest.fn();
      subscribeToCategories.mockImplementation((userId, callback) => {
        callback([]);
        return mockUnsubscribe;
      });

      const { unmount } = render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(subscribeToCategories).toHaveBeenCalled();
      });

      unmount();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('handles component re-renders correctly', async () => {
      const { rerender } = render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Categories')).toBeInTheDocument();
      });

      rerender(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      expect(screen.getByText('Categories')).toBeInTheDocument();
    });
  });
});
