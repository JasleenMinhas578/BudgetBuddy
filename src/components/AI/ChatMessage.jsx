import { LuCheck } from 'react-icons/lu';
import { useCurrency } from '../../context/CurrencyContext';
import MessageText from './MessageText';
import ExpenseCard from './ExpenseCard';
import EditableExpenseCard from './EditableExpenseCard';

const DATE_PRESETS = ['Today', 'This Week', 'This Month', 'Last Month', 'This Year', 'All Time'];

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

function ConfirmMessage({ content, children }) {
  return (
    <div className="ai-expense-confirm">
      <p>{content}</p>
      {children}
    </div>
  );
}

export default function ChatMessage({ msg, index, onConfirm, onDismiss, onPickDateRange }) {
  const { formatAmount } = useCurrency();
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
      <ConfirmMessage content={msg.content}>
        <EditableExpenseCard
          data={msg.expenseData}
          onConfirm={(editedData) => onConfirm({ ...msg, expenseData: editedData }, index)}
          onDismiss={() => onDismiss(index)}
        />
      </ConfirmMessage>
    );
  }

  if (msg.type === 'multiple_expense_confirm' && active) {
    return (
      <ConfirmMessage content={msg.content}>
        <div className="ai-expense-card">
          {msg.expensesData.map((e, i) => (
            <div key={i} className="ai-expense-row ai-multi-row">
              <span>{e.title}</span>
              <strong>{formatAmount(Number(e.amount))} · {e.category}</strong>
            </div>
          ))}
          <div className="ai-expense-actions">
            <button className="btn-confirm" onClick={() => onConfirm(msg, index)}><LuCheck size={14} /> Add All</button>
            <button className="btn-dismiss" onClick={() => onDismiss(index)}>Cancel</button>
          </div>
        </div>
      </ConfirmMessage>
    );
  }

  if (msg.type === 'category_confirm' && active) {
    return (
      <ConfirmMessage content={msg.content}>
        <ExpenseCard
          rows={[{ label: 'Category', value: msg.categoryData.name }]}
          confirmLabel="Add Category"
          onConfirm={() => onConfirm(msg, index)}
          onDismiss={() => onDismiss(index)}
        />
      </ConfirmMessage>
    );
  }

  if (msg.type === 'delete_expense_confirm' && active) {
    return (
      <ConfirmMessage content={msg.content}>
        <ExpenseCard
          rows={[
            { label: 'Title',    value: msg.deleteExpenseData.title },
            { label: 'Amount',   value: formatAmount(Number(msg.deleteExpenseData.amount)) },
            { label: 'Category', value: msg.deleteExpenseData.category },
            { label: 'Date',     value: msg.deleteExpenseData.date },
          ]}
          confirmLabel="Delete Expense"
          isDanger
          onConfirm={() => onConfirm(msg, index)}
          onDismiss={() => onDismiss(index)}
        />
      </ConfirmMessage>
    );
  }

  if (msg.type === 'edit_expense_confirm' && active) {
    return (
      <ConfirmMessage content={msg.content}>
        <ExpenseCard
          rows={[
            { label: 'Title',    value: msg.editExpenseData.updates.title    ?? msg.editExpenseData.title    },
            { label: 'Amount',   value: formatAmount(Number(msg.editExpenseData.updates.amount ?? msg.editExpenseData.amount)) },
            { label: 'Category', value: msg.editExpenseData.updates.category ?? msg.editExpenseData.category },
            { label: 'Date',     value: msg.editExpenseData.updates.date     ?? msg.editExpenseData.date     },
          ]}
          confirmLabel="Save Changes"
          onConfirm={() => onConfirm(msg, index)}
          onDismiss={() => onDismiss(index)}
        />
      </ConfirmMessage>
    );
  }

  if (msg.type === 'delete_category_confirm' && active) {
    return (
      <ConfirmMessage content={msg.content}>
        <ExpenseCard
          rows={[{ label: 'Category', value: msg.deleteCategoryData.name }]}
          confirmLabel="Delete Category"
          isDanger
          onConfirm={() => onConfirm(msg, index)}
          onDismiss={() => onDismiss(index)}
        />
      </ConfirmMessage>
    );
  }

  if (msg.type === 'edit_category_confirm' && active) {
    return (
      <ConfirmMessage content={msg.content}>
        <ExpenseCard
          rows={[
            { label: 'Current Name', value: msg.editCategoryData.name },
            { label: 'New Name',     value: msg.editCategoryData.newName },
          ]}
          confirmLabel="Rename"
          onConfirm={() => onConfirm(msg, index)}
          onDismiss={() => onDismiss(index)}
        />
      </ConfirmMessage>
    );
  }

  if (msg.type === 'set_budget_confirm' && active) {
    return (
      <ConfirmMessage content={msg.content}>
        <ExpenseCard
          rows={[
            { label: 'Category',     value: msg.budgetData.categoryName },
            { label: 'Monthly Goal', value: formatAmount(Number(msg.budgetData.amount)) },
          ]}
          confirmLabel="Set Goal"
          onConfirm={() => onConfirm(msg, index)}
          onDismiss={() => onDismiss(index)}
        />
      </ConfirmMessage>
    );
  }

  if (msg.type === 'remove_budget_confirm' && active) {
    return (
      <ConfirmMessage content={msg.content}>
        <ExpenseCard
          rows={[
            { label: 'Category',     value: msg.budgetData.categoryName },
            { label: 'Current goal', value: msg.budgetData.amount ? `${formatAmount(Number(msg.budgetData.amount))}/mo` : '—' },
          ]}
          confirmLabel="Remove Goal"
          isDanger
          onConfirm={() => onConfirm(msg, index)}
          onDismiss={() => onDismiss(index)}
        />
      </ConfirmMessage>
    );
  }

  if (msg.confirmed) {
    return (
      <ConfirmMessage content={msg.content}>
        <div className="ai-expense-confirmed">
          <LuCheck size={14} /> {CONFIRMED_LABELS[msg.type] ?? 'Done!'}
        </div>
      </ConfirmMessage>
    );
  }

  if (msg.dismissed) {
    return (
      <ConfirmMessage content={msg.content}>
        <div className="ai-expense-dismissed">Cancelled</div>
      </ConfirmMessage>
    );
  }

  if (msg.type === 'reminder') {
    return <p className="ai-reminder">{msg.content}</p>;
  }

  return <MessageText text={msg.content} />;
}
