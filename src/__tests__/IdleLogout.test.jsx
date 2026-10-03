// Tests for the 30-minute idle sign-out (`IdleLogout` + `useIdleLogout`),
// and how AuthContext / Login handle it.
// - Mocks @supabase/supabase-js (see src/__mocks__/) and uses fake timers.
// - Verifies the "Still there?" warning appears for the last 10 minutes,
//   that only "Stay signed in" (or activity in another tab) dismisses it,
//   and that the user is signed out of this browser at 30 minutes.
// - Verifies a session restored after 30+ idle minutes is never shown, and
//   that the login page explains why the user was signed out.
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import IdleLogout from '../components/Layout/IdleLogout';
import Login from '../components/Auth/Login';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { INACTIVITY_MESSAGE, recordActivity, signedOutReason } from '../utils/idleSession';

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

const MINUTE = 60 * 1000;
const START = new Date('2026-10-03T12:00:00Z').getTime();

function WhoIsSignedIn() {
  const { currentUser } = useAuth();
  return <p>{currentUser ? `signed in as ${currentUser.email}` : 'signed out'}</p>;
}

function renderApp(children = <IdleLogout />) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <WhoIsSignedIn />
        {children}
      </AuthProvider>
    </MemoryRouter>
  );
}

function advance(ms) {
  act(() => { jest.advanceTimersByTime(ms); });
}

describe('Idle sign-out', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(START);
    localStorage.clear();
    __setMockSession(__mockSession({ email: 'idle@example.com' }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows nothing while the user is active', () => {
    renderApp();
    advance(19 * MINUTE);
    expect(screen.queryByText('Still there?')).not.toBeInTheDocument();
  });

  it('warns for the last 10 minutes with a countdown', () => {
    renderApp();
    advance(20 * MINUTE);

    expect(screen.getByText('Still there?')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();

    advance(MINUTE + 30 * 1000);
    expect(screen.getByText('8:30')).toBeInTheDocument();
  });

  it('keeps the user signed in when they click "Stay signed in"', () => {
    renderApp();
    advance(25 * MINUTE);

    fireEvent.click(screen.getByRole('button', { name: 'Stay signed in' }));
    expect(screen.queryByText('Still there?')).not.toBeInTheDocument();

    // The 30-minute clock restarted from the click.
    advance(10 * MINUTE);
    expect(__mockAuth.signOut).not.toHaveBeenCalled();
    expect(screen.getByText('signed in as idle@example.com')).toBeInTheDocument();
  });

  it('does not let a stray mouse movement dismiss the warning', () => {
    renderApp();
    advance(20 * MINUTE);

    fireEvent.mouseMove(window);
    advance(1000);
    expect(screen.getByText('Still there?')).toBeInTheDocument();
  });

  it('dismisses the warning when the user is active in another tab', () => {
    renderApp();
    advance(21 * MINUTE);

    recordActivity(); // what another tab writes to localStorage
    advance(1000);
    expect(screen.queryByText('Still there?')).not.toBeInTheDocument();
  });

  it('counts activity before the warning as using the app', () => {
    renderApp();
    advance(15 * MINUTE);
    fireEvent.keyDown(window, { key: 'a' });

    advance(19 * MINUTE);
    expect(screen.queryByText('Still there?')).not.toBeInTheDocument();
  });

  it('signs out of this browser only after 30 idle minutes', async () => {
    renderApp();
    await act(async () => { jest.advanceTimersByTime(30 * MINUTE); });

    expect(__mockAuth.signOut).toHaveBeenCalledTimes(1);
    expect(__mockAuth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(screen.getByText('signed out')).toBeInTheDocument();
    expect(signedOutReason()).toBe(INACTIVITY_MESSAGE);
  });

  it('"Sign out" in the warning signs out normally', async () => {
    renderApp();
    advance(20 * MINUTE);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    });

    expect(__mockAuth.signOut).toHaveBeenCalledWith();
    expect(screen.getByText('signed out')).toBeInTheDocument();
    expect(signedOutReason()).toBeNull();
  });

  it('never shows a session restored after 30+ idle minutes', () => {
    recordActivity(START - 45 * MINUTE);
    renderApp();

    expect(screen.getByText('signed out')).toBeInTheDocument();
    advance(0);
    expect(__mockAuth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(signedOutReason()).toBe(INACTIVITY_MESSAGE);
  });

  it('restores a session that was active recently', () => {
    recordActivity(START - 5 * MINUTE);
    renderApp();
    expect(screen.getByText('signed in as idle@example.com')).toBeInTheDocument();
  });

  it('tells the user on the login page why they were signed out, once', () => {
    __setMockSession(null);
    localStorage.setItem('bb:signedOutReason', INACTIVITY_MESSAGE);
    renderApp(<Login />);

    expect(screen.getByText(INACTIVITY_MESSAGE)).toBeInTheDocument();
    expect(signedOutReason()).toBeNull();
  });
});
