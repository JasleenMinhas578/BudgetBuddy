import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToExpenses } from '../../services/database';
import { useAuth } from '../../context/AuthContext';
import { useDateFilter } from '../../hooks/useDateFilter';
import { formatDate } from '../../utils/formatDate';
import DateFilterBar from '../UI/DateFilterBar';
import '../../styles/main.css';


export default function DashboardOverview() {
  // State management for data
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { filteredExpenses, dateFilter, setDateFilter, customDateRange, setCustomDateRange } = useDateFilter(expenses, 'today');

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
          <div className="illustration-circle">
            <span>💰</span>
          </div>
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
            <span>📊</span>
          </div>
          <div className="card-content">
            <h3>Total Spent</h3>
            <p className="card-amount">${totalSpent.toFixed(2)}</p>
            <p className="card-subtitle">{filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <span>📈</span>
          </div>
          <div className="card-content">
            <h3>Average</h3>
            <p className="card-amount">${averageExpense.toFixed(2)}</p>
            <p className="card-subtitle">Per transaction</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <span>🏆</span>
          </div>
          <div className="card-content">
            <h3>Top Category</h3>
            <p className="card-amount">{topCategoryName}</p>
            <p className="card-subtitle">Most spent category</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity">
        <div className="activity-header">
          <h3>Recent Expenses</h3>
          <Link to="/dashboard/expenses" className="btn btn-primary view-all-link">View All</Link>
        </div>
        
        <div className="activity-list">
          {recentExpenses.length > 0 ? (
            // Display recent expenses with details
            recentExpenses.map((expense) => (
              <div key={expense.id} className="activity-item">
                <div className="activity-icon">
                  <span>💸</span>
                </div>
                <div className="activity-content">
                  <h4>{expense.title}</h4>
                  <p>{expense.category} • {formatDate(expense.date)}</p>
                </div>
                <div className="activity-amount">
                  <span>${expense.amount.toFixed(2)}</span>
                </div>
              </div>
            ))
          ) : (
            // Empty state when no expenses exist
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h4>No expenses yet</h4>
              <p>Start tracking your expenses to see them here</p>
              <Link to="/dashboard/expenses" className="btn btn-primary">Add First Expense</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 