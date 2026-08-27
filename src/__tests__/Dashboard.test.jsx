// Tests for the `Dashboard` page (layout shell).
// - Verifies FAB renders and opens the "Add New Expense" modal.
// - Verifies the logout confirmation dialog opens from both Sidebar and Navbar.
// - Confirms modals close correctly.
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';

// ── Firebase stubs ─────────────────────────────────────────────────────────────
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(() => () => {}),
  getAuth: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  onSnapshot: jest.fn(() => () => {}),
  addDoc: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  doc: jest.fn(),
  setDoc: jest.fn(),
  deleteField: jest.fn(),
}));

jest.mock('../firebaseConfig', () => ({ auth: {}, db: {} }));

// ── Auth ───────────────────────────────────────────────────────────────────────
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    currentUser: { uid: 'test-uid', email: 'test@example.com' },
    logout: jest.fn(),
  })),
  AuthProvider: ({ children }) => <>{children}</>,
}));

// ── Currency ───────────────────────────────────────────────────────────────────
jest.mock('../context/CurrencyContext', () => ({
  useCurrency: () => ({
    formatAmount: (n) => `$${Number(n).toFixed(2)}`,
    currency: 'USD',
    currencySymbol: '$',
  }),
  CurrencyProvider: ({ children }) => <>{children}</>,
}));

// ── Sidebar — uses forwardRef so we require react inside the factory ────────────
jest.mock('../components/Layout/Sidebar', () => {
  const { forwardRef } = require('react');
  return forwardRef(function MockSidebar(props, ref) {
    return (
      <div data-testid="sidebar" ref={ref}>
        <button onClick={props.onLogoutClick}>Sidebar Logout</button>
      </div>
    );
  });
});

jest.mock('../components/Layout/Navbar', () =>
  function MockNavbar({ onLogoutClick }) {
    return (
      <nav data-testid="navbar">
        <button onClick={onLogoutClick}>Navbar Logout</button>
      </nav>
    );
  }
);

// ── useSidebar hook stub ────────────────────────────────────────────────────────
jest.mock('../hooks/useSidebar', () => ({
  useSidebar: () => ({
    sidebarOpen: false,
    setSidebarOpen: jest.fn(),
    isDragging: false,
    showEdgeIndicator: false,
    isMobile: () => false,
    sidebarRef: { current: null },
    overlayRef: { current: null },
    handleOverlayClick: jest.fn(),
    handleTouchStart: jest.fn(),
    handleMouseDown: jest.fn(),
  }),
}));

// ── Minimal UI stubs ────────────────────────────────────────────────────────────
jest.mock('../components/UI/Modal', () =>
  function MockModal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <span data-testid="modal-title">{title}</span>
        <button onClick={onClose}>Close Modal</button>
        {children}
      </div>
    );
  }
);

jest.mock('../components/UI/ConfirmDialog', () =>
  function MockConfirmDialog({ isOpen, title, onConfirm, onCancel }) {
    if (!isOpen) return null;
    return (
      <div data-testid="confirm-dialog">
        <span data-testid="dialog-title">{title}</span>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  }
);

jest.mock('../components/Expense/ExpenseForm', () =>
  function MockExpenseForm({ onExpenseAdded, onCancel }) {
    return (
      <div data-testid="expense-form">
        <button onClick={() => onExpenseAdded && onExpenseAdded()}>Submit</button>
        <button onClick={onCancel}>Cancel Form</button>
      </div>
    );
  }
);

// ── framer-motion ───────────────────────────────────────────────────────────────
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }) => {
      const { whileHover, whileTap, initial, animate, transition, ...rest } = p;
      return <div {...rest}>{children}</div>;
    },
  },
}));

// ── Helpers ─────────────────────────────────────────────────────────────────────
const { useAuth } = require('../context/AuthContext');

const mockAuthValue = {
  currentUser: { uid: 'test-uid', email: 'test@example.com' },
  logout: jest.fn(),
};

const Wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/dashboard']}>
    <Routes>
      <Route path="/dashboard/*" element={children} />
    </Routes>
  </MemoryRouter>
);

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue(mockAuthValue);
});

// ── Tests ───────────────────────────────────────────────────────────────────────
describe('Dashboard page', () => {
  describe('Basic rendering', () => {
    it('renders the sidebar and navbar', () => {
      render(<Wrapper><Dashboard /></Wrapper>);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    it('renders the floating action button', () => {
      render(<Wrapper><Dashboard /></Wrapper>);
      expect(screen.getByRole('button', { name: /add expense/i })).toBeInTheDocument();
    });

    it('does not show the expense modal on initial render', () => {
      render(<Wrapper><Dashboard /></Wrapper>);
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('does not show the logout dialog on initial render', () => {
      render(<Wrapper><Dashboard /></Wrapper>);
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });
  });

  describe('FAB — Add Expense modal', () => {
    it('opens the add-expense modal when FAB is clicked', async () => {
      render(<Wrapper><Dashboard /></Wrapper>);
      fireEvent.click(screen.getByRole('button', { name: /add expense/i }));
      await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Add New Expense');
      expect(screen.getByTestId('expense-form')).toBeInTheDocument();
    });

    it('closes the modal via the modal close button', async () => {
      render(<Wrapper><Dashboard /></Wrapper>);
      fireEvent.click(screen.getByRole('button', { name: /add expense/i }));
      await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Close Modal'));
      await waitFor(() => expect(screen.queryByTestId('modal')).not.toBeInTheDocument());
    });

    it('closes the modal after successful form submission', async () => {
      render(<Wrapper><Dashboard /></Wrapper>);
      fireEvent.click(screen.getByRole('button', { name: /add expense/i }));
      await waitFor(() => expect(screen.getByTestId('expense-form')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Submit'));
      await waitFor(() => expect(screen.queryByTestId('modal')).not.toBeInTheDocument());
    });

    it('closes the modal when form cancel is clicked', async () => {
      render(<Wrapper><Dashboard /></Wrapper>);
      fireEvent.click(screen.getByRole('button', { name: /add expense/i }));
      await waitFor(() => expect(screen.getByTestId('expense-form')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Cancel Form'));
      await waitFor(() => expect(screen.queryByTestId('modal')).not.toBeInTheDocument());
    });
  });

  describe('Logout confirmation dialog', () => {
    it('opens from the Sidebar logout button', async () => {
      render(<Wrapper><Dashboard /></Wrapper>);
      fireEvent.click(screen.getByText('Sidebar Logout'));
      await waitFor(() => expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument());
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Logout');
    });

    it('opens from the Navbar logout button', async () => {
      render(<Wrapper><Dashboard /></Wrapper>);
      fireEvent.click(screen.getByText('Navbar Logout'));
      await waitFor(() => expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument());
    });

    it('closes when Cancel is clicked', async () => {
      render(<Wrapper><Dashboard /></Wrapper>);
      fireEvent.click(screen.getByText('Sidebar Logout'));
      await waitFor(() => expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Cancel'));
      await waitFor(() => expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument());
    });

    it('calls logout() when Confirm is clicked', async () => {
      const mockLogout = jest.fn();
      useAuth.mockReturnValue({ currentUser: { uid: 'test-uid' }, logout: mockLogout });
      render(<Wrapper><Dashboard /></Wrapper>);
      fireEvent.click(screen.getByText('Sidebar Logout'));
      await waitFor(() => expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Confirm'));
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});
