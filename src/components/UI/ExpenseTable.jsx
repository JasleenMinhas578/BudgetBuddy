import { useState, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import Pagination from './Pagination';
import CuteEmptyFace from './CuteEmptyFace';
import SortIcon from './SortIcon';
import CategoryFilterTh from './CategoryFilterTh';
import ExpenseRow from './ExpenseRow';

export default function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
  itemsPerPage = 15,
  showPagination = true,
  showCategoryFilter = false,
  hiddenColumns = [],
  emptyIcon,
  emptyMessage = 'No expenses found',
  emptySubMessage = '',
  emptyAction,
}) {
  const { formatAmount } = useCurrency();
  const hide = new Set(hiddenColumns);
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');

  // Clear stale category filter when the expenses dataset changes (e.g. date range switch)
  useEffect(() => {
    setCategoryFilter('');
    setCurrentPage(1);
  }, [expenses]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter]);

  const uniqueCategories = showCategoryFilter
    ? [...new Set(expenses.map(e => e.category).filter(Boolean))].sort()
    : [];

  const visibleExpenses = showCategoryFilter && categoryFilter
    ? expenses.filter(e => e.category === categoryFilter)
    : expenses;

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const sorted = [...visibleExpenses].sort((a, b) => {
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
  const colCount =
    (!hide.has('category') ? 1 : 0) +
    (!hide.has('title') ? 1 : 0) +
    (!hide.has('amount') ? 1 : 0) +
    (!hide.has('date') ? 1 : 0) +
    (showActions ? 1 : 0);

  if (visibleExpenses.length === 0) {
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
                showCategoryFilter
                  ? <CategoryFilterTh
                      categoryFilter={categoryFilter}
                      setCategoryFilter={setCategoryFilter}
                      uniqueCategories={uniqueCategories}
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  : <th>
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
              <ExpenseRow
                key={expense.id}
                expense={expense}
                hide={hide}
                showActions={showActions}
                colCount={colCount}
                onEdit={onEdit}
                onDelete={onDelete}
                formatAmount={formatAmount}
              />
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
