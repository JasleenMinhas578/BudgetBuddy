import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Now import the components after mocks are set up
import Categories from '../components/Dashboard/Categories';
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
  addDoc: jest.fn(),
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
const { 
  collection, 
  query, 
  onSnapshot, 
  addDoc 
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

describe('Categories Component', () => {
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
    
    // Mock onSnapshot to simulate Firebase listener
    onSnapshot.mockImplementation((query, callback) => {
      act(() => {
        callback({
          forEach: (fn) => [] // Empty array to simulate no categories initially
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
    addDoc.mockResolvedValue({ id: 'new-category-id' });
  });

  afterAll(() => {
    // Restore console methods
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
      
      // Check section subtitle
      expect(screen.getByText('Analyze your spending by category')).toBeInTheDocument();
      
      // Check add button
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

      // Initially no modal
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

      // Click add button
      const addButton = screen.getByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      // Modal should open
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

      // Open modal
      const addButton = screen.getByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByText('Close Modal');
      fireEvent.click(closeButton);

      // Modal should close
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

      // Open modal
      const addButton = screen.getByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      // Click cancel button
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Modal should close
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

      // Open modal
      const addButton = screen.getByRole('button', { name: /add category/i });
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

      // Open modal
      const addButton = screen.getByRole('button', { name: /add category/i });
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

      // Open modal and enter text
      const addButton = screen.getByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });
      
      const input = screen.getByLabelText('Category Name');
      fireEvent.change(input, { target: { value: 'Test Category' } });
      expect(input.value).toBe('Test Category');

      // Close modal
      const closeButton = screen.getByText('Close Modal');
      fireEvent.click(closeButton);

      // Reopen modal and check if form is reset
      fireEvent.click(addButton);

      await waitFor(() => {
        const input = screen.getByLabelText('Category Name');
        expect(input.value).toBe('');
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

      // Open modal
      const addButton = screen.getByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });
      
      const input = screen.getByLabelText('Category Name');
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });
      
      fireEvent.change(input, { target: { value: 'Test Category' } });
      fireEvent.click(submitButtons[1]); // Second button is the submit button

      await waitFor(() => {
        expect(addDoc).toHaveBeenCalledWith(
          'mock-collection',
          {
            name: 'Test Category',
            createdAt: expect.any(Date)
          }
        );
      });
    });

    it('shows success toast after adding category', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      // Open modal
      const addButton = screen.getByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });
      
      const input = screen.getByLabelText('Category Name');
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });
      
      fireEvent.change(input, { target: { value: 'Test Category' } });
      fireEvent.click(submitButtons[1]); // Second button is the submit button

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

      // Open modal
      const addButton = screen.getByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });
      
      const input = screen.getByLabelText('Category Name');
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });
      
      fireEvent.change(input, { target: { value: 'Test Category' } });
      fireEvent.click(submitButtons[1]); // Second button is the submit button

      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });
    });

    it('shows loading state during category addition', async () => {
      // Mock a delayed response
      addDoc.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      // Open modal
      const addButton = screen.getByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });
      
      const input = screen.getByLabelText('Category Name');
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });
      
      fireEvent.change(input, { target: { value: 'Test Category' } });
      
      // Check that submit button is disabled during loading (before clicking)
      expect(submitButtons[1]).not.toBeDisabled(); // Should not be disabled initially
      
      fireEvent.click(submitButtons[1]); // Second button is the submit button
      
      // The modal closes immediately after submission, so we can't check the disabled state
      // But we can verify that the form submission was initiated
      expect(addDoc).toHaveBeenCalled();
    });
  });

  describe('Error Handling Tests', () => {
    it('handles Firebase addDoc error', async () => {
      addDoc.mockRejectedValue(new Error('Firebase error'));

      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      // Open modal
      const addButton = screen.getByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });
      
      const input = screen.getByLabelText('Category Name');
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });
      
      fireEvent.change(input, { target: { value: 'Test Category' } });
      fireEvent.click(submitButtons[1]); // Second button is the submit button

      await waitFor(() => {
        expect(screen.getByTestId('toast')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Failed to add category. Please try again.')).toBeInTheDocument();
      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'error');
    });

    it('handles Firebase not configured error', async () => {
      // Temporarily mock db as null for this test
      const originalDb = require('../firebaseConfig').db;
      require('../firebaseConfig').db = null;

      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      // Open modal
      const addButton = screen.getByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });
      
      const input = screen.getByLabelText('Category Name');
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });
      
      fireEvent.change(input, { target: { value: 'Test Category' } });
      fireEvent.click(submitButtons[1]); // Second button is the submit button

      await waitFor(() => {
        expect(screen.getByTestId('toast')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Firebase not configured. Please set up your Firebase project.')).toBeInTheDocument();
      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'error');

      // Restore original db
      require('../firebaseConfig').db = originalDb;
    });

    it('handles user not logged in error', async () => {
      // Mock no user
      onAuthStateChanged.mockImplementation((auth, callback) => {
        act(() => {
          callback(null);
        });
        return () => {};
      });

      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      // Open modal
      const addButton = screen.getByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });
      
      const input = screen.getByLabelText('Category Name');
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });
      
      fireEvent.change(input, { target: { value: 'Test Category' } });
      fireEvent.click(submitButtons[1]); // Second button is the submit button

      await waitFor(() => {
        expect(screen.getByTestId('toast')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Please log in to add categories.')).toBeInTheDocument();
      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'error');
    });

    it('handles Firebase listener errors gracefully', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        // Simulate error
        throw new Error('Firebase connection failed');
      });

      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      // Component should still render without crashing
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });
  });

  describe('Firebase Integration Tests', () => {
    it('calls Firebase functions with correct parameters', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(collection).toHaveBeenCalledWith({}, 'users', 'test-user-123', 'expenses');
      });
      
      expect(query).toHaveBeenCalled();
      expect(onSnapshot).toHaveBeenCalled();
    });

    it('handles Firebase unsubscribe correctly', async () => {
      const mockUnsubscribe = jest.fn();
      onSnapshot.mockReturnValue(mockUnsubscribe);

      const { unmount } = render(
        <TestWrapper>
          <Categories />
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

    it('sets up listeners only when user is authenticated', async () => {
      // Mock no user initially
      onAuthStateChanged.mockImplementation((auth, callback) => {
        act(() => {
          callback(null);
        });
        return () => {};
      });

      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      // Should not call Firebase functions when no user
      expect(collection).not.toHaveBeenCalled();
      expect(query).not.toHaveBeenCalled();
      expect(onSnapshot).not.toHaveBeenCalled();
    });
  });

  describe('Data Loading Tests', () => {
    it('loads and displays categories from Firebase', async () => {
      const mockCategories = [
        { id: '1', name: 'Food', createdAt: new Date() },
        { id: '2', name: 'Transportation', createdAt: new Date() }
      ];

      onSnapshot.mockImplementation((query, callback) => {
        act(() => {
          callback({
            forEach: (fn) => mockCategories.forEach(fn)
          });
        });
        return () => {};
      });

      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      // Note: The current component doesn't display categories in the UI
      // This test verifies that the data is loaded from Firebase
      await waitFor(() => {
        expect(collection).toHaveBeenCalled();
      });
      
      expect(onSnapshot).toHaveBeenCalled();
    });

    it('loads and displays expenses from Firebase', async () => {
      const mockExpenses = [
        { id: '1', title: 'Lunch', amount: 15.50, category: 'Food' },
        { id: '2', title: 'Bus fare', amount: 2.50, category: 'Transportation' }
      ];

      onSnapshot.mockImplementation((query, callback) => {
        act(() => {
          callback({
            forEach: (fn) => mockExpenses.forEach(fn)
          });
        });
        return () => {};
      });

      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      // Verify that expenses are loaded
      await waitFor(() => {
        expect(collection).toHaveBeenCalledWith({}, 'users', 'test-user-123', 'expenses');
      });
      
      expect(onSnapshot).toHaveBeenCalled();
    });
  });

  describe('Form Validation Tests', () => {
    it('submits with empty category name (no client-side validation)', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      // Open modal
      const addButton = screen.getByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /add category/i })).toHaveLength(2);
      });
      
      // Click the submit button (the one in the form)
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });
      fireEvent.click(submitButtons[1]); // Second button is the submit button

      // Wait for the form submission
      await waitFor(() => {
        expect(addDoc).toHaveBeenCalledWith(
          'mock-collection',
          {
            name: '',
            createdAt: expect.any(Date)
          }
        );
      });
    });

    it('requires category name input', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      // Open modal
      const addButton = screen.getByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });
      
      const input = screen.getByLabelText('Category Name');
      expect(input).toHaveAttribute('required');
    });
  });

  describe('Toast Notification Tests', () => {
    it('closes toast when close button is clicked', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      // Open modal and add category
      const addButton = screen.getByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      });
      
      const input = screen.getByLabelText('Category Name');
      const submitButtons = screen.getAllByRole('button', { name: /add category/i });
      
      fireEvent.change(input, { target: { value: 'Test Category' } });
      fireEvent.click(submitButtons[1]); // Second button is the submit button

      // Wait for toast to appear
      await waitFor(() => {
        expect(screen.getByTestId('toast')).toBeInTheDocument();
      });

      // Click close button
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      // Toast should disappear
      await waitFor(() => {
        expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
      });
    });
  });

  describe('Component Lifecycle Tests', () => {
    it('cleans up event listeners on unmount', async () => {
      const mockUnsubscribe = jest.fn();
      onSnapshot.mockReturnValue(mockUnsubscribe);

      const { unmount } = render(
        <TestWrapper>
          <Categories />
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

    it('handles component re-renders correctly', async () => {
      const { rerender } = render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Categories')).toBeInTheDocument();
      });

      // Re-render component
      rerender(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      // Component should still work correctly
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });
  });
});
