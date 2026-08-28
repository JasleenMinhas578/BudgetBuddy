import { LuTrash2 } from 'react-icons/lu';

export default function CategoryDeleteMessage({ pendingDeleteCategory, expenses, formatAmount }) {
  if (!pendingDeleteCategory) return null;
  const catExpenses = expenses.filter((e) => e.category === pendingDeleteCategory.name);

  return (
    <div>
      <p>
        Are you sure you want to delete <strong>"{pendingDeleteCategory.name}"</strong>?
        {pendingDeleteCategory.isDefault
          ? ' This default category will be hidden from your view.'
          : ' This action cannot be undone.'}
      </p>
      {catExpenses.length > 0 && (
        <div className="cd-expense-warning-block">
          <p className="cd-expense-warning-title">
            <LuTrash2 size={14} />
            {`${catExpenses.length} expense${catExpenses.length !== 1 ? 's' : ''} will be reassigned to "Other":`}
          </p>
          <ul className={`cd-expense-list${catExpenses.length > 10 ? ' cd-expense-list--scrollable' : ''}`}>
            {catExpenses.map((e) => (
              <li key={e.id}>
                <span className="cd-exp-title">{e.title}</span>
                <span className="cd-exp-date">
                  {e.date
                    ? new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : ''}
                </span>
                <span className="cd-exp-amount">{formatAmount(Number(e.amount))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
