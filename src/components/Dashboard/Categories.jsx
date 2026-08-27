/* istanbul ignore file */
import { useState, useEffect, useMemo } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { LuTag, LuPlus, LuChevronDown, LuChevronUp, LuMoreVertical, LuPencil, LuTrash2 } from 'react-icons/lu';
import CuteEmptyFace from '../UI/CuteEmptyFace';
import ExpenseTable from '../UI/ExpenseTable';
import { subscribeToUserPreferences } from '../../services/categoryService';
import { DEFAULT_CATEGORIES } from '../../utils/getCategoryIcon';
import { useExpenses } from '../../hooks/useExpenses';
import PageHeader from '../UI/PageHeader';
import ChartCard from '../UI/ChartCard';
import { getCategoryColor } from '../../utils/getCategoryColor';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useCategoryActions } from '../../hooks/useCategoryActions';
import { useBudgets } from '../../hooks/useBudgets';
import { useBudgetProgress } from '../../hooks/useBudgetProgress';
import { useAuth } from '../../context/AuthContext';
import { useDateFilter } from '../../hooks/useDateFilter';
import { useDateRangeContext } from '../../context/DateRangeContext';
import { useCurrency } from '../../context/CurrencyContext';
import PieChart from '../Charts/PieChart';
import BarChart from '../Charts/BarChart';
import Modal from '../UI/Modal';
import AddCategoryModal from '../UI/AddCategoryModal';
import Toast from '../UI/Toast';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../UI/ConfirmDialog';
import DateFilterBar from '../UI/DateFilterBar';
import '../../styles/main.css';
import '../../styles/modal-forms.css';


export default function Categories() {
  const { formatAmount, currencySymbol, toDisplayAmount, toHomeAmount } = useCurrency();
  const { expenses } = useExpenses();
  const firestoreCategories = useCategories();
  const { toast, showToast, hideToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [openMenu, setOpenMenu] = useState(null);
  const [hiddenDefaults, setHiddenDefaults] = useState([]);
  const [editName, setEditName] = useState('');
  const { currentUser } = useAuth();
  const dateRangeCtx = useDateRangeContext();
  const {
    filteredExpenses, dateFilter, setDateFilter,
    customDateRange, setCustomDateRange,
    pickedMonth, setPickedMonth, availableMonths,
  } = useDateFilter(expenses, 'thisMonth', dateRangeCtx);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.category-card') && !e.target.closest('.btn-toggle-all')) {
        setExpandedCategories(new Set());
      }
      if (!e.target.closest('.category-menu-wrapper')) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);


  useEffect(() => {
    if (!currentUser) return;
    let unsub = () => {};
    try {
      unsub = subscribeToUserPreferences(currentUser.uid, (prefs) => {
        setHiddenDefaults(prefs.hiddenDefaultCategories || []);
      });
    } catch (e) {
      console.error('Error subscribing to user preferences:', e);
    }
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [currentUser]);

  const allCategories = useMemo(() => [
    ...DEFAULT_CATEGORIES
      .filter(cat => !hiddenDefaults.includes(cat.name))
      .map(cat => ({ ...cat, isDefault: true })),
    ...firestoreCategories
      .filter(cat => cat && cat.name && cat.name !== 'undefined' && cat.name !== 'null')
      .map(cat => ({ ...cat, Icon: LuTag, isDefault: false })),
  ], [firestoreCategories, hiddenDefaults]);

  const { categoryData, totalSpent } = useCategoryData(filteredExpenses, allCategories);
  const { budgets, setCategoryBudget } = useBudgets();
  const [goalInputOpen, setGoalInputOpen] = useState(null);
  const [goalInputValue, setGoalInputValue] = useState('');
  const { categoryProgress } = useBudgetProgress(filteredExpenses, allCategories, budgets);

  const monthlyTrendData = useMemo(() => {
    const months = [...new Set(
      filteredExpenses.map(e => e.date?.slice(0, 7)).filter(Boolean)
    )].sort();
    const catTotals = {};
    filteredExpenses.forEach(e => {
      if (e.category) catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    });
    const topCats = Object.entries(catTotals)
      .sort(([, a], [, b]) => b - a).slice(0, 4).map(([name]) => name);
    return {
      labels: months.map(m => {
        const [y, mo] = m.split('-');
        return new Date(Number(y), Number(mo) - 1).toLocaleDateString('en', { month: 'short', year: 'numeric' });
      }),
      datasets: topCats.map(cat => ({
        label: cat,
        data: months.map(month =>
          filteredExpenses
            .filter(e => e.category === cat && e.date?.startsWith(month))
            .reduce((sum, e) => sum + e.amount, 0)
        ),
        backgroundColor: getCategoryColor(cat),
      })),
    };
  }, [filteredExpenses]);

  const hasMultipleMonths = useMemo(() =>
    new Set(filteredExpenses.map(e => e.date?.slice(0, 7)).filter(Boolean)).size >= 2
  , [filteredExpenses]);

  const {
    isLoading,
    pendingDeleteCategory, setPendingDeleteCategory,
    pendingEditCategory, setPendingEditCategory,
    handleAddCategory,
    handleEditCategory,
    confirmEditCategory,
    handleDeleteCategory,
    confirmDeleteCategory,
  } = useCategoryActions(currentUser, allCategories, showToast);

  const toggleCategory = (name) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const expandableCategoryNames = allCategories
    .filter(cat => filteredExpenses.some(e => e.category === cat.name))
    .map(cat => cat.name);
  const allExpanded = expandableCategoryNames.length > 0 &&
    expandableCategoryNames.every(name => expandedCategories.has(name));
  const toggleAll = () => {
    setExpandedCategories(allExpanded ? new Set() : new Set(expandableCategoryNames));
  };

  return (
    <div className="categories-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible
          onClose={hideToast}
        />
      )}

      <PageHeader
        title="Categories"
        subtitle="Analyze your spending by category"
        action={
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <LuPlus size={16} />
            Add Category
          </button>
        }
      />

      <div className="categories-summary">
        <div className="summary-stat">
          <span className="stat-label">Total Categories</span>
          <span className="stat-value">{allCategories.length}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Total Spent</span>
          <span className="stat-value">{formatAmount(totalSpent)}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Active Categories</span>
          <span className="stat-value">
            {categoryData.datasets[0].data.filter(val => val > 0).length}
          </span>
        </div>
      </div>

      <div className="filter-controls">
        <div className="filter-section">
          <DateFilterBar
            dateFilter={dateFilter}
            onChange={setDateFilter}
            customDateRange={customDateRange}
            onCustomDateRangeChange={setCustomDateRange}
            pickedMonth={pickedMonth}
            onPickedMonthChange={setPickedMonth}
            availableMonths={availableMonths}
          />
        </div>
      </div>

      <div className="categories-list-section">
        <div className="section-subheader">
          <div>
            <h3>All Categories</h3>
            <p>Detailed breakdown of your spending by category (default and custom)</p>
          </div>
          {expandableCategoryNames.length > 0 && (
            <button className="btn btn-secondary btn-sm btn-toggle-all" onClick={toggleAll}>
              {allExpanded ? <LuChevronUp size={14} /> : <LuChevronDown size={14} />}
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          )}
        </div>

        {allCategories.length > 0 ? (
          <div className="categories-grid">
            {allCategories.map((category) => {
              const categoryAmount = categoryData.datasets[0].data[categoryData.labels.indexOf(category.name)] || 0;
              const sharePercentage = totalSpent > 0 ? (categoryAmount / totalSpent) * 100 : 0;
              const isDefaultCategory = DEFAULT_CATEGORIES.some(dc => dc.name === category.name);
              const isExpanded = expandedCategories.has(category.name);
              const categoryExpenses = filteredExpenses.filter(e => e.category === category.name);
              const isExpandable = categoryExpenses.length > 0;

              const prog = categoryProgress.find(p => p.name === category.name);
              const hasBudget = prog?.budget !== null && prog?.budget !== undefined;
              // bar shows budget progress when a budget is set; otherwise share-of-total
              const barPct = hasBudget ? Math.min(prog.pct, 100) : sharePercentage;
              const barClass = hasBudget
                ? `progress-fill progress-fill--${prog.status}`
                : 'progress-fill';
              const barStyle = hasBudget
                ? { width: `${barPct}%` }
                : { width: `${barPct}%`, backgroundColor: getCategoryColor(category.name) };

              return (
                <div
                  key={category.id ?? category.name}
                  className={`category-card${isExpandable ? ' category-card--clickable' : ''}${isExpanded ? ' category-card--expanded' : ''}`}
                  onClick={isExpandable ? () => toggleCategory(category.name) : undefined}
                >
                  <div className="category-card-header">
                    <div className="category-icon-large" style={{ color: getCategoryColor(category.name), background: `${getCategoryColor(category.name)}26` }}>
                      <category.Icon size={22} />
                    </div>
                    <div className="category-info">
                      <h4>{category.name}</h4>
                      <p className="category-amount">{formatAmount(categoryAmount)}</p>
                      {goalInputOpen === category.name ? (
                        <form
                          className="category-goal-form"
                          onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const val = parseFloat(goalInputValue);
                            if (!isNaN(val) && val > 0) {
                              setCategoryBudget(category.name, toHomeAmount(val));
                            }
                            setGoalInputOpen(null);
                            setGoalInputValue('');
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            className="category-goal-input"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder={`${currencySymbol}/mo`}
                            value={goalInputValue}
                            autoFocus
                            onChange={(e) => setGoalInputValue(e.target.value)}
                            onBlur={() => { setGoalInputOpen(null); setGoalInputValue(''); }}
                            onKeyDown={(e) => { if (e.key === 'Escape') { setGoalInputOpen(null); setGoalInputValue(''); } }}
                          />
                          <button type="submit" className="category-goal-save" onMouseDown={(e) => e.preventDefault()}>✓</button>
                        </form>
                      ) : hasBudget ? (
                        <span
                          className="category-goal-badge"
                          title="Click to edit monthly budget"
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setGoalInputOpen(category.name);
                            const inDisplay = prog.budget != null ? toDisplayAmount(prog.budget) : null;
                            setGoalInputValue(inDisplay != null ? String(parseFloat(inDisplay.toFixed(2))) : '');
                          }}
                        >
                          Budget: {formatAmount(prog.budget)}/mo
                        </span>
                      ) : (
                        <button
                          className="category-set-goal-btn"
                          title="Set a monthly budget for this category"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGoalInputOpen(category.name);
                            setGoalInputValue('');
                          }}
                        >
                          + Set Budget
                        </button>
                      )}
                    </div>
                    <div className="category-actions">
                      <div className="category-menu-wrapper">
                        <button
                          className="btn-kebab"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(openMenu === category.name ? null : category.name);
                          }}
                          aria-label="Category options"
                        >
                          <LuMoreVertical size={15} />
                        </button>
                        {openMenu === category.name && (
                          <div className="category-kebab-menu">
                            <button
                              className="category-menu-item"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setOpenMenu(null);
                                setEditName(category.name);
                                handleEditCategory({ ...category, isDefault: isDefaultCategory });
                              }}
                            >
                              <LuPencil size={13} />
                              Edit
                            </button>
                            <button
                              className="category-menu-item category-menu-item--danger"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setOpenMenu(null);
                                handleDeleteCategory(category.id, category.name, isDefaultCategory, expenses.filter(e => e.category === category.name).length);
                              }}
                            >
                              <LuTrash2 size={13} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {isExpandable && (
                    <span className="category-expand-hint" aria-hidden="true">
                      {isExpanded ? <LuChevronUp size={14} /> : <LuChevronDown size={14} />}
                    </span>
                  )}
                  <div className="category-progress">
                    <div className="progress-bar">
                      <div className={barClass} style={barStyle}></div>
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
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon"><CuteEmptyFace size={96} /></div>
            <h4>No categories available</h4>
            <p>Add custom categories to start organizing your expenses</p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              Add First Category
            </button>
          </div>
        )}
      </div>

      <div className="categories-list-section">
        <div className="section-subheader">
          <div>
            <h3>Charts &amp; Visualizations</h3>
            <p>Visual breakdown of your spending across categories</p>
          </div>
        </div>
        <div className="charts-section">
          <ChartCard title="Share of Spending" isEmpty={filteredExpenses.length === 0}>
            <PieChart data={categoryData} />
          </ChartCard>
          <ChartCard title="Monthly Trend by Category" isEmpty={filteredExpenses.length === 0}>
            {hasMultipleMonths
              ? <BarChart data={monthlyTrendData} />
              : <p className="chart-empty-hint">Select a wider date range to see monthly trends</p>
            }
          </ChartCard>
        </div>
      </div>

      <AddCategoryModal
        isOpen={isModalOpen}
        isLoading={isLoading}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddCategory}
      />

      {pendingEditCategory && (
        <Modal isOpen={true} onClose={() => setPendingEditCategory(null)} title="Edit Category">
          <form
            onSubmit={(e) => { e.preventDefault(); confirmEditCategory(editName); }}
            className="category-form"
          >
            <div className="form-group">
              <label htmlFor="editCategoryName">Category Name</label>
              <input
                id="editCategoryName"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter new name"
                maxLength={25}
                autoFocus
                required
              />
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => setPendingEditCategory(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary gradient-btn" disabled={isLoading}>
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!pendingDeleteCategory}
        title="Delete Category"
        message={pendingDeleteCategory ? (() => {
          const catExpenses = expenses.filter(e => e.category === pendingDeleteCategory.name);
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
                    {pendingDeleteCategory.isDefault
                      ? `${catExpenses.length} expense${catExpenses.length !== 1 ? 's' : ''} will become uncategorized:`
                      : `${catExpenses.length} expense${catExpenses.length !== 1 ? 's' : ''} will also be permanently deleted:`}
                  </p>
                  <ul className={`cd-expense-list${catExpenses.length > 10 ? ' cd-expense-list--scrollable' : ''}`}>
                    {catExpenses.map(e => (
                      <li key={e.id}>
                        <span className="cd-exp-title">{e.title}</span>
                        <span className="cd-exp-date">{e.date ? new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                        <span className="cd-exp-amount">{formatAmount(Number(e.amount))}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })() : ''}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setPendingDeleteCategory(null)}
        variant="danger"
      />
    </div>
  );
}
