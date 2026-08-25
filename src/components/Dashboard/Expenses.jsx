/* istanbul ignore file */
import { useState, useEffect } from 'react';
import { subscribeToExpenses, deleteExpense, updateExpense } from '../../services/database';
import { formatDate } from '../../utils/formatDate';
import { getCategoryIcon } from '../../utils/getCategoryIcon';
import { useAuth } from '../../context/AuthContext';
import { useDateFilter } from '../../hooks/useDateFilter';
import Toast from '../UI/Toast';
import DateFilterBar from '../UI/DateFilterBar';
import '../../styles/main.css';
import '../../styles/modal-forms.css';
import ExpenseForm from '../Expense/ExpenseForm';
import Modal from '../UI/Modal';
import Pagination from '../UI/Pagination';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const { filteredExpenses, dateFilter, setDateFilter, customDateRange, setCustomDateRange } = useDateFilter(expenses, 'today');
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const { currentUser } = useAuth();
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isEditExpenseFormOpen, setIsEditExpenseFormOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    let unsubscribe = () => {};

    try {
      unsubscribe = subscribeToExpenses(currentUser.uid, (expensesData) => {
        if (expensesData !== null) setExpenses(expensesData);
      });
    } catch (error) {
      console.error("Error setting up listeners:", error);
      setToast({
        message: 'Error loading data. Please refresh the page.',
        type: 'error'
      });
    }

    return () => unsubscribe();
  }, [currentUser]);



  const handleDeleteExpense = async (id) => {
    if (!currentUser) return;
    const expense = expenses.find(exp => exp.id === id);
    if (window.confirm(`Are you sure you want to delete the expense "${expense?.title}" for $${(typeof expense?.amount === 'number' ? expense.amount : 0).toFixed(2)}?`)) {
      try {
        await deleteExpense(currentUser.uid, id);
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
      await updateExpense(currentUser.uid, updatedExpense.id, {
        title: updatedExpense.title,
        amount: parseFloat(updatedExpense.amount),
        category: updatedExpense.category,
        date: updatedExpense.date,
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

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + (typeof expense.amount === 'number' ? expense.amount : 0), 0);

  // Pagination logic
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  // Reset to first page when filtered expenses change
  useEffect(() => {
    if (currentPage > Math.max(1, totalPages)) {
      setCurrentPage(1);
    }
  }, [filteredExpenses.length, currentPage, totalPages]);

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


  return (
    <div className="expenses-container">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
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
          <span className="stat-value">{filteredExpenses.length}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Average Amount</span>
          <span className="stat-value">
            ${filteredExpenses.length > 0 ? (totalAmount / filteredExpenses.length).toFixed(2) : '0.00'}
          </span>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="filter-controls">
        <div className="filter-section">
          <h3>Date Range</h3>
          <DateFilterBar
            dateFilter={dateFilter}
            onChange={setDateFilter}
            customDateRange={customDateRange}
            onCustomDateRangeChange={setCustomDateRange}
            onPageReset={() => setCurrentPage(1)}
          />
        </div>
      </div>

      <div className="expenses-table-container">
        {filteredExpenses.length > 0 ? (
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
            totalItems={filteredExpenses.length}
          />
        )}
        </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h4>{expenses.length === 0 ? 'No expenses yet' : 'No expenses in this period'}</h4>
            <p>{expenses.length === 0 ? 'Start tracking your expenses to see them here' : 'Try a different date range or add a new expense'}</p>
            {expenses.length === 0 && (
              <button onClick={() => setIsExpenseFormOpen(true)} className="btn btn-primary">
                Add First Expense
              </button>
            )}
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