import { LuGripVertical } from 'react-icons/lu';
import { getCategoryColor } from '../../utils/getCategoryColor';
import GoalInput from './GoalInput';

export default function GoalCard({
  category,
  prog,
  index,
  draggingIndex,
  dragOverIndex,
  onDragStart,
  onDragEnter,
  onDragEnd,
  currencySymbol,
  formatAmount,
  goalValue,
  onSave,
  onRemove,
}) {
  const pct = Math.min(prog?.pct ?? 0, 100);
  const isDragging = draggingIndex === index;
  const isDragOver = dragOverIndex === index && draggingIndex !== index;
  const isOk = !prog?.status || prog.status === 'ok';

  return (
    <div
      className={`goal-card goal-card--active${isDragging ? ' goal-card--dragging' : ''}${isDragOver ? ' goal-card--drag-over' : ''}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="goal-card-header">
        <div
          className="goal-icon"
          style={{
            color: getCategoryColor(category.name),
            background: `${getCategoryColor(category.name)}26`,
          }}
        >
          <category.Icon size={20} />
        </div>
        <div className="goal-info">
          <h4>{category.name}</h4>
          {prog?.spent > 0
            ? <p className="goal-spent">{formatAmount(prog.spent)} spent this month</p>
            : <p className="goal-spent">No spending yet</p>
          }
        </div>
        <div className="goal-drag-handle" title="Drag to reorder">
          <LuGripVertical size={16} />
        </div>
      </div>

      <div className="goal-progress-bar">
        <div
          className={`goal-progress-fill goal-progress-fill--${prog?.status ?? 'ok'}`}
          style={{
            width: `${pct}%`,
            ...(isOk ? { background: 'var(--accent-teal)' } : {}),
          }}
        />
      </div>

      <div className="goal-progress-meta">
        <span
          className={`goal-remaining${!isOk ? ` goal-remaining--${prog?.status}` : ''}`}
          style={isOk ? { color: 'var(--accent-teal)' } : {}}
        >
          {(prog?.remaining ?? 0) >= 0
            ? `${formatAmount(prog?.remaining ?? 0)} left of ${formatAmount(prog?.budget ?? 0)}`
            : `${formatAmount(Math.abs(prog?.remaining ?? 0))} over ${formatAmount(prog?.budget ?? 0)}`}
        </span>
        <span
          className={`goal-pct goal-pct--${prog?.status ?? 'ok'}`}
          style={isOk ? { color: 'var(--accent-teal)' } : {}}
        >
          {Math.min(prog?.pct ?? 0, 999).toFixed(0)}%
        </span>
      </div>

      <div className="goal-input-row">
        <label className="goal-input-label">Monthly goal ({currencySymbol})</label>
        <div className="goal-input-wrapper">
          <GoalInput
            categoryName={category.name}
            initialValue={goalValue}
            onSave={onSave}
          />
          <button
            className="goal-remove-btn"
            onClick={() => onRemove(category.name)}
            title="Remove goal"
            aria-label={`Remove ${category.name} budget goal`}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
