import { useState } from 'react';
import { LuCheck } from 'react-icons/lu';

const DATE_PRESETS = ['Today', 'This Week', 'This Month', 'Last Month', 'This Year', 'All Time'];

// Renders plain text, but splits on bullet lines (• …) into a proper list
function MessageText({ text, className }) {
  const lines = text.split('\n').flatMap(line => line.split(/(?=•)/)).map(l => l.trim()).filter(Boolean);
  const hasBullets = lines.some(l => l.startsWith('•'));

  if (!hasBullets) return <p className={className}>{text}</p>;

  return (
    <div className={className}>
      {lines.map((line, i) =>
        line.startsWith('•')
          ? <div key={i} className="ai-bullet-line">{line}</div>
          : <p key={i} className="ai-bullet-intro">{line}</p>
      )}
    </div>
  );
}

const CONFIRMED_LABELS = {
  expense_confirm:          'Expense added!',
  multiple_expense_confirm: 'All expenses added!',
  category_confirm:         'Category added successfully!',
  delete_expense_confirm:   'Expense deleted!',
  edit_expense_confirm:     'Expense updated!',
  delete_category_confirm:  'Category deleted!',
  edit_category_confirm:    'Category renamed!',
  set_budget_confirm:       'Budget goal saved!',
  remove_budget_confirm:    'Budget goal removed!',
};

function ExpenseCard({ rows, confirmLabel, isDanger, onConfirm, onDismiss }) {
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

function EditableExpenseCard({ data, onConfirm, onDismiss }) {
  const [title, setTitle] = useState(data.title || '');
  const [amount, setAmount] = useState(String(data.amount ?? ''));
  const [category, setCategory] = useState(data.category || '');
  const [date, setDate] = useState(data.date || '');

  const handleConfirm = () => {
    onConfirm({ ...data, title, amount: parseFloat(amount) || 0, category, date });
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

export default function ChatMessage({ msg, index, onConfirm, onDismiss, onPickDateRange }) {
  const active = !msg.confirmed && !msg.dismissed;

  if (msg.type === 'date_range_picker') {
    return (
      <div className="ai-date-range-picker">
        <p>{msg.content}</p>
        {!msg.resolved && (
          <>
            <div className="ai-date-preset-grid">
              {DATE_PRESETS.map((label) => (
                <button
                  key={label}
                  className="ai-date-preset-btn"
                  onClick={() => onPickDateRange(index, label, msg.originalQuestion)}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="ai-date-custom-hint">
              Or type a custom range below (e.g. "January 2026", "past 3 weeks")
            </p>
          </>
        )}
      </div>
    );
  }

  if (msg.type === 'expense_confirm' && active) {
    return (
      <div className="ai-expense-confirm">
        <p>{msg.content}</p>
        <EditableExpenseCard
          data={msg.expenseData}
          onConfirm={(editedData) => onConfirm({ ...msg, expenseData: editedData }, index)}
          onDismiss={() => onDismiss(index)}
        />
      </div>
    );
  }

  if (msg.type === 'multiple_expense_confirm' && active) {
    return (
      <div className="ai-expense-confirm">
        <p>{msg.content}</p>
        <div className="ai-expense-card">
          {msg.expensesData.map((e, i) => (
            <div key={i} className="ai-expense-row ai-multi-row">
              <span>{e.title}</span>
              <strong>${Number(e.amount).toFixed(2)} · {e.category}</strong>
            </div>
          ))}
          <div className="ai-expense-actions">
            <button className="btn-confirm" onClick={() => onConfirm(msg, index)}><LuCheck size={14} /> Add All</button>
            <button className="btn-dismiss" onClick={() => onDismiss(index)}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  if (msg.type === 'category_confirm' && active) {
    return (
      <div className="ai-expense-confirm">
        <p>{msg.content}</p>
        <ExpenseCard
          rows={[{ label: 'Category', value: msg.categoryData.name }]}
          confirmLabel="Add Category"
          onConfirm={() => onConfirm(msg, index)}
          onDismiss={() => onDismiss(index)}
        />
      </div>
    );
  }

  if (msg.type === 'delete_expense_confirm' && active) {
    return (
      <div className="ai-expense-confirm">
        <p>{msg.content}</p>
        <ExpenseCard
          rows={[
            { label: 'Title',    value: msg.deleteExpenseData.title },
            { label: 'Amount',   value: `$${Number(msg.deleteExpenseData.amount).toFixed(2)}` },
            { label: 'Category', value: msg.deleteExpenseData.category },
            { label: 'Date',     value: msg.deleteExpenseData.date },
          ]}
          confirmLabel="Delete Expense"
          isDanger
          onConfirm={() => onConfirm(msg, index)}
          onDismiss={() => onDismiss(index)}
        />
      </div>
    );
  }

  if (msg.type === 'edit_expense_confirm' && active) {
    return (
      <div className="ai-expense-confirm">
        <p>{msg.content}</p>
        <ExpenseCard
          rows={[
            { label: 'Title',    value: msg.editExpenseData.updates.title    ?? msg.editExpenseData.title    },
            { label: 'Amount',   value: `$${Number(msg.editExpenseData.updates.amount   ?? msg.editExpenseData.amount).toFixed(2)}` },
            { label: 'Category', value: msg.editExpenseData.updates.category ?? msg.editExpenseData.category },
            { label: 'Date',     value: msg.editExpenseData.updates.date     ?? msg.editExpenseData.date     },
          ]}
          confirmLabel="Save Changes"
          onConfirm={() => onConfirm(msg, index)}
          onDismiss={() => onDismiss(index)}
        />
      </div>
    );
  }

  if (msg.type === 'delete_category_confirm' && active) {
    return (
      <div className="ai-expense-confirm">
        <p>{msg.content}</p>
        <ExpenseCard
          rows={[{ label: 'Category', value: msg.deleteCategoryData.name }]}
          confirmLabel="Delete Category"
          isDanger
          onConfirm={() => onConfirm(msg, index)}
          onDismiss={() => onDismiss(index)}
        />
      </div>
    );
  }

  if (msg.type === 'edit_category_confirm' && active) {
    return (
      <div className="ai-expense-confirm">
        <p>{msg.content}</p>
        <ExpenseCard
          rows={[
            { label: 'Current Name', value: msg.editCategoryData.name },
            { label: 'New Name',     value: msg.editCategoryData.newName },
          ]}
          confirmLabel="Rename"
          onConfirm={() => onConfirm(msg, index)}
          onDismiss={() => onDismiss(index)}
        />
      </div>
    );
  }

  if (msg.type === 'set_budget_confirm' && active) {
    return (
      <div className="ai-expense-confirm">
        <p>{msg.content}</p>
        <ExpenseCard
          rows={[
            { label: 'Category', value: msg.budgetData.categoryName },
            { label: 'Monthly Goal', value: `$${Number(msg.budgetData.amount).toFixed(2)}` },
          ]}
          confirmLabel="Set Goal"
          onConfirm={() => onConfirm(msg, index)}
          onDismiss={() => onDismiss(index)}
        />
      </div>
    );
  }

  if (msg.type === 'remove_budget_confirm' && active) {
    return (
      <div className="ai-expense-confirm">
        <p>{msg.content}</p>
        <ExpenseCard
          rows={[
            { label: 'Category', value: msg.budgetData.categoryName },
            { label: 'Current goal', value: msg.budgetData.amount ? `$${Number(msg.budgetData.amount).toFixed(0)}/mo` : '—' },
          ]}
          confirmLabel="Remove Goal"
          isDanger
          onConfirm={() => onConfirm(msg, index)}
          onDismiss={() => onDismiss(index)}
        />
      </div>
    );
  }

  if (msg.confirmed) {
    return (
      <div className="ai-expense-confirm">
        <p>{msg.content}</p>
        <div className="ai-expense-confirmed">
          <LuCheck size={14} /> {CONFIRMED_LABELS[msg.type] ?? 'Done!'}
        </div>
      </div>
    );
  }

  if (msg.dismissed) {
    return (
      <div className="ai-expense-confirm">
        <p>{msg.content}</p>
        <div className="ai-expense-dismissed">Cancelled</div>
      </div>
    );
  }

  if (msg.type === 'reminder') {
    return <p className="ai-reminder">{msg.content}</p>;
  }

  return <MessageText text={msg.content} />;
}
