import { useState } from 'react';

export default function CategoryBudgetControl({
  categoryName,
  hasBudget,
  prog,
  formatAmount,
  currencySymbol,
  toDisplayAmount,
  toHomeAmount,
  setCategoryBudget,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');

  const openInput = (e) => {
    e.stopPropagation();
    setIsOpen(true);
    if (hasBudget && prog?.budget != null) {
      const inDisplay = toDisplayAmount(prog.budget);
      setValue(inDisplay != null ? String(parseFloat(inDisplay.toFixed(2))) : '');
    } else {
      setValue('');
    }
  };

  const close = () => {
    setIsOpen(false);
    setValue('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const val = parseFloat(value);
    if (!isNaN(val) && val > 0) {
      setCategoryBudget(categoryName, toHomeAmount(val));
    }
    close();
  };

  if (isOpen) {
    return (
      <form
        className="category-goal-form"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          className="category-goal-input"
          type="number"
          min="0.01"
          step="0.01"
          placeholder={`${currencySymbol}/mo`}
          value={value}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onBlur={close}
          onKeyDown={(e) => { if (e.key === 'Escape') close(); }}
        />
        <button
          type="submit"
          className="category-goal-save"
          onMouseDown={(e) => e.preventDefault()}
        >
          ✓
        </button>
      </form>
    );
  }

  if (hasBudget) {
    return (
      <span
        className="category-goal-badge"
        title="Click to edit monthly budget"
        style={{ cursor: 'pointer' }}
        onClick={openInput}
      >
        Budget: {formatAmount(prog.budget)}/mo
      </span>
    );
  }

  return (
    <button
      className="category-set-goal-btn"
      title="Set a monthly budget for this category"
      onClick={openInput}
    >
      + Set Budget
    </button>
  );
}
