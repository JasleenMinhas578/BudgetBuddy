import { Link } from 'react-router-dom';
import { LuDollarSign, LuTrendingUp, LuAward, LuTarget } from 'react-icons/lu';

export default function SummaryCards({
  totalSpent,
  averageExpense,
  transactionCount,
  topCategory,
  closestToLimit,
  formatAmount,
}) {
  return (
    <div className="summary-cards">
      <div className="summary-card">
        <div className="card-icon"><LuDollarSign size={26} /></div>
        <div className="card-content">
          <h3>Total Spent</h3>
          <p className="card-amount">{formatAmount(totalSpent)}</p>
          <p className="card-subtitle">{transactionCount} transaction{transactionCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon"><LuTrendingUp size={26} /></div>
        <div className="card-content">
          <h3>Average</h3>
          <p className="card-amount">{formatAmount(averageExpense)}</p>
          <p className="card-subtitle">Per transaction</p>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon"><LuAward size={26} /></div>
        <div className="card-content">
          <h3>Top Category</h3>
          <p className="card-amount">{topCategory ?? 'None'}</p>
          <p className="card-subtitle">Most spent category</p>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon"><LuTarget size={26} /></div>
        <div className="card-content">
          <h3>Closest to Limit</h3>
          {closestToLimit ? (
            <>
              <p className="budget-limit-card__name">{closestToLimit.name}</p>
              <p className={`budget-limit-card__pct budget-limit-card__pct--${closestToLimit.status}`}>
                {Math.min(closestToLimit.pct, 999).toFixed(0)}%
              </p>
              <p className="budget-limit-card__detail">
                {formatAmount(closestToLimit.spent)} of {formatAmount(closestToLimit.budget)}
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
  );
}
