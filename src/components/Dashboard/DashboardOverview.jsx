import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuDollarSign, LuTrendingUp, LuAward, LuReceipt, LuPlus } from 'react-icons/lu';
import { format, subMonths, subDays, subWeeks, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
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
  const { filteredExpenses, dateFilter, setDateFilter, customDateRange, setCustomDateRange } = useDateFilter(expenses, 'thisMonth', dateRangeCtx);

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

  // Compute previous-period total so we can show a trend delta on the Total Spent card
  const previousPeriodTotal = (() => {
    switch (dateFilter) {
      case 'today': {
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        return expenses.filter(e => e.date === yesterday).reduce((sum, e) => sum + e.amount, 0);
      }
      case 'thisWeek': {
        const lastWeek = subWeeks(new Date(), 1);
        const start = format(startOfWeek(lastWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const end = format(endOfWeek(lastWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        return expenses.filter(e => e.date >= start && e.date <= end).reduce((sum, e) => sum + e.amount, 0);
      }
      case 'thisMonth': {
        const last = subMonths(new Date(), 1);
        const start = format(startOfMonth(last), 'yyyy-MM-dd');
        const end = format(endOfMonth(last), 'yyyy-MM-dd');
        return expenses.filter(e => e.date >= start && e.date <= end).reduce((sum, e) => sum + e.amount, 0);
      }
      default:
        return null;
    }
  })();
  const trendDelta = previousPeriodTotal !== null ? totalSpent - previousPeriodTotal : null;

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
            {trendDelta !== null && (
              <p className={`card-trend ${trendDelta > 0 ? 'trend-up' : 'trend-down'}`}>
                {trendDelta > 0 ? '▲' : '▼'} ${Math.abs(trendDelta).toFixed(2)} vs prior period
              </p>
            )}
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
          emptyIcon={<LuReceipt size={48} />}
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