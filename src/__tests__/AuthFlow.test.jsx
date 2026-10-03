// Comprehensive integration tests for the authentication flow and `AuthContext`.
// - Mocks `@supabase/supabase-js` to isolate UI and context behavior from a real Supabase call.
// - Exercises successful and failing login/signup/logout flows, including error messaging and navigation.
// - Verifies password validation rules, reset/update password helpers, session restore, loading states, and concurrency protection.
// - Confirms the context exposes the correct helper functions and that they call the underlying Supabase Auth APIs with expected arguments.
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Now import the components after mocks are set up
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';
import { AuthProvider, useAuth } from '../context/AuthContext';

// See src/__mocks__/@supabase/supabase-js.js for how session state and the
// auth action mocks are set up.
jest.mock('@supabase/supabase-js');
const { __mockAuth, __setMockSession, __mockSession } = require('@supabase/supabase-js');
const mockSignUp = __mockAuth.signUp;
const mockSignIn = __mockAuth.signInWithPassword;

const ok = { data: {}, error: null };
const signInOk = { data: { user: __mockSession().user }, error: null };
// "Confirm email" on: a user comes back but no session until the code is entered.
const signUpNeedsConfirm = {
  data: { user: { ...__mockSession().user, identities: [{}] }, session: null },
  error: null,
};
const authError = (code) => ({ data: {}, error: { code } });

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
  const {
    currentUser, login, signup, logout, resetPassword, updatePassword, updateDisplayName,
  } = useAuth();

  return (
    <div>
      <div data-testid="current-user">
        {currentUser ? `Logged in as: ${currentUser.email}` : 'Not logged in'}
      </div>
      <div data-testid="display-name">{currentUser?.displayName}</div>
      <button onClick={() => updateDisplayName('New Name')}>
        Rename
      </button>
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
      <button onClick={() => updatePassword('NewPass123!')}>
        Update Password
      </button>
    </div>
  );
}

describe('Authentication Flow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __setMockSession(null);

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
      mockSignIn.mockResolvedValue(signInOk);

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
        expect(mockSignIn).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should handle successful signup flow (navigates to email confirmation)', async () => {
      mockSignUp.mockResolvedValue(signUpNeedsConfirm);

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
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123!',
          options: {
            data: { name: 'Test User', home_currency: 'USD' },
            emailRedirectTo: 'http://localhost/confirm-signup',
          },
        });
      });

      // With "Confirm email" on, Supabase returns no session until the
      // emailed code is entered — signup doesn't land in the dashboard yet.
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/confirm-signup', { state: { email: 'test@example.com' } });
      });
    });

    it('should handle successful logout flow', async () => {
      __setMockSession(__mockSession());

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
      mockSignIn.mockResolvedValue(authError('validation_failed'));

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
      mockSignIn.mockResolvedValue(authError('invalid_credentials'));

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
      mockSignIn.mockResolvedValue(authError('invalid_credentials'));

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
      mockSignIn.mockResolvedValue(authError('email_not_confirmed'));

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
      mockSignUp.mockResolvedValue(authError('user_already_exists'));

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

    it('should handle weak password rejected by Supabase during signup', async () => {
      mockSignUp.mockResolvedValue(authError('weak_password'));

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

      // Test password without special character (kept from the Cognito-era policy)
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
      __setMockSession(__mockSession());

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
      // No INITIAL_SESSION event yet — simulates a still-pending session check.
      __setMockSession(undefined);

      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      // AuthProvider only renders children once loading resolves.
      expect(screen.queryByTestId('current-user')).not.toBeInTheDocument();
    });

    it('should log out when the session ends outside the app (e.g. refresh token revoked)', async () => {
      __setMockSession(__mockSession());

      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-user')).toHaveTextContent('Logged in as: test@example.com');
      });

      act(() => __setMockSession(null));

      await waitFor(() => {
        expect(screen.getByTestId('current-user')).toHaveTextContent('Not logged in');
      });
    });

    it('should handle a generic Supabase failure during login', async () => {
      mockSignIn.mockResolvedValue(authError('unexpected_failure'));

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
      mockSignIn.mockResolvedValue(authError('over_request_rate_limit'));

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

    it('exposes resetPassword helper that calls the Supabase API', () => {
      __mockAuth.resetPasswordForEmail.mockResolvedValue(ok);
      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(__mockAuth.resetPasswordForEmail).toHaveBeenCalledWith('reset@example.com', {
        redirectTo: 'http://localhost/reset-password',
      });
    });

    it('exposes updatePassword helper that sets the new password, then signs out', async () => {
      __mockAuth.updateUser.mockResolvedValue(signInOk);
      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole('button', { name: /update password/i }));
      await waitFor(() => {
        expect(__mockAuth.updateUser).toHaveBeenCalledWith({ password: 'NewPass123!' });
      });
      await waitFor(() => {
        expect(__mockAuth.signOut).toHaveBeenCalled();
      });
    });

    it('refreshes the session after a display-name change so the API sees the new name', async () => {
      __setMockSession(__mockSession({ name: 'Old Name' }));
      __mockAuth.updateUser.mockResolvedValue(signInOk);
      __mockAuth.refreshSession.mockResolvedValue(ok);
      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole('button', { name: /rename/i }));

      await waitFor(() => {
        expect(screen.getByTestId('display-name')).toHaveTextContent('New Name');
      });
      expect(__mockAuth.updateUser).toHaveBeenCalledWith({ data: { name: 'New Name' } });
      expect(__mockAuth.refreshSession).toHaveBeenCalled();
    });

    it('should handle concurrent authentication attempts', async () => {
      mockSignIn.mockResolvedValue(signInOk);

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
        expect(mockSignIn).toHaveBeenCalledTimes(1);
      });
    });

    it('should link to the signup page from login', async () => {
      mockSignIn.mockResolvedValue(authError('invalid_credentials'));

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
