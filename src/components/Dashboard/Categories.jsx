/* istanbul ignore file */
import { useState, useEffect } from 'react';
import { LuTag, LuPlus, LuBarChart2, LuChevronDown, LuChevronUp } from 'react-icons/lu';
import CuteEmptyFace from '../UI/CuteEmptyFace';
import ExpenseTable from '../UI/ExpenseTable';
import { addCategory, deleteCategory, subscribeToExpenses, subscribeToCategories } from '../../services/database';
import { CATEGORY_ICON_MAP } from '../../utils/getCategoryIcon';
import { getCategoryColor } from '../../utils/getCategoryColor';
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

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const dateRangeCtx = useDateRangeContext();
  const { filteredExpenses, dateFilter, setDateFilter, customDateRange, setCustomDateRange, pickedMonth, setPickedMonth, availableMonths } = useDateFilter(expenses, 'thisMonth', dateRangeCtx);
  const [newCategory, setNewCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const { currentUser } = useAuth();

  const toggleCategory = (name) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

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

    let unsubscribeExpenses = () => {};
    let unsubscribeCategories = () => {};

    try {
      unsubscribeExpenses = subscribeToExpenses(currentUser.uid, (expensesData) => {
        if (expensesData !== null) setExpenses(expensesData);
      });

      unsubscribeCategories = subscribeToCategories(currentUser.uid, (categoriesData) => {
        if (categoriesData !== null) setCategories(categoriesData);
      });
    } catch (error) {
      console.error("Error setting up listeners:", error);
      setToast({
        message: 'Error loading data. Please refresh the page.',
        type: 'error'
      });
    }

    return () => {
      unsubscribeExpenses();
      unsubscribeCategories();
    };
  }, [currentUser]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset form when closing modal
    setNewCategory('');
  };


  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!currentUser) { setToast({ message: 'Please log in to add categories.', type: 'error' }); return; }
    const categoryName = newCategory.trim();
    if (!categoryName) return;

    const existingNames = allCategories.map(c => c.name.toLowerCase());
    if (existingNames.includes(categoryName.toLowerCase())) {
      setToast({ message: `Category "${categoryName}" already exists.`, type: 'error' });
      return;
    }

    setIsModalOpen(false);
    setNewCategory('');
    setIsLoading(true);
    try {
      await addCategory(currentUser.uid, { name: categoryName });
      setToast({ message: `Category "${categoryName}" added successfully!`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to add category. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = (categoryId, categoryName) => {
    if (!currentUser) {
      setToast({ message: 'Please log in to delete categories.', type: 'error' });
      return;
    }
    setPendingDeleteCategory({ id: categoryId, name: categoryName });
  };

  const confirmDeleteCategory = async () => {
    if (!pendingDeleteCategory) return;
    const { id, name } = pendingDeleteCategory;
    setPendingDeleteCategory(null);
    setIsLoading(true);
    try {
      await deleteCategory(currentUser.uid, id);
      setToast({ message: `Category "${name}" deleted successfully!`, type: 'success' });
    } catch (error) {
      console.error('Error deleting category:', error);
      setToast({ message: 'Failed to delete category. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Default categories that are always available
  const defaultCategories = [
    { id: 'food',          name: 'Food',          Icon: CATEGORY_ICON_MAP['Food']          },
    { id: 'transport',     name: 'Transport',     Icon: CATEGORY_ICON_MAP['Transport']     },
    { id: 'entertainment', name: 'Entertainment', Icon: CATEGORY_ICON_MAP['Entertainment'] },
    { id: 'utilities',     name: 'Utilities',     Icon: CATEGORY_ICON_MAP['Utilities']     },
    { id: 'rent',          name: 'Rent',          Icon: CATEGORY_ICON_MAP['Rent']          },
    { id: 'other',         name: 'Other',         Icon: CATEGORY_ICON_MAP['Other']         },
  ];

  // Combine default and custom categories
  const allCategories = [
    ...defaultCategories,
    ...categories
      .filter(cat => cat && cat.name && cat.name !== 'undefined' && cat.name !== 'null')
      .map(cat => ({ ...cat, Icon: LuTag })),
  ];

  // Prepare data for charts
  const getCategoryData = () => {
    const categoryMap = {};
    
    // Initialize all categories (default + custom) with 0
    allCategories.forEach(cat => {
      if (cat.name && cat.name !== 'undefined' && cat.name !== 'null') {
        categoryMap[cat.name] = 0;
      }
    });
    
    // Sum expenses by category. If a category was deleted its key won't be in
    // categoryMap, so we add it on the fly — otherwise those expenses silently
    // vanish from totals while still showing on the Expenses page.
    filteredExpenses.forEach(expense => {
      if (expense &&
          expense.category &&
          expense.category !== 'undefined' &&
          expense.category !== 'null' &&
          typeof expense.category === 'string' &&
          expense.category.trim() !== '') {
        if (!categoryMap.hasOwnProperty(expense.category)) {
          categoryMap[expense.category] = 0;
        }
        categoryMap[expense.category] += (expense.amount || 0);
      }
    });
    
    // Filter out categories with zero values and undefined/null keys
    const filteredLabels = [];
    const filteredData = [];
    const filteredColors = [];
    
    Object.entries(categoryMap).forEach(([label, value], index) => {
      if (value > 0 && 
          label && 
          label !== 'undefined' && 
          label !== 'null' && 
          typeof label === 'string' &&
          label.trim() !== '') {
        filteredLabels.push(label);
        filteredData.push(value);
        filteredColors.push(getCategoryColor(label));
      }
    });
    
    return {
      labels: filteredLabels,
      datasets: [{
        label: 'Spending',
        data: filteredData,
        backgroundColor: filteredColors
      }]
    };
  };

  const categoryData = getCategoryData();
  const totalSpent = categoryData.datasets[0].data.reduce((sum, val) => sum + val, 0);

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
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="section-header">
        <div className="header-content">
        <h2>Categories</h2>
          <p className="section-subtitle">Analyze your spending by category</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <LuPlus size={16} />
          Add Category
        </button>
      </div>
      
      {/* Summary Stats */}
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

      {/* Date Filter Bar */}
      <div className="filter-controls">
        <div className="filter-section">
          <h3>Date Range</h3>
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

      {/* Categories List */}
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
              const percentage = totalSpent > 0 ? (categoryAmount / totalSpent) * 100 : 0;
              const isDefaultCategory = defaultCategories.some(dc => dc.name === category.name);
              
              const isExpanded = expandedCategories.has(category.name);
              const categoryExpenses = filteredExpenses.filter(e => e.category === category.name);
              const isExpandable = categoryExpenses.length > 0;

              return (
                <div
                  key={category.id}
                  className={`category-card${isExpandable ? ' category-card--clickable' : ''}${isExpanded ? ' category-card--expanded' : ''}`}
                  onClick={isExpandable ? () => toggleCategory(category.name) : undefined}
                >
                  <div className="category-card-header">
                    <div className="category-icon-large" style={{ color: getCategoryColor(category.name) }}>
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
                      <div
                        className="progress-fill"
                        style={{ width: `${percentage}%`, backgroundColor: getCategoryColor(category.name) }}
                      ></div>
                    </div>
                    <span className="progress-text">{percentage.toFixed(1)}%</span>
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

      {/* Charts Section */}
      <div className="categories-list-section">
        <div className="section-subheader">
          <div>
            <h3>Charts &amp; Visualizations</h3>
            <p>Visual breakdown of your spending across categories</p>
          </div>
        </div>
        <div className="charts-section">
          <div className="chart-container">
            <div className="chart-card">
              <h3>Share of Spending</h3>
              <div className="chart-wrapper">
                <PieChart data={categoryData} />
              </div>
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-card">
              <h3>Amount per Category</h3>
              <div className="chart-wrapper">
                <BarChart data={categoryData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Category</h2>
        </div>
        <form onSubmit={handleAddCategory} className="category-form">
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
            <button 
              type="button" 
              onClick={handleCloseModal} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary gradient-btn"
              disabled={isLoading}
            >
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