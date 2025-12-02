// Tests for the top navigation `Navbar` component within the dashboard layout.
// - Mocks `AuthContext` to simulate different auth states and verify logout handling.
// - Asserts that context-specific icons/titles render based on the current route.
// - Verifies sidebar toggle behavior, including the functional updater logic for open/closed state.
// - Confirms that logout prompts for confirmation and respects the user's choice, and that the user section hides when no currentUser exists.
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

const { useAuth } = require('../context/AuthContext');

const setup = (path = '/dashboard', overrides = {}) => {
  const setSidebarOpen = jest.fn();
  useAuth.mockReturnValue({
    currentUser: { email: 'user@example.com' },
    logout: jest.fn(),
    ...overrides
  });

  render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar setSidebarOpen={setSidebarOpen} />
    </MemoryRouter>
  );

  return { setSidebarOpen };
};

describe('Navbar component', () => {
  const originalConfirm = window.confirm;

  beforeEach(() => {
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    window.confirm = originalConfirm;
  });

  it.each([
    ['/dashboard', '📊', 'Dashboard'],
    ['/dashboard/expenses', '💸', 'Expenses'],
    ['/dashboard/categories', '📂', 'Categories'],
    ['/dashboard/reports', '📈', 'Reports']
  ])('shows contextual icon and title for %s', (path, icon, title) => {
    setup(path);
    expect(screen.getByText(icon)).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('toggles sidebar when menu button is clicked', () => {
    const { setSidebarOpen } = setup('/dashboard');
    fireEvent.click(screen.getByRole('button', { name: /toggle sidebar/i }));
    expect(setSidebarOpen).toHaveBeenCalledWith(expect.any(Function));
    const updater = setSidebarOpen.mock.calls[0][0];
    expect(updater(true)).toBe(false);
    expect(updater(false)).toBe(true);
  });

  it('confirms before logging out', () => {
    const logout = jest.fn();
    setup('/dashboard', { logout });
    fireEvent.click(screen.getByTitle('Click to logout'));
    expect(window.confirm).toHaveBeenCalled();
    expect(logout).toHaveBeenCalled();
  });

  it('does not logout when confirmation is cancelled', () => {
    const logout = jest.fn();
    window.confirm = jest.fn(() => false);
    setup('/dashboard', { logout });
    fireEvent.click(screen.getByTitle('Click to logout'));
    expect(logout).not.toHaveBeenCalled();
  });

  it('hides user section when no currentUser', () => {
    useAuth.mockReturnValue({ currentUser: null, logout: jest.fn() });
    render(
      <MemoryRouter>
        <Navbar setSidebarOpen={jest.fn()} />
      </MemoryRouter>
    );
    expect(screen.queryByText(/click to logout/i)).toBeNull();
  });
});

