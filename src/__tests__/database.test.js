// Unit tests for the REST-backed `expenseService`/`categoryService` functions.
// - Mocks `../cognito`'s getIdToken and the global `fetch` so tests only verify
//   request method/path/body and response handling, not a real network call.
// - Covers CRUD operations for expenses and categories, including required-field
//   validation (which happens before any network call) and error propagation.
// - Verifies the pub/sub subscription helpers (replacing Firestore's onSnapshot):
//   an initial fetch on subscribe, and error callbacks on a failed fetch.
import {
  addExpense,
  updateExpense,
  deleteExpense,
  subscribeToExpenses,
} from '../services/expenseService';
import {
  addCategory,
  updateCategory,
  deleteCategory,
  subscribeToCategories,
} from '../services/categoryService';

jest.mock('../cognito', () => ({
  getIdToken: jest.fn(() => Promise.resolve('test-token')),
}));

function mockFetchOnce(status, body) {
  global.fetch.mockResolvedValueOnce({
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  });
}

// Lets a subscribe()'s internal fire-and-forget fetch/callback resolve
// before assertions run.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('service layer (REST API client)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('expenses CRUD', () => {
    it('adds expense and returns its id', async () => {
      mockFetchOnce(201, { id: 42, title: 'Coffee' });

      const id = await addExpense('user-1', {
        title: 'Coffee', amount: 5, category: 'Food', date: '2024-02-01',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/expenses'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(id).toBe('42');
    });

    it('throws when required expense data missing', async () => {
      await expect(addExpense('user', { amount: 5 })).rejects.toThrow(
        'Missing required expense data'
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('throws when amount is null', async () => {
      await expect(addExpense('user', {
        title: 'T', category: 'C', date: '2024-01-01', amount: null,
      })).rejects.toThrow('Amount must be a positive number');
    });

    it('throws when amount is NaN', async () => {
      await expect(addExpense('user', {
        title: 'T', category: 'C', date: '2024-01-01', amount: NaN,
      })).rejects.toThrow('Amount must be a positive number');
    });

    it('throws when amount is zero', async () => {
      await expect(addExpense('user', {
        title: 'T', category: 'C', date: '2024-01-01', amount: 0,
      })).rejects.toThrow('Amount must be a positive number');
    });

    it('throws when amount is negative', async () => {
      await expect(addExpense('user', {
        title: 'T', category: 'C', date: '2024-01-01', amount: -5,
      })).rejects.toThrow('Amount must be a positive number');
    });

    it('updates expense via PUT', async () => {
      mockFetchOnce(200, { id: 'exp-1', title: 'Updated' });
      await updateExpense('user-1', 'exp-1', { title: 'Updated' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/expenses/exp-1'),
        expect.objectContaining({ method: 'PUT', body: JSON.stringify({ title: 'Updated' }) })
      );
    });

    it('throws when updateExpense missing parameters', async () => {
      await expect(updateExpense(null, null, {})).rejects.toThrow('Missing required parameters');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deletes expense via DELETE', async () => {
      mockFetchOnce(204, null);
      await deleteExpense('user-1', 'exp-1');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/expenses/exp-1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('throws when deleteExpense missing parameters', async () => {
      await expect(deleteExpense(null, null)).rejects.toThrow('Missing required parameters');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('propagates server errors', async () => {
      mockFetchOnce(500, { error: 'boom' });
      await expect(deleteExpense('user-1', 'exp-1')).rejects.toThrow('boom');
    });
  });

  describe('category CRUD', () => {
    it('adds category with metadata', async () => {
      mockFetchOnce(201, { id: 7, name: 'Travel' });
      const id = await addCategory('user-1', { name: 'Travel' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/categories'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(id).toBe('7');
    });

    it('throws when category data missing', async () => {
      await expect(addCategory('user', {})).rejects.toThrow('Missing required category data');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('updates category', async () => {
      mockFetchOnce(200, { id: 'cat-1', name: 'Updated' });
      await updateCategory('user-1', 'cat-1', { name: 'Updated' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/categories/cat-1'),
        expect.objectContaining({ method: 'PUT' })
      );
    });

    it('throws when updateCategory missing params', async () => {
      await expect(updateCategory(null, null, {})).rejects.toThrow('Missing required parameters');
    });

    it('deletes category', async () => {
      mockFetchOnce(204, null);
      await deleteCategory('user-1', 'cat-1');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/categories/cat-1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('throws when deleteCategory missing params', async () => {
      await expect(deleteCategory(null, null)).rejects.toThrow('Missing required parameters');
    });
  });

  describe('subscriptions', () => {
    it('subscribes to expenses, fetches once, and returns unsubscribe', async () => {
      mockFetchOnce(200, [{ id: 1, amount: 15 }]);
      const callback = jest.fn();
      const unsubscribe = subscribeToExpenses('user-1', callback);
      await flush();
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/expenses'), expect.anything());
      expect(callback).toHaveBeenCalledWith([{ id: 1, amount: 15 }]);
      expect(typeof unsubscribe).toBe('function');
    });

    it('invokes error callback when the expenses fetch fails', async () => {
      mockFetchOnce(500, { error: 'listener' });
      const callback = jest.fn();
      subscribeToExpenses('user-1', callback);
      await flush();
      expect(callback).toHaveBeenCalledWith(undefined, expect.any(Error));
    });

    it('throws if subscribeToExpenses called with invalid args', () => {
      expect(() => subscribeToExpenses(null, jest.fn())).toThrow(
        'Invalid parameters for expense subscription'
      );
    });

    it('subscribes to categories', async () => {
      mockFetchOnce(200, [{ id: 1, name: 'Food' }]);
      const callback = jest.fn();
      subscribeToCategories('user-1', callback);
      await flush();
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/categories'), expect.anything());
      expect(callback).toHaveBeenCalledWith([{ id: 1, name: 'Food' }]);
    });

    it('invokes error callback when the categories fetch fails', async () => {
      mockFetchOnce(500, { error: 'categories' });
      const callback = jest.fn();
      subscribeToCategories('user-1', callback);
      await flush();
      expect(callback).toHaveBeenCalledWith(undefined, expect.any(Error));
    });

    it('throws when subscribeToCategories missing params', () => {
      expect(() => subscribeToCategories('user', null)).toThrow(
        'Invalid parameters for category subscription'
      );
    });
  });
});
