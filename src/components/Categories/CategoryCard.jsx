import { LuChevronDown, LuChevronUp } from 'react-icons/lu';
import { getCategoryColor } from '../../utils/getCategoryColor';
import ExpenseTable from '../UI/ExpenseTable';
import CategoryBudgetControl from './CategoryBudgetControl';
import CategoryKebabMenu from './CategoryKebabMenu';

export default function CategoryCard({
  category,
  isExpanded,
  isExpandable,
  categoryAmount,
  sharePercentage,
  prog,
  hasBudget,
  barPct,
  barClass,
  isMenuOpen,
  formatAmount,
  currencySymbol,
  toDisplayAmount,
  toHomeAmount,
  setCategoryBudget,
  filteredExpenses,
  onToggle,
  onMenuToggle,
  onEdit,
  onDelete,
}) {
  const categoryExpenses = filteredExpenses.filter((e) => e.category === category.name);

  return (
    <div
      className={`category-card${isExpandable ? ' category-card--clickable' : ''}${isExpanded ? ' category-card--expanded' : ''}`}
      onClick={isExpandable ? onToggle : undefined}
    >
      <div className="category-card-header">
        <div
          className="category-icon-large"
          style={{
            color: getCategoryColor(category.name),
            background: `${getCategoryColor(category.name)}26`,
          }}
        >
          <category.Icon size={22} />
        </div>

        <div className="category-info">
          <h4>{category.name}</h4>
          <p className="category-amount">{formatAmount(categoryAmount)}</p>
          <CategoryBudgetControl
            categoryName={category.name}
            hasBudget={hasBudget}
            prog={prog}
            formatAmount={formatAmount}
            currencySymbol={currencySymbol}
            toDisplayAmount={toDisplayAmount}
            toHomeAmount={toHomeAmount}
            setCategoryBudget={setCategoryBudget}
          />
        </div>

        <div className="category-actions">
          <CategoryKebabMenu
            isOpen={isMenuOpen}
            onToggle={onMenuToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>

      {isExpandable && (
        <span className="category-expand-hint" aria-hidden="true">
          {isExpanded ? <LuChevronUp size={14} /> : <LuChevronDown size={14} />}
        </span>
      )}

      <div className="category-progress">
        <div className="progress-bar">
          <div className={barClass} style={{ width: `${barPct}%` }} />
        </div>
        {hasBudget ? (
          <div className="budget-row">
            <span className={`budget-remaining${prog.status === 'ok' ? '' : ` budget-remaining--${prog.status}`}`}>
              {prog.remaining >= 0
                ? `${formatAmount(prog.remaining)} left of ${formatAmount(prog.budget)}`
                : `${formatAmount(Math.abs(prog.remaining))} over budget`}
            </span>
            <span className="progress-text">{Math.min(prog.pct, 999).toFixed(0)}%</span>
          </div>
        ) : (
          <span className="progress-text">{sharePercentage.toFixed(1)}% of total</span>
        )}
      </div>

      {isExpanded && (
        <div className="category-expenses-panel" onClick={(e) => e.stopPropagation()}>
          <ExpenseTable
            expenses={categoryExpenses}
            hiddenColumns={['category']}
            itemsPerPage={5}
            emptyMessage="No expenses in this category"
            emptySubMessage="Try a different date range"
          />
        </div>
      )}
    </div>
  );
}
