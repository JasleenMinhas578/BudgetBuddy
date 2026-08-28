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
import { snapshotToArray } from '../utils/firebaseUtils';

export const addCategory = async (userId, categoryData) => {
  try {
    if (!db) throw new Error('Firebase not configured. Please set up your Firebase project.');
    if (!userId || !categoryData.name) throw new Error('Missing required category data');
    const categoryWithMetadata = {
      ...categoryData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'users', userId, 'categories'), categoryWithMetadata);
    return docRef.id;
  } catch (error) {
    console.error('Error adding category:', error);
    throw new Error(`Failed to add category: ${error.message}`);
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

// Reassigns all expenses with the given category name to "Other".
// Used when hiding a default category so existing expenses don't keep a hidden label.
export const reassignCategoryExpenses = async (userId, categoryName) => {
  const expSnap = await getDocs(
    query(collection(db, 'users', userId, 'expenses'), where('category', '==', categoryName))
  );
  const expDocs = expSnap.docs;
  if (expDocs.length === 0) return;

  const BATCH_SIZE = 500;
  for (let i = 0; i < expDocs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    expDocs.slice(i, i + BATCH_SIZE).forEach(d =>
      batch.update(d.ref, { category: 'Other', updatedAt: serverTimestamp() })
    );
    await batch.commit();
  }
};

// Renames all expenses that reference oldName to use newName.
// Called after a category is renamed so existing expense records stay consistent.
export const renameCategoryExpenses = async (userId, oldName, newName) => {
  const expSnap = await getDocs(
    query(collection(db, 'users', userId, 'expenses'), where('category', '==', oldName))
  );
  const expDocs = expSnap.docs;
  if (expDocs.length === 0) return;

  const BATCH_SIZE = 500;
  for (let i = 0; i < expDocs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    expDocs.slice(i, i + BATCH_SIZE).forEach(d =>
      batch.update(d.ref, { category: newName, updatedAt: serverTimestamp() })
    );
    await batch.commit();
  }
};

// Deletes a category and reassigns all its expenses to "Other" instead of deleting them.
export const reassignAndDeleteCategory = async (userId, categoryId, categoryName) => {
  const expSnap = await getDocs(
    query(collection(db, 'users', userId, 'expenses'), where('category', '==', categoryName))
  );
  const expDocs = expSnap.docs;
  const BATCH_SIZE = 500;

  // First batch: delete the category doc + reassign up to 499 expenses
  const firstBatch = writeBatch(db);
  firstBatch.delete(doc(db, 'users', userId, 'categories', categoryId));
  expDocs.slice(0, BATCH_SIZE - 1).forEach(d =>
    firstBatch.update(d.ref, { category: 'Other', updatedAt: serverTimestamp() })
  );
  await firstBatch.commit();

  // Remaining expenses in subsequent batches of 500
  const remaining = expDocs.slice(BATCH_SIZE - 1);
  for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    remaining.slice(i, i + BATCH_SIZE).forEach(d =>
      batch.update(d.ref, { category: 'Other', updatedAt: serverTimestamp() })
    );
    await batch.commit();
  }
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
        callback(snapshotToArray(snapshot));
      },
      (error) => { console.error('Error listening to categories:', error); callback([], error); }
    );
  } catch (error) {
    console.error('Error setting up category subscription:', error);
    throw new Error(`Failed to subscribe to categories: ${error.message}`);
  }
};
