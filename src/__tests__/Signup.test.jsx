// Detailed tests for the `Signup` registration form component.
// - Mocks Firebase Auth, config, framer-motion, and navigation to isolate validation and UX behavior from external services.
// - Verifies initial rendering, accessibility attributes, password visibility toggles (click + keyboard), and basic typing interactions.
// - Exercises password strength validation rules (length, uppercase, lowercase, numeric, confirm match) and appropriate error messages.
// - Confirms successful signups navigate to the dashboard and that navigation helpers (back to home, link to login) point to the right routes.
// - Maps various Firebase error codes (email in use, invalid email, weak password) to human-readable errors, including a generic fallback.
// - Checks loading state during signup, disabling the submit button, and that calling signup uses the correct arguments.
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Now import the components after mocks are set up
import Signup from '../components/Auth/Signup';
import { AuthProvider } from '../context/AuthContext';

// Mock Firebase Auth before importing components
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn(),
  getAuth: jest.fn(() => ({})),
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
    button: ({ children, ...props }) => {
      const { whileHover, whileTap, ...restProps } = props;
      return <button {...restProps}>{children}</button>;
    },
  },
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Get the mocked functions
const { createUserWithEmailAndPassword, onAuthStateChanged } = require('firebase/auth');

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Suppress console warnings for cleaner test output
    jest.spyOn(console, 'error').mockImplementation((message) => {
      if (message.includes('Warning: An update to') || 
          message.includes('ReactDOMTestUtils.act') ||
          message.includes('React Router Future Flag')) {
        return;
      }
      console.error(message);
    });
    
    jest.spyOn(console, 'warn').mockImplementation((message) => {
      if (message.includes('React Router Future Flag')) {
        return;
      }
      console.warn(message);
    });
    
    onAuthStateChanged.mockImplementation((auth, callback) => {
      // Use act to wrap the callback to prevent warnings
      act(() => {
      callback(null); // No user initially
      });
      return () => {}; // Return unsubscribe function
    });
  });

  afterEach(() => {
    // Restore console methods
    console.error.mockRestore();
    console.warn.mockRestore();
  });

  describe('Rendering Tests', () => {
    it('renders all signup elements correctly', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      // Check for main elements
      expect(screen.getByText('Join FinTrack')).toBeInTheDocument();
      expect(screen.getByText('Create your account and start tracking your finances')).toBeInTheDocument();
      
      // Check for form elements
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      
      // Check for navigation elements
      expect(screen.getByRole('button', { name: /go back to home/i })).toBeInTheDocument();
      expect(screen.getByText('Already have an account?')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders input fields with correct attributes', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      // Check input types and required attributes
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('placeholder', 'Create a strong password');

      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('placeholder', 'Re-enter your password');
    });

    it('renders accessibility attributes correctly', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      // Check for proper labeling
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      
      // Check for aria-label on back button
      expect(screen.getByRole('button', { name: /go back to home/i })).toBeInTheDocument();
      
      // Check for password visibility toggles
      expect(screen.getAllByRole('button', { name: /show password/i })).toHaveLength(2);
    });
  });

  describe('Form Interaction Tests', () => {
    it('updates email field when user types', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      expect(emailInput.value).toBe('test@example.com');
    });

    it('updates password field when user types', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText('Password');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      expect(passwordInput.value).toBe('password123');
    });

    it('updates confirm password field when user types', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      expect(confirmPasswordInput.value).toBe('password123');
    });

    it('toggles password visibility when eye icon is clicked', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = screen.getAllByRole('button', { name: /show password/i })[0];
      
      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle button
      fireEvent.click(toggleButton);
      
      // Password should now be visible
      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('toggles confirm password visibility when eye icon is clicked', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const toggleButton = screen.getAllByRole('button', { name: /show password/i })[1];
      
      // Initially password should be hidden
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      
      // Click toggle button
      fireEvent.click(toggleButton);
      
      // Password should now be visible
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });

    it('shows loading state when form is submitted', async () => {
      // Mock a delayed signup response
      createUserWithEmailAndPassword.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      // Check for loading state
      expect(screen.getByText('Creating account...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Password Validation Tests', () => {
    it('validates password length requirement', async () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
      });
    });

    it('validates password uppercase requirement', async () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument();
      });
    });

    it('validates password lowercase requirement', async () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'PASSWORD123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'PASSWORD123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one lowercase letter')).toBeInTheDocument();
      });
    });

    it('validates password number requirement', async () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
      });
    });

    it('validates password confirmation match', async () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Tests', () => {
    it('navigates to dashboard on successful signup', async () => {
      createUserWithEmailAndPassword.mockResolvedValue({});

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('navigates to home when back button is clicked', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const backButton = screen.getByRole('button', { name: /go back to home/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('navigates to login when sign in link is clicked', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const signInLink = screen.getByRole('link', { name: /sign in/i });
      expect(signInLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Error Handling Tests', () => {
    it('displays email already in use error', async () => {
      const error = { code: 'auth/email-already-in-use' };
      createUserWithEmailAndPassword.mockRejectedValue(error);

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An account with this email already exists')).toBeInTheDocument();
      });
    });

    it('displays invalid email error', async () => {
      const error = { code: 'auth/invalid-email' };
      createUserWithEmailAndPassword.mockRejectedValue(error);

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('displays weak password error', async () => {
      const error = { code: 'auth/weak-password' };
      createUserWithEmailAndPassword.mockRejectedValue(error);

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password is too weak. Please choose a stronger password')).toBeInTheDocument();
      });
    });

    it('displays generic error for unknown error codes', async () => {
      const error = { code: 'auth/unknown-error' };
      createUserWithEmailAndPassword.mockRejectedValue(error);

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create an account')).toBeInTheDocument();
      });
    });

    it('clears error when form is resubmitted', async () => {
      // First, trigger an error
      const error = { code: 'auth/email-already-in-use' };
      createUserWithEmailAndPassword.mockRejectedValueOnce(error);

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An account with this email already exists')).toBeInTheDocument();
      });

      // Now mock a successful signup
      createUserWithEmailAndPassword.mockResolvedValue({});
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('An account with this email already exists')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation Tests', () => {
    it('calls signup function with correct parameters', async () => {
      createUserWithEmailAndPassword.mockResolvedValue({});

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(), // Firebase auth instance
          'test@example.com',
          'Password123'
        );
      });
    });
  });

  describe('Loading State Tests', () => {
    it('disables submit button during loading', async () => {
      createUserWithEmailAndPassword.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
    });

    it('shows loading spinner during authentication', async () => {
      createUserWithEmailAndPassword.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Creating account...')).toBeInTheDocument();
    });
  });

  describe('Password Visibility Toggle Tests', () => {
    it('toggles password visibility with keyboard navigation', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = screen.getAllByRole('button', { name: /show password/i })[0];
      
      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Press Enter key on toggle button
      toggleButton.focus();
      fireEvent.keyDown(toggleButton, { key: 'Enter' });
      
      // Password should now be visible
      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('toggles password visibility with space key', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = screen.getAllByRole('button', { name: /show password/i })[0];
      
      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Press Space key (space character) on toggle button
      toggleButton.focus();
      fireEvent.keyDown(toggleButton, { key: ' ', code: 'Space', charCode: 32, keyCode: 32 });
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Toggle back to hidden and trigger Space string variant
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
      fireEvent.keyDown(toggleButton, { key: 'Space', code: 'Space', charCode: 32, keyCode: 32 });
      
      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('toggles confirm password visibility with keyboard navigation', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const toggleButton = screen.getAllByRole('button', { name: /show password/i })[1];

      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      toggleButton.focus();
      fireEvent.keyDown(toggleButton, { key: 'Enter' });
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });

    it('toggles confirm password visibility with space key', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const toggleButton = screen.getAllByRole('button', { name: /show password/i })[1];

      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      toggleButton.focus();
      fireEvent.keyDown(toggleButton, { key: ' ', code: 'Space', charCode: 32, keyCode: 32 });
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');

      fireEvent.click(toggleButton);
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      fireEvent.keyDown(toggleButton, { key: 'Space', code: 'Space', charCode: 32, keyCode: 32 });
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });

    it('ignores non-activation keys on password toggle', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = screen.getAllByRole('button', { name: /show password/i })[0];

      expect(passwordInput).toHaveAttribute('type', 'password');
      toggleButton.focus();
      fireEvent.keyDown(toggleButton, { key: 'Escape' });
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('ignores non-activation keys on confirm password toggle', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const toggleButton = screen.getAllByRole('button', { name: /show password/i })[1];

      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      toggleButton.focus();
      fireEvent.keyDown(toggleButton, { key: 'Escape' });
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });
});
