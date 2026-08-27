import { useMemo, useState } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { Link } from 'react-router-dom';
import { LuTarget, LuChevronRight, LuCalendar, LuCheck } from 'react-icons/lu';
import { useBudgetProgress } from '../../hooks/useBudgetProgress';
import { getCategoryColor } from '../../utils/getCategoryColor';
import { useCurrency } from '../../context/CurrencyContext';

export default function BudgetProgressPanel({ expenses, allCategories, budgets, forecastResult, setCategoryBudget }) {
  const { formatAmount } = useCurrency();
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalInput, setGoalInput] = useState('');

  function handleGoalSave(categoryName) {
    const amount = parseFloat(goalInput);
    if (!isNaN(amount) && amount > 0) {
      setCategoryBudget(categoryName, amount);
    }
    setEditingGoal(null);
    setGoalInput('');
  }
  // Always compare against current month — regardless of the dashboard's date filter
  const thisMonthExpenses = useMemo(() => {
    const now = new Date();
    const start = format(startOfMonth(now), 'yyyy-MM-dd');
    const end = format(endOfMonth(now), 'yyyy-MM-dd');
    return expenses.filter((e) => e.date >= start && e.date <= end);
  }, [expenses]);

  const { categoryProgress } = useBudgetProgress(thisMonthExpenses, allCategories, budgets);

  const totalBudgeted = useMemo(
    () => Object.values(budgets?.categories || {}).reduce((s, v) => s + (v || 0), 0),
    [budgets]
  );
  const totalSpent = thisMonthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const overallPct = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0;
  const overStatus = totalBudgeted > 0
    ? (totalSpent >= totalBudgeted ? 'danger' : totalSpent / totalBudgeted >= 0.8 ? 'warning' : 'ok')
    : 'ok';

  const categoriesWithBudget = categoryProgress.filter((p) => p.budget !== null);
  const categoriesWithoutBudget = categoryProgress.filter((p) => p.budget === null && p.spent > 0);

  if (categoriesWithBudget.length === 0 && categoriesWithoutBudget.length === 0) return null;

  return (
    <div className="budget-panel">
      <div className="budget-panel-header">
        <div className="budget-panel-title">
          <LuTarget size={16} />
          <h3>This Month's Goals</h3>
        </div>
        <Link to="/dashboard/goals" className="budget-panel-link">
          Manage goals <LuChevronRight size={14} />
        </Link>
      </div>

      {/* Feature 1 — Month-end forecast, shown when available */}
      {forecastResult && (
        <div className="budget-panel-forecast">
          <LuCalendar size={13} className="budget-panel-forecast__icon" />
          <span className="budget-panel-forecast__label">Month-end forecast</span>
          <span className="budget-panel-forecast__amount">{formatAmount(forecastResult.forecast)}</span>
          <span className="budget-panel-forecast__pace">{formatAmount(forecastResult.dailyAvg)}/day</span>
        </div>
      )}

      {/* Overall progress bar */}
      {totalBudgeted > 0 && (
        <div className="budget-panel-overall">
          <div className="budget-panel-overall-labels">
            <span className="budget-panel-overall-amounts">
              {formatAmount(totalSpent)}{' '}
              <span className="budget-panel-overall-of">of {formatAmount(totalBudgeted)}</span>
            </span>
            <span className={`budget-panel-overall-pct budget-panel-overall-pct--${overStatus}`}>
              {overallPct.toFixed(0)}%{' '}
              {totalSpent > totalBudgeted
                ? `(${formatAmount(totalSpent - totalBudgeted)} over)`
                : `(${formatAmount(totalBudgeted - totalSpent)} left)`}
            </span>
          </div>
          <div className="budget-panel-bar">
            <div
              className={`budget-panel-fill budget-panel-fill--${overStatus}`}
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Column headers */}
      <div className="budget-panel-col-headers">
        <span className="budget-panel-col-headers__cat">Categories</span>
        <span />
        <span>Spent</span>
        <span>Budget</span>
        <span>Left</span>
        <span>%</span>
      </div>

      {/* Per-category rows */}
      <div className="budget-panel-rows">
        {categoriesWithBudget.map((prog) => {
          const pct = prog.pct !== null ? Math.min(prog.pct, 100) : 0;
          const remaining = prog.remaining ?? null;
          return (
            <div key={prog.name} className="budget-panel-row">
              <div className="budget-panel-row-label">
                <span
                  className="budget-panel-row-dot"
                  style={{ background: getCategoryColor(prog.name) }}
                />
                <span className="budget-panel-row-name">{prog.name}</span>
              </div>
              <div className="budget-panel-row-bar">
                <div
                  className={`budget-panel-row-fill budget-panel-row-fill--${prog.status}`}
                  style={{ width: `${pct}%` }}
                />
                {pct > 0 && (
                  <div
                    className={`budget-panel-row-marker budget-panel-row-marker--${prog.status}`}
                    style={{ left: `${pct}%` }}
                  />
                )}
              </div>
              <span className="budget-panel-col budget-panel-col--spent">
                {formatAmount(prog.spent)}
              </span>
              <span className="budget-panel-col budget-panel-col--budget">
                {formatAmount(prog.budget)}
              </span>
              <span className={`budget-panel-col budget-panel-col--left budget-panel-col--left-${prog.status}`}>
                {remaining !== null && remaining >= 0
                  ? formatAmount(remaining)
                  : remaining !== null ? `${formatAmount(Math.abs(remaining))} over` : '—'}
              </span>
              <span className={`budget-panel-col budget-panel-col--pct budget-panel-col--pct-${prog.status}`}>
                {prog.pct !== null ? `${Math.min(prog.pct, 999).toFixed(0)}%` : '—'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Categories with spending but no goal */}
      {categoriesWithoutBudget.length > 0 && (
        <div className="budget-panel-rows">
          {categoriesWithoutBudget.map((prog) => (
            <div key={prog.name} className="budget-panel-row budget-panel-row--no-goal">
              <div className="budget-panel-row-label">
                <span
                  className="budget-panel-row-dot"
                  style={{ background: getCategoryColor(prog.name) }}
                />
                <span className="budget-panel-row-name">{prog.name}</span>
              </div>
              <div className="budget-panel-row-bar budget-panel-row-bar--dashed" />
              <span className="budget-panel-col budget-panel-col--spent">
                {formatAmount(prog.spent)}
              </span>
              {editingGoal === prog.name ? (
                <div className="budget-panel-set-goal-inline">
                  <input
                    className="budget-panel-set-goal-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={goalInput}
                    autoFocus
                    onChange={(e) => setGoalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGoalSave(prog.name);
                      if (e.key === 'Escape') { setEditingGoal(null); setGoalInput(''); }
                    }}
                  />
                  <button
                    className="budget-panel-set-goal-confirm"
                    onClick={() => handleGoalSave(prog.name)}
                    aria-label="Save goal"
                  >
                    <LuCheck size={14} />
                  </button>
                </div>
              ) : (
                <button
                  className="budget-panel-set-goal-btn"
                  onClick={() => { setEditingGoal(prog.name); setGoalInput(''); }}
                >
                  Set Goal
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
