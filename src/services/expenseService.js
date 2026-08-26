import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const addExpense = async (userId, expenseData) => {
  try {
    if (!userId || !expenseData.title || !expenseData.amount || !expenseData.category || !expenseData.date) {
      throw new Error('Missing required expense data');
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
    const expenses = [];
    querySnapshot.forEach((doc) => expenses.push({ id: doc.id, ...doc.data() }));
    return expenses;
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
        const expenses = [];
        snapshot.forEach((doc) => expenses.push({ id: doc.id, ...doc.data() }));
        callback(expenses);
      },
      (error) => { console.error('Error listening to expenses:', error); callback([], error); }
    );
  } catch (error) {
    console.error('Error setting up expense subscription:', error);
    throw new Error(`Failed to subscribe to expenses: ${error.message}`);
  }
};

export const subscribeToExpensesByCategory = (userId, category, callback) => {
  try {
    if (!userId || !category || typeof callback !== 'function') {
      throw new Error('Invalid parameters for category expense subscription');
    }
    const q = query(
      collection(db, 'users', userId, 'expenses'),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const expenses = [];
        snapshot.forEach((doc) => expenses.push({ id: doc.id, ...doc.data() }));
        callback(expenses);
      },
      (error) => { console.error('Error listening to category expenses:', error); callback([], error); }
    );
  } catch (error) {
    console.error('Error setting up category expense subscription:', error);
    throw new Error(`Failed to subscribe to category expenses: ${error.message}`);
  }
};
