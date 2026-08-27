import { LuAlertTriangle, LuTrendingUp, LuCheckCircle } from 'react-icons/lu';

export default function BudgetSummaryCard({
  totalBudgeted,
  totalSpent,
  totalRemaining,
  overallPct,
  overStatus,
  overBudget,
  nearLimit,
  onTrack,
  formatAmount,
}) {
  return (
    <div className="goals-summary-card">
      <div className="goals-summary-top">
        <div>
          <p className="goals-summary-label">Total Monthly Budget</p>
          <p className="goals-summary-total">{formatAmount(totalBudgeted)}</p>
        </div>
        <div className="goals-summary-right">
          <p className="goals-summary-spent">{formatAmount(totalSpent)} spent</p>
          {totalRemaining !== null && (
            <p className={`goals-summary-remaining${overStatus !== 'ok' ? ` goals-summary-remaining--${overStatus}` : ''}`}>
              {totalRemaining >= 0
                ? `${formatAmount(totalRemaining)} remaining`
                : `${formatAmount(Math.abs(totalRemaining))} over budget`}
            </p>
          )}
        </div>
      </div>

      <div className="goals-overall-bar">
        <div
          className={`goals-overall-fill goals-overall-fill--${overStatus}`}
          style={{ width: `${overallPct}%` }}
        />
      </div>
      <p className="goals-overall-pct">{overallPct.toFixed(0)}% of monthly budget used</p>

      {(overBudget.length > 0 || nearLimit.length > 0 || onTrack.length > 0) && (
        <div className="goals-insights">
          {overBudget.map((p) => (
            <div key={p.name} className="goals-insight goals-insight--danger">
              <LuAlertTriangle size={15} />
              <span>
                <strong>{p.name}</strong> is over budget by {formatAmount(Math.abs(p.remaining))}
              </span>
            </div>
          ))}
          {nearLimit.map((p) => (
            <div key={p.name} className="goals-insight goals-insight--warning">
              <LuTrendingUp size={15} />
              <span>
                <strong>{p.name}</strong> is at {p.pct.toFixed(0)}% — {formatAmount(p.remaining)} left
              </span>
            </div>
          ))}
          {onTrack.length > 0 && (
            <div className="goals-insight goals-insight--ok">
              <LuCheckCircle size={15} />
              <span>
                {onTrack.map((p) => p.name).join(', ')} {onTrack.length === 1 ? 'is' : 'are'} on track
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
