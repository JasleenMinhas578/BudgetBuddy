import { useState, useEffect, useMemo } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LuDollarSign, LuTrendingUp, LuAward, LuPlus, LuTarget, LuTag, LuAlertTriangle,
  LuChevronDown, LuChevronUp, LuSparkles, LuFileText, LuFileSpreadsheet,
  LuLoader, LuX, LuZap, LuLightbulb, LuBarChart2,
} from 'react-icons/lu';
import { format, subMonths, subWeeks, subDays, subYears, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { useDateFilter } from '../../hooks/useDateFilter';
import { useDateRangeContext } from '../../context/DateRangeContext';
import { useExpenses } from '../../hooks/useExpenses';
import { useBudgets } from '../../hooks/useBudgets';
import { useBudgetProgress } from '../../hooks/useBudgetProgress';
import { useReportData } from '../../hooks/useReportData';
import { useReportExport } from '../../hooks/useReportExport';
import { DEFAULT_CATEGORIES } from '../../utils/getCategoryIcon';
import DateFilterBar from '../UI/DateFilterBar';
import BudgetBuddyLogo from '../UI/BudgetBuddyLogo';
import ExpenseTable from '../UI/ExpenseTable';
import Modal from '../UI/Modal';
import ExpenseForm from '../Expense/ExpenseForm';
import BudgetProgressPanel from './BudgetProgressPanel';
import ChartCard from '../UI/ChartCard';
import PieChart from '../Charts/PieChart';
import LineChart from '../Charts/LineChart';
import { getMonthEndForecast } from '../../utils/forecastUtils';
import '../../styles/main.css';


export default function DashboardOverview() {
  const { expenses, loading } = useExpenses();
  const { budgets } = useBudgets();
  const firestoreCategories = useCategories();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [showChatHint, setShowChatHint] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [chartsOpen, setChartsOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (!localStorage.getItem('chatHintSeen')) setShowChatHint(true);
    } catch {}
  }, []);

  // Open export modal when sidebar Export nav item is clicked (?export=open)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('export') === 'open') {
      setExportModalOpen(true);
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate]);

  const dismissChatHint = () => {
    try { localStorage.setItem('chatHintSeen', '1'); } catch {}
    setShowChatHint(false);
  };

  const allCategories = useMemo(() => [
    ...DEFAULT_CATEGORIES,
    ...firestoreCategories
      .filter(c => c && c.name && c.name !== 'undefined' && c.name !== 'null')
      .map(c => ({ ...c, Icon: LuTag })),
  ], [firestoreCategories]);

  const dateRangeCtx = useDateRangeContext();
  const { filteredExpenses, dateFilter, setDateFilter, customDateRange, setCustomDateRange, pickedMonth, setPickedMonth, availableMonths } = useDateFilter(expenses, 'thisMonth', dateRangeCtx);

  const { categoryProgress, closestToLimit } = useBudgetProgress(filteredExpenses, allCategories, budgets);

  // Feature 4 — budget alert categories
  const dangerCategories = categoryProgress.filter(c => c.status === 'danger');
  const warnCategories = categoryProgress.filter(c => c.status === 'warning');

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

  const { categoryData, monthlyData, spendingInsights, totalAmount: reportTotal, averageAmount: reportAvg, topCategory } = useReportData(filteredExpenses);

  const {
    isGeneratingPDF,
    aiSummary, setAiSummary,
    aiSummaryLoading,
    aiSummaryError, setAiSummaryError,
    exportDropdownRef,
    handleGenerateSummary,
    exportToCSV,
    generatePDF,
  } = useReportExport({ filteredExpenses, dateFilter, customDateRange, totalAmount: reportTotal, averageAmount: reportAvg, categoryData, topCategory });

  // Feature 1 — month-end spending forecast (only meaningful for thisMonth filter)
  const forecastResult = dateFilter === 'thisMonth' ? getMonthEndForecast(filteredExpenses) : null;

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

      {/* Feature 4 — Budget over-limit banner */}
      {(dangerCategories.length > 0 || warnCategories.length > 0) && (
        <div className="budget-alert-strip">
          {dangerCategories.length > 0 && (
            <div className="budget-alert budget-alert--danger">
              <LuAlertTriangle size={15} className="budget-alert__icon" />
              <span className="budget-alert__label">Over budget:</span>
              <div className="budget-alert__chips">
                {dangerCategories.map(c => (
                  <Link key={c.name} to="/dashboard/goals" className="budget-alert__chip">
                    {c.name} · ${(c.spent - c.budget).toFixed(0)} over
                  </Link>
                ))}
              </div>
            </div>
          )}
          {warnCategories.length > 0 && (
            <div className="budget-alert budget-alert--warn">
              <LuAlertTriangle size={15} className="budget-alert__icon" />
              <span className="budget-alert__label">Near limit:</span>
              <div className="budget-alert__chips">
                {warnCategories.map(c => (
                  <Link key={c.name} to="/dashboard/goals" className="budget-alert__chip">
                    {c.name} · {Math.round(c.pct)}%
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
                <Link to="/dashboard/goals">Set goals</Link> to track progress.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Budget Goals Progress — only relevant for month-scoped filters */}
      {['today', 'thisWeek', 'thisMonth', 'pickMonth'].includes(dateFilter) && (
        <BudgetProgressPanel
          expenses={expenses}
          allCategories={allCategories}
          budgets={budgets}
          forecastResult={forecastResult}
        />
      )}

      {/* Block 1 — Spending Insights (AI summary + text insights) */}
      <div className="spending-insights-block">
        <div className="spending-insights-toggle" aria-expanded={insightsOpen}>
          <button
            className="spending-insights-expand"
            onClick={() => setInsightsOpen(o => !o)}
          >
            <span className="spending-insights-toggle-left">
              <LuLightbulb size={18} />
              <span>Spending Insights</span>
            </span>
          </button>
          <div className="spending-insights-toggle-right" ref={exportDropdownRef}>
            <button
              onClick={handleGenerateSummary}
              disabled={aiSummaryLoading || filteredExpenses.length === 0}
              className="btn btn-primary btn-sm"
            >
              {aiSummaryLoading ? <LuLoader size={14} /> : <LuSparkles size={14} />}
              {aiSummaryLoading ? 'Generating…' : 'AI Summary'}
            </button>
            <button
              className="spending-insights-chevron"
              onClick={() => setInsightsOpen(o => !o)}
              aria-label={insightsOpen ? 'Collapse' : 'Expand'}
            >
              {insightsOpen ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
            </button>
          </div>
        </div>

        {insightsOpen && (
          <div className="spending-insights-content">
            {(aiSummary || aiSummaryError) && (
              <div className="ai-summary-card">
                <div className="ai-summary-header">
                  <div className="ai-summary-title">
                    <LuSparkles size={16} />
                    <h3>AI Spending Summary</h3>
                  </div>
                  <button
                    className="ai-summary-close"
                    onClick={() => { setAiSummary(null); setAiSummaryError(null); }}
                    aria-label="Close summary"
                  >
                    <LuX size={14} />
                  </button>
                </div>
                <div className="ai-summary-body">
                  {aiSummaryError ? (
                    <p className="ai-summary-error">{aiSummaryError}</p>
                  ) : (
                    <p className="ai-summary-text">{aiSummary}</p>
                  )}
                </div>
                {!aiSummaryError && (
                  <div className="ai-summary-footer">
                    <span className="ai-summary-powered"><LuZap size={12} /> Powered by Gemini</span>
                    <button
                      className="ai-summary-regenerate"
                      onClick={handleGenerateSummary}
                      disabled={aiSummaryLoading}
                    >
                      ↻ Regenerate
                    </button>
                  </div>
                )}
              </div>
            )}

            {spendingInsights.length > 0 && (
              <div className="insights-list">
                {spendingInsights.map((insight, index) => (
                  <div key={index} className="insight-item">
                    <p>{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Block 2 — Charts & Visualizations */}
      <div className="spending-insights-block" id="report-content">
        <div className="spending-insights-toggle" aria-expanded={chartsOpen}>
          <button
            className="spending-insights-expand"
            onClick={() => setChartsOpen(o => !o)}
          >
            <span className="spending-insights-toggle-left">
              <LuBarChart2 size={18} />
              <span>Charts &amp; Visualizations</span>
            </span>
          </button>
          <button
            className="spending-insights-chevron"
            onClick={() => setChartsOpen(o => !o)}
            aria-label={chartsOpen ? 'Collapse' : 'Expand'}
          >
            {chartsOpen ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
          </button>
        </div>

        {chartsOpen && (
          <div className="spending-insights-content">
            <div className="charts-section">
              <ChartCard title="Spending by Category" isEmpty={filteredExpenses.length === 0}>
                <PieChart data={categoryData} />
              </ChartCard>
              <ChartCard title="Monthly Trend" isEmpty={filteredExpenses.length === 0}>
                <LineChart data={monthlyData} />
              </ChartCard>
            </div>
          </div>
        )}
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
          showCategoryFilter={true}
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

      <Modal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} title="Export Data">
        <div className="export-modal-body">
          <div className="export-modal-date-section">
            <p className="export-modal-date-label">Select date range</p>
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

          <div className="export-modal-options">
            <button
              className="export-modal-option"
              onClick={() => { generatePDF(); setExportModalOpen(false); }}
              disabled={isGeneratingPDF || filteredExpenses.length === 0}
            >
              <LuFileText size={22} />
              <div className="export-modal-option-text">
                <span className="export-modal-option-label">PDF Report</span>
                <span className="export-modal-option-desc">Formatted report with charts and summary</span>
              </div>
            </button>
            <button
              className="export-modal-option"
              onClick={() => { exportToCSV(); setExportModalOpen(false); }}
              disabled={filteredExpenses.length === 0}
            >
              <LuFileSpreadsheet size={22} />
              <div className="export-modal-option-text">
                <span className="export-modal-option-label">CSV Spreadsheet</span>
                <span className="export-modal-option-desc">Raw data for Excel or Google Sheets</span>
              </div>
            </button>
          </div>

          {filteredExpenses.length === 0 && (
            <p className="export-modal-empty">No expenses in the selected date range to export.</p>
          )}
        </div>
      </Modal>
    </div>
  );
} 