import { LuCheck } from 'react-icons/lu';

const DATE_PRESETS = ['Today', 'This Week', 'This Month', 'Last Month', 'This Year', 'All Time'];

const CONFIRMED_LABELS = {
  category_confirm:        'Category added successfully!',
  delete_expense_confirm:  'Expense deleted!',
  edit_expense_confirm:    'Expense updated!',
  delete_category_confirm: 'Category deleted!',
  edit_category_confirm:   'Category renamed!',
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
        <ExpenseCard
          rows={[
            { label: 'Title',    value: msg.expenseData.title },
            { label: 'Amount',   value: `$${Number(msg.expenseData.amount).toFixed(2)}` },
            { label: 'Category', value: msg.expenseData.category },
            { label: 'Date',     value: msg.expenseData.date },
          ]}
          confirmLabel="Add Expense"
          onConfirm={() => onConfirm(msg, index)}
          onDismiss={() => onDismiss(index)}
        />
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

  return <p>{msg.content}</p>;
}
