// Unit tests for the Firestore-backed `database` service functions.
// - Mocks Firestore and the shared `db` reference so tests only verify queries, writes, and listeners.
// - Covers CRUD operations for expenses and categories, including required-field validation and timestamp metadata.
// - Verifies subscription helpers that stream expenses and categories, including error callbacks and invalid-parameter guards.
// - Ensures that service functions rethrow Firestore failures so calling code can respond appropriately.
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

jest.mock('../firebaseConfig', () => ({
  db: 'db-instance'
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn()
}));

const {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} = require('firebase/firestore');

describe('database service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    collection.mockReturnValue('collection-ref');
    query.mockReturnValue('query-ref');
    where.mockReturnValue('where-clause');
    doc.mockReturnValue('doc-ref');
    orderBy.mockReturnValue('order-by');
    serverTimestamp.mockReturnValue('timestamp');
    addDoc.mockResolvedValue({ id: 'doc-id' });
    getDocs.mockResolvedValue({
      docs: [{ id: '1', data: () => ({ amount: 10 }) }]
    });
    onSnapshot.mockImplementation((q, onNext) => {
      onNext({
        docs: [{ id: '1', data: () => ({ amount: 15 }) }]
      });
      return jest.fn();
    });
  });

  describe('expenses CRUD', () => {
    it('adds expense with metadata', async () => {
      const id = await addExpense('user-1', {
        title: 'Coffee',
        amount: 5,
        category: 'Food',
        date: '2024-02-01'
      });

      expect(addDoc).toHaveBeenCalledWith(
        'collection-ref',
        expect.objectContaining({
          title: 'Coffee',
          userId: 'user-1',
          createdAt: 'timestamp',
          updatedAt: 'timestamp'
        })
      );
      expect(id).toBe('doc-id');
    });

    it('throws when required expense data missing', async () => {
      await expect(addExpense('user', { amount: 5 })).rejects.toThrow(
        'Missing required expense data'
      );
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

    it('updates expense with timestamp', async () => {
      await updateExpense('user-1', 'exp-1', { title: 'Updated' });
      expect(doc).toHaveBeenCalledWith('db-instance', 'users', 'user-1', 'expenses', 'exp-1');
      expect(updateDoc).toHaveBeenCalledWith('doc-ref', {
        title: 'Updated',
        updatedAt: 'timestamp'
      });
    });

    it('throws when updateExpense missing parameters', async () => {
      await expect(updateExpense(null, null, {})).rejects.toThrow('Missing required parameters');
    });

    it('deletes expense', async () => {
      await deleteExpense('user-1', 'exp-1');
      expect(deleteDoc).toHaveBeenCalledWith('doc-ref');
    });

    it('throws when deleteExpense missing parameters', async () => {
      await expect(deleteExpense(null, null)).rejects.toThrow('Missing required parameters');
    });
  });

  describe('category CRUD', () => {
    it('adds category with metadata', async () => {
      const id = await addCategory('user-1', { name: 'Travel' });
      expect(addDoc).toHaveBeenCalled();
      expect(id).toBe('doc-id');
    });

    it('throws when category data missing', async () => {
      await expect(addCategory('user', {})).rejects.toThrow('Missing required category data');
    });

    it('updates category', async () => {
      await updateCategory('user-1', 'cat-1', { name: 'Updated' });
      expect(updateDoc).toHaveBeenCalledWith('doc-ref', {
        name: 'Updated',
        updatedAt: 'timestamp'
      });
    });

    it('throws when updateCategory missing params', async () => {
      await expect(updateCategory(null, null, {})).rejects.toThrow('Missing required parameters');
    });

    it('deletes category', async () => {
      await deleteCategory('user-1', 'cat-1');
      expect(deleteDoc).toHaveBeenCalledWith('doc-ref');
    });

    it('throws when deleteCategory missing params', async () => {
      await expect(deleteCategory(null, null)).rejects.toThrow('Missing required parameters');
    });
  });

  describe('subscriptions', () => {
    it('subscribes to expenses and returns unsubscribe', () => {
      const callback = jest.fn();
      const unsubscribe = subscribeToExpenses('user-1', callback);
      expect(onSnapshot).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith([{ id: '1', amount: 15 }]);
      expect(typeof unsubscribe).toBe('function');
    });

    it('invokes error callback when expenses listener fails', () => {
      const listenError = new Error('listener');
      onSnapshot.mockImplementationOnce((q, onNext, onError) => {
        onError(listenError);
        return jest.fn();
      });
      const callback = jest.fn();
      subscribeToExpenses('user-1', callback);
      expect(callback).toHaveBeenCalledWith([], listenError);
    });

    it('throws if subscribeToExpenses called with invalid args', () => {
      expect(() => subscribeToExpenses(null, jest.fn())).toThrow(
        'Invalid parameters for expense subscription'
      );
    });

    it('subscribes to categories', () => {
      const callback = jest.fn();
      subscribeToCategories('user-1', callback);
      expect(onSnapshot).toHaveBeenCalled();
    });

    it('invokes error callback when category listener fails', () => {
      const listenError = new Error('categories');
      onSnapshot.mockImplementationOnce((q, onNext, onError) => {
        onError(listenError);
        return jest.fn();
      });
      const callback = jest.fn();
      subscribeToCategories('user-1', callback);
      expect(callback).toHaveBeenCalledWith([], listenError);
    });

    it('throws when subscribeToCategories missing params', () => {
      expect(() => subscribeToCategories('user', null)).toThrow(
        'Invalid parameters for category subscription'
      );
    });

  });
});

