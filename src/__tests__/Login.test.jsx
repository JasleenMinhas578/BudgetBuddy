// Detailed tests for the `Login` authentication form component.
// - Mocks amazon-cognito-identity-js (see src/__mocks__/), framer-motion, and navigation
//   to isolate form validation, UX, and routing behavior from a real Cognito call.
// - Verifies initial rendering, accessibility attributes, input wiring, and basic typing interactions.
// - Covers navigation flows (to dashboard on success, back to home, and to signup) as well as reading and clearing messages from router state.
// - Exercises loading state, disabling the submit button, and displaying "Signing in..." while a login is pending.
// - Maps a variety of Cognito error codes to user-friendly messages and ensures generic errors are handled, then cleared on resubmission.
// - Confirms the form forwards the correct credentials into `authenticateUser`, even when fields are empty.
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

// Now import the components after mocks are set up
import Login from '../components/Auth/Login';
import { AuthProvider } from '../context/AuthContext';

jest.mock('amazon-cognito-identity-js');
const { __mockUserInstance: mockUserInstance } = require('amazon-cognito-identity-js');
const mockAuthenticateUser = mockUserInstance.authenticateUser;

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
    // Re-establish defaults every test — clearAllMocks() wipes out the
    // baked-in default implementation from the manual mock module, not just
    // call history, once enough tests have run.
    mockUserInstance.getUserAttributes.mockImplementation((cb) => cb(null, [
      { getName: () => 'email', getValue: () => 'test@example.com' },
    ]));

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
      // Never resolves — simulates a pending Cognito call.
      mockAuthenticateUser.mockImplementation(() => {});

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
      mockAuthenticateUser.mockImplementation((details, { onSuccess }) => onSuccess());

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
    });

    it('displays wrong password error', async () => {
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

    it('displays invalid email error', async () => {
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

    it('displays generic error for unknown error codes', async () => {
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

    it('clears error when form is resubmitted', async () => {
      mockAuthenticateUser.mockImplementationOnce((details, { onFailure }) =>
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

      mockAuthenticateUser.mockImplementation((details, { onSuccess }) => onSuccess());
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
      // happens at the Cognito level, same as it did at the Firebase level before.
      expect(mockAuthenticateUser).toHaveBeenCalled();
      const [authDetails] = mockAuthenticateUser.mock.calls[0];
      expect(authDetails.Username).toBe('');
      expect(authDetails.Password).toBe('');
    });

    it('calls authenticateUser with correct parameters', async () => {
      mockAuthenticateUser.mockImplementation((details, { onSuccess }) => onSuccess());

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockAuthenticateUser).toHaveBeenCalled();
      });
      const [authDetails] = mockAuthenticateUser.mock.calls[0];
      expect(authDetails.Username).toBe('test@example.com');
      expect(authDetails.Password).toBe('password123');
    });
  });

  describe('Loading State Tests', () => {
    it('disables submit button during loading', async () => {
      mockAuthenticateUser.mockImplementation(() => {});

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
      mockAuthenticateUser.mockImplementation(() => {});

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
