import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  arrayUnion,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const addCategory = async (userId, categoryData) => {
  try {
    if (!db) throw new Error('Firebase not configured. Please set up your Firebase project.');
    if (!userId || !categoryData.name) throw new Error('Missing required category data');
    const now = new Date();
    const categoryWithMetadata = {
      ...categoryData,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(collection(db, 'users', userId, 'categories'), categoryWithMetadata);
    return docRef.id;
  } catch (error) {
    console.error('Error adding category:', error);
    throw new Error(`Failed to add category: ${error.message}`);
  }
};

export const getCategories = async (userId) => {
  try {
    const q = query(collection(db, 'users', userId, 'categories'));
    const querySnapshot = await getDocs(q);
    const categories = [];
    querySnapshot.forEach((doc) => categories.push({ id: doc.id, ...doc.data() }));
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

export const updateCategory = async (userId, categoryId, updateData) => {
  try {
    if (!userId || !categoryId) throw new Error('Missing required parameters');
    const categoryRef = doc(db, 'users', userId, 'categories', categoryId);
    await updateDoc(categoryRef, { ...updateData, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error(`Failed to update category: ${error.message}`);
  }
};

export const deleteCategory = async (userId, categoryId) => {
  try {
    if (!userId || !categoryId) throw new Error('Missing required parameters');
    await deleteDoc(doc(db, 'users', userId, 'categories', categoryId));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error(`Failed to delete category: ${error.message}`);
  }
};

export const subscribeToUserPreferences = (userId, callback) => {
  const prefRef = doc(db, 'users', userId, 'preferences', 'general');
  return onSnapshot(
    prefRef,
    (snap) => callback(snap.exists() ? snap.data() : {}),
    () => callback({})
  );
};

export const hideDefaultCategory = async (userId, categoryName) => {
  const prefRef = doc(db, 'users', userId, 'preferences', 'general');
  await setDoc(prefRef, { hiddenDefaultCategories: arrayUnion(categoryName) }, { merge: true });
};

export const deleteCategoryAndExpenses = async (userId, categoryId, categoryName) => {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'users', userId, 'categories', categoryId));
  const expSnap = await getDocs(
    query(collection(db, 'users', userId, 'expenses'), where('category', '==', categoryName))
  );
  expSnap.forEach(d => batch.delete(d.ref));
  await batch.commit();
};

export const subscribeToCategories = (userId, callback) => {
  try {
    if (!userId || typeof callback !== 'function') {
      throw new Error('Invalid parameters for category subscription');
    }
    const q = query(collection(db, 'users', userId, 'categories'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const categories = [];
        snapshot.forEach((doc) => categories.push({ id: doc.id, ...doc.data() }));
        callback(categories);
      },
      (error) => { console.error('Error listening to categories:', error); callback([], error); }
    );
  } catch (error) {
    console.error('Error setting up category subscription:', error);
    throw new Error(`Failed to subscribe to categories: ${error.message}`);
  }
};
