import { LuCheck } from 'react-icons/lu';

export default function ExpenseCard({ rows, confirmLabel, isDanger, onConfirm, onDismiss }) {
  return (
    <div className="ai-expense-card">
      {rows.map(({ label, value }) => (
        <div key={label} className="ai-expense-row">
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
      <div className="ai-expense-actions">
        <button
          className={`btn-confirm${isDanger ? ' btn-danger' : ''}`}
          onClick={onConfirm}
        >
          {!isDanger && <LuCheck size={14} />} {confirmLabel}
        </button>
        <button className="btn-dismiss" onClick={onDismiss}>Cancel</button>
      </div>
    </div>
  );
}
