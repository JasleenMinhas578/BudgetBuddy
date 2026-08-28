import { useState } from 'react';
import { LuCheck } from 'react-icons/lu';
import { DEFAULT_CATEGORIES } from '../../utils/getCategoryIcon';

const DEFAULT_CATEGORY_NAMES = DEFAULT_CATEGORIES.map(c => c.name);

export default function EditableExpenseCard({ data, customCategories = [], onConfirm, onDismiss }) {
  const [title, setTitle] = useState(data.title || '');
  const [amount, setAmount] = useState(String(data.amount ?? ''));
  const [category, setCategory] = useState(data.category || '');
  const [date, setDate] = useState(data.date || '');
  const [validationError, setValidationError] = useState('');

  const allCategoryNames = [
    ...DEFAULT_CATEGORY_NAMES,
    ...customCategories
      .filter(c => !DEFAULT_CATEGORY_NAMES.includes(c.name))
      .map(c => c.name),
  ];

  const handleConfirm = () => {
    const parsedAmount = parseFloat(amount);
    if (!title.trim()) { setValidationError('Title is required'); return; }
    if (!parsedAmount || parsedAmount <= 0) { setValidationError('Amount must be greater than 0'); return; }
    if (!date) { setValidationError('Date is required'); return; }
    if (!category || !allCategoryNames.includes(category)) {
      setValidationError('Please select a valid category'); return;
    }
    setValidationError('');
    onConfirm({ ...data, title: title.trim(), amount: parsedAmount, category, date });
  };

  return (
    <div className="ai-expense-card">
      {[
        { label: 'Title',  el: <input className="ai-edit-input" value={title}  onChange={e => setTitle(e.target.value)} /> },
        { label: 'Amount', el: <input className="ai-edit-input" type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} /> },
        {
          label: 'Category',
          el: (
            <select className="ai-edit-input" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">— none —</option>
              {allCategoryNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          ),
        },
        { label: 'Date', el: <input className="ai-edit-input" type="date" value={date} onChange={e => setDate(e.target.value)} /> },
      ].map(({ label, el }) => (
        <div key={label} className="ai-expense-row">
          <span>{label}</span>
          {el}
        </div>
      ))}
      {validationError && (
        <p style={{ color: 'var(--color-error, #ef4444)', fontSize: '0.8rem', margin: '4px 0 0' }}>
          {validationError}
        </p>
      )}
      <div className="ai-expense-actions">
        <button className="btn-confirm" onClick={handleConfirm}><LuCheck size={14} /> Add Expense</button>
        <button className="btn-dismiss" onClick={onDismiss}>Cancel</button>
      </div>
    </div>
  );
}
