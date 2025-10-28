import { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Toast from '../UI/Toast';
import '../../styles/main.css';
import '../../styles/modal-forms.css';

export default function Categories() {
  const [newCategory, setNewCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [toast, setToast] = useState(null);

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