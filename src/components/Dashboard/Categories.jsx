import { useState, useEffect } from 'react';
import '../../styles/main.css';
import '../../styles/modal-forms.css';

export default function Categories() {
  const [newCategory, setNewCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);

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

  // Combine default and custom categories
  const allCategories = [
    ...defaultCategories,
    ...categories.map(cat => ({ ...cat, icon: '📊' }))
  ];

  // Prepare data for charts
  const getCategoryData = () => {
    const categoryMap = {};
    
    // Initialize all categories (default + custom) with 0
    allCategories.forEach(cat => {
      categoryMap[cat.name] = 0;
    });
    
    // Sum expenses by category
    expenses.forEach(expense => {
      if (categoryMap.hasOwnProperty(expense.category)) {
        categoryMap[expense.category] += expense.amount;
      }
    });
    
    return {
      labels: Object.keys(categoryMap),
      datasets: [{
        data: Object.values(categoryMap),
        backgroundColor: [
          '#4fd1c5', '#f687b3', '#f6ad55', '#68d391', '#63b3ed', '#b794f4',
          '#fc8181', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#fb7185'
        ]
      }]
    };
  };

  const categoryData = getCategoryData();

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