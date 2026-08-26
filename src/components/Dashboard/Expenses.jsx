/* istanbul ignore file */
import { useState, useEffect } from 'react';
import { LuPlus, LuSearch, LuX } from 'react-icons/lu';
import { subscribeToExpenses, deleteExpense, updateExpense } from '../../services/database';
import { useAuth } from '../../context/AuthContext';
import { useDateFilter } from '../../hooks/useDateFilter';
import { useDateRangeContext } from '../../context/DateRangeContext';
import Toast from '../UI/Toast';
import DateFilterBar from '../UI/DateFilterBar';
import '../../styles/main.css';
import '../../styles/modal-forms.css';
import ExpenseForm from '../Expense/ExpenseForm';
import Modal from '../UI/Modal';
import ExpenseTable from '../UI/ExpenseTable';
import ConfirmDialog from '../UI/ConfirmDialog';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const dateRangeCtx = useDateRangeContext();
  const { filteredExpenses, dateFilter, setDateFilter, customDateRange, setCustomDateRange, pickedMonth, setPickedMonth, availableMonths } = useDateFilter(expenses, 'thisMonth', dateRangeCtx);
  const [toast, setToast] = useState(null);

  const { currentUser } = useAuth();
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isEditExpenseFormOpen, setIsEditExpenseFormOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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



  const handleDeleteExpense = (id) => {
    setPendingDeleteId(id);
  };

  const confirmDeleteExpense = async () => {
    if (!currentUser || !pendingDeleteId) return;
    setPendingDeleteId(null);
    try {
      await deleteExpense(currentUser.uid, pendingDeleteId);
      setToast({ message: 'Expense deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting expense: ', error);
      setToast({ message: 'Failed to delete expense. Please try again.', type: 'error' });
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

  const q = searchQuery.trim().toLowerCase();
  const searchFilteredExpenses = q
    ? filteredExpenses.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.amount?.toString().includes(q)
      )
    : filteredExpenses;

  const totalAmount = searchFilteredExpenses.reduce((sum, expense) => sum + (typeof expense.amount === 'number' ? expense.amount : 0), 0);

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
          <LuPlus size={16} />
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
          <span className="stat-value">{searchFilteredExpenses.length}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Average Amount</span>
          <span className="stat-value">
            ${searchFilteredExpenses.length > 0 ? (totalAmount / searchFilteredExpenses.length).toFixed(2) : '0.00'}
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
            pickedMonth={pickedMonth}
            onPickedMonthChange={setPickedMonth}
            availableMonths={availableMonths}
          />
        </div>
      </div>

      {/* Search Filter */}
      <div className="search-filter">
        <div className="search-input-wrapper">
          <LuSearch size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, category, or amount…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
              <LuX size={14} />
            </button>
          )}
        </div>
      </div>

      <ExpenseTable
        expenses={searchFilteredExpenses}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
        itemsPerPage={15}
        emptyMessage={expenses.length === 0 ? 'No expenses yet' : searchQuery ? 'No results found' : 'No expenses in this period'}
        emptySubMessage={expenses.length === 0 ? 'Start tracking your expenses to see them here' : searchQuery ? `No expenses match "${searchQuery}"` : 'Try a different date range or add a new expense'}
        emptyAction={expenses.length === 0 ? (
          <button onClick={() => setIsExpenseFormOpen(true)} className="btn btn-primary">
            Add First Expense
          </button>
        ) : null}
      />
      
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

      {(() => {
        const expense = expenses.find(e => e.id === pendingDeleteId);
        const amount = expense ? (typeof expense.amount === 'number' ? expense.amount : 0).toFixed(2) : '0.00';
        return (
          <ConfirmDialog
            isOpen={!!pendingDeleteId}
            title="Delete Expense"
            message={expense ? <>Are you sure you want to delete <strong>"{expense.title}"</strong> for ${amount}?</> : 'Are you sure you want to delete this expense?'}
            onConfirm={confirmDeleteExpense}
            onCancel={() => setPendingDeleteId(null)}
            variant="danger"
          />
        );
      })()}
    </div>
  );
}