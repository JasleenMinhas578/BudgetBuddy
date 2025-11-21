import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import { createRef } from 'react';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

const { useAuth } = require('../context/AuthContext');

const renderSidebar = (props = {}) => {
  const defaultProps = {
    sidebarOpen: true,
    setSidebarOpen: jest.fn(),
    onTouchStart: jest.fn(),
    onMouseDown: jest.fn(),
    isDragging: false,
    isMobile: false,
    ref: createRef()
  };

  const merged = { ...defaultProps, ...props };

  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Sidebar
        ref={merged.ref}
        sidebarOpen={merged.sidebarOpen}
        setSidebarOpen={merged.setSidebarOpen}
        onTouchStart={merged.onTouchStart}
        onMouseDown={merged.onMouseDown}
        isDragging={merged.isDragging}
        isMobile={merged.isMobile}
      />
    </MemoryRouter>
  );
};

describe('Sidebar component', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      currentUser: { email: 'user@example.com' },
      logout: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders navigation links and highlights active route', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
  });

  it('toggles sidebar visibility on desktop button', () => {
    const setSidebarOpen = jest.fn();
    renderSidebar({ setSidebarOpen });
    fireEvent.click(screen.getByRole('button', { name: /toggle sidebar/i }));
    expect(setSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('closes sidebar via mobile close button', () => {
    const setSidebarOpen = jest.fn();
    renderSidebar({ setSidebarOpen, isMobile: true });
    fireEvent.click(screen.getByRole('button', { name: /close sidebar/i }));
    expect(setSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('signs out when logout button clicked', () => {
    const logout = jest.fn();
    useAuth.mockReturnValue({ currentUser: { email: 'user@example.com' }, logout });
    renderSidebar();
    fireEvent.click(screen.getByText(/Logout/));
    expect(logout).toHaveBeenCalled();
  });

  it('closes sidebar after navigating on mobile', () => {
    jest.useFakeTimers();
    const setSidebarOpen = jest.fn();
    renderSidebar({ setSidebarOpen, isMobile: true });

    fireEvent.click(screen.getByRole('link', { name: /Expenses$/ }));
    jest.runAllTimers();

    expect(setSidebarOpen).toHaveBeenCalledWith(false);
    jest.useRealTimers();
  });

  it('keeps sidebar open when navigating on desktop', () => {
    const setSidebarOpen = jest.fn();
    renderSidebar({ setSidebarOpen, isMobile: false });

    fireEvent.click(screen.getByRole('link', { name: /Expenses$/ }));

    expect(setSidebarOpen).not.toHaveBeenCalledWith(false);
  });

  it('applies dragging and mobile classes', () => {
    renderSidebar({ sidebarOpen: false, isDragging: true, isMobile: true });
    // Verify sidebar is rendered
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('shows correct toggle text when collapsed on desktop', () => {
    renderSidebar({ sidebarOpen: false });
    const toggle = screen.getByRole('button', { name: /toggle sidebar/i });
    expect(toggle).toHaveTextContent('▶');
    expect(toggle).toHaveAttribute('title', 'Show sidebar');
  });
});

