import { useState, useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { LuTag } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { addExpense } from '../../services/expenseService';
import { useHiddenCategories } from '../../hooks/useHiddenCategories';
import { DEFAULT_CATEGORIES } from '../../utils/getCategoryIcon';
import { useCurrency } from '../../context/CurrencyContext';
import { suggestCategory } from '../../utils/categorySuggester';
import { validCategory } from '../../utils/categoryUtils';
import CategoryDropdown from '../UI/CategoryDropdown';
import '../../styles/main.css';
import '../../styles/modal-forms.css';

const MAX_AMOUNT = 1_000_000;

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
  const [notes, setNotes] = useState(initialExpense ? initialExpense.notes || '' : '');
  // Feature 8 — category suggestion state
  const [suggestion, setSuggestion] = useState(null);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  
  const { currentUser } = useAuth();
  const { homeSymbol } = useCurrency();

  // State for custom categories
  const rawCategories = useCategories();
  const customCategories = rawCategories.map(cat => ({ ...cat, Icon: LuTag }));

  const hiddenDefaults = useHiddenCategories(currentUser);

  // Merge default and custom categories, excluding categories the user has hidden
  const allCategories = [
    ...DEFAULT_CATEGORIES.filter(cat => !hiddenDefaults.includes(cat.name)),
    ...customCategories.filter(cat => validCategory(cat.name) && !DEFAULT_CATEGORIES.some(def => def.name === cat.name)),
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
      setNotes(initialExpense.notes || '');
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
    setNotes(initialExpense ? initialExpense.notes || '' : '');
    setSuggestion(null);
    setSuggestionDismissed(false);
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
    if (amountValue > MAX_AMOUNT) {
      return { isValid: false, message: `Amount cannot exceed ${homeSymbol}1,000,000` };
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
          date,
          notes: notes.trim() || null,
        });
      } else {
      // Create expense object with all necessary data
      const expenseData = {
        amount: parseFloat(amount),
          title: title.trim(),
        category,
          date,
          ...(notes.trim() && { notes: notes.trim() }),
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
    const amountValue = parseFloat(cleanValue);

    if (cleanValue && !isNaN(amountValue)) {
      if (amountValue > MAX_AMOUNT) {
        setAmountError(`Amount cannot exceed ${homeSymbol}1,000,000`);
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
          <label htmlFor="amount">Amount ({homeSymbol})</label>
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
            onChange={(e) => {
              const val = e.target.value;
              setTitle(val);
              if (!suggestionDismissed) {
                setSuggestion(suggestCategory(val, allCategories));
              }
            }}
            placeholder="Expense title"
            required
            disabled={loading}
            autoComplete="off"
          />
        </div>
        
        <CategoryDropdown
          category={category}
          setCategory={setCategory}
          allCategories={allCategories}
          loading={loading}
          currentUser={currentUser}
          suggestion={suggestion}
          setSuggestion={setSuggestion}
          suggestionDismissed={suggestionDismissed}
          setSuggestionDismissed={setSuggestionDismissed}
        />

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
        
        {/* Feature 3 — optional notes field */}
        <div className="form-group">
          <label htmlFor="notes">
            Notes <span className="field-optional">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What was this for?"
            maxLength={200}
            rows={2}
            disabled={loading}
            className="notes-textarea"
          />
          <div className="char-counter">{notes.length}/200</div>
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