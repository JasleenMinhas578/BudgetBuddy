import { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
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

  const toggleMenu = (categoryId) => {
    setMenuOpen(menuOpen === categoryId ? null : categoryId);
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