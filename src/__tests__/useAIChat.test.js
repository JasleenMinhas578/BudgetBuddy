// Tests for useAIChat.handleConfirmAction, specifically the Promise.allSettled
// partial-failure path for multiple_expense_confirm actions.
import { renderHook, act } from '@testing-library/react';
import { useAIChat } from '../hooks/useAIChat';

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'u1' } }),
}));

jest.mock('../context/CurrencyContext', () => ({
  useCurrency: () => ({
    homeCurrency: 'USD',
    currency: 'USD',
    CURRENCIES: [{ code: 'USD', symbol: '$' }],
    liveRates: {},
  }),
}));

jest.mock('../services/expenseService', () => ({
  subscribeToExpenses: jest.fn(() => jest.fn()),
  addExpense: jest.fn(),
  deleteExpense: jest.fn(),
  updateExpense: jest.fn(),
}));

jest.mock('../services/categoryService', () => ({
  addCategory: jest.fn(),
  deleteCategory: jest.fn(),
  updateCategory: jest.fn(),
}));

jest.mock('../services/budgetService', () => ({
  updateCategoryBudget: jest.fn(),
  subscribeToBudgets: jest.fn(() => jest.fn()),
}));

jest.mock('../services/aiService', () => ({
  processMessage: jest.fn(),
}));

jest.mock('../hooks/useDateFilter', () => ({
  getDateRangeForPreset: jest.fn(),
}));

jest.mock('../firebaseConfig', () => ({ db: {} }));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
}));

const { addExpense } = require('../services/expenseService');

const EXP_A = { title: 'Coffee', amount: 5,  category: 'Food', date: '2024-01-01' };
const EXP_B = { title: 'Lunch',  amount: 12, category: 'Food', date: '2024-01-02' };

const makeCard = (...expensesData) => ({
  role: 'assistant',
  type: 'multiple_expense_confirm',
  content: 'Add these?',
  expensesData,
  confirmed: false,
  dismissed: false,
});

describe('useAIChat – handleConfirmAction (multiple_expense_confirm)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('marks the card confirmed and adds a partial-error message when some writes fail', async () => {
    addExpense
      .mockResolvedValueOnce('id-1')           // EXP_A succeeds
      .mockRejectedValueOnce(new Error('write failed')); // EXP_B fails

    const card = makeCard(EXP_A, EXP_B);
    sessionStorage.setItem('ai-chat-messages', JSON.stringify([card]));

    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.handleConfirmAction(card, 0);
    });

    expect(result.current.messages[0].confirmed).toBe(true);

    const errMsg = result.current.messages.find(m => m.isError);
    expect(errMsg).toBeDefined();
    expect(errMsg.content).toBe('1 of 2 expenses saved. 1 could not be added.');
  });

  it('adds an error message and does NOT confirm the card when all writes fail', async () => {
    addExpense.mockRejectedValue(new Error('offline'));

    const card = makeCard(EXP_A, EXP_B);
    sessionStorage.setItem('ai-chat-messages', JSON.stringify([card]));

    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.handleConfirmAction(card, 0);
    });

    // card should stay unconfirmed
    expect(result.current.messages[0].confirmed).toBe(false);

    const errMsg = result.current.messages.find(m => m.isError);
    expect(errMsg).toBeDefined();
    expect(errMsg.content).toMatch(/offline/);
  });

  it('marks the card confirmed with no error message when all writes succeed', async () => {
    addExpense.mockResolvedValue('new-id');

    const card = makeCard(EXP_A, EXP_B);
    sessionStorage.setItem('ai-chat-messages', JSON.stringify([card]));

    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.handleConfirmAction(card, 0);
    });

    expect(result.current.messages[0].confirmed).toBe(true);
    expect(result.current.messages.find(m => m.isError)).toBeUndefined();
  });

  it('calls addExpense once per expense in expensesData', async () => {
    addExpense.mockResolvedValue('id');

    const card = makeCard(EXP_A, EXP_B);
    sessionStorage.setItem('ai-chat-messages', JSON.stringify([card]));

    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.handleConfirmAction(card, 0);
    });

    expect(addExpense).toHaveBeenCalledTimes(2);
    expect(addExpense).toHaveBeenCalledWith('u1', EXP_A);
    expect(addExpense).toHaveBeenCalledWith('u1', EXP_B);
  });
});
