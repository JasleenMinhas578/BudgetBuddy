import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LuTarget, LuChevronRight } from 'react-icons/lu';
import { useBudgetProgress } from '../../hooks/useBudgetProgress';
import { getCategoryColor } from '../../utils/getCategoryColor';

export default function BudgetProgressPanel({ expenses, allCategories, budgets }) {
  // Always compare against current month — regardless of the dashboard's date filter
  const thisMonthExpenses = useMemo(() => {
    const now = new Date();
    const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const end = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
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

  if (categoriesWithBudget.length === 0) {
    return (
      <div className="budget-panel budget-panel--empty">
        <LuTarget size={18} />
        <p>
          No budget goals set yet.{' '}
          <Link to="/dashboard/goals" className="budget-panel-cta-link">
            Set up your monthly goals
          </Link>{' '}
          to track progress here.
        </p>
      </div>
    );
  }

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

      {/* Overall progress bar */}
      {totalBudgeted > 0 && (
        <div className="budget-panel-overall">
          <div className="budget-panel-overall-labels">
            <span className="budget-panel-overall-amounts">
              ${totalSpent.toFixed(2)}{' '}
              <span className="budget-panel-overall-of">of ${totalBudgeted.toFixed(2)}</span>
            </span>
            <span className={`budget-panel-overall-pct budget-panel-overall-pct--${overStatus}`}>
              {overallPct.toFixed(0)}%{' '}
              {totalSpent > totalBudgeted
                ? `($${(totalSpent - totalBudgeted).toFixed(2)} over)`
                : `($${(totalBudgeted - totalSpent).toFixed(2)} left)`}
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

      {/* Per-category rows */}
      <div className="budget-panel-rows">
        {categoriesWithBudget.map((prog) => {
          const pct = prog.pct !== null ? Math.min(prog.pct, 100) : 0;
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
              </div>
              <div className="budget-panel-row-meta">
                <span className={`budget-panel-row-status budget-panel-row-status--${prog.status}`}>
                  {prog.remaining !== null && prog.remaining >= 0
                    ? `$${prog.remaining.toFixed(0)} left`
                    : prog.remaining !== null
                      ? `$${Math.abs(prog.remaining).toFixed(0)} over`
                      : '—'}
                </span>
                <span className="budget-panel-row-pct">
                  {prog.pct !== null ? `${Math.min(prog.pct, 999).toFixed(0)}%` : '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
