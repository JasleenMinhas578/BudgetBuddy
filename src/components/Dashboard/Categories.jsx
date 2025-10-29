import { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import PieChart from '../Charts/PieChart';
import BarChart from '../Charts/BarChart';
import Modal from '../UI/Modal';
import Toast from '../UI/Toast';
import '../../styles/main.css';
import '../../styles/modal-forms.css';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const { currentUser } = useAuth();
 

  useEffect(() => {
    if (!currentUser) return;
  
    let unsubscribeExpenses = () => {};
    let unsubscribeCategories = () => {};
  
    const setupListeners = async () => {
      try {
        // Expenses listener
        const qExpenses = query(
          collection(db, 'users', currentUser.uid, 'expenses')
        );
        
        unsubscribeExpenses = onSnapshot(qExpenses, (querySnapshot) => {
          const expensesData = [];
          querySnapshot.forEach((doc) => {
            expensesData.push({ id: doc.id, ...doc.data() });
          });
          
          const sortedExpenses = expensesData.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
            }
            if (a.date && b.date) {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
            return 0;
          });
          
          setExpenses(sortedExpenses);
        });
  
        // Categories listener
        const qCategories = query(
          collection(db, 'users', currentUser.uid, 'categories')
        );
        
        unsubscribeCategories = onSnapshot(qCategories, (querySnapshot) => {
          const categoriesData = [];
          querySnapshot.forEach((doc) => {
            categoriesData.push({ id: doc.id, ...doc.data() });
          });
          setCategories(categoriesData);
        });
  
      } catch (error) {
        console.error("Error setting up listeners:", error);
        setToast({
          message: 'Error loading data. Please refresh the page.',
          type: 'error'
        });
      }
    };
  
    setupListeners();
  
    return () => {
      // Cleanup function
      try {
        if (typeof unsubscribeExpenses === 'function') unsubscribeExpenses();
        if (typeof unsubscribeCategories === 'function') unsubscribeCategories();
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
    };
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.category-menu')) {
        setMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleCloseModal = () => {
    console.log('handleCloseModal called');
    setIsModalOpen(false);
    // Reset form when closing modal
    setNewCategory('');
  };


  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!db) { setToast({ message: 'Firebase not configured. Please set up your Firebase project.', type: 'error' }); return; }
    if (!currentUser) { setToast({ message: 'Please log in to add categories.', type: 'error' }); return; }
    const categoryName = newCategory;
    setIsModalOpen(false);
    setNewCategory('');
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'categories'), {
        name: categoryName,
        createdAt: new Date()
      });
      setToast({ message: `Category "${categoryName}" added successfully!`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to add category. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!db) { 
      setToast({ message: 'Firebase not configured. Please set up your Firebase project.', type: 'error' }); 
      return; 
    }
    if (!currentUser) { 
      setToast({ message: 'Please log in to delete categories.', type: 'error' }); 
      return; 
    }

    // Check if this is a default category
    const defaultCategories = [
      'food', 'transport', 'entertainment', 'utilities', 'rent', 'other'
    ];
    if (defaultCategories.includes(categoryId)) {
      setToast({ message: 'Cannot delete default categories.', type: 'error' });
      return;
    }

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'categories', categoryId));
      setToast({ message: `Category "${categoryName}" deleted successfully!`, type: 'success' });
    } catch (error) {
      console.error('Error deleting category:', error);
      setToast({ message: 'Failed to delete category. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Default categories that are always available
  const defaultCategories = [
    { id: 'food', name: 'Food', icon: '🍕' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'utilities', name: 'Utilities', icon: '💡' },
    { id: 'rent', name: 'Rent', icon: '🏠' },
    { id: 'other', name: 'Other', icon: '📦' }
  ];


  // Combine default and custom categories
  const allCategories = [
    ...defaultCategories,
    ...categories.filter(cat => cat && cat.name && cat.name !== 'undefined' && cat.name !== 'null')
      .map(cat => ({ ...cat, icon: '📊' }))
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
    
    // Sum expenses by category - filter out expenses with invalid categories
    expenses.forEach(expense => {
      if (expense && 
          expense.category && 
          expense.category !== 'undefined' && 
          expense.category !== 'null' && 
          typeof expense.category === 'string' &&
          expense.category.trim() !== '' &&
          categoryMap.hasOwnProperty(expense.category)) {
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
        filteredColors.push([
          '#4fd1c5', '#f687b3', '#f6ad55', '#68d391', '#63b3ed', '#b794f4',
          '#fc8181', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#fb7185'
        ][index % 12]);
      }
    });
    
    return {
      labels: filteredLabels,
      datasets: [{
        data: filteredData,
        backgroundColor: filteredColors
      }]
    };
  };

  const categoryData = getCategoryData();
  
  // Debug logging to help identify undefined values
  console.log('Category Data:', categoryData);
  console.log('Labels:', categoryData.labels);
  console.log('Data:', categoryData.datasets[0].data);
  
  const totalSpent = Object.values(categoryData.datasets[0].data).reduce((sum, val) => sum + val, 0);

  return (
    <div className="categories-container">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="section-header">
        <div className="header-content">
        <h2>Categories</h2>
          <p className="section-subtitle">Analyze your spending by category</p>
        </div>
        <button onClick={() => {
          console.log('Add Category button clicked');
          setIsModalOpen(true);
        }} className="btn btn-primary">
          <span>➕</span>
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
            {Object.values(categoryData.datasets[0].data).filter(val => val > 0).length}
          </span>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
        <div className="chart-card">
          <h3>Spending by Category</h3>
            <div className="chart-wrapper">
          <PieChart data={categoryData} />
            </div>
          </div>
        </div>
        
        <div className="chart-container">
        <div className="chart-card">
          <h3>Category Breakdown</h3>
            <div className="chart-wrapper">
          <BarChart data={categoryData} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories List */}
      <div className="categories-list-section">
        <div className="section-subheader">
          <h3>All Categories</h3>
          <p>Detailed breakdown of your spending by category (default and custom)</p>
        </div>
        
        {allCategories.length > 0 ? (
          <div className="categories-grid">
            {allCategories.map((category) => {
              const categoryAmount = categoryData.datasets[0].data[categoryData.labels.indexOf(category.name)] || 0;
              const percentage = totalSpent > 0 ? (categoryAmount / totalSpent) * 100 : 0;
              const isDefaultCategory = defaultCategories.some(dc => dc.name === category.name);
              
              return (
                <div key={category.id} className="category-card">
                  <div className="category-card-header">
                    <div className="category-icon-large">
                      <span>{category.icon}</span>
                    </div>
                    <div className="category-info">
                      <h4>{category.name}</h4>
                      <p className="category-amount">${categoryAmount.toFixed(2)}</p>
                    </div>
                    {!isDefaultCategory && (
                      <div className="category-actions">
                        <button
                          onClick={() => handleDeleteCategory(category.id, category.name)}
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
                      </div>
                    )}
                  </div>
                  <div className="category-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h4>No categories available</h4>
            <p>Add custom categories to start organizing your expenses</p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              Add First Category
            </button>
          </div>
        )}
      </div>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New Category">
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
    </div>
  );
}