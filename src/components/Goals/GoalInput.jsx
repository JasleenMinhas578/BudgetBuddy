import { useState, useEffect } from 'react';

export function toDisplayStr(v) {
  if (v === null || v === undefined || v === '') return '';
  const n = parseFloat(v);
  return isNaN(n) ? '' : String(parseFloat(n.toFixed(2)));
}

export default function GoalInput({ categoryName, initialValue, onSave }) {
  const normalized = toDisplayStr(initialValue);
  const [value, setValue] = useState(normalized);

  useEffect(() => {
    setValue(toDisplayStr(initialValue));
  }, [initialValue]);

  const isDirty = value !== normalized;

  const save = () => {
    if (!isDirty) return;
    const parsed = value === '' ? null : parseFloat(value);
    if (value !== '' && (Number.isNaN(parsed) || parsed < 0 || parsed > 1000000)) return;
    // $0 is treated the same as no goal — removes the budget entry
    onSave(categoryName, parsed === 0 ? null : parsed);
  };

  return (
    <>
      <input
        type="number"
        min="0"
        step="1"
        className="goal-input"
        placeholder="Add goal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && save()}
        onBlur={save}
      />
      <button
        className="goal-save-btn"
        onMouseDown={(e) => e.preventDefault()}
        onClick={save}
        disabled={!isDirty}
        title="Save goal"
      >
        Save
      </button>
    </>
  );
}
