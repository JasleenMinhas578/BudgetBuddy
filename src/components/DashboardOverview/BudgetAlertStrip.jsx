import { Link } from 'react-router-dom';
import { LuAlertTriangle } from 'react-icons/lu';

export default function BudgetAlertStrip({ dangerCategories, warnCategories, formatAmount }) {
  if (dangerCategories.length === 0 && warnCategories.length === 0) return null;

  return (
    <div className="budget-alert-strip">
      {dangerCategories.length > 0 && (
        <div className="budget-alert budget-alert--danger">
          <LuAlertTriangle size={15} className="budget-alert__icon" />
          <span className="budget-alert__label">Over budget:</span>
          <div className="budget-alert__chips">
            {dangerCategories.map(c => (
              <Link key={c.name} to="/dashboard/goals" className="budget-alert__chip">
                {c.name} · {formatAmount(c.spent - c.budget)} over
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
  );
}
