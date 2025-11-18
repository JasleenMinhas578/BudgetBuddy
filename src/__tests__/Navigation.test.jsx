import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Navigation from '../components/Layout/Navigation';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, animate, initial, transition, ...rest }) => (
      <div {...rest}>{children}</div>
    )
  }
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: jest.fn(() => jest.fn())
  };
});

const { useAuth } = require('../context/AuthContext');
const { useNavigate } = require('react-router-dom');

const renderNav = (initialPath = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navigation />
    </MemoryRouter>
  );

describe('Navigation component', () => {
  beforeEach(() => {
    document.body.style.overflow = 'unset';
    jest.clearAllMocks();
  });

  it('shows authenticated links and logs out via button', async () => {
    const logout = jest.fn().mockResolvedValue();
    const navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);
    useAuth.mockReturnValue({ currentUser: { email: 'user@example.com' }, logout });

    renderNav();

    const logoutButtons = screen.getAllByRole('button', { name: /logout/i });
    fireEvent.click(logoutButtons[0]);
    expect(logout).toHaveBeenCalled();
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/login');
    });
  });

  it('shows guest links when user is not authenticated', () => {
    useAuth.mockReturnValue({ currentUser: null, logout: jest.fn() });
    renderNav('/login');

    expect(screen.getAllByText('Login')).toHaveLength(2);
    expect(screen.getAllByText('Sign Up')).toHaveLength(2);
  });

  it('toggles mobile menu and body overflow', () => {
    useAuth.mockReturnValue({ currentUser: { email: 'user@example.com' }, logout: jest.fn() });
    renderNav();

    const toggle = screen.getByRole('button', { name: /toggle mobile menu/i });
    fireEvent.click(toggle);
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(toggle);
    expect(document.body.style.overflow).toBe('unset');
  });

  it('handles logout errors gracefully', async () => {
    const logout = jest.fn().mockRejectedValue(new Error('boom'));
    const navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);
    useAuth.mockReturnValue({ currentUser: { email: 'user@example.com' }, logout });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderNav();

    fireEvent.click(screen.getAllByRole('button', { name: /logout/i })[0]);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to log out:', expect.any(Error));
    });
    expect(navigate).not.toHaveBeenCalledWith('/login');
    consoleSpy.mockRestore();
  });

  it('closes mobile menu via navigation link and resets overflow', () => {
    useAuth.mockReturnValue({ currentUser: { email: 'user@example.com' }, logout: jest.fn() });
    renderNav();

    const toggle = screen.getByRole('button', { name: /toggle mobile menu/i });
    fireEvent.click(toggle);
    expect(document.body.style.overflow).toBe('hidden');

    const dashboardLinks = screen.getAllByText('Dashboard');
    fireEvent.click(dashboardLinks[dashboardLinks.length - 1]);
    expect(document.body.style.overflow).toBe('unset');
  });
});

