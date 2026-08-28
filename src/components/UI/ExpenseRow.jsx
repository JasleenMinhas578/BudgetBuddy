import { useState, Fragment } from 'react';
import { LuPencil, LuTrash2, LuMessageSquare } from 'react-icons/lu';
import { getCategoryIcon } from '../../utils/getCategoryIcon';
import { formatDate } from '../../utils/formatDate';

export default function ExpenseRow({
  expense,
  hide,
  showActions,
  colCount,
  onEdit,
  onDelete,
  formatAmount,
}) {
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);

  return (
    <Fragment>
      <tr>
        {!hide.has('category') && (
          <td>
            <div className="category-cell">
              <span className="category-icon">{getCategoryIcon(expense.category)}</span>
              <span className="category-name">{expense.category}</span>
            </div>
          </td>
        )}
        {!hide.has('title') && (
          <td>
            <div className="title-cell">
              <span className="expense-title">{expense.title}</span>
              {expense.notes && (
                <button
                  className={`note-toggle-btn${isNoteExpanded ? ' active' : ''}`}
                  onClick={() => setIsNoteExpanded(v => !v)}
                  title={isNoteExpanded ? 'Hide note' : 'Show note'}
                  aria-label={isNoteExpanded ? 'Hide note' : 'Show note'}
                  type="button"
                >
                  <LuMessageSquare size={13} />
                </button>
              )}
            </div>
          </td>
        )}
        {!hide.has('amount') && (
          <td>
            <span className="amount-cell">
              {formatAmount(typeof expense.amount === 'number' ? expense.amount : 0)}
            </span>
          </td>
        )}
        {!hide.has('date') && (
          <td>
            <span className="date-cell">
              {hide.has('category') && expense.category
                ? `${expense.category} • ${formatDate(expense.date)}`
                : formatDate(expense.date)}
            </span>
          </td>
        )}
        {showActions && (
          <td>
            <div className="action-buttons">
              {onEdit && (
                <button
                  onClick={() => onEdit(expense)}
                  className="btn btn-secondary btn-sm edit-btn"
                  title="Edit expense"
                >
                  <LuPencil size={14} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(expense.id)}
                  className="btn btn-danger btn-sm delete-btn"
                  title="Delete expense"
                >
                  <LuTrash2 size={14} />
                </button>
              )}
            </div>
          </td>
        )}
      </tr>
      {expense.notes && isNoteExpanded && (
        <tr className="note-row">
          <td colSpan={colCount} className="note-row-cell">
            <div className="note-row-inner">
              <LuMessageSquare size={12} />
              <span>{expense.notes}</span>
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}
