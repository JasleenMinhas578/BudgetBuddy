import { useState } from 'react';
import { LuCheck } from 'react-icons/lu';
import { useCurrency } from '../../context/CurrencyContext';
import { getCategoryColor } from '../../utils/getCategoryColor';

export default function BudgetRowNoGoal({ prog, setCategoryBudget }) {
  const { formatAmount } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const handleSave = () => {
    const amount = parseFloat(goalInput);
    if (!isNaN(amount) && amount > 0) {
      setCategoryBudget(prog.name, amount);
    }
    setIsEditing(false);
    setGoalInput('');
  };

  return (
    <div className="budget-panel-row budget-panel-row--no-goal">
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
      {isEditing ? (
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
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') { setIsEditing(false); setGoalInput(''); }
            }}
          />
          <button
            className="budget-panel-set-goal-confirm"
            onClick={handleSave}
            aria-label="Save goal"
          >
            <LuCheck size={14} />
          </button>
        </div>
      ) : (
        <button
          className="budget-panel-set-goal-btn"
          onClick={() => setIsEditing(true)}
        >
          Set Goal
        </button>
      )}
    </div>
  );
}
