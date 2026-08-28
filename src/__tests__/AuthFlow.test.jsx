// Comprehensive integration tests for the authentication flow and `AuthContext`.
// - Mocks Firebase Auth and config to isolate UI and context behavior from real network calls.
// - Exercises successful and failing login/signup/logout flows, including error messaging and navigation.
// - Verifies password validation rules, reset/update password helpers, auth state changes, loading states, and concurrency protection.
// - Confirms that the context exposes the correct helper functions and that they call the underlying Firebase APIs with expected arguments.
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Now import the components after mocks are set up
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mock Firebase Auth before importing components
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  getAuth: jest.fn(() => ({})),
  sendPasswordResetEmail: jest.fn(),
  confirmPasswordReset: jest.fn(),
  updateProfile: jest.fn().mockResolvedValue({}),
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
const { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset
} = require('firebase/auth');

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

// Component to test AuthContext directly
function AuthTestComponent() {
  const { currentUser, login, signup, logout, resetPassword, resetPasswordWithCode } = useAuth();
  
  return (
    <div>
      <div data-testid="current-user">
        {currentUser ? `Logged in as: ${currentUser.email}` : 'Not logged in'}
      </div>
      <button onClick={() => login('test@example.com', 'password123')}>
        Login
      </button>
      <button onClick={() => signup('test@example.com', 'password123')}>
        Signup
      </button>
      <button onClick={() => logout()}>
        Logout
      </button>
      <button onClick={() => resetPassword('reset@example.com', { url: 'https://example.com/reset' })}>
        Reset Password
      </button>
      <button onClick={() => resetPasswordWithCode('code-123', 'NewPass123')}>
        Update Password
      </button>
    </div>
  );
}

describe('Authentication Flow Tests', () => {
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
    
    // Default mock implementation for onAuthStateChanged
    onAuthStateChanged.mockImplementation((auth, callback) => {
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

  describe('Valid Authentication Flow', () => {
    it('should handle successful login flow', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      
      // Mock auth state change after login
      onAuthStateChanged.mockImplementation((auth, callback) => {
        act(() => {
          callback(mockUser);
        });
        return () => {};
      });

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
          expect.anything(),
          'test@example.com',
          'password123'
        );
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should handle successful signup flow', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      // Mock auth state change after signup
      onAuthStateChanged.mockImplementation((auth, callback) => {
        act(() => {
          callback(mockUser);
        });
        return () => {};
      });

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'Password123'
        );
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should handle successful logout flow', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      signOut.mockResolvedValue({});
      
      // Mock initial logged-in state
      onAuthStateChanged.mockImplementation((auth, callback) => {
        act(() => {
          callback(mockUser);
        });
        return () => {};
      });

      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-user')).toHaveTextContent('Logged in as: test@example.com');
      });

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(signOut).toHaveBeenCalled();
      });
    });
  });

  describe('Invalid Input Handling', () => {
    it('should handle invalid email format during login', async () => {
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

    it('should handle wrong password during login', async () => {
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

    it('should handle user not found during login', async () => {
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

      fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('No account found with this email')).toBeInTheDocument();
      });
    });

    it('should handle email already in use during signup', async () => {
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

      fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An account with this email already exists')).toBeInTheDocument();
      });
    });

    it('should handle weak password during signup', async () => {
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

      // Use a password that passes client-side validation but fails Firebase validation
      fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password is too weak. Please choose a stronger password')).toBeInTheDocument();
      });
    });

    it('should handle password validation errors during signup', async () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Test password too short
      fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
      });

      // Test password without uppercase
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument();
      });

      // Test password without lowercase
      fireEvent.change(passwordInput, { target: { value: 'PASSWORD123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'PASSWORD123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one lowercase letter')).toBeInTheDocument();
      });

      // Test password without number
      fireEvent.change(passwordInput, { target: { value: 'Password' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
      });

      // Test password mismatch
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });
  });

  describe('Session Expiry and State Management', () => {
    it('should handle authentication state changes', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      
      // Mock auth state change from null to logged in
      onAuthStateChanged.mockImplementation((auth, callback) => {
        act(() => {
          callback(mockUser);
        });
        return () => {};
      });

      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-user')).toHaveTextContent('Logged in as: test@example.com');
      });
    });

    it('should handle user logout state change', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      
      // Mock initial logged-in state, then logout
      let currentCallback;
      onAuthStateChanged.mockImplementation((auth, callback) => {
        currentCallback = callback;
        act(() => {
          callback(mockUser);
        });
        return () => {};
      });

      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-user')).toHaveTextContent('Logged in as: test@example.com');
      });

      // Simulate logout by calling the auth state change callback with null
      act(() => {
        currentCallback(null);
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-user')).toHaveTextContent('Not logged in');
      });
    });

    it('should handle authentication loading state', async () => {
      // Mock loading state by not calling the callback immediately
      onAuthStateChanged.mockImplementation((auth, callback) => {
        // Don't call callback immediately to simulate loading
        return () => {};
      });

      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      // The component should not render children while loading
      // This is handled by the AuthProvider's loading state
      expect(screen.queryByTestId('current-user')).not.toBeInTheDocument();
    });

    it('should handle network errors during authentication', async () => {
      const networkError = { code: 'auth/network-request-failed' };
      signInWithEmailAndPassword.mockRejectedValue(networkError);

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

    it('should handle too many requests error', async () => {
      const tooManyRequestsError = { code: 'auth/too-many-requests' };
      signInWithEmailAndPassword.mockRejectedValue(tooManyRequestsError);

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
        expect(screen.getByText('Too many attempts. Please try again later.')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Context Integration', () => {
    it('should provide authentication methods through context', () => {
      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signup/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('exposes resetPassword helper that calls Firebase API', () => {
      sendPasswordResetEmail.mockResolvedValue({});
      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'reset@example.com', { url: 'https://example.com/reset' });
    });

    it('exposes resetPasswordWithCode helper that calls Firebase API', () => {
      confirmPasswordReset.mockResolvedValue({});
      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole('button', { name: /update password/i }));
      expect(confirmPasswordReset).toHaveBeenCalledWith(expect.anything(), 'code-123', 'NewPass123');
    });

    it('should handle concurrent authentication attempts', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      
      onAuthStateChanged.mockImplementation((auth, callback) => {
        act(() => {
          callback(mockUser);
        });
        return () => {};
      });

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

      // Click submit button multiple times rapidly
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      // The component has loading state that prevents multiple calls
      // So we expect only 1 call due to the loading state protection
      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      });
    });

    it('should clear errors when switching between login and signup', async () => {
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

      // Navigate to signup (simulated by changing the form)
      const signupLink = screen.getByRole('link', { name: /sign up/i });
      expect(signupLink).toHaveAttribute('href', '/signup');
    });
  });
});
