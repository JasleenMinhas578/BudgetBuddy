// Behavioral tests for the `ExpenseForm` component.
// - Mocks `AuthContext`, the database service, Firestore category listener, and Firebase config so only form logic is exercised.
// - Verifies default values for new expenses (today's date, default category) and correct filling from `initialExpense` in edit mode.
// - Covers validation rules for amount, title, and date (including future and missing dates) and ensures helpful error messages.
// - Checks that submissions call `addExpense` or `onExpenseEdited` with correctly shaped payloads and that optional callbacks are handled safely.
// - Tests UI-only behaviors like numeric-only amount input, category selection, loading states ("Adding Expense...", "Saving..."), and cancel behavior during loading.
// - Ensures Firestore category listener errors and cleanup are logged/handled without breaking unmount, including non-function unsubscribe return values.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ExpenseForm from '../components/Expense/ExpenseForm';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('../services/expenseService', () => ({
  addExpense: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'collection-ref'),
  query: jest.fn(() => 'query-ref'),
  onSnapshot: jest.fn()
}));

jest.mock('../firebaseConfig', () => ({
  db: 'db-instance'
}));

const { useAuth } = require('../context/AuthContext');
const { addExpense } = require('../services/expenseService');
const { onSnapshot, query } = require('firebase/firestore');

const setup = (props = {}) =>
  render(
    <ExpenseForm
      onExpenseAdded={jest.fn()}
      onExpenseEdited={jest.fn()}
      onCancel={jest.fn()}
      {...props}
    />
  );

describe('ExpenseForm component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { uid: 'user-123' } });
    addExpense.mockResolvedValue('new-expense');
    onSnapshot.mockImplementation((unused, callback) => {
      callback({
        forEach: (fn) =>
          fn({
            id: 'custom-cat',
            data: () => ({ name: 'Travel' })
          })
      });
      return jest.fn();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('sets today as default date for new expense', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-02-20T10:00:00Z'));
    setup();
    expect(screen.getByLabelText(/date/i).value).toBe('2024-02-20');
    expect(screen.getByLabelText(/category/i)).toHaveTextContent(/Travel/);
  });

  it('shows validation error for invalid amount', () => {
    setup();

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Coffee' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-02-20' } });
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }));

    expect(screen.getByText(/please enter a valid amount/i)).toBeInTheDocument();
  });

  it('submits a new expense successfully and resets form', async () => {
    const onExpenseAdded = jest.fn();
    setup({ onExpenseAdded });

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '25.50' } });
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Lunch' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-02-21' } });
    expect(screen.getByLabelText(/date/i).value).toBe('2024-02-21');

    fireEvent.click(screen.getByRole('button', { name: /add expense/i }));

    await waitFor(() => expect(addExpense).toHaveBeenCalled());
    const [, payload] = addExpense.mock.calls[0];
    expect(payload).toMatchObject({
      amount: 25.5,
      title: 'Lunch',
      category: 'Food',
      date: '2024-02-21'
    });
    expect(onExpenseAdded).toHaveBeenCalled();
  });

  it('invokes edit callback when in edit mode', async () => {
    const onExpenseEdited = jest.fn();
    const initialExpense = {
      id: 'exp-1',
      amount: 10,
      title: 'Tea',
      category: 'Food',
      date: '2024-02-15'
    };

    setup({ onExpenseEdited, initialExpense, isEditMode: true });

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Tea Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(onExpenseEdited).toHaveBeenCalledWith({
        id: 'exp-1',
        amount: 10,
        title: 'Tea Updated',
        category: 'Food',
        date: '2024-02-15'
      });
    });
  });

  it('handles cancel action', () => {
    const onCancel = jest.fn();
    const initialExpense = {
      id: 'exp-2',
      amount: 55,
      title: 'Groceries',
      category: 'Food',
      date: '2024-02-10'
    };

    setup({ onCancel, initialExpense, isEditMode: true });

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Changed' } });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
    expect(titleInput.value).toBe('Groceries');
  });

  it('limits amount input to numeric values', () => {
    setup();
    const amountInput = screen.getByLabelText(/amount/i);

    fireEvent.change(amountInput, { target: { value: '12.34' } });
    expect(amountInput.value).toBe('12.34');

    fireEvent.change(amountInput, { target: { value: '12.345' } });
    expect(amountInput.value).toBe('12.34');

    fireEvent.change(amountInput, { target: { value: 'abc' } });
    expect(amountInput.value).toBe('');

    fireEvent.change(amountInput, { target: { value: '12.3.4' } });
    expect(amountInput.value).toBe('');
  });
  it('shows validation error when title is missing', () => {
    setup();

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-02-20' } });
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }));

    expect(screen.getByText(/Please enter a title/i)).toBeInTheDocument();
  });

  it('shows validation errors when date is missing or in the future', async () => {
    const initialExpense = {
      id: 'exp-date',
      amount: 10,
      title: 'Groceries',
      category: 'Food',
      date: ''
    };
    setup({ initialExpense, isEditMode: true });

    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => {
      expect(screen.getByText(/Please select a date/i)).toBeInTheDocument();
    });

    fireEvent.change(dateInput, { target: { value: '2030-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => {
      expect(screen.getByText(/Date cannot be in the future/)).toBeInTheDocument();
    });
  });

  it('shows error message when addExpense fails', async () => {
    addExpense.mockRejectedValueOnce(new Error('Network down'));
    setup();

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Snacks' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-02-20' } });
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to add expense: Network down/)).toBeInTheDocument();
    });
  });

  it('updates category when selection changes', () => {
    setup();
    const select = screen.getByLabelText(/category/i);
    fireEvent.change(select, { target: { value: 'Travel' } });
    expect(select.value).toBe('Travel');
  });

  it('logs errors when listener setup fails', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    query.mockImplementationOnce(() => {
      throw new Error('boom');
    });

    setup();

    expect(consoleSpy).toHaveBeenCalledWith('Error setting up categories listener:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('logs errors when unsubscribe throws during cleanup', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    onSnapshot.mockImplementationOnce(() => () => {
      throw new Error('cleanup fail');
    });

    const view = setup();
    view.unmount();

    expect(consoleSpy).toHaveBeenCalledWith('Error during cleanup:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('does not set up listeners when there is no authenticated user', () => {
    useAuth.mockReturnValue({ currentUser: null });
    setup();
    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it('handles non-function unsubscribe return values gracefully', () => {
    onSnapshot.mockImplementationOnce(() => null);
    const view = setup();
    expect(() => view.unmount()).not.toThrow();
  });

  it('resets fields to fallback values when editing incomplete expenses', () => {
    const initialExpense = {
      id: 'fallback',
      amount: '',
      title: '',
      category: '',
      date: ''
    };

    setup({ initialExpense, isEditMode: true });

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Temp' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Travel' } });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.getByLabelText(/amount/i).value).toBe('');
    expect(screen.getByLabelText(/title/i).value).toBe('');
    expect(screen.getByLabelText(/category/i).value).toBe('Food');
  });

  it('renders custom categories even when Firestore id is missing', () => {
    onSnapshot.mockImplementationOnce((_, callback) => {
      callback({
        forEach: (fn) =>
          fn({
            id: '',
            data: () => ({ name: 'Misc' })
          })
      });
      return jest.fn();
    });

    setup();
    expect(screen.getByRole('option', { name: /Misc/ })).toBeInTheDocument();
  });

  it('handles edit submissions without onExpenseEdited callback', async () => {
    const initialExpense = {
      id: 'edit-1',
      amount: 20,
      title: 'Existing',
      category: 'Food',
      date: '2024-02-10'
    };

    setup({ initialExpense, isEditMode: true, onExpenseEdited: undefined });

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Updated Title' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(addExpense).not.toHaveBeenCalled();
    });
  });

  it('submits new expenses even when onExpenseAdded callback is missing', async () => {
    setup({ onExpenseAdded: undefined });

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '40' } });
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Snacks' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-02-22' } });
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }));

    await waitFor(() => expect(addExpense).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByLabelText(/amount/i).value).toBe(''));
  });

  it('shows adding state while a new expense is being submitted', async () => {
    jest.useFakeTimers();
    addExpense.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('id'), 100)));

    setup();

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '55' } });
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Groceries' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-03-01' } });
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }));

    expect(await screen.findByText('Adding Expense...')).toBeInTheDocument();

    await act(async () => {
      jest.runAllTimers();
    });
    jest.useRealTimers();
  });

  it('shows saving state while an edit submission is pending', async () => {
    jest.useFakeTimers();
    const initialExpense = {
      id: 'pending-edit',
      amount: 30,
      title: 'Fuel',
      category: 'Transport',
      date: '2024-02-05'
    };
    const onExpenseEdited = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    setup({ initialExpense, isEditMode: true, onExpenseEdited });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText('Saving...')).toBeInTheDocument();

    await act(async () => {
      jest.runAllTimers();
    });
    jest.useRealTimers();
  });

  it('ignores cancel events while a submission is loading', async () => {
    jest.useFakeTimers();
    const onCancel = jest.fn();
    addExpense.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('id'), 100)));

    setup({ onCancel });

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '70' } });
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Conference' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-02-25' } });
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }));

    await waitFor(() => {
      expect(screen.getByText(/Adding Expense/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).not.toHaveBeenCalled();

    await act(async () => {
      jest.runAllTimers();
    });
    jest.useRealTimers();
  });

  it('handles cancel action when onCancel is not provided', () => {
    setup({ onCancel: undefined });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.getByLabelText(/amount/i).value).toBe('');
  });
});

