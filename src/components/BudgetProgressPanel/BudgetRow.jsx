import { useCurrency } from '../../context/CurrencyContext';
import { getCategoryColor } from '../../utils/getCategoryColor';

export default function BudgetRow({ prog }) {
  const { formatAmount } = useCurrency();
  const pct = prog.pct !== null ? Math.min(prog.pct, 100) : 0;
  const remaining = prog.remaining ?? null;

  return (
    <div className="budget-panel-row">
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
}
