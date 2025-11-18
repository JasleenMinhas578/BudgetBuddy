import { render, screen } from '@testing-library/react';

import App from '../App';

jest.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({ currentUser: { uid: 'user-1' } })
}));

jest.mock('../pages/Landing', () => () => <div>Landing Page</div>);
jest.mock('../components/Auth/Login', () => () => <div>Login Page</div>);
jest.mock('../components/Auth/Signup', () => () => <div>Signup Page</div>);
jest.mock('../components/Auth/ForgotPassword', () => () => <div>Forgot Password Page</div>);
jest.mock('../components/Auth/ResetPassword', () => () => <div>Reset Password Page</div>);

jest.mock('../pages/Dashboard', () => {
  const React = require('react');
  const { Outlet } = require('react-router-dom');
  return function MockDashboard() {
    return (
      <div>
        <span>Dashboard Shell</span>
        <Outlet />
      </div>
    );
  };
});

jest.mock('../components/Dashboard/DashboardOverview', () => () => <div>Overview Page</div>);
jest.mock('../components/Dashboard/Expenses', () => () => <div>Expenses Page</div>);
jest.mock('../components/Dashboard/Categories', () => () => <div>Categories Page</div>);
jest.mock('../components/Dashboard/Reports', () => () => <div>Reports Page</div>);
jest.mock('../pages/PrivateRoute', () => ({ children }) => <div data-testid="private-route">{children}</div>);

describe('App routing', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('renders the landing page on root route', () => {
    render(<App />);
    expect(screen.getByText('Landing Page')).toBeInTheDocument();
  });

  it('navigates to public auth routes', () => {
    window.history.pushState({}, '', '/login');
    const { unmount } = render(<App />);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    unmount();

    window.history.pushState({}, '', '/signup');
    render(<App />);
    expect(screen.getByText('Signup Page')).toBeInTheDocument();
  });

  it('wraps dashboard routes with PrivateRoute and renders nested pages', () => {
    window.history.pushState({}, '', '/dashboard/expenses');
    render(<App />);

    expect(screen.getByTestId('private-route')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Shell')).toBeInTheDocument();
    expect(screen.getByText('Expenses Page')).toBeInTheDocument();
  });

  it('renders dashboard overview at index route', () => {
    window.history.pushState({}, '', '/dashboard');
    render(<App />);
    expect(screen.getByText('Overview Page')).toBeInTheDocument();
  });
});

