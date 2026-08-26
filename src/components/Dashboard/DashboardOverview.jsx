import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LuDollarSign, LuTrendingUp, LuAward, LuPlus, LuTarget } from 'react-icons/lu';
import { format, subMonths, subWeeks, subDays, subYears, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { useDateFilter } from '../../hooks/useDateFilter';
import { useDateRangeContext } from '../../context/DateRangeContext';
import { useExpenses } from '../../hooks/useExpenses';
import { useAuth } from '../../context/AuthContext';
import { useBudgets } from '../../hooks/useBudgets';
import { useBudgetProgress } from '../../hooks/useBudgetProgress';
import { subscribeToCategories } from '../../services/categoryService';
import { DEFAULT_CATEGORIES } from '../../utils/getCategoryIcon';
import { LuTag } from 'react-icons/lu';
import DateFilterBar from '../UI/DateFilterBar';
import BudgetBuddyLogo from '../UI/BudgetBuddyLogo';
import ExpenseTable from '../UI/ExpenseTable';
import Modal from '../UI/Modal';
import ExpenseForm from '../Expense/ExpenseForm';
import '../../styles/main.css';


export default function DashboardOverview() {
  const { expenses, loading } = useExpenses();
  const { currentUser } = useAuth();
  const { budgets } = useBudgets();
  const [firestoreCategories, setFirestoreCategories] = useState([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [showChatHint, setShowChatHint] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('chatHintSeen')) setShowChatHint(true);
    } catch {}
  }, []);

  const dismissChatHint = () => {
    try { localStorage.setItem('chatHintSeen', '1'); } catch {}
    setShowChatHint(false);
  };
  useEffect(() => {
    if (!currentUser) return;
    let unsub = () => {};
    try {
      unsub = subscribeToCategories(currentUser.uid, (data) => {
        if (data !== null) setFirestoreCategories(data);
      });
    } catch {}
    return () => unsub();
  }, [currentUser]);

  const allCategories = useMemo(() => [
    ...DEFAULT_CATEGORIES,
    ...firestoreCategories
      .filter(c => c && c.name && c.name !== 'undefined' && c.name !== 'null')
      .map(c => ({ ...c, Icon: LuTag })),
  ], [firestoreCategories]);

  const dateRangeCtx = useDateRangeContext();
  const { filteredExpenses, dateFilter, setDateFilter, customDateRange, setCustomDateRange, pickedMonth, setPickedMonth, availableMonths } = useDateFilter(expenses, 'thisMonth', dateRangeCtx);

  const { closestToLimit } = useBudgetProgress(filteredExpenses, allCategories, budgets);

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

  const prevPeriodTotal = useMemo(() => {
    if (!expenses.length) return null;
    const now = new Date();
    let prevStart, prevEnd;
    if (dateFilter === 'thisMonth') {
      const prev = subMonths(now, 1);
      prevStart = format(startOfMonth(prev), 'yyyy-MM-dd');
      prevEnd   = format(endOfMonth(prev),   'yyyy-MM-dd');
    } else if (dateFilter === 'thisWeek') {
      const prev = subWeeks(now, 1);
      prevStart = format(startOfWeek(prev, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      prevEnd   = format(endOfWeek(prev,   { weekStartsOn: 1 }), 'yyyy-MM-dd');
    } else if (dateFilter === 'thisYear') {
      const prev = subYears(now, 1);
      prevStart = format(startOfYear(prev), 'yyyy-MM-dd');
      prevEnd   = format(endOfYear(prev),   'yyyy-MM-dd');
    } else if (dateFilter === 'today') {
      const yesterday = format(subDays(now, 1), 'yyyy-MM-dd');
      prevStart = yesterday;
      prevEnd   = yesterday;
    } else {
      return null;
    }
    return expenses
      .filter(e => e.date >= prevStart && e.date <= prevEnd)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, dateFilter]);

  const trendDelta = prevPeriodTotal !== null && prevPeriodTotal > 0 && totalSpent > 0
    ? ((totalSpent - prevPeriodTotal) / prevPeriodTotal) * 100
    : null;

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

      {/* AI Chat hint — shown until the user dismisses it */}
      {showChatHint && (
        <div className="ai-hint-card">
          <span className="ai-hint-icon">✨</span>
          <div className="ai-hint-text">
            <strong>BudgetBuddy has an AI assistant</strong>
            <span>Try asking: <em>"Where did I overspend this month?"</em></span>
          </div>
          <button className="ai-hint-dismiss" onClick={dismissChatHint} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* Date Filter */}
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

      {/* Summary Cards - Key financial metrics */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <LuDollarSign size={26} />
          </div>
          <div className="card-content">
            <h3>Total Spent</h3>
            <p className="card-amount">${totalSpent.toFixed(2)}</p>
            {trendDelta !== null
              ? <p className={`card-delta ${trendDelta >= 0 ? 'card-delta--up' : 'card-delta--down'}`}>
                  {trendDelta >= 0 ? '↑' : '↓'} {Math.abs(trendDelta).toFixed(0)}% vs last period
                </p>
              : <p className="card-subtitle">{filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}</p>
            }
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

        <div className="summary-card">
          <div className="card-icon">
            <LuTarget size={26} />
          </div>
          <div className="card-content">
            <h3>Closest to Limit</h3>
            {closestToLimit ? (
              <>
                <p className="budget-limit-card__name">{closestToLimit.name}</p>
                <p className={`budget-limit-card__pct budget-limit-card__pct--${closestToLimit.status}`}>
                  {Math.min(closestToLimit.pct, 999).toFixed(0)}%
                </p>
                <p className="budget-limit-card__detail">
                  ${closestToLimit.spent.toFixed(2)} of ${closestToLimit.budget.toFixed(2)}
                </p>
              </>
            ) : (
              <p className="budget-limit-card__cta">
                No budgets set yet.{' '}
                <Link to="/dashboard/categories">Set a budget</Link> to track progress.
              </p>
            )}
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
          hiddenColumns={['category']}
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

      <Modal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} title="Add New Expense">
        <ExpenseForm
          onExpenseAdded={() => setIsAddExpenseOpen(false)}
          onCancel={() => setIsAddExpenseOpen(false)}
        />
      </Modal>
    </div>
  );
} 