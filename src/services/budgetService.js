import { apiFetch } from './apiClient';
import { createSubscribable } from './pubsub';

const { subscribe, notify } = createSubscribable(() => apiFetch('/api/budgets'));

export const subscribeToBudgets = (userId, callback) => {
  if (!userId || typeof callback !== 'function') throw new Error('Invalid parameters');
  // Matches the old Firestore listener's error fallback shape so callers
  // (e.g. useBudgets.js) can safely do `budgets.categories` unconditionally.
  return subscribe(userId, (data, err) => {
    if (err) {
      console.error('Budget listener error:', err);
      callback({ monthly: null, categories: {} });
    } else {
      callback(data);
    }
  });
};

export const updateCategoryBudget = async (userId, categoryName, amount) => {
  try {
    await apiFetch(`/api/budgets/categories/${encodeURIComponent(categoryName)}`, {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    });
    notify(userId);
  } catch (err) {
    console.error('Failed to update category budget:', err);
    throw new Error('Failed to save budget goal. Please try again.');
  }
};

export const updateMonthlyBudget = async (userId, amount) => {
  try {
    await apiFetch('/api/budgets/monthly', {
      method: 'PUT',
      body: JSON.stringify({ monthly: amount ?? null }),
    });
    notify(userId);
  } catch (err) {
    console.error('Failed to update monthly budget:', err);
    throw new Error('Failed to save monthly budget. Please try again.');
  }
};
