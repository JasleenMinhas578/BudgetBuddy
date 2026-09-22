// Detailed tests for the `Signup` registration form component.
// - Mocks amazon-cognito-identity-js (see src/__mocks__/), framer-motion, and navigation
//   to isolate validation and UX behavior from a real Cognito call.
// - Verifies initial rendering, accessibility attributes, password visibility toggles (click + keyboard), and basic typing interactions.
// - Exercises password strength validation rules (length, uppercase, lowercase, numeric, special character, confirm match) and appropriate error messages.
// - Confirms successful signups navigate to the email-confirmation page (Cognito requires this; Firebase didn't) and that navigation helpers (back to home, link to login) point to the right routes.
// - Maps various Cognito error codes (username exists, invalid parameter, weak password) to human-readable errors, including a generic fallback.
// - Checks loading state during signup, disabling the submit button, and that calling signUp uses the correct arguments.
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Now import the components after mocks are set up
import Signup from '../components/Auth/Signup';
import { AuthProvider } from '../context/AuthContext';

jest.mock('amazon-cognito-identity-js');
const { __mockUserPoolInstance: mockUserPoolInstance } = require('amazon-cognito-identity-js');
const mockSignUp = mockUserPoolInstance.signUp;

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

// Fill the displayName field (required before form submission since it was added after the tests were written)
const fillDisplayName = (name = 'Test User') =>
  fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: name } });

// Cognito's default password policy requires a special character, which
// src/utils/validatePassword.js now also enforces client-side — every
// "should succeed" password in these tests needs one.
const VALID_PASSWORD = 'Password123!';

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignUp.mockImplementation((email, password, attrs, _, callback) => {
      callback(null, { userSub: 'mock-sub' });
    });

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
    it('renders all signup elements correctly', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      expect(screen.getByText('Join BudgetBuddy')).toBeInTheDocument();
      expect(screen.getByText('Create your account and start tracking your finances')).toBeInTheDocument();

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();

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

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go back to home/i })).toBeInTheDocument();
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

      expect(passwordInput).toHaveAttribute('type', 'password');
      fireEvent.click(toggleButton);
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

      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      fireEvent.click(toggleButton);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });

    it('shows loading state when form is submitted', async () => {
      mockSignUp.mockImplementation(() => {}); // never calls back — simulates pending

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: VALID_PASSWORD } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: VALID_PASSWORD } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText('Creating account...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });
  });

  describe('Password Validation Tests', () => {
    it('validates password length requirement', async () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'short' } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

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

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123!' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123!' } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

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

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'PASSWORD123!' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'PASSWORD123!' } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

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

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password!' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Password!' } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
      });
    });

    it('validates password special character requirement', async () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Password123' } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one special character')).toBeInTheDocument();
      });
    });

    it('validates password confirmation match', async () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: VALID_PASSWORD } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'DifferentPassword123!' } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Tests', () => {
    it('navigates to email confirmation on successful signup', async () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: VALID_PASSWORD } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: VALID_PASSWORD } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      // Cognito requires confirming an emailed code before login — unlike
      // Firebase, signup does not land the user in the dashboard directly.
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/confirm-signup', { state: { email: 'test@example.com' } });
      });
    });

    it('navigates to home when back button is clicked', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole('button', { name: /go back to home/i }));
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
      mockSignUp.mockImplementation((email, password, attrs, _, callback) =>
        callback({ code: 'UsernameExistsException' })
      );

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: VALID_PASSWORD } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: VALID_PASSWORD } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('An account with this email already exists')).toBeInTheDocument();
      });
    });

    it('displays invalid email error', async () => {
      mockSignUp.mockImplementation((email, password, attrs, _, callback) =>
        callback({ code: 'InvalidParameterException' })
      );

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'invalid-email' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: VALID_PASSWORD } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: VALID_PASSWORD } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('displays weak password error rejected by Cognito', async () => {
      mockSignUp.mockImplementation((email, password, attrs, _, callback) =>
        callback({ code: 'InvalidPasswordException' })
      );

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: VALID_PASSWORD } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: VALID_PASSWORD } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Password is too weak. Please choose a stronger password')).toBeInTheDocument();
      });
    });

    it('displays generic error for unknown error codes', async () => {
      mockSignUp.mockImplementation((email, password, attrs, _, callback) =>
        callback({ code: 'InternalErrorException' })
      );

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: VALID_PASSWORD } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: VALID_PASSWORD } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Failed to create an account')).toBeInTheDocument();
      });
    });

    it('clears error when form is resubmitted', async () => {
      mockSignUp.mockImplementationOnce((email, password, attrs, _, callback) =>
        callback({ code: 'UsernameExistsException' })
      );

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: VALID_PASSWORD } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: VALID_PASSWORD } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('An account with this email already exists')).toBeInTheDocument();
      });

      mockSignUp.mockImplementation((email, password, attrs, _, callback) => callback(null, { userSub: 'mock-sub' }));
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.queryByText('An account with this email already exists')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation Tests', () => {
    it('calls signUp with correct parameters', async () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: VALID_PASSWORD } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: VALID_PASSWORD } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          'test@example.com',
          VALID_PASSWORD,
          expect.anything(),
          null,
          expect.any(Function)
        );
      });
    });
  });

  describe('Loading State Tests', () => {
    it('disables submit button during loading', async () => {
      mockSignUp.mockImplementation(() => {});

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: VALID_PASSWORD } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: VALID_PASSWORD } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });

    it('shows loading spinner during authentication', async () => {
      mockSignUp.mockImplementation(() => {});

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: VALID_PASSWORD } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: VALID_PASSWORD } });
      fillDisplayName();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

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

      expect(passwordInput).toHaveAttribute('type', 'password');
      toggleButton.focus();
      fireEvent.keyDown(toggleButton, { key: 'Enter' });
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

      expect(passwordInput).toHaveAttribute('type', 'password');
      toggleButton.focus();
      fireEvent.keyDown(toggleButton, { key: ' ', code: 'Space', charCode: 32, keyCode: 32 });
      expect(passwordInput).toHaveAttribute('type', 'text');

      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
      fireEvent.keyDown(toggleButton, { key: 'Space', code: 'Space', charCode: 32, keyCode: 32 });
      expect(passwordInput).toHaveAttribute('type', 'password');
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
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
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
