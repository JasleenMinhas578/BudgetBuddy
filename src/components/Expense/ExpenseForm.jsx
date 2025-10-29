import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addExpense } from '../../services/database';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import '../../styles/main.css';

export default function ExpenseForm({ onExpenseAdded, onExpenseEdited, initialExpense = null, isEditMode = false }) {
  // Form state management
  const [amount, setAmount] = useState(initialExpense ? initialExpense.amount : '');
  const [title, setTitle] = useState(initialExpense ? initialExpense.title : '');
  const [category, setCategory] = useState(initialExpense ? initialExpense.category : 'Food');
  const [date, setDate] = useState(initialExpense ? initialExpense.date : '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Get current user from authentication context
  const { currentUser } = useAuth();

  // Default categories
  const defaultCategories = [
    { id: 'food', name: 'Food', icon: '🍕' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'utilities', name: 'Utilities', icon: '💡' },
    { id: 'rent', name: 'Rent', icon: '🏠' },
    { id: 'other', name: 'Other', icon: '📦' }
  ];

  // State for custom categories
  const [customCategories, setCustomCategories] = useState([]);

  // Fetch custom categories from Firestore
  useEffect(() => {
    if (!currentUser) return;
  
    // Initialize unsubscribe as a no-op function first
    let unsubscribe = () => {};
  
    try {
      const q = query(collection(db, 'users', currentUser.uid, 'categories'));
      
      // Assign the real unsubscribe function
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const cats = [];
        querySnapshot.forEach((doc) => {
          cats.push({ id: doc.id, name: doc.data().name, icon: '📊' });
        });
        setCustomCategories(cats);
      });
  
    } catch (error) {
      console.error("Error setting up categories listener:", error);
    }
  
    // Return cleanup function
    return () => {
      try {
        // Only call if it's a function
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
    };
  }, [currentUser]);

  // Merge default and custom categories, avoiding duplicates by name
  const allCategories = [
    ...defaultCategories,
    ...customCategories.filter(cat => !defaultCategories.some(def => def.name === cat.name))
  ];

  /**
   * Set default date to today only if not already set (for add mode)
   */
  useEffect(() => {
    if (!initialExpense && !date) {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    }
  }, [initialExpense, date]);

  // Update form fields if initialExpense changes (for edit mode)
  useEffect(() => {
    if (initialExpense) {
      setAmount(initialExpense.amount);
      setTitle(initialExpense.title);
      setCategory(initialExpense.category);
      setDate(initialExpense.date);
    }
  }, [initialExpense]);

  /**
   * Validate form inputs before submission
   * 
   * Checks:
   * - Amount is a positive number
   * - Description is not empty
   * - Date is not in the future
   * - Category is selected
   * 
   * @returns {Object} Validation result with isValid boolean and error message
   */
  const validateForm = () => {
    // Check if amount is valid positive number
    const amountValue = parseFloat(amount);
    if (!amount || amountValue <= 0) {
      return { isValid: false, message: 'Please enter a valid amount' };
    }
    
    // Check if title is provided
    if (!title.trim()) {
      return { isValid: false, message: 'Please enter a title' };
    }
    
    // Check if date is selected
    if (!date) {
      return { isValid: false, message: 'Please select a date' };
    }
    
    // Check if date is not in the future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    
    if (selectedDate > today) {
      return { isValid: false, message: 'Date cannot be in the future' };
    }
    
    return { isValid: true, message: '' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous messages
    setMessage('');
    setMessageType('');
    
    // Validate form inputs
    const validation = validateForm();
    if (!validation.isValid) {
      setMessage(validation.message);
      setMessageType('error');
      return;
    }
    
    try {
      // Set loading state to show spinner/disable form
      setLoading(true);
      
      if (isEditMode && initialExpense) {
        // Update existing expense (you may need to import and use updateExpense from your service)
        // For now, just call the callback
        if (onExpenseEdited) onExpenseEdited({
          id: initialExpense.id,
          amount: parseFloat(amount),
          title: title.trim(),
          category,
          date
        });
      } else {
      // Create expense object with all necessary data
      const expenseData = {
        amount: parseFloat(amount),
          title: title.trim(),
        category,
          date
      };
      // Save expense to Firebase database
        await addExpense(currentUser.uid, expenseData);
      // Show success message
      setMessage('Expense added successfully!');
      setMessageType('success');
      // Reset form to initial state
      setAmount('');
        setTitle('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      // Call callback to refresh expense list in parent component
      if (onExpenseAdded) {
        onExpenseAdded();
        }
      }
      
    } catch (error) {
      // Display error message
      setMessage('Failed to add expense: ' + error.message);
      setMessageType('error');
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  const handleAmountChange = (value) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setAmount(cleanValue);
  };

  return (
    <div className="expense-form-container">
      {/* Display success/error messages */}
      {message && (
        <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}
      
      {/* Expense form */}
      <form onSubmit={handleSubmit} className="expense-form">
        {/* Amount input field */}
        <div className="form-group">
          <label htmlFor="amount">Amount ($)</label>
          <input
            type="text"
            id="amount"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            required
            disabled={loading}
          />
        </div>
        
        {/* Title input field (was Description) */}
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Expense title"
            required
            disabled={loading}
          />
        </div>
        
        {/* Category selection dropdown */}
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
           {allCategories.map((cat) => (
             <option key={cat.id || cat.name} value={cat.name}>
               {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Date picker */}
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        {/* Submit button with loading state */}
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Adding Expense...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
} 