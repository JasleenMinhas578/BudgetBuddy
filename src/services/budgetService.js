import { doc, onSnapshot, setDoc, deleteField, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const budgetRef = (userId) => doc(db, 'users', userId, 'budgets', 'config');

export const subscribeToBudgets = (userId, callback) => {
  if (!userId || typeof callback !== 'function') throw new Error('Invalid parameters');
  return onSnapshot(
    budgetRef(userId),
    (snap) => callback(snap.exists?.() ? snap.data() : { monthly: null, categories: {} }),
    (err) => { console.error('Budget listener error:', err); callback({ monthly: null, categories: {} }); }
  );
};

export const updateCategoryBudget = async (userId, categoryName, amount) => {
  const value = amount === null || amount === undefined || amount === '' ? deleteField() : Number(amount);
  try {
    return await setDoc(
      budgetRef(userId),
      { categories: { [categoryName]: value }, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to update category budget:', err);
    throw new Error('Failed to save budget goal. Please try again.');
  }
};

export const updateMonthlyBudget = async (userId, amount) => {
  const value = amount === null || amount === undefined || amount === '' ? null : Number(amount);
  try {
    return await setDoc(
      budgetRef(userId),
      { monthly: value, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to update monthly budget:', err);
    throw new Error('Failed to save monthly budget. Please try again.');
  }
};
