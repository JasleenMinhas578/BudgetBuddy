import {
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { snapshotToArray } from '../utils/firebaseUtils';

export const addExpense = async (userId, expenseData) => {
  try {
    if (!userId || !expenseData.title || !expenseData.category || !expenseData.date) {
      throw new Error('Missing required expense data');
    }
    if (expenseData.amount == null || Number.isNaN(expenseData.amount) || expenseData.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }
    const expenseWithMetadata = {
      ...expenseData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'users', userId, 'expenses'), expenseWithMetadata);
    return docRef.id;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw new Error(`Failed to add expense: ${error.message}`);
  }
};

export const getExpenses = async (userId) => {
  try {
    const q = query(collection(db, 'users', userId, 'expenses'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return snapshotToArray(querySnapshot);
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
};

export const updateExpense = async (userId, expenseId, updateData) => {
  try {
    if (!userId || !expenseId) throw new Error('Missing required parameters');
    const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
    await updateDoc(expenseRef, { ...updateData, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error updating expense:', error);
    throw new Error(`Failed to update expense: ${error.message}`);
  }
};

export const deleteExpense = async (userId, expenseId) => {
  try {
    if (!userId || !expenseId) throw new Error('Missing required parameters');
    await deleteDoc(doc(db, 'users', userId, 'expenses', expenseId));
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw new Error(`Failed to delete expense: ${error.message}`);
  }
};

export const subscribeToExpenses = (userId, callback) => {
  try {
    if (!userId || typeof callback !== 'function') {
      throw new Error('Invalid parameters for expense subscription');
    }
    const q = query(collection(db, 'users', userId, 'expenses'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        callback(snapshotToArray(snapshot));
      },
      (error) => { console.error('Error listening to expenses:', error); callback([], error); }
    );
  } catch (error) {
    console.error('Error setting up expense subscription:', error);
    throw new Error(`Failed to subscribe to expenses: ${error.message}`);
  }
};
