import { useState, useEffect, useRef } from 'react';
import { LuChevronDown, LuCheck, LuTag } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { addExpense } from '../../services/expenseService';
import { subscribeToCategories } from '../../services/categoryService';
import { DEFAULT_CATEGORIES } from '../../utils/getCategoryIcon';
import '../../styles/main.css';

export default function ExpenseForm({
  onExpenseAdded,
  onExpenseEdited,
  onCancel,
  initialExpense = null,
  isEditMode = false
}) {
  // Form state management
  const [amount, setAmount] = useState(initialExpense ? initialExpense.amount : '');
  const [title, setTitle] = useState(initialExpense ? initialExpense.title : '');
  const [category, setCategory] = useState(initialExpense ? initialExpense.category : 'Food');
  const [date, setDate] = useState(initialExpense ? initialExpense.date : '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [amountError, setAmountError] = useState('');
  
  // Get current user from authentication context
  const { currentUser } = useAuth();

  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const catDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setCatDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // State for custom categories
  const [customCategories, setCustomCategories] = useState([]);

  // Fetch custom categories from Firestore via the service layer
  useEffect(() => {
    if (!currentUser) return;
    let unsubscribe = () => {};
    try {
      unsubscribe = subscribeToCategories(currentUser.uid, (cats) => {
        setCustomCategories(cats.map(cat => ({ ...cat, Icon: LuTag })));
      });
    } catch (error) {
      console.error("Error setting up categories listener:", error);
    }
    return () => {
      try { unsubscribe(); } catch (error) { console.error("Error during cleanup:", error); }
    };
  }, [currentUser]);

  // Merge default and custom categories, avoiding duplicates by name
  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories.filter(cat => !DEFAULT_CATEGORIES.some(def => def.name === cat.name))
  ];

  /**
   * Set default date to today only if not already set (for add mode)
   */
  useEffect(() => {
    if (!initialExpense) {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
    }
  }, [initialExpense]);

  // Update form fields if initialExpense changes (for edit mode)
  useEffect(() => {
    if (initialExpense) {
      setAmount(initialExpense.amount);
      setTitle(initialExpense.title);
      setCategory(initialExpense.category);
      setDate(initialExpense.date);
    }
  }, [initialExpense]);

  const modalButtonLabel = isEditMode ? 'Save Changes' : 'Add Expense';

  const resetForm = ({ preserveMessage = false } = {}) => {
    if (initialExpense) {
      setAmount(initialExpense.amount || '');
      setTitle(initialExpense.title || '');
      setCategory(initialExpense.category || 'Food');
      setDate(initialExpense.date || '');
    } else {
      setAmount('');
      setTitle('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
    }
    if (!preserveMessage) {
      setMessage('');
      setMessageType('');
    }
    setAmountError('');
  };

  /**
   * Validate form inputs before submission
   * 
   * Checks:
   * - Amount is a positive number
   * - Amount does not exceed $1 million
   * - Description is not empty
   * - Date is not in the future
   * - Category is selected
   * 
   * @returns {Object} Validation result with isValid boolean and error message
   */
  const validateForm = () => {
    // Check if amount is valid positive number
    const amountValue = parseFloat(amount);
    if (!amount || amountValue <= 0) {
      return { isValid: false, message: 'Please enter a valid amount' };
    }
    
    // Check if amount exceeds $1 million
    const MAX_AMOUNT = 1000000;
    if (amountValue > MAX_AMOUNT) {
      return { isValid: false, message: 'Amount cannot exceed $1,000,000' };
    }
    
    // Check if title is provided
    if (!title.trim()) {
      return { isValid: false, message: 'Please enter a title' };
    }
    
    // Check if date is selected
    if (!date) {
      return { isValid: false, message: 'Please select a date' };
    }
    
    // Check if date is not in the future (string compare is timezone-safe for yyyy-MM-dd)
    const todayStr = new Date().toISOString().split('T')[0];
    if (date > todayStr) {
      return { isValid: false, message: 'Date cannot be in the future' };
    }
    
    return { isValid: true, message: '' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous messages
    setMessage('');
    setMessageType('');
    setAmountError('');
    
    // Validate form inputs
    const validation = validateForm();
    if (!validation.isValid) {
      setMessage(validation.message);
      setMessageType('error');
      // If it's an amount error, also set the amount error state
      if (validation.message.includes('exceed')) {
        setAmountError(validation.message);
      }
      return;
    }
    
    try {
      // Set loading state to show spinner/disable form
      setLoading(true);
      
      if (isEditMode && initialExpense) {
        // Update existing expense and await external persistence to finish
        if (onExpenseEdited) await onExpenseEdited({
          id: initialExpense.id,
          amount: parseFloat(amount),
          title: title.trim(),
          category,
          date
        });
      } else {
      // Create expense object with all necessary data
      const expenseData = {
        amount: parseFloat(amount),
          title: title.trim(),
        category,
          date
      };
      // Save expense to Firebase database
        await addExpense(currentUser.uid, expenseData);
      // Show success message
      setMessage('Expense added successfully!');
      setMessageType('success');
      // Call callback to refresh expense list in parent component
      if (onExpenseAdded) {
        onExpenseAdded();
        }
      // Preserve success message after resetting inputs
      resetForm({ preserveMessage: true });
      }
      
    } catch (error) {
      // Display error message
      setMessage(`Failed to ${isEditMode ? 'save changes' : 'add expense'}: ${error.message}`);
      setMessageType('error');
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  const handleAmountChange = (value) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setAmount(cleanValue);
    
    // Validate amount in real-time
    const MAX_AMOUNT = 1000000;
    const amountValue = parseFloat(cleanValue);

    if (cleanValue && !isNaN(amountValue)) {
      if (amountValue > MAX_AMOUNT) {
        setAmountError('Amount cannot exceed $1,000,000');
      } else {
        setAmountError('');
      }
    } else {
      setAmountError('');
    }
  };

  const handleCancel = () => {
    /* istanbul ignore next */
    if (loading) return;
    resetForm();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <>
      {message && (
        <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="expense-form" noValidate>
        {/* Amount input field */}
        <div className="form-group">
          <label htmlFor="amount">Amount ($)</label>
          <input
            type="text"
            id="amount"
            name="amount"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="Amount (e.g. 0.00)"
            inputMode="decimal"
            required
            disabled={loading}
            autoComplete="off"
            className={amountError ? 'input-error' : ''}
          />
          {amountError && (
            <div className="field-error">
              {amountError}
            </div>
          )}
        </div>
        
        {/* Title input field (was Description) */}
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Expense title"
            required
            disabled={loading}
            autoComplete="off"
          />
        </div>
        
        {/* Category selection — custom dropdown so Lucide icons can render */}
        <div className="form-group">
          <label>Category</label>
          <div className="cat-dropdown" ref={catDropdownRef}>
            <button
              type="button"
              className="cat-dropdown-trigger"
              onClick={() => !loading && setCatDropdownOpen(o => !o)}
              disabled={loading}
            >
              {(() => {
                const sel = allCategories.find(c => c.name === category);
                const SelIcon = sel?.Icon || LuTag;
                return (
                  <>
                    <span className="cat-dropdown-icon"><SelIcon size={15} /></span>
                    <span>{category}</span>
                  </>
                );
              })()}
              <LuChevronDown size={14} className={`cat-dropdown-chevron${catDropdownOpen ? ' open' : ''}`} />
            </button>

            {catDropdownOpen && (
              <div className="cat-dropdown-menu">
                {allCategories.map((cat) => (
                  <button
                    key={cat.id || cat.name}
                    type="button"
                    className={`cat-dropdown-item${category === cat.name ? ' active' : ''}`}
                    onClick={() => { setCategory(cat.name); setCatDropdownOpen(false); }}
                  >
                    <span className="cat-dropdown-icon"><cat.Icon size={15} /></span>
                    <span>{cat.name}</span>
                    {category === cat.name && <LuCheck size={13} className="cat-dropdown-check" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Date picker */}
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        {/* Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
            {loading ? (isEditMode ? 'Saving...' : 'Adding Expense...') : modalButtonLabel}
        </button>
        </div>
      </form>
    </>
  );
} 