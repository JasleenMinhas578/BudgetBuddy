import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getExpenses, deleteExpense } from '../../services/database';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/main.css';

/**
 * ExpenseList Component
 * 
 * This component displays a list of user expenses with:
 * - Real-time data fetching from Firebase
 * - Expense filtering by category and date range
 * - Sorting options (date, amount, category)
 * - Delete functionality with confirmation
 * - Loading states and error handling
 * - Responsive design with animations
 * 
 * Features:
 * - Automatic data refresh when expenses change
 * - Category-based filtering
 * - Date range filtering
 * - Multiple sorting options
 * - Delete confirmation modal
 * - Empty state handling
 * - Loading and error states
 * - Responsive grid layout
 */
export default function ExpenseList({ refreshTrigger }) {
  // State management for expenses and UI
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  
  // Get current user from authentication context
  const { currentUser } = useAuth();

  // Predefined expense categories for filtering
  const categories = [
    'All', 'Food', 'Transport', 'Entertainment', 
    'Shopping', 'Bills', 'Health', 'Education', 'Other'
  ];

  /**
   * Fetch expenses from Firebase database
   * 
   * This function:
   * 1. Sets loading state
   * 2. Fetches expenses for current user
   * 3. Updates state with fetched data
   * 4. Handles errors appropriately
   * 5. Resets loading state
   */
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch expenses for current user from Firebase
      const userExpenses = await getExpenses(currentUser.uid);
      setExpenses(userExpenses);
    } catch (error) {
      setError('Failed to load expenses: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Fetch expenses when component mounts or refresh is triggered
   * 
   * This effect runs:
   * - On component mount
   * - When refreshTrigger changes (new expense added)
   * - When currentUser changes
   */
  useEffect(() => {
    if (currentUser) {
      fetchExpenses();
    }
  }, [currentUser, refreshTrigger, fetchExpenses]);

  /**
   * Filter and sort expenses based on current filter and sort settings
   * 
   * This function:
   * 1. Filters expenses by category (if not 'All')
   * 2. Sorts expenses by selected criteria
   * 3. Applies sort order (ascending/descending)
   * 
   * @returns {Array} Filtered and sorted expenses
   */
  const getFilteredAndSortedExpenses = () => {
    let filteredExpenses = [...expenses];
    
    // Filter by category if not 'All'
    if (filterCategory !== 'All') {
      filteredExpenses = filteredExpenses.filter(
        expense => expense.category === filterCategory
      );
    }
    
    // Sort expenses based on selected criteria
    filteredExpenses.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        default:
          comparison = 0;
      }
      
      // Apply sort order
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filteredExpenses;
  };

  /**
   * Handle expense deletion
   * 
   * This function:
   * 1. Shows delete confirmation modal
   * 2. Sets expense to be deleted
   * 
   * @param {Object} expense - Expense object to delete
   */
  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  /**
   * Confirm and execute expense deletion
   * 
   * This function:
   * 1. Deletes expense from Firebase
   * 2. Updates local state
   * 3. Closes modal
   * 4. Handles errors
   */
  const confirmDelete = async () => {
    try {
      // Delete expense from Firebase database
      await deleteExpense(expenseToDelete.id);
      
      // Remove expense from local state
      setExpenses(expenses.filter(exp => exp.id !== expenseToDelete.id));
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setExpenseToDelete(null);
    } catch (error) {
      setError('Failed to delete expense: ' + error.message);
      setShowDeleteModal(false);
      setExpenseToDelete(null);
    }
  };

  /**
   * Cancel deletion and close modal
   */
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setExpenseToDelete(null);
  };

  /**
   * Format date for display
   * 
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${months[parseInt(month, 10) - 1]} ${day}, ${year}`;
  };

  /**
   * Format amount for display with currency
   * 
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get filtered and sorted expenses
  const filteredExpenses = getFilteredAndSortedExpenses();

  return (
    <div className="expense-list-container">
      {/* Header with filters and sorting */}
      <div className="expense-list-header">
        <h3>Your Expenses</h3>
        
        {/* Filter and sort controls */}
        <div className="expense-controls">
          {/* Category filter */}
          <div className="filter-group">
            <label>Filter by Category:</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort by field */}
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="category">Category</option>
              <option value="description">Description</option>
            </select>
          </div>
          
          {/* Sort order toggle */}
          <div className="filter-group">
            <label>Order:</label>
            <button 
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Error message display */}
      {error && <div className="error-alert">{error}</div>}

      {/* Loading state */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading expenses...</p>
        </div>
      )}

      {/* Expense list */}
      {!loading && (
        <div className="expense-list">
          <AnimatePresence>
            {filteredExpenses.length === 0 ? (
              // Empty state
              <motion.div 
                className="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p>No expenses found.</p>
                {filterCategory !== 'All' && (
                  <p>Try changing the category filter or add a new expense.</p>
                )}
              </motion.div>
            ) : (
              // Expense items
              filteredExpenses.map((expense) => (
                <motion.div
                  key={expense.id}
                  className="expense-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Expense details */}
                  <div className="expense-details">
                    <div className="expense-header">
                      <h4>{expense.description}</h4>
                      <span className="expense-amount">
                        {formatAmount(expense.amount)}
                      </span>
                    </div>
                    
                    <div className="expense-meta">
                      <span className="expense-category">
                        {expense.category}
                      </span>
                      <span className="expense-date">
                        {formatDate(expense.date)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(expense)}
                    title="Delete expense"
                  >
                    ×
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Expense</h3>
            <p>
              Are you sure you want to delete "{expenseToDelete?.description}" 
              for {formatAmount(expenseToDelete?.amount)}?
            </p>
            <p>This action cannot be undone.</p>
            
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 