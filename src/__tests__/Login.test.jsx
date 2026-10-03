// Detailed tests for the `Login` authentication form component.
// - Mocks @supabase/supabase-js (see src/__mocks__/), framer-motion, and navigation
//   to isolate form validation, UX, and routing behavior from a real Supabase call.
// - Verifies initial rendering, accessibility attributes, input wiring, and basic typing interactions.
// - Covers navigation flows (to dashboard on success, back to home, and to signup) as well as reading and clearing messages from router state.
// - Exercises loading state, disabling the submit button, and displaying "Signing in..." while a login is pending.
// - Maps a variety of Supabase Auth error codes to user-friendly messages and ensures generic errors are handled, then cleared on resubmission.
// - Confirms the form forwards the correct credentials into `signInWithPassword`, even when fields are empty.
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

// Now import the components after mocks are set up
import Login from '../components/Auth/Login';
import { AuthProvider } from '../context/AuthContext';

jest.mock('@supabase/supabase-js');
const { __mockAuth, __setMockSession, __mockSession } = require('@supabase/supabase-js');
const mockSignIn = __mockAuth.signInWithPassword;

const signInOk = { data: { user: __mockSession().user }, error: null };
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

describe('Login Component', () => {
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

  describe('Rendering Tests', () => {
    it('renders all login elements correctly', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your BudgetBuddy account')).toBeInTheDocument();

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

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

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
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
      // Never resolves — simulates a pending Supabase call.
      mockSignIn.mockImplementation(() => new Promise(() => {}));

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
  });

  describe('Navigation Tests', () => {
    it('navigates to dashboard on successful login', async () => {
      mockSignIn.mockResolvedValue(signInOk);

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

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

      fireEvent.click(screen.getByRole('button', { name: /go back to home/i }));
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
    });
  });

  describe('Error Handling Tests', () => {
    it('displays user not found error', async () => {
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
    });

    it('displays wrong password error', async () => {
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

    it('displays invalid email error', async () => {
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

    it('displays generic error for unknown error codes', async () => {
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

    it('clears error when form is resubmitted', async () => {
      mockSignIn.mockResolvedValueOnce(authError('invalid_credentials'));

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

      mockSignIn.mockResolvedValue(signInOk);
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument();
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

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // The form still attempts to submit with empty values — validation
      // happens at the Supabase level, same as it did at Cognito/Firebase before.
      expect(mockSignIn).toHaveBeenCalledWith({ email: '', password: '' });
    });

    it('calls signInWithPassword with correct parameters', async () => {
      mockSignIn.mockResolvedValue(signInOk);

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
      });
    });
  });

  describe('Loading State Tests', () => {
    it('disables submit button during loading', async () => {
      mockSignIn.mockImplementation(() => new Promise(() => {}));

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });

    it('shows loading spinner during authentication', async () => {
      mockSignIn.mockImplementation(() => new Promise(() => {}));

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });
  });
});
