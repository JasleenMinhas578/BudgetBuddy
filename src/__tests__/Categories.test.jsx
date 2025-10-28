import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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
  addDoc: jest.fn(),
}));

// Mock Firebase config
jest.mock('../firebaseConfig', () => ({
  auth: {},
  db: {},
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

// Now import the components after mocks are set up
import Categories from '../components/Dashboard/Categories';
import { AuthProvider } from '../context/AuthContext';

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
        expect(screen.getByText('Analyze your spending by category')).toBeInTheDocument();
        expect(screen.getByText('Add Category')).toBeInTheDocument();
      });
    });

    it('renders with proper component structure', async () => {
      render(
        <TestWrapper>
          <Categories />
        </TestWrapper>
      );

      await waitFor(() => {
        // Check main container
        expect(screen.getByText('Categories')).toBeInTheDocument();
        
        // Check section subtitle
        expect(screen.getByText('Analyze your spending by category')).toBeInTheDocument();
        
        // Check add button
        expect(screen.getByText('Add Category')).toBeInTheDocument();
      });
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
        expect(screen.getByText('Add New Category')).toBeInTheDocument();
      });
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
        expect(screen.getByPlaceholderText('Enter category name')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /add category/i })).toHaveLength(2);
      });
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
        const input = screen.getByLabelText('Category Name');
        fireEvent.change(input, { target: { value: 'Test Category' } });
        expect(input.value).toBe('Test Category');
      });
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
        const input = screen.getByLabelText('Category Name');
        fireEvent.change(input, { target: { value: 'Test Category' } });
        expect(input.value).toBe('Test Category');
      });

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

 });