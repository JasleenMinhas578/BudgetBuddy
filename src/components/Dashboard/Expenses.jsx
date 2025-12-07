/* istanbul ignore file */
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import Toast from '../UI/Toast';
import '../../styles/main.css';
import '../../styles/modal-forms.css';
import ExpenseForm from '../Expense/ExpenseForm';
import Modal from '../UI/Modal';
import Pagination from '../UI/Pagination';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const { currentUser } = useAuth();
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isEditExpenseFormOpen, setIsEditExpenseFormOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
  
    let unsubscribeExpenses = () => {};
  
    try {
      // Fetch expenses
      const qExpenses = query(
        collection(db, 'users', currentUser.uid, 'expenses')
      );
      
      unsubscribeExpenses = onSnapshot(qExpenses, (querySnapshot) => {
        const expensesData = [];
        querySnapshot.forEach((doc) => {
          expensesData.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort expenses by date in descending order (newest first)
        const sortedExpenses = expensesData.sort((a, b) => {
          if (a.date && b.date) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          // Fallback to createdAt if date is not available
          if (a.createdAt && b.createdAt) {
            const aTime = a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
            const bTime = b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
            return bTime - aTime;
          }
          return 0;
        });
        
        setExpenses(sortedExpenses);
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
      } catch (error) {
        console.error("Error unsubscribing:", error);
      }
    };
  }, [currentUser]);



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

  const handleEditExpense = (expense) => {
    setExpenseToEdit({
      id: expense.id,
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date
    });
    setIsEditExpenseFormOpen(true);
  };

  const handleUpdateExpense = async (updatedExpense) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'expenses', updatedExpense.id), {
        title: updatedExpense.title,
        amount: parseFloat(updatedExpense.amount),
        category: updatedExpense.category,
        date: updatedExpense.date,
        updatedAt: new Date()
      });
      setToast({
        message: `Expense "${updatedExpense.title}" updated successfully!`,
        type: 'success'
      });
      setIsEditExpenseFormOpen(false);
      setExpenseToEdit(null);
    } catch (error) {
      setToast({
        message: 'Failed to update expense. Please try again.',
        type: 'error'
      });
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

  // Pagination logic
  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = expenses.slice(startIndex, endIndex);

  // Reset to first page when expenses change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [expenses.length, currentPage, totalPages]);

  const handleExpenseAdded = () => {
    setIsExpenseFormOpen(false);
    // Optionally, refresh expenses here if needed
  };

  const closeAddExpenseModal = () => {
    setIsExpenseFormOpen(false);
  };

  const closeEditExpenseModal = () => {
    setIsEditExpenseFormOpen(false);
    setExpenseToEdit(null);
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
          <>
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
            {paginatedExpenses.map((expense) => (
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
                <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEditExpense(expense)}
                        className="btn btn-secondary btn-sm edit-btn"
                        title="Edit expense"
                      >
                        <span className="edit-icon">✏️</span>
                      </button>
                  <button 
                    onClick={() => handleDeleteExpense(expense.id)}
                        className="btn btn-danger btn-sm delete-btn"
                        title="Delete expense"
                  >
                        <span className="delete-icon">🗑️</span>
                  </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={expenses.length}
          />
        )}
        </>
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
      <Modal isOpen={isExpenseFormOpen} onClose={closeAddExpenseModal}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Expense</h2>
        </div>
        <ExpenseForm 
          onExpenseAdded={handleExpenseAdded} 
          onCancel={closeAddExpenseModal}
        />
      </Modal>
      {/* Edit Expense Form Modal */}
      <Modal isOpen={isEditExpenseFormOpen} onClose={closeEditExpenseModal}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Expense</h2>
        </div>
        <ExpenseForm
          onExpenseEdited={handleUpdateExpense}
          onCancel={closeEditExpenseModal}
          initialExpense={expenseToEdit}
          isEditMode={true}
        />
      </Modal>
    </div>
  );
}