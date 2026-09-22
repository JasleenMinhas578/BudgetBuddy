import { apiFetch } from './apiClient';
import { createSubscribable } from './pubsub';

const { subscribe: subscribeCategories, notify: notifyCategories } =
  createSubscribable(() => apiFetch('/api/categories'));
const { subscribe: subscribePrefs, notify: notifyPrefs } =
  createSubscribable(() => apiFetch('/api/settings').then((s) => ({ hiddenDefaultCategories: s.hiddenDefaultCategories })));

export const addCategory = async (userId, categoryData) => {
  try {
    if (!userId || !categoryData.name) throw new Error('Missing required category data');
    const created = await apiFetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    notifyCategories(userId);
    return String(created.id);
  } catch (error) {
    console.error('Error adding category:', error);
    throw new Error(`Failed to add category: ${error.message}`);
  }
};

// Renaming cascades onto every expense referencing the old name — handled
// server-side in one transaction now, so no separate "rename expenses" call
// is needed here (Firestore's version required two round-trips).
export const updateCategory = async (userId, categoryId, updateData) => {
  try {
    if (!userId || !categoryId) throw new Error('Missing required parameters');
    await apiFetch(`/api/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    notifyCategories(userId);
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error(`Failed to update category: ${error.message}`);
  }
};

// Deletes the category AND reassigns its expenses to "Other" — also one
// transaction server-side now.
export const deleteCategory = async (userId, categoryId) => {
  try {
    if (!userId || !categoryId) throw new Error('Missing required parameters');
    await apiFetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
    notifyCategories(userId);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error(`Failed to delete category: ${error.message}`);
  }
};

export const subscribeToCategories = (userId, callback) => {
  if (!userId || typeof callback !== 'function') {
    throw new Error('Invalid parameters for category subscription');
  }
  return subscribeCategories(userId, callback);
};

export const subscribeToUserPreferences = (userId, callback) => {
  return subscribePrefs(userId, callback);
};

export const hideDefaultCategory = async (userId, categoryName) => {
  await apiFetch('/api/settings/hide-category', {
    method: 'POST',
    body: JSON.stringify({ categoryName }),
  });
  notifyPrefs(userId);
};

// Reassigns expenses in a category to "Other" without deleting anything —
// used for default categories (Food, Rent, ...), which were never rows in
// the `categories` table to begin with.
export const reassignCategoryExpenses = async (userId, categoryName) => {
  await apiFetch('/api/categories/reassign', {
    method: 'POST',
    body: JSON.stringify({ categoryName }),
  });
};
