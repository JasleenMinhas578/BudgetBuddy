import { useState, useEffect } from 'react';
import { LuPencil, LuTrash2, LuArrowUp, LuArrowDown, LuArrowUpDown } from 'react-icons/lu';
import { getCategoryIcon } from '../../utils/getCategoryIcon';
import { formatDate } from '../../utils/formatDate';
import Pagination from './Pagination';
import CuteEmptyFace from './CuteEmptyFace';

function SortIcon({ active, dir }) {
  if (!active) return <LuArrowUpDown size={13} className="sort-icon-inactive" />;
  return dir === 'asc'
    ? <LuArrowUp size={13} className="sort-icon-active" />
    : <LuArrowDown size={13} className="sort-icon-active" />;
}

/**
 * Reusable sortable expense table.
 *
 * Props:
 *   expenses        - full filtered array (component handles sorting + pagination)
 *   onEdit(expense) - optional; renders edit button when provided
 *   onDelete(id)    - optional; renders delete button when provided
 *   itemsPerPage    - default 15
 *   showPagination  - default true; pass false to hide the paginator (e.g. dashboard preview)
 *   emptyIcon       - node shown in the empty state
 *   emptyMessage    - primary empty-state text
 *   emptySubMessage - secondary empty-state text
 *   emptyAction     - node (e.g. a button) rendered below the empty-state text
 */
export default function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
  itemsPerPage = 15,
  showPagination = true,
  hiddenColumns = [],
  emptyIcon,
  emptyMessage = 'No expenses found',
  emptySubMessage = '',
  emptyAction,
}) {
  const hide = new Set(hiddenColumns);
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever the data set changes (e.g. parent date-filter change)
  useEffect(() => {
    setCurrentPage(1);
  }, [expenses]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const sorted = [...expenses].sort((a, b) => {
    let aVal, bVal;
    switch (sortKey) {
      case 'date':
        aVal = a.date || '';
        bVal = b.date || '';
        break;
      case 'title':
        aVal = (a.title || '').toLowerCase();
        bVal = (b.title || '').toLowerCase();
        break;
      case 'amount':
        aVal = typeof a.amount === 'number' ? a.amount : 0;
        bVal = typeof b.amount === 'number' ? b.amount : 0;
        break;
      case 'category':
        aVal = (a.category || '').toLowerCase();
        bVal = (b.category || '').toLowerCase();
        break;
      default:
        return 0;
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const page = sorted.slice(startIdx, startIdx + itemsPerPage);
  const showActions = !!(onEdit || onDelete);

  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">{emptyIcon || <CuteEmptyFace size={96} />}</div>
        <h4>{emptyMessage}</h4>
        {emptySubMessage && <p>{emptySubMessage}</p>}
        {emptyAction}
      </div>
    );
  }

  return (
    <>
      <div className="expenses-table-container">
        <table className="expenses-table">
          <thead>
            <tr>
              {!hide.has('category') && (
                <th>
                  <button className="th-sort-btn" onClick={() => handleSort('category')}>
                    Category <SortIcon active={sortKey === 'category'} dir={sortDir} />
                  </button>
                </th>
              )}
              {!hide.has('title') && (
                <th>
                  <button className="th-sort-btn" onClick={() => handleSort('title')}>
                    Title <SortIcon active={sortKey === 'title'} dir={sortDir} />
                  </button>
                </th>
              )}
              {!hide.has('amount') && (
                <th>
                  <button className="th-sort-btn" onClick={() => handleSort('amount')}>
                    Amount <SortIcon active={sortKey === 'amount'} dir={sortDir} />
                  </button>
                </th>
              )}
              {!hide.has('date') && (
                <th>
                  <button className="th-sort-btn" onClick={() => handleSort('date')}>
                    Date <SortIcon active={sortKey === 'date'} dir={sortDir} />
                  </button>
                </th>
              )}
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {page.map((expense) => (
              <tr key={expense.id}>
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
                    </div>
                  </td>
                )}
                {!hide.has('amount') && (
                  <td>
                    <span className="amount-cell">
                      ${(typeof expense.amount === 'number' ? expense.amount : 0).toFixed(2)}
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
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={sorted.length}
        />
      )}
    </>
  );
}
