import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../pages/PrivateRoute';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

const { useAuth } = require('../context/AuthContext');

const renderRoutes = () =>
  render(
    <MemoryRouter initialEntries={['/secret']}>
      <Routes>
        <Route
          path="/secret"
          element={
            <PrivateRoute>
              <div>Secret content</div>
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('pages/PrivateRoute component', () => {
  afterEach(() => jest.clearAllMocks());

  it('renders children when authenticated', () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'abc' } });
    renderRoutes();
    expect(screen.getByText('Secret content')).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated', () => {
    useAuth.mockReturnValue({ currentUser: null });
    renderRoutes();
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
});

