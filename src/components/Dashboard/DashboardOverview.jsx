import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuDollarSign, LuTrendingUp, LuAward, LuPlus } from 'react-icons/lu';
import { subscribeToExpenses } from '../../services/database';
import { useAuth } from '../../context/AuthContext';
import { useDateFilter } from '../../hooks/useDateFilter';
import { useDateRangeContext } from '../../context/DateRangeContext';
import DateFilterBar from '../UI/DateFilterBar';
import BudgetBuddyLogo from '../UI/BudgetBuddyLogo';
import ExpenseTable from '../UI/ExpenseTable';
import Modal from '../UI/Modal';
import ExpenseForm from '../Expense/ExpenseForm';
import '../../styles/main.css';


export default function DashboardOverview() {
  // State management for data
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const dateRangeCtx = useDateRangeContext();
  const { filteredExpenses, dateFilter, setDateFilter, customDateRange, setCustomDateRange, pickedMonth, setPickedMonth, availableMonths } = useDateFilter(expenses, 'thisMonth', dateRangeCtx);

  // Get current user from authentication context
  const { currentUser } = useAuth();

  /**
   * Set up real-time data listeners for expenses and categories
   * This effect runs when the component mounts and when currentUser changes
   */
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribe;
    try {
      unsubscribe = subscribeToExpenses(currentUser.uid, (expensesData, error) => {
        if (!error) setExpenses(expensesData);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error loading expenses:', error);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // Stats derived from the filtered period
  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const averageExpense = filteredExpenses.length > 0 ? totalSpent / filteredExpenses.length : 0;

  const topCategoryName = (() => {
    const map = filteredExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    return Object.keys(map).length > 0
      ? Object.entries(map).sort(([, a], [, b]) => b - a)[0][0]
      : 'None';
  })();

  const recentExpenses = filteredExpenses.slice(0, 5);

  // Only show "Welcome!" after data has loaded to avoid flashing for returning users
  const isFirstTimeUser = !loading && expenses.length === 0;

  return (
    <div className="dashboard-overview">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>{isFirstTimeUser ? 'Welcome!' : 'Welcome back!'}</h1>
          <p className="welcome-subtitle">
            {isFirstTimeUser 
              ? 'Let\'s start tracking your expenses and take control of your finances.' 
              : 'Here\'s what\'s happening with your finances today.'
            }
          </p>
        </div>
        <div className="welcome-illustration">
          <BudgetBuddyLogo size={80} />
        </div>
      </div>

      {/* Date Filter */}
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

      {/* Summary Cards - Key financial metrics */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <LuDollarSign size={26} />
          </div>
          <div className="card-content">
            <h3>Total Spent</h3>
            <p className="card-amount">${totalSpent.toFixed(2)}</p>
            <p className="card-subtitle">{filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <LuTrendingUp size={26} />
          </div>
          <div className="card-content">
            <h3>Average</h3>
            <p className="card-amount">${averageExpense.toFixed(2)}</p>
            <p className="card-subtitle">Per transaction</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <LuAward size={26} />
          </div>
          <div className="card-content">
            <h3>Top Category</h3>
            <p className="card-amount">{topCategoryName}</p>
            <p className="card-subtitle">Most spent category</p>
          </div>
        </div>
      </div>

      {/* Recent Expenses Table */}
      <div className="recent-activity">
        <div className="activity-header">
          <h3>Recent Expenses</h3>
          <div className="activity-header-actions">
            <button onClick={() => setIsAddExpenseOpen(true)} className="btn btn-primary">
              <LuPlus size={15} />
              Add Expense
            </button>
            <Link to="/dashboard/expenses" className="btn btn-secondary view-all-link">View All</Link>
          </div>
        </div>

        <ExpenseTable
          expenses={recentExpenses}
          itemsPerPage={5}
          showPagination={false}
          emptyMessage="No expenses yet"
          emptySubMessage="Start tracking your expenses to see them here"
          emptyAction={
            <button onClick={() => setIsAddExpenseOpen(true)} className="btn btn-primary">
              Add First Expense
            </button>
          }
        />
      </div>

      <Modal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Expense</h2>
        </div>
        <ExpenseForm
          onExpenseAdded={() => setIsAddExpenseOpen(false)}
          onCancel={() => setIsAddExpenseOpen(false)}
        />
      </Modal>
    </div>
  );
} 