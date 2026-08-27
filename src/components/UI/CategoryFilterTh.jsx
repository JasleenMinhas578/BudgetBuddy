import { useState, useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { LuFilter } from 'react-icons/lu';
import { getCategoryIcon } from '../../utils/getCategoryIcon';
import SortIcon from './SortIcon';

export default function CategoryFilterTh({
  categoryFilter,
  setCategoryFilter,
  uniqueCategories,
  sortKey,
  sortDir,
  onSort,
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useClickOutside(filterRef, () => setFilterOpen(false), filterOpen);

  return (
    <th>
      <div className="th-category-wrapper" ref={filterRef}>
        <button className="th-sort-btn" onClick={() => onSort('category')}>
          Category <SortIcon active={sortKey === 'category'} dir={sortDir} />
        </button>
        <button
          className={`th-filter-btn${categoryFilter ? ' th-filter-active' : ''}`}
          onClick={() => setFilterOpen(o => !o)}
          title={categoryFilter ? `Filtering: ${categoryFilter}` : 'Filter by category'}
        >
          <LuFilter size={12} />
        </button>
        {filterOpen && (
          <div className="category-filter-dropdown">
            <button
              className={`category-filter-option${!categoryFilter ? ' active' : ''}`}
              onClick={() => { setCategoryFilter(''); setFilterOpen(false); }}
            >
              All Categories
            </button>
            {uniqueCategories.map(cat => (
              <button
                key={cat}
                className={`category-filter-option${categoryFilter === cat ? ' active' : ''}`}
                onClick={() => { setCategoryFilter(cat); setFilterOpen(false); }}
              >
                <span className="category-option-icon">{getCategoryIcon(cat)}</span>
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
    </th>
  );
}
