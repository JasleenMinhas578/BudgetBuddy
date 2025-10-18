import { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import Toast from '../UI/Toast';
import '../../styles/main.css';
import { format } from 'date-fns';
import '../../styles/modal-forms.css';
import ExpenseForm from '../Expense/ExpenseForm';
import Modal from '../Modal';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [setCategories] = useState([]);
  const [newExpense] = useState({
    title: '',
    amount: '',
    category: ''
  });
  const [setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const { currentUser } = useAuth();
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
  
    let unsubscribeExpenses = () => {};
    let unsubscribeCategories = () => {};
  
    try {
      // Fetch expenses
      const qExpenses = query(
        collection(db, 'users', currentUser.uid, 'expenses'),
        orderBy('createdAt', 'desc')
      );
      
      unsubscribeExpenses = onSnapshot(qExpenses, (querySnapshot) => {
        const expensesData = [];
        querySnapshot.forEach((doc) => {
          expensesData.push({ id: doc.id, ...doc.data() });
        });
        
        const sortedExpenses = expensesData.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
          }
          if (a.date && b.date) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          return 0;
        });
        
        setExpenses(sortedExpenses);
      });
  
      // Fetch categories
      const qCategories = query(
        collection(db, 'users', currentUser.uid, 'categories')
      );
      
      unsubscribeCategories = onSnapshot(qCategories, (querySnapshot) => {
        const categoriesData = [];
        querySnapshot.forEach((doc) => {
          categoriesData.push({ id: doc.id, ...doc.data() });
        });
        setCategories(categoriesData);
      });
  
    } catch (error) {
      console.error("Error setting up listeners:", error);
      setToast({
        message: 'Error loading data. Please refresh the page.',
        type: 'error'
      });
    }
  
    return () => {
      // Safely unsubscribe
      try {
        unsubscribeExpenses();
        unsubscribeCategories();
      } catch (error) {
        console.error("Error unsubscribing:", error);
      }
    };
  }, [currentUser]);


  const handleAddExpense = async (e) => {
    e.preventDefault();
    console.log('handleAddExpense called', newExpense);
    
    // Check if Firebase is configured
    if (!db) {
      console.error('Firebase not configured');
      setToast({
        message: 'Firebase not configured. Please set up your Firebase project.',
        type: 'error'
      });
      return;
    }
    
    // Check if user is authenticated
    if (!currentUser) {
      console.error('User not authenticated');
      setToast({
        message: 'Please log in to add expenses.',
        type: 'error'
      });
      return;
    }
    
    // Store the expense data before resetting
    const expenseData = { ...newExpense };
    
    setIsLoading(true);
    
    try {
      console.log('Attempting to add expense to Firebase...');
      // Add the expense to the database
      await addDoc(collection(db, 'users', currentUser.uid, 'expenses'), {
        ...expenseData,
        amount: parseFloat(expenseData.amount),
        createdAt: new Date()
      });
      
      console.log('Expense added successfully');
      // Show success toast with date information
      setToast({
        message: `Expense "${expenseData.title}" added for ${format(new Date(expenseData.date), 'MMM dd, yyyy')}`,
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error adding expense: ', error);
      // Show error toast
      setToast({
        message: 'Failed to add expense. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    const expense = expenses.find(exp => exp.id === id);
    if (window.confirm(`Are you sure you want to delete the expense "${expense?.title}" for $${expense?.amount.toFixed(2)}?`)) {
      try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'expenses', id));
        setToast({
          message: 'Expense deleted successfully!',
          type: 'success'
        });
      } catch (error) {
        console.error('Error deleting expense: ', error);
        setToast({
          message: 'Failed to delete expense. Please try again.',
          type: 'error'
        });
      }
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food': '🍕',
      'Transport': '🚗',
      'Entertainment': '🎬',
      'Utilities': '💡',
      'Rent': '🏠',
      'Other': '📦'
    };
    return icons[category] || '📊';
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleExpenseAdded = () => {
    setIsExpenseFormOpen(false);
    // Optionally, refresh expenses here if needed
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${months[parseInt(month, 10) - 1]} ${day}, ${year}`;
  };

  return (
    <div className="expenses-container">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="section-header">
        <div className="header-content">
        <h2>Expenses</h2>
          <p className="section-subtitle">Track and manage your expenses</p>
        </div>
        <button onClick={() => setIsExpenseFormOpen(true)} className="btn btn-primary">
          <span>➕</span>
          Add Expense
        </button>
      </div>

      {/* Summary Stats */}
      <div className="expenses-summary">
        <div className="summary-stat">
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value">${totalAmount.toFixed(2)}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Total Transactions</span>
          <span className="stat-value">{expenses.length}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Average Amount</span>
          <span className="stat-value">
            ${expenses.length > 0 ? (totalAmount / expenses.length).toFixed(2) : '0.00'}
          </span>
        </div>
      </div>
      
      <div className="expenses-table-container">
        {expenses.length > 0 ? (
        <table className="expenses-table">
          <thead>
            <tr>
                <th>Category</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                  <td>
                    <div className="category-cell">
                      <span className="category-icon">{getCategoryIcon(expense.category)}</span>
                      <span className="category-name">{expense.category}</span>
                    </div>
                  </td>
                  <td>
                    <div className="title-cell">
                      <span className="expense-title">{expense.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className="amount-cell">${expense.amount.toFixed(2)}</span>
                  </td>
                  <td>
                    <span className="date-cell">{formatDate(expense.date)}</span>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h4>No expenses yet</h4>
            <p>Start tracking your expenses to see them here</p>
            <button onClick={() => setIsExpenseFormOpen(true)} className="btn btn-primary">
              Add First Expense
            </button>
          </div>
        )}
      </div>
      
      {/* Expense Form Modal */}
      <Modal isOpen={isExpenseFormOpen} onClose={() => setIsExpenseFormOpen(false)}>
        <ExpenseForm onExpenseAdded={handleExpenseAdded} />
      </Modal>
    </div>
  );
}