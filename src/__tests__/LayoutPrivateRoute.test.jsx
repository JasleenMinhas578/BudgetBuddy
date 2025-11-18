import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../components/Layout/PrivateRoute';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

const { useAuth } = require('../context/AuthContext');

const renderWithRoutes = () =>
  render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <PrivateRoute redirectTo="/login">
              <div>Secret area</div>
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<div>Login Screen</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('Layout PrivateRoute', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading indicator when auth state is loading', () => {
    useAuth.mockReturnValue({ currentUser: null, loading: true });
    renderWithRoutes();
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it('redirects to login when user is missing', () => {
    useAuth.mockReturnValue({ currentUser: null, loading: false });
    renderWithRoutes();
    expect(screen.getByText('Login Screen')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    useAuth.mockReturnValue({ currentUser: { uid: '1' }, loading: false });
    renderWithRoutes();
    expect(screen.getByText('Secret area')).toBeInTheDocument();
  });

  it('falls back to /login when redirectTo is not provided', () => {
    useAuth.mockReturnValue({ currentUser: null, loading: false });
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute>
                <div>Hidden</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>Login Screen</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Login Screen')).toBeInTheDocument();
  });
});

