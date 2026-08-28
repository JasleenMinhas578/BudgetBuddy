import { useState } from 'react';
import { LuCheck } from 'react-icons/lu';

export default function EditableExpenseCard({ data, onConfirm, onDismiss }) {
  const [title, setTitle] = useState(data.title || '');
  const [amount, setAmount] = useState(String(data.amount ?? ''));
  const [category, setCategory] = useState(data.category || '');
  const [date, setDate] = useState(data.date || '');

  const handleConfirm = () => {
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || !parsedAmount || parsedAmount <= 0 || !date) return;
    onConfirm({ ...data, title: title.trim(), amount: parsedAmount, category, date });
  };

  return (
    <div className="ai-expense-card">
      {[
        { label: 'Title',    el: <input className="ai-edit-input" value={title}    onChange={e => setTitle(e.target.value)} /> },
        { label: 'Amount',   el: <input className="ai-edit-input" type="number" min="0" step="0.01" value={amount}   onChange={e => setAmount(e.target.value)} /> },
        { label: 'Category', el: <input className="ai-edit-input" value={category} onChange={e => setCategory(e.target.value)} /> },
        { label: 'Date',     el: <input className="ai-edit-input" type="date"  value={date}     onChange={e => setDate(e.target.value)} /> },
      ].map(({ label, el }) => (
        <div key={label} className="ai-expense-row">
          <span>{label}</span>
          {el}
        </div>
      ))}
      <div className="ai-expense-actions">
        <button className="btn-confirm" onClick={handleConfirm}><LuCheck size={14} /> Add Expense</button>
        <button className="btn-dismiss" onClick={onDismiss}>Cancel</button>
      </div>
    </div>
  );
}
