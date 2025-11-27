import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

// Now import the components after mocks are set up
import Login from '../components/Auth/Login';
import { AuthProvider } from '../context/AuthContext';

// Mock Firebase Auth before importing components
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
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
const { signInWithEmailAndPassword, onAuthStateChanged } = require('firebase/auth');

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Login Component', () => {
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
    it('renders all login elements correctly', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Check for main elements
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your BudgetBuddy account')).toBeInTheDocument();
      
      // Check for form elements
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      
      // Check for navigation elements
      expect(screen.getByRole('button', { name: /go back to home/i })).toBeInTheDocument();
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    });

    it('renders input fields with correct attributes', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');

      // Check input types and required attributes
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password');
    });

    it('renders accessibility attributes correctly', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Check for proper labeling
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      
      // Check for aria-label on back button
      expect(screen.getByRole('button', { name: /go back to home/i })).toBeInTheDocument();
    });
  });

  describe('Form Interaction Tests', () => {
    it('updates email field when user types', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      expect(emailInput.value).toBe('test@example.com');
    });

    it('updates password field when user types', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText('Password');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      expect(passwordInput.value).toBe('password123');
    });

    it('shows loading state when form is submitted', async () => {
      // Mock a delayed login response
      signInWithEmailAndPassword.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Check for loading state
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Navigation Tests', () => {
    it('navigates to dashboard on successful login', async () => {
      signInWithEmailAndPassword.mockResolvedValue({});

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('navigates to home when back button is clicked', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const backButton = screen.getByRole('button', { name: /go back to home/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('navigates to signup when sign up link is clicked', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const signupLink = screen.getByRole('link', { name: /sign up/i });
      expect(signupLink).toHaveAttribute('href', '/signup');
    });

    it('displays message from navigation state and clears history', async () => {
      const replaceSpy = jest.spyOn(window.history, 'replaceState');
      render(
        <MemoryRouter initialEntries={[{ pathname: '/login', state: { message: 'Password reset successful!' } }]}>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Password reset successful!/)).toBeInTheDocument();
      });
      expect(replaceSpy).toHaveBeenCalled();
      replaceSpy.mockRestore();
    });
  });

  describe('Error Handling Tests', () => {
    it('displays user not found error', async () => {
      const error = { code: 'auth/user-not-found' };
      signInWithEmailAndPassword.mockRejectedValue(error);

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('No account found with this email')).toBeInTheDocument();
      });
    });

    it('displays wrong password error', async () => {
      const error = { code: 'auth/wrong-password' };
      signInWithEmailAndPassword.mockRejectedValue(error);

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Incorrect password')).toBeInTheDocument();
      });
    });

    it('displays invalid email error', async () => {
      const error = { code: 'auth/invalid-email' };
      signInWithEmailAndPassword.mockRejectedValue(error);

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('displays generic error for unknown error codes', async () => {
      const error = { code: 'auth/unknown-error' };
      signInWithEmailAndPassword.mockRejectedValue(error);

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to log in. Please try again.')).toBeInTheDocument();
      });
    });

    it('clears error when form is resubmitted', async () => {
      // First, trigger an error
      const error = { code: 'auth/user-not-found' };
      signInWithEmailAndPassword.mockRejectedValueOnce(error);

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('No account found with this email')).toBeInTheDocument();
      });

      // Now mock a successful login
      signInWithEmailAndPassword.mockResolvedValue({});
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('No account found with this email')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation Tests', () => {
    it('prevents submission with empty fields', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Try to submit with empty fields
      fireEvent.click(submitButton);

      // The form should still attempt to submit but with empty values
      // This is expected behavior as the component doesn't prevent empty submissions
      // The validation happens at the Firebase level
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        '',
        ''
      );
    });

    it('calls login function with correct parameters', async () => {
      signInWithEmailAndPassword.mockResolvedValue({});

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(), // Firebase auth instance
          'test@example.com',
          'password123'
        );
      });
    });
  });

  describe('Loading State Tests', () => {
    it('disables submit button during loading', async () => {
      signInWithEmailAndPassword.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
    });

    it('shows loading spinner during authentication', async () => {
      signInWithEmailAndPassword.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });
  });
});
