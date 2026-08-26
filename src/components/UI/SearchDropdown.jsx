import { LuTag, LuArrowRight } from 'react-icons/lu';

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="search-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchDropdown({ expenseResults, categoryResults, query, onSelect, onViewAll }) {
  const hasExpenses = expenseResults.length > 0;
  const hasCategories = categoryResults.length > 0;
  const isEmpty = !hasExpenses && !hasCategories;

  return (
    <div className="search-dropdown">
      {isEmpty && (
        <p className="search-dropdown-empty">No results for "{query}"</p>
      )}

      {hasExpenses && (
        <div className="search-dropdown-section">
          <span className="search-dropdown-label">Expenses</span>
          {expenseResults.map(exp => (
            <button
              key={exp.id}
              className="search-result-item"
              onMouseDown={() => onSelect('expense', exp)}
            >
              <span className="search-result-icon"><LuTag size={14} /></span>
              <span className="search-result-title">{highlight(exp.title, query)}</span>
              <span className="search-result-meta">
                <span className="search-result-amount">${Number(exp.amount).toFixed(2)}</span>
                <span className="search-result-category">{exp.category}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {hasCategories && (
        <div className="search-dropdown-section">
          <span className="search-dropdown-label">Categories</span>
          {categoryResults.map(cat => (
            <button
              key={cat.name}
              className="search-result-item"
              onMouseDown={() => onSelect('category', cat)}
            >
              <span className="search-result-icon"><cat.Icon size={14} /></span>
              <span className="search-result-title">{highlight(cat.name, query)}</span>
              <span className="search-result-meta">
                <span className="search-result-amount">${cat.total.toFixed(2)} total</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <button className="search-dropdown-footer" onMouseDown={onViewAll}>
        View all results for "{query}" <LuArrowRight size={13} />
      </button>
    </div>
  );
}
