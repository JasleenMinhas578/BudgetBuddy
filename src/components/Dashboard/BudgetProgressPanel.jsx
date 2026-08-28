import { useMemo } from 'react';
import { getCurrentMonthExpenses } from '../../utils/formatDate';
import { Link } from 'react-router-dom';
import { LuTarget, LuChevronRight, LuCalendar } from 'react-icons/lu';
import { useBudgetProgress } from '../../hooks/useBudgetProgress';
import { useCurrency } from '../../context/CurrencyContext';
import BudgetRow from '../BudgetProgressPanel/BudgetRow';
import BudgetRowNoGoal from '../BudgetProgressPanel/BudgetRowNoGoal';

export default function BudgetProgressPanel({ expenses, allCategories, budgets, forecastResult, setCategoryBudget }) {
  const { formatAmount } = useCurrency();

  // Always uses the real current month, regardless of pickedMonth in the parent date filter.
  const thisMonthExpenses = useMemo(() => getCurrentMonthExpenses(expenses), [expenses]);

  const { categoryProgress } = useBudgetProgress(thisMonthExpenses, allCategories, budgets);

  const totalBudgeted = useMemo(
    () => Object.values(budgets?.categories || {}).reduce((s, v) => s + (v || 0), 0),
    [budgets]
  );
  const totalSpent = useMemo(() => thisMonthExpenses.reduce((s, e) => s + (e.amount || 0), 0), [thisMonthExpenses]);
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
          <div>
            <h3>This Month's Goals</h3>
            {totalBudgeted > 0 && (
              <span className="budget-panel-total-label">
                Total budget: {formatAmount(totalBudgeted)}/mo
              </span>
            )}
          </div>
        </div>
        <Link to="/dashboard/goals" className="budget-panel-link">
          Manage goals <LuChevronRight size={14} />
        </Link>
      </div>

      {forecastResult && (
        <div className="budget-panel-forecast">
          <LuCalendar size={13} className="budget-panel-forecast__icon" />
          <span className="budget-panel-forecast__label">Month-end forecast</span>
          <span className="budget-panel-forecast__amount">{formatAmount(forecastResult.forecast)}</span>
          <span className="budget-panel-forecast__pace">{formatAmount(forecastResult.dailyAvg)}/day</span>
        </div>
      )}

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

      <div className="budget-panel-col-headers">
        <span className="budget-panel-col-headers__cat">Categories</span>
        <span />
        <span>Spent</span>
        <span>Budget</span>
        <span>Left</span>
        <span>%</span>
      </div>

      <div className="budget-panel-rows">
        {categoriesWithBudget.map((prog) => (
          <BudgetRow key={prog.name} prog={prog} />
        ))}
      </div>

      {categoriesWithoutBudget.length > 0 && (
        <div className="budget-panel-rows">
          {categoriesWithoutBudget.map((prog) => (
            <BudgetRowNoGoal key={prog.name} prog={prog} setCategoryBudget={setCategoryBudget} />
          ))}
        </div>
      )}
    </div>
  );
}
