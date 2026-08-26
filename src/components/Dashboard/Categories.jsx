/* istanbul ignore file */
import { useState, useEffect, useMemo } from 'react';
import { LuTag, LuPlus, LuChevronDown, LuChevronUp } from 'react-icons/lu';
import CuteEmptyFace from '../UI/CuteEmptyFace';
import ExpenseTable from '../UI/ExpenseTable';
import { subscribeToCategories } from '../../services/categoryService';
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
import PieChart from '../Charts/PieChart';
import BarChart from '../Charts/BarChart';
import Modal from '../UI/Modal';
import Toast from '../UI/Toast';
import ConfirmDialog from '../UI/ConfirmDialog';
import DateFilterBar from '../UI/DateFilterBar';
import '../../styles/main.css';
import '../../styles/modal-forms.css';


// Controlled input that syncs when the Firestore value changes from outside,
// but only pushes to Firestore on blur or Enter so we don't spam writes.
function CategoryBudgetInput({ id, categoryName, initialValue, onSave }) {
  const [value, setValue] = useState(initialValue !== null && initialValue !== undefined ? String(initialValue) : '');

  useEffect(() => {
    setValue(initialValue !== null && initialValue !== undefined ? String(initialValue) : '');
  }, [initialValue]);

  const save = () => {
    const parsed = value === '' ? null : parseFloat(value);
    if (value !== '' && (Number.isNaN(parsed) || parsed < 0)) return;
    onSave(categoryName, parsed);
  };

  return (
    <input
      id={id}
      type="number"
      min="0"
      step="1"
      className="budget-input"
      placeholder="Set budget"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => e.key === 'Enter' && save()}
    />
  );
}

export default function Categories() {
  const { expenses } = useExpenses();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
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
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    let unsubscribeCategories = () => {};
    try {
      unsubscribeCategories = subscribeToCategories(currentUser.uid, (data) => {
        if (data !== null) setCategories(data);
      });
    } catch (error) {
      console.error('Error setting up category listener:', error);
    }
    return () => unsubscribeCategories();
  }, [currentUser]);

  const allCategories = useMemo(() => [
    ...DEFAULT_CATEGORIES,
    ...categories
      .filter(cat => cat && cat.name && cat.name !== 'undefined' && cat.name !== 'null')
      .map(cat => ({ ...cat, Icon: LuTag })),
  ], [categories]);

  const { categoryData, totalSpent } = useCategoryData(filteredExpenses, allCategories);
  const { budgets, setCategoryBudget, setMonthlyBudget } = useBudgets();
  const { categoryProgress, overallProgress } = useBudgetProgress(filteredExpenses, allCategories, budgets);

  // Local input state for monthly budget (controlled input, saved on blur/enter)
  const [monthlyInput, setMonthlyInput] = useState('');
  useEffect(() => {
    setMonthlyInput(budgets.monthly !== null && budgets.monthly !== undefined ? String(budgets.monthly) : '');
  }, [budgets.monthly]);

  const handleMonthlyBudgetSave = () => {
    const parsed = monthlyInput === '' ? null : parseFloat(monthlyInput);
    if (monthlyInput !== '' && (Number.isNaN(parsed) || parsed < 0)) return;
    setMonthlyBudget(parsed);
  };

  const catBudgetSum = Object.values(budgets.categories || {}).reduce((s, v) => s + (v || 0), 0);
  const showCapWarning = budgets.monthly > 0 && catBudgetSum > budgets.monthly;

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
    toast, setToast,
    pendingDeleteCategory, setPendingDeleteCategory,
    handleAddCategory,
    handleDeleteCategory,
    confirmDeleteCategory,
  } = useCategoryActions(currentUser, allCategories);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewCategory('');
  };

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
          isVisible={true}
          onClose={() => setToast(null)}
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
          <span className="stat-value">${totalSpent.toFixed(2)}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Active Categories</span>
          <span className="stat-value">
            {categoryData.datasets[0].data.filter(val => val > 0).length}
          </span>
        </div>
      </div>

      {/* Monthly budget cap input */}
      <div className="monthly-budget-row">
        <label htmlFor="monthly-budget">Monthly budget cap ($)</label>
        <input
          id="monthly-budget"
          type="number"
          min="0"
          step="1"
          className="budget-input"
          placeholder="e.g. 1500"
          value={monthlyInput}
          onChange={(e) => setMonthlyInput(e.target.value)}
          onBlur={handleMonthlyBudgetSave}
          onKeyDown={(e) => e.key === 'Enter' && handleMonthlyBudgetSave()}
        />
        {budgets.monthly > 0 && (
          <span className={`budget-remaining${overallProgress.status === 'ok' ? '' : ` budget-remaining--${overallProgress.status}`}`}>
            {overallProgress.remaining >= 0
              ? `$${overallProgress.remaining.toFixed(2)} left`
              : `$${Math.abs(overallProgress.remaining).toFixed(2)} over`}
          </span>
        )}
        {showCapWarning && (
          <span className="budget-cap-warning">⚠ Category budgets exceed monthly cap</span>
        )}
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

      {dateFilter !== 'thisMonth' && dateFilter !== 'pickedMonth' && (
        <p className="budget-filter-warning">
          ⚠ Budget targets are monthly — switch to &ldquo;This Month&rdquo; for accurate progress.
        </p>
      )}

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
                  key={category.id}
                  className={`category-card${isExpandable ? ' category-card--clickable' : ''}${isExpanded ? ' category-card--expanded' : ''}`}
                  onClick={isExpandable ? () => toggleCategory(category.name) : undefined}
                >
                  <div className="category-card-header">
                    <div className="category-icon-large" style={{ color: getCategoryColor(category.name), background: `${getCategoryColor(category.name)}26` }}>
                      <category.Icon size={22} />
                    </div>
                    <div className="category-info">
                      <h4>{category.name}</h4>
                      <p className="category-amount">${categoryAmount.toFixed(2)}</p>
                    </div>
                    <div className="category-actions">
                      {!isDefaultCategory && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id, category.name); }}
                          className="btn-delete"
                          disabled={isLoading}
                          title="Delete category"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      )}
                      {isExpandable && (
                        <span className="btn-expand" aria-hidden="true">
                          {isExpanded ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="category-progress">
                    <div className="progress-bar">
                      <div className={barClass} style={barStyle}></div>
                    </div>
                    {hasBudget ? (
                      <div className="budget-row">
                        <span className={`budget-remaining${prog.status === 'ok' ? '' : ` budget-remaining--${prog.status}`}`}>
                          {prog.remaining >= 0
                            ? `$${prog.remaining.toFixed(2)} left of $${prog.budget.toFixed(2)}`
                            : `$${Math.abs(prog.remaining).toFixed(2)} over budget`}
                        </span>
                        <span className="progress-text">{Math.min(prog.pct, 999).toFixed(0)}%</span>
                      </div>
                    ) : (
                      <span className="progress-text">{sharePercentage.toFixed(1)}% of total</span>
                    )}
                  </div>
                  {/* Budget input — stop click from toggling the card */}
                  <div className="budget-input-row" onClick={(e) => e.stopPropagation()}>
                    <label htmlFor={`budget-${category.name}`}>Budget $</label>
                    <CategoryBudgetInput
                      id={`budget-${category.name}`}
                      categoryName={category.name}
                      initialValue={budgets.categories?.[category.name] ?? null}
                      onSave={setCategoryBudget}
                    />
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New Category">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddCategory(newCategory, handleCloseModal);
          }}
          className="category-form"
        >
          <div className="form-group">
            <label htmlFor="categoryName">Category Name</label>
            <input
              id="categoryName"
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary gradient-btn" disabled={isLoading}>
              Add Category
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingDeleteCategory}
        title="Delete Category"
        message={pendingDeleteCategory ? <>Are you sure you want to delete <strong>"{pendingDeleteCategory.name}"</strong>? This cannot be undone.</> : ''}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setPendingDeleteCategory(null)}
        variant="danger"
      />
    </div>
  );
}
