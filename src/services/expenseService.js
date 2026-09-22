import { apiFetch } from './apiClient';
import { createSubscribable } from './pubsub';

const { subscribe, notify } = createSubscribable(() => apiFetch('/api/expenses'));

export const addExpense = async (userId, expenseData) => {
  try {
    if (!userId || !expenseData.title || !expenseData.category || !expenseData.date) {
      throw new Error('Missing required expense data');
    }
    if (expenseData.amount == null || Number.isNaN(expenseData.amount) || expenseData.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }
    const created = await apiFetch('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
    notify(userId);
    return String(created.id);
  } catch (error) {
    console.error('Error adding expense:', error);
    throw new Error(`Failed to add expense: ${error.message}`);
  }
};

export const updateExpense = async (userId, expenseId, updateData) => {
  try {
    if (!userId || !expenseId) throw new Error('Missing required parameters');
    await apiFetch(`/api/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    notify(userId);
  } catch (error) {
    console.error('Error updating expense:', error);
    throw new Error(`Failed to update expense: ${error.message}`);
  }
};

export const deleteExpense = async (userId, expenseId) => {
  try {
    if (!userId || !expenseId) throw new Error('Missing required parameters');
    await apiFetch(`/api/expenses/${expenseId}`, { method: 'DELETE' });
    notify(userId);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw new Error(`Failed to delete expense: ${error.message}`);
  }
};

export const subscribeToExpenses = (userId, callback) => {
  if (!userId || typeof callback !== 'function') {
    throw new Error('Invalid parameters for expense subscription');
  }
  return subscribe(userId, callback);
};
