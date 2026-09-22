// Comprehensive integration tests for the authentication flow and `AuthContext`.
// - Mocks `amazon-cognito-identity-js` to isolate UI and context behavior from a real Cognito call.
// - Exercises successful and failing login/signup/logout flows, including error messaging and navigation.
// - Verifies password validation rules, reset/update password helpers, session restore, loading states, and concurrency protection.
// - Confirms the context exposes the correct helper functions and that they call the underlying Cognito APIs with expected arguments.
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Now import the components after mocks are set up
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';
import { AuthProvider, useAuth } from '../context/AuthContext';

// See src/__mocks__/amazon-cognito-identity-js.js for why this is a manual
// mock using real classes rather than an inline jest.fn() factory.
jest.mock('amazon-cognito-identity-js');
const cognitoMock = require('amazon-cognito-identity-js');
const mockSignUp = cognitoMock.__mockUserPoolInstance.signUp;
const mockGetCurrentUser = cognitoMock.__mockUserPoolInstance.getCurrentUser;
const mockAuthenticateUser = cognitoMock.__mockUserInstance.authenticateUser;
const mockForgotPassword = cognitoMock.__mockUserInstance.forgotPassword;
const mockConfirmPassword = cognitoMock.__mockUserInstance.confirmPassword;
const mockGetUserAttributes = cognitoMock.__mockUserInstance.getUserAttributes;
const mockGetSession = cognitoMock.__mockUserInstance.getSession;

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
      <button onClick={() => signup('test@example.com', 'Password123!', 'Test User')}>
        Signup
      </button>
      <button onClick={() => logout()}>
        Logout
      </button>
      <button onClick={() => resetPassword('reset@example.com')}>
        Reset Password
      </button>
      <button onClick={() => resetPasswordWithCode('reset@example.com', '123456', 'NewPass123!')}>
        Update Password
      </button>
    </div>
  );
}

describe('Authentication Flow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockReturnValue(null);
    mockGetUserAttributes.mockImplementation((cb) => cb(null, [
      { getName: () => 'email', getValue: () => 'test@example.com' },
    ]));
    mockGetSession.mockImplementation((cb) => cb(null, { isValid: () => true }));

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
  });

  afterEach(() => {
    console.error.mockRestore();
    console.warn.mockRestore();
  });

  describe('Valid Authentication Flow', () => {
    it('should handle successful login flow', async () => {
      mockAuthenticateUser.mockImplementation((details, { onSuccess }) => onSuccess());

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
        expect(mockAuthenticateUser).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should handle successful signup flow (navigates to email confirmation)', async () => {
      mockSignUp.mockImplementation((email, password, attrs, _, callback) => {
        callback(null, { userSub: '123' });
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
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          'test@example.com',
          'Password123!',
          expect.anything(),
          null,
          expect.any(Function)
        );
      });

      // Cognito requires confirming an emailed code before login — unlike
      // Firebase, signup does not land the user in the dashboard directly.
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/confirm-signup', { state: { email: 'test@example.com' } });
      });
    });

    it('should handle successful logout flow', async () => {
      mockGetCurrentUser.mockReturnValue({
        getSession: mockGetSession,
        getUserAttributes: mockGetUserAttributes,
        signOut: cognitoMock.__mockUserInstance.signOut,
        getUsername: () => 'mock-uid',
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
        expect(screen.getByTestId('current-user')).toHaveTextContent('Not logged in');
      });
    });
  });

  describe('Invalid Input Handling', () => {
    it('should handle invalid email format during login', async () => {
      mockAuthenticateUser.mockImplementation((details, { onFailure }) =>
        onFailure({ code: 'InvalidParameterException' })
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'invalid-email' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should handle wrong password during login', async () => {
      mockAuthenticateUser.mockImplementation((details, { onFailure }) =>
        onFailure({ code: 'NotAuthorizedException' })
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });
    });

    it('should handle user not found during login', async () => {
      mockAuthenticateUser.mockImplementation((details, { onFailure }) =>
        onFailure({ code: 'UserNotFoundException' })
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'nonexistent@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });
    });

    it('should redirect to confirmation page if login is attempted before confirming email', async () => {
      mockAuthenticateUser.mockImplementation((details, { onFailure }) =>
        onFailure({ code: 'UserNotConfirmedException' })
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'unconfirmed@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/confirm-signup', { state: { email: 'unconfirmed@example.com' } });
      });
    });

    it('should handle email already in use during signup', async () => {
      mockSignUp.mockImplementation((email, password, attrs, _, callback) =>
        callback({ code: 'UsernameExistsException' })
      );

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'existing@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Password123!' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('An account with this email already exists')).toBeInTheDocument();
      });
    });

    it('should handle weak password rejected by Cognito during signup', async () => {
      mockSignUp.mockImplementation((email, password, attrs, _, callback) =>
        callback({ code: 'InvalidPasswordException' })
      );

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Password123!' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

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

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });

      // Test password too short
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
      });

      // Test password without uppercase
      fireEvent.change(passwordInput, { target: { value: 'password123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123!' } });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument();
      });

      // Test password without lowercase
      fireEvent.change(passwordInput, { target: { value: 'PASSWORD123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'PASSWORD123!' } });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one lowercase letter')).toBeInTheDocument();
      });

      // Test password without number
      fireEvent.change(passwordInput, { target: { value: 'Password!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password!' } });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
      });

      // Test password without special character (matches Cognito's default policy)
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one special character')).toBeInTheDocument();
      });

      // Test password mismatch
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123!' } });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });
  });

  describe('Session Restore and State Management', () => {
    it('should restore an already-logged-in session on load', async () => {
      mockGetCurrentUser.mockReturnValue({
        getSession: mockGetSession,
        getUserAttributes: mockGetUserAttributes,
        signOut: cognitoMock.__mockUserInstance.signOut,
        getUsername: () => 'mock-uid',
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

    it('should show nothing while the session check is still pending', () => {
      // getSession never calls back — simulates a still-pending session check.
      mockGetCurrentUser.mockReturnValue({ getSession: jest.fn() });

      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      // AuthProvider only renders children once loading resolves.
      expect(screen.queryByTestId('current-user')).not.toBeInTheDocument();
    });

    it('should treat an invalid persisted session as logged out', async () => {
      mockGetCurrentUser.mockReturnValue({
        getSession: (cb) => cb(null, { isValid: () => false }),
      });

      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-user')).toHaveTextContent('Not logged in');
      });
    });

    it('should handle a generic Cognito failure during login', async () => {
      mockAuthenticateUser.mockImplementation((details, { onFailure }) =>
        onFailure({ code: 'InternalErrorException' })
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Failed to log in. Please try again.')).toBeInTheDocument();
      });
    });

    it('should handle too many requests error', async () => {
      mockAuthenticateUser.mockImplementation((details, { onFailure }) =>
        onFailure({ code: 'LimitExceededException' })
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

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

    it('exposes resetPassword helper that calls the Cognito API', () => {
      mockForgotPassword.mockImplementation(({ onSuccess }) => onSuccess());
      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(mockForgotPassword).toHaveBeenCalledWith(
        expect.objectContaining({ onSuccess: expect.any(Function) })
      );
    });

    it('exposes resetPasswordWithCode helper that calls the Cognito API', () => {
      mockConfirmPassword.mockImplementation((code, password, { onSuccess }) => onSuccess());
      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole('button', { name: /update password/i }));
      expect(mockConfirmPassword).toHaveBeenCalledWith(
        '123456',
        'NewPass123!',
        expect.objectContaining({ onSuccess: expect.any(Function) })
      );
    });

    it('should handle concurrent authentication attempts', async () => {
      mockAuthenticateUser.mockImplementation((details, { onSuccess }) => onSuccess());

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      // Click submit button multiple times rapidly — loading state should
      // prevent duplicate calls.
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthenticateUser).toHaveBeenCalledTimes(1);
      });
    });

    it('should link to the signup page from login', async () => {
      mockAuthenticateUser.mockImplementation((details, { onFailure }) =>
        onFailure({ code: 'UserNotFoundException' })
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });

      const signupLink = screen.getByRole('link', { name: /sign up/i });
      expect(signupLink).toHaveAttribute('href', '/signup');
    });
  });
});
