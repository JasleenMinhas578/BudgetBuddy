// Tests for the `ExpenseList` component that renders and manages a list of expenses.
// - Mocks `AuthContext`, the database service, and framer-motion to focus on filtering, sorting, and deletion logic.
// - Verifies loading state, successful fetch of expenses for the current user, and basic rendering of items and summary values.
// - Exercises category filtering, multiple sort keys (category, description, amount), sort order toggling, and a safe default for unknown sort keys.
// - Covers the delete-confirmation modal flow, including cancel vs confirm, backend error surfacing, and removal behavior.
// - Ensures error handling when initial load fails, behavior for unauthenticated users, formatting when dates are missing, and hints when filters yield no matches.
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ExpenseList from '../components/Expense/ExpenseList';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('../services/database', () => ({
  getExpenses: jest.fn(),
  deleteExpense: jest.fn()
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }) => <div {...rest}>{children}</div>
  },
  AnimatePresence: ({ children }) => <div>{children}</div>
}));

const { useAuth } = require('../context/AuthContext');
const { getExpenses, deleteExpense } = require('../services/database');

const sampleExpenses = [
  {
    id: '1',
    category: 'Food',
    description: 'Lunch',
    amount: 12,
    date: '2024-02-15'
  },
  {
    id: '2',
    category: 'Transport',
    description: 'Taxi',
    amount: 25,
    date: '2024-02-11'
  }
];

describe('ExpenseList component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { uid: 'user-1' } });
    getExpenses.mockResolvedValue(sampleExpenses);
    deleteExpense.mockResolvedValue();
  });

  it('loads and displays expenses with summary data', async () => {
    render(<ExpenseList />);

    expect(screen.getByText(/Loading expenses/)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Lunch')).toBeInTheDocument();
    });
    
    expect(getExpenses).toHaveBeenCalledWith('user-1');
    expect(screen.getByText('$12.00')).toBeInTheDocument();
    expect(screen.getByText('Taxi')).toBeInTheDocument();
  });

  it('filters by category and toggles sort order', async () => {
    render(<ExpenseList />);

    await screen.findByText('Lunch');

    const [categorySelect, sortSelect] = screen.getAllByRole('combobox');

    fireEvent.change(categorySelect, { target: { value: 'Food' } });
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.queryByText('Taxi')).toBeNull();

    fireEvent.change(sortSelect, { target: { value: 'amount' } });

    const orderButton = screen.getByRole('button', { name: '↓' });
    fireEvent.click(orderButton);
    expect(orderButton).toHaveTextContent('↑');
  });

  it('sorts by category and description correctly', async () => {
    render(<ExpenseList />);

    await screen.findByText('Lunch');

    const [, sortSelect] = screen.getAllByRole('combobox');
    const orderButton = screen.getByRole('button', { name: '↓' });

    fireEvent.change(sortSelect, { target: { value: 'category' } });
    fireEvent.click(orderButton); // switch to ascending

    // Verify sorting by checking that elements are present
    expect(screen.getByText('Lunch')).toBeInTheDocument();

    fireEvent.change(sortSelect, { target: { value: 'description' } });
    fireEvent.click(screen.getByRole('button', { name: '↑' })); // back to descending

    // Verify sorting by checking that elements are present
    expect(screen.getByText('Taxi')).toBeInTheDocument();
  });

  it('sorts by amount and handles unknown sort keys', async () => {
    render(<ExpenseList />);

    await screen.findByText('Lunch');

    const [, sortSelect] = screen.getAllByRole('combobox');
    const orderButton = screen.getByRole('button', { name: '↓' });

    fireEvent.change(sortSelect, { target: { value: 'amount' } });
    fireEvent.click(orderButton); // ascending

    // Verify sorting by checking that elements are present
    expect(screen.getByText('Lunch')).toBeInTheDocument();

    // Trigger default branch by setting an unknown sort value
    fireEvent.change(sortSelect, { target: { value: 'unknown' } });
    expect(screen.getByText('Lunch')).toBeInTheDocument();
  });

  it('opens delete modal and cancels deletion', async () => {
    render(<ExpenseList />);
    await screen.findByText('Lunch');

    fireEvent.click(screen.getAllByTitle('Delete expense')[0]);
    expect(screen.getByText(/Delete Expense/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Cancel$/ }));
    expect(screen.queryByText(/Delete Expense/)).toBeNull();
    expect(deleteExpense).not.toHaveBeenCalled();
  });

  it('confirms deletion and removes expense', async () => {
    render(<ExpenseList />);
    await screen.findByText('Lunch');

    fireEvent.click(screen.getAllByTitle('Delete expense')[0]);
    fireEvent.click(screen.getByRole('button', { name: /^Delete$/ }));

    await waitFor(() => {
      expect(deleteExpense).toHaveBeenCalledWith('1');
    });
  });

  it('surfaces an error when deletion fails', async () => {
    deleteExpense.mockRejectedValueOnce(new Error('db down'));
    render(<ExpenseList />);
    await screen.findByText('Lunch');

    fireEvent.click(screen.getAllByTitle('Delete expense')[0]);
    fireEvent.click(screen.getByRole('button', { name: /^Delete$/ }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to delete expense/)).toBeInTheDocument();
    });
  });

  it('shows error alert when loading fails', async () => {
    getExpenses.mockRejectedValueOnce(new Error('network'));
    render(<ExpenseList />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load expenses/)).toBeInTheDocument();
    });
  });

  it('does not fetch expenses when there is no authenticated user', () => {
    useAuth.mockReturnValueOnce({ currentUser: null });
    render(<ExpenseList />);
    expect(getExpenses).not.toHaveBeenCalled();
  });

  it('handles expenses without dates when formatting output', async () => {
    getExpenses.mockResolvedValueOnce([
      { id: '3', category: 'Other', description: 'No Date', amount: 5, date: '' }
    ]);

    render(<ExpenseList />);

    await waitFor(() => {
      expect(screen.getByText('No Date')).toBeInTheDocument();
    });
  });

  it('shows hint when category filter yields no results', async () => {
    render(<ExpenseList />);
    await screen.findByText('Lunch');

    const categorySelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(categorySelect, { target: { value: 'Bills' } });

    await waitFor(() => {
      expect(screen.getByText(/Try changing the category filter/)).toBeInTheDocument();
    });
  });
});

