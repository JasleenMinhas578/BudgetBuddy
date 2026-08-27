/* istanbul ignore file */
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuPlus } from 'react-icons/lu';
import { deleteExpense, updateExpense } from '../../services/expenseService';
import { useAuth } from '../../context/AuthContext';
import { useDateFilter } from '../../hooks/useDateFilter';
import { useDateRangeContext } from '../../context/DateRangeContext';
import { useExpenses } from '../../hooks/useExpenses';
import { useToast } from '../../hooks/useToast';
import PageHeader from '../UI/PageHeader';
import Toast from '../UI/Toast';
import DateFilterBar from '../UI/DateFilterBar';
import '../../styles/main.css';
import '../../styles/modal-forms.css';
import ExpenseForm from '../Expense/ExpenseForm';
import Modal from '../UI/Modal';
import ExpenseTable from '../UI/ExpenseTable';
import ConfirmDialog from '../UI/ConfirmDialog';
import { useCurrency } from '../../context/CurrencyContext';

export default function Expenses() {
  const { formatAmount } = useCurrency();
  const { expenses } = useExpenses();
  const { toast, showToast, hideToast } = useToast();
  const dateRangeCtx = useDateRangeContext();
  const { filteredExpenses, dateFilter, setDateFilter, customDateRange, setCustomDateRange, pickedMonth, setPickedMonth, availableMonths } = useDateFilter(expenses, 'thisMonth', dateRangeCtx);

  const { currentUser } = useAuth();
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isEditExpenseFormOpen, setIsEditExpenseFormOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';



  const handleDeleteExpense = (id) => {
    setPendingDeleteId(id);
  };

  const confirmDeleteExpense = async () => {
    if (!currentUser || !pendingDeleteId) return;
    setPendingDeleteId(null);
    try {
      await deleteExpense(currentUser.uid, pendingDeleteId);
      showToast('Expense deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting expense: ', error);
      showToast('Failed to delete expense. Please try again.', 'error');
    }
  };

  const handleEditExpense = (expense) => {
    setExpenseToEdit({
      id: expense.id,
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      notes: expense.notes || '',
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
        notes: updatedExpense.notes || null,
      });
      showToast(`Expense "${updatedExpense.title}" updated successfully!`, 'success');
      setIsEditExpenseFormOpen(false);
      setExpenseToEdit(null);
    } catch (error) {
      showToast('Failed to update expense. Please try again.', 'error');
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
          onClose={hideToast}
        />
      )}
      
      <PageHeader
        title="Expenses"
        subtitle="Track and manage your expenses"
        action={
          <button onClick={() => setIsExpenseFormOpen(true)} className="btn btn-primary">
            <LuPlus size={16} />
            Add Expense
          </button>
        }
      />

      {/* Summary Stats */}
      <div className="expenses-summary">
        <div className="summary-stat">
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value">{formatAmount(totalAmount)}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Total Transactions</span>
          <span className="stat-value">{searchFilteredExpenses.length}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Average Amount</span>
          <span className="stat-value">
            {formatAmount(searchFilteredExpenses.length > 0 ? totalAmount / searchFilteredExpenses.length : 0)}
          </span>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="filter-controls">
        <div className="filter-section">
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

      <ExpenseTable
        expenses={searchFilteredExpenses}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
        showCategoryFilter={true}
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
      <Modal isOpen={isExpenseFormOpen} onClose={closeAddExpenseModal} title="Add New Expense">
        <ExpenseForm
          onExpenseAdded={handleExpenseAdded}
          onCancel={closeAddExpenseModal}
        />
      </Modal>
      <Modal isOpen={isEditExpenseFormOpen} onClose={closeEditExpenseModal} title="Edit Expense">
        <ExpenseForm
          onExpenseEdited={handleUpdateExpense}
          onCancel={closeEditExpenseModal}
          initialExpense={expenseToEdit}
          isEditMode={true}
        />
      </Modal>

      {(() => {
        const expense = expenses.find(e => e.id === pendingDeleteId);
        const rawAmount = expense ? (typeof expense.amount === 'number' ? expense.amount : 0) : 0;
        return (
          <ConfirmDialog
            isOpen={!!pendingDeleteId}
            title="Delete Expense"
            message={expense ? <>Are you sure you want to delete <strong>"{expense.title}"</strong> for {formatAmount(rawAmount)}?</> : 'Are you sure you want to delete this expense?'}
            onConfirm={confirmDeleteExpense}
            onCancel={() => setPendingDeleteId(null)}
            variant="danger"
          />
        );
      })()}
    </div>
  );
}