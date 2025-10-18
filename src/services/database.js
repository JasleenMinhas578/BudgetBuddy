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
    serverTimestamp
  } from 'firebase/firestore';
  import { db } from '../firebaseConfig';
  
  /**
   * Database Service Functions
   * 
   * This module provides a centralized interface for all Firestore database operations.
   * It handles CRUD operations for expenses and categories with proper error handling
   * and data validation.
   * 
   * All functions are designed to work with user-specific data collections
   * following the pattern: users/{userId}/expenses and users/{userId}/categories
   */
  
  /**
   * Add a new expense to the database
   * 
   * @param {string} userId - User's unique identifier
   * @param {Object} expenseData - Expense data object
   * @param {string} expenseData.title - Expense title
   * @param {number} expenseData.amount - Expense amount
   * @param {string} expenseData.category - Expense category
   * @param {string} expenseData.date - Expense date
   * @returns {Promise<string>} Document ID of the created expense
   */
  export const addExpense = async (userId, expenseData) => {
    try {
      // Validate required fields
      if (!userId || !expenseData.title || !expenseData.amount || !expenseData.category || !expenseData.date) {
        throw new Error('Missing required expense data');
      }
  
      // Add timestamp and user ID to the expense data
      const expenseWithMetadata = {
        ...expenseData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
  
      // Add document to Firestore
      const docRef = await addDoc(collection(db, 'users', userId, 'expenses'), expenseWithMetadata);
      return docRef.id;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw new Error(`Failed to add expense: ${error.message}`);
    }
  };
  
  export const getExpenses = async (userId) => {
    try {
      const q = query(collection(db, 'expenses'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const expenses = [];
      querySnapshot.forEach((doc) => {
        expenses.push({ id: doc.id, ...doc.data() });
      });
      return expenses;
    } catch (error) {
      console.error('Error getting expenses: ', error);
      throw error;
    }
  };
  
  /**
   * Update an existing expense in the database
   * 
   * @param {string} userId - User's unique identifier
   * @param {string} expenseId - Expense document ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  export const updateExpense = async (userId, expenseId, updateData) => {
    try {
      // Validate required parameters
      if (!userId || !expenseId) {
        throw new Error('Missing required parameters');
      }
  
      // Add updated timestamp
      const dataWithTimestamp = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
  
      // Update document in Firestore
      const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
      await updateDoc(expenseRef, dataWithTimestamp);
    } catch (error) {
      console.error('Error updating expense:', error);
      throw new Error(`Failed to update expense: ${error.message}`);
    }
  };
  
  /**
   * Delete an expense from the database
   * 
   * @param {string} userId - User's unique identifier
   * @param {string} expenseId - Expense document ID
   * @returns {Promise<void>}
   */
  export const deleteExpense = async (userId, expenseId) => {
    try {
      // Validate required parameters
      if (!userId || !expenseId) {
        throw new Error('Missing required parameters');
      }
  
      // Delete document from Firestore
      const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
      await deleteDoc(expenseRef);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
  };
  
  // Categories
  /**
   * Add a new category to the database
   * 
   * @param {string} userId - User's unique identifier
   * @param {Object} categoryData - Category data object
   * @param {string} categoryData.name - Category name
   * @param {string} categoryData.color - Category color (optional)
   * @returns {Promise<string>} Document ID of the created category
   */
  export const addCategory = async (userId, categoryData) => {
    try {
      // Validate required fields
      if (!userId || !categoryData.name) {
        throw new Error('Missing required category data');
      }
  
      // Add timestamp and user ID to the category data
      const categoryWithMetadata = {
        ...categoryData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
  
      // Add document to Firestore
      const docRef = await addDoc(collection(db, 'users', userId, 'categories'), categoryWithMetadata);
      return docRef.id;
    } catch (error) {
      console.error('Error adding category:', error);
      throw new Error(`Failed to add category: ${error.message}`);
    }
  };
  
  export const getCategories = async (userId) => {
    try {
      const q = query(collection(db, 'categories'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const categories = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      return categories;
    } catch (error) {
      console.error('Error getting categories: ', error);
      throw error;
    }
  };
  
  /**
   * Update an existing category in the database
   * 
   * @param {string} userId - User's unique identifier
   * @param {string} categoryId - Category document ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  export const updateCategory = async (userId, categoryId, updateData) => {
    try {
      // Validate required parameters
      if (!userId || !categoryId) {
        throw new Error('Missing required parameters');
      }
  
      // Add updated timestamp
      const dataWithTimestamp = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
  
      // Update document in Firestore
      const categoryRef = doc(db, 'users', userId, 'categories', categoryId);
      await updateDoc(categoryRef, dataWithTimestamp);
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error(`Failed to update category: ${error.message}`);
    }
  };
  
  /**
   * Delete a category from the database
   * 
   * @param {string} userId - User's unique identifier
   * @param {string} categoryId - Category document ID
   * @returns {Promise<void>}
   */
  export const deleteCategory = async (userId, categoryId) => {
    try {
      // Validate required parameters
      if (!userId || !categoryId) {
        throw new Error('Missing required parameters');
      }
  
      // Delete document from Firestore
      const categoryRef = doc(db, 'users', userId, 'categories', categoryId);
      await deleteDoc(categoryRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  };
  
  /**
   * Get all expenses for a user with real-time updates
   * 
   * @param {string} userId - User's unique identifier
   * @param {Function} callback - Callback function to handle data updates
   * @returns {Function} Unsubscribe function to stop listening
   */
  export const subscribeToExpenses = (userId, callback) => {
    try {
      // Validate required parameters
      if (!userId || typeof callback !== 'function') {
        throw new Error('Invalid parameters for expense subscription');
      }
  
      // Create query to get user's expenses ordered by creation date
      const q = query(
        collection(db, 'users', userId, 'expenses'),
        orderBy('createdAt', 'desc')
      );
  
      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const expenses = [];
        querySnapshot.forEach((doc) => {
          expenses.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Call the callback with updated data
        callback(expenses);
      }, (error) => {
        console.error('Error listening to expenses:', error);
        callback([], error);
      });
  
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up expense subscription:', error);
      throw new Error(`Failed to subscribe to expenses: ${error.message}`);
    }
  };
  
  /**
   * Get all categories for a user with real-time updates
   * 
   * @param {string} userId - User's unique identifier
   * @param {Function} callback - Callback function to handle data updates
   * @returns {Function} Unsubscribe function to stop listening
   */
  export const subscribeToCategories = (userId, callback) => {
    try {
      // Validate required parameters
      if (!userId || typeof callback !== 'function') {
        throw new Error('Invalid parameters for category subscription');
      }
  
      // Create query to get user's categories ordered by creation date
      const q = query(
        collection(db, 'users', userId, 'categories'),
        orderBy('createdAt', 'desc')
      );
  
      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const categories = [];
        querySnapshot.forEach((doc) => {
          categories.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Call the callback with updated data
        callback(categories);
      }, (error) => {
        console.error('Error listening to categories:', error);
        callback([], error);
      });
  
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up category subscription:', error);
      throw new Error(`Failed to subscribe to categories: ${error.message}`);
    }
  };

  /**
   * Get expenses filtered by category
   * 
   * @param {string} userId - User's unique identifier
   * @param {string} category - Category name to filter by
   * @param {Function} callback - Callback function to handle data updates
   * @returns {Function} Unsubscribe function to stop listening
   */
  export const subscribeToExpensesByCategory = (userId, category, callback) => {
    try {
      // Validate required parameters
      if (!userId || !category || typeof callback !== 'function') {
        throw new Error('Invalid parameters for category expense subscription');
      }
  
      // Create query to get user's expenses filtered by category
      const q = query(
        collection(db, 'users', userId, 'expenses'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
  
      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const expenses = [];
        querySnapshot.forEach((doc) => {
          expenses.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Call the callback with updated data
        callback(expenses);
      }, (error) => {
        console.error('Error listening to category expenses:', error);
        callback([], error);
      });
  
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up category expense subscription:', error);
      throw new Error(`Failed to subscribe to category expenses: ${error.message}`);
    }
  };