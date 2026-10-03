// Tests for the `ConfirmSignUp` page — the "check your email" screen shown
// after signup, which is also where the emailed confirmation link lands.
// - Mocks @supabase/supabase-js (see src/__mocks__/) and navigation.
// - Verifies a signed-in user (i.e. the link worked) is sent to the dashboard.
// - Verifies resending the link calls Supabase with the right redirect, and
//   shows success / rate-limit messages with a "Resend in Ns" countdown.
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ConfirmSignUp from '../components/Auth/ConfirmSignUp';
import { AuthProvider } from '../context/AuthContext';

jest.mock('@supabase/supabase-js');
const { __mockAuth, __setMockSession, __mockSession } = require('@supabase/supabase-js');

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => {
      const { initial, animate, transition, ...restProps } = props;
      return <div {...restProps}>{children}</div>;
    },
    button: ({ children, ...props }) => {
      const { whileHover, whileTap, ...restProps } = props;
      return <button {...restProps}>{children}</button>;
    },
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function renderPage(state = { email: 'new@example.com' }) {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/confirm-signup', state }]}>
      <AuthProvider>
        <ConfirmSignUp />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ConfirmSignUp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __setMockSession(null);
  });

  it('prefills the email passed from signup', () => {
    renderPage();
    expect(screen.getByLabelText('Email Address')).toHaveValue('new@example.com');
  });

  it('goes to the dashboard once the confirmation link has signed the user in', async () => {
    __setMockSession(__mockSession());
    renderPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('resends the confirmation link back to this page', async () => {
    __mockAuth.resend.mockResolvedValue({ data: {}, error: null });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /resend confirmation link/i }));

    await waitFor(() => {
      expect(screen.getByText('A new confirmation link has been sent to your email.')).toBeInTheDocument();
    });
    expect(__mockAuth.resend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'new@example.com',
      options: { emailRedirectTo: 'http://localhost/confirm-signup' },
    });
  });

  it('counts down before allowing another resend', async () => {
    __mockAuth.resend.mockResolvedValue({ data: {}, error: null });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /resend confirmation link/i }));

    expect(await screen.findByRole('button', { name: /resend in 60s/i })).toBeDisabled();
  });

  it('starts the countdown straight away when signup just sent the email', () => {
    renderPage({ email: 'new@example.com', justSent: true });
    expect(screen.getByRole('button', { name: /resend in 60s/i })).toBeDisabled();
  });

  it('turns the "wait N seconds" error into a countdown', async () => {
    __mockAuth.resend.mockResolvedValue({
      data: {},
      error: {
        code: 'over_email_send_rate_limit',
        status: 429,
        message: 'For security purposes, you can only request this after 42 seconds.',
      },
    });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /resend confirmation link/i }));

    expect(await screen.findByRole('button', { name: /resend in 42s/i })).toBeDisabled();
    expect(screen.getByText(/we can only send one email a minute/i)).toBeInTheDocument();
  });

  it('explains the hourly email limit, which has no countdown', async () => {
    __mockAuth.resend.mockResolvedValue({
      data: {},
      error: { code: 'over_email_send_rate_limit', status: 429, message: 'email rate limit exceeded' },
    });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /resend confirmation link/i }));

    expect(await screen.findByText(/please wait a few minutes and try again/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resend confirmation link/i })).toBeEnabled();
  });
});
