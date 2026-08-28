import { useState, useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { LuTag } from 'react-icons/lu';
import { todayString } from '../../utils/formatDate';
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
  const [amount, setAmount] = useState(initialExpense ? initialExpense.amount : '');
  const [title, setTitle] = useState(initialExpense ? initialExpense.title : '');
  const [category, setCategory] = useState(initialExpense ? initialExpense.category : 'Food');
  const [date, setDate] = useState(initialExpense ? initialExpense.date : '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [amountError, setAmountError] = useState('');
  const [notes, setNotes] = useState(initialExpense ? initialExpense.notes || '' : '');
  const [suggestion, setSuggestion] = useState(null);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  const { currentUser } = useAuth();
  const { homeSymbol } = useCurrency();

  const rawCategories = useCategories();
  const customCategories = rawCategories.map(cat => ({ ...cat, Icon: LuTag }));

  const hiddenDefaults = useHiddenCategories(currentUser);

  const allCategories = [
    ...DEFAULT_CATEGORIES.filter(cat => !hiddenDefaults.includes(cat.name)),
    ...customCategories.filter(cat => validCategory(cat.name) && !DEFAULT_CATEGORIES.some(def => def.name === cat.name)),
  ];

  useEffect(() => {
    if (!initialExpense) {
      setDate(todayString());
    }
  }, [initialExpense]);

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
      setDate(todayString());
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

  const validateForm = () => {
    const amountValue = parseFloat(amount);
    if (!amount || amountValue <= 0) {
      return { isValid: false, message: 'Please enter a valid amount' };
    }

    if (amountValue > MAX_AMOUNT) {
      return { isValid: false, message: `Amount cannot exceed ${homeSymbol}1,000,000` };
    }

    if (!title.trim()) {
      return { isValid: false, message: 'Please enter a title' };
    }
    if (title.trim().length > 100) {
      return { isValid: false, message: 'Title must be 100 characters or fewer' };
    }

    if (!date) {
      return { isValid: false, message: 'Please select a date' };
    }

    // String compare is safe for yyyy-MM-dd; use local date to avoid UTC-offset mismatch
    if (date > todayString()) {
      return { isValid: false, message: 'Date cannot be in the future' };
    }

    return { isValid: true, message: '' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setMessageType('');
    setAmountError('');

    const validation = validateForm();
    if (!validation.isValid) {
      setMessage(validation.message);
      setMessageType('error');
      if (validation.message.includes('exceed')) {
        setAmountError(validation.message);
      }
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && initialExpense) {
        if (onExpenseEdited) await onExpenseEdited({
          id: initialExpense.id,
          amount: parseFloat(amount),
          title: title.trim(),
          category,
          date,
          notes: notes.trim() || null,
        });
      } else {
        const expenseData = {
          amount: parseFloat(amount),
          title: title.trim(),
          category,
          date,
          ...(notes.trim() && { notes: notes.trim() }),
        };
        await addExpense(currentUser.uid, expenseData);
        setMessage('Expense added successfully!');
        setMessageType('success');
        if (onExpenseAdded) {
          onExpenseAdded();
        }
        resetForm({ preserveMessage: true });
      }

    } catch (error) {
      setMessage(`Failed to ${isEditMode ? 'save changes' : 'add expense'}: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');

    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return;
    }

    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setAmount(cleanValue);

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
            maxLength={100}
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
