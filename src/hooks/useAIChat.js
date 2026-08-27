import { useState, useRef, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { subscribeToExpenses, addExpense, deleteExpense, updateExpense } from '../services/expenseService';
import { addCategory, deleteCategory, updateCategory } from '../services/categoryService';
import { updateCategoryBudget, subscribeToBudgets } from '../services/budgetService';
import { processMessage } from '../services/aiService';
import { getDateRangeForPreset } from './useDateFilter';

const ACTION_TYPES = [
  'expense_confirm', 'multiple_expense_confirm', 'category_confirm',
  'delete_expense_confirm', 'edit_expense_confirm',
  'delete_category_confirm', 'edit_category_confirm',
  'set_budget_confirm', 'remove_budget_confirm',
];

// Maps AI intent names → message type + data key
const INTENT_MAP = {
  ADD_EXPENSE:           { type: 'expense_confirm',          dataKey: 'expenseData' },
  ADD_MULTIPLE_EXPENSES: { type: 'multiple_expense_confirm', dataKey: 'expensesData' },
  ADD_CATEGORY:    { type: 'category_confirm',        dataKey: 'categoryData' },
  DELETE_EXPENSE:  { type: 'delete_expense_confirm',  dataKey: 'deleteExpenseData' },
  EDIT_EXPENSE:    { type: 'edit_expense_confirm',    dataKey: 'editExpenseData' },
  DELETE_CATEGORY: { type: 'delete_category_confirm', dataKey: 'deleteCategoryData' },
  EDIT_CATEGORY:   { type: 'edit_category_confirm',   dataKey: 'editCategoryData' },
  SET_BUDGET:      { type: 'set_budget_confirm',      dataKey: 'budgetData' },
  REMOVE_BUDGET:   { type: 'remove_budget_confirm',   dataKey: 'budgetData' },
};

const ERROR_LABELS = {
  expense_confirm:          'add expense',
  multiple_expense_confirm: 'add expenses',
  category_confirm:        'add category',
  delete_expense_confirm:  'delete expense',
  edit_expense_confirm:    'update expense',
  delete_category_confirm: 'delete category',
  edit_category_confirm:   'rename category',
  set_budget_confirm:      'set budget goal',
  remove_budget_confirm:   'remove budget goal',
};

const getPendingReminder = (currentMessages, homeSymbol = '$') => {
  const pending = currentMessages.filter(
    (m) => ACTION_TYPES.includes(m.type) && !m.confirmed && !m.dismissed
  );
  if (!pending.length) return null;
  const labels = pending.map((m) => {
    if (m.type === 'expense_confirm')          return `add expense "${m.expenseData?.title}"`;
    if (m.type === 'multiple_expense_confirm') return `add ${m.expensesData?.length ?? 'multiple'} expenses`;
    if (m.type === 'category_confirm')        return `add category "${m.categoryData?.name}"`;
    if (m.type === 'delete_expense_confirm')  return `delete expense "${m.deleteExpenseData?.title}"`;
    if (m.type === 'edit_expense_confirm')    return `update expense "${m.editExpenseData?.title}"`;
    if (m.type === 'delete_category_confirm') return `delete category "${m.deleteCategoryData?.name}"`;
    if (m.type === 'edit_category_confirm')   return `rename category "${m.editCategoryData?.name}"`;
    if (m.type === 'set_budget_confirm')      return `set ${m.budgetData?.categoryName} budget to ${homeSymbol}${m.budgetData?.amount}`;
    if (m.type === 'remove_budget_confirm')   return `remove ${m.budgetData?.categoryName} budget goal`;
    return '';
  }).filter(Boolean);
  return `Just a reminder — you haven't confirmed: ${labels.join(', ')}. Scroll up to confirm or cancel.`;
};


export function useAIChat() {
  const { currentUser } = useAuth();
  const { homeCurrency, currency, CURRENCIES, liveRates } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [sessionDateRange, setSessionDateRange] = useState(null);
  const [budgets, setBudgets] = useState({ monthly: null, categories: {} });

  // Ref so sendMessage can read current messages without stale closure
  const messagesRef = useRef([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Ref so callbacks always have fresh currency info without adding it to all deps
  const currencyInfoRef = useRef({});
  const homeSymbol = CURRENCIES?.find(c => c.code === homeCurrency)?.symbol ?? '$';
  const displaySymbol = CURRENCIES?.find(c => c.code === currency)?.symbol ?? '$';
  currencyInfoRef.current = { homeCurrency, homeSymbol, displayCurrency: currency, displaySymbol, liveRates };

  // Persist chat across page navigations within the same tab
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('ai-chat-messages');
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem('ai-chat-messages', JSON.stringify(messages)); }
    catch {}
  }, [messages]);

  // Live-subscribe to expenses, categories, and budgets when chat opens
  useEffect(() => {
    if (!isOpen || !currentUser) return;
    let unsubExpenses = () => {};
    try {
      unsubExpenses = subscribeToExpenses(currentUser.uid, setExpenses);
    } catch {}
    const q = query(collection(db, 'users', currentUser.uid, 'categories'));
    const unsubCats = onSnapshot(q, (snap) =>
      setCustomCategories(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    let unsubBudgets = () => {};
    try {
      unsubBudgets = subscribeToBudgets(currentUser.uid, setBudgets);
    } catch {}
    return () => { unsubExpenses(); unsubCats(); unsubBudgets(); };
  }, [isOpen, currentUser]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text?.trim();
    if (!trimmed || loading) return;

    const hadPendingBefore = messagesRef.current.some(
      (m) => ACTION_TYPES.includes(m.type) && !m.confirmed && !m.dismissed
    );

    setMessages((prev) => [...prev, { role: 'user', content: trimmed, type: 'text' }]);
    setInput('');
    setLoading(true);

    try {
      const result = await processMessage(trimmed, expenses, customCategories, sessionDateRange, budgets, currencyInfoRef.current);

      const mapped = INTENT_MAP[result.intent];
      if (mapped && result[mapped.dataKey]) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.message, type: mapped.type,
            [mapped.dataKey]: result[mapped.dataKey], confirmed: false, dismissed: false },
        ]);
      } else if (result.intent === 'SET_DATE_RANGE' && result.dateRange) {
        setSessionDateRange(result.dateRange);
        setMessages((prev) => [...prev, { role: 'assistant', content: result.message, type: 'text' }]);
      } else if (result.intent === 'ASK_DATE_RANGE') {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.message, type: 'date_range_picker',
            resolved: false, originalQuestion: trimmed },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: result.message, type: 'text' }]);
      }

      if (hadPendingBefore) {
        const _homeSymbol = currencyInfoRef.current.homeSymbol;
        setMessages((prev) => {
          const reminder = getPendingReminder(prev, _homeSymbol);
          return reminder ? [...prev, { role: 'assistant', content: reminder, type: 'reminder' }] : prev;
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, something went wrong: ${err.message}`, type: 'text', isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, expenses, customCategories, sessionDateRange, budgets]);

  const handleDismiss = useCallback((idx) => {
    setMessages((prev) => prev.map((msg, i) => (i === idx ? { ...msg, dismissed: true } : msg)));
  }, []);

  const handleConfirmAction = useCallback(async (msg, idx) => {
    const { type } = msg;
    try {
      if (type === 'expense_confirm')              await addExpense(currentUser.uid, msg.expenseData);
      else if (type === 'multiple_expense_confirm') {
        const results = await Promise.allSettled(msg.expensesData.map(e => addExpense(currentUser.uid, e)));
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length === results.length) {
          throw new Error(failed[0]?.reason?.message ?? 'Failed to add expenses');
        }
        if (failed.length > 0) {
          // Partial failure: mark confirmed immediately to prevent duplicate retries
          setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, confirmed: true } : m)));
          setMessages((prev) => [...prev, {
            role: 'assistant',
            content: `${results.length - failed.length} of ${results.length} expenses saved. ${failed.length} could not be added.`,
            type: 'text',
            isError: true,
          }]);
          return;
        }
        // all succeeded — falls through to mark confirmed below
      }
      else if (type === 'category_confirm')        await addCategory(currentUser.uid, { name: msg.categoryData.name });
      else if (type === 'delete_expense_confirm')  await deleteExpense(currentUser.uid, msg.deleteExpenseData.id);
      else if (type === 'edit_expense_confirm')    await updateExpense(currentUser.uid, msg.editExpenseData.id, msg.editExpenseData.updates);
      else if (type === 'delete_category_confirm') await deleteCategory(currentUser.uid, msg.deleteCategoryData.id);
      else if (type === 'edit_category_confirm')   await updateCategory(currentUser.uid, msg.editCategoryData.id, { name: msg.editCategoryData.newName });
      else if (type === 'set_budget_confirm')      await updateCategoryBudget(currentUser.uid, msg.budgetData.categoryName, msg.budgetData.amount);
      else if (type === 'remove_budget_confirm')   await updateCategoryBudget(currentUser.uid, msg.budgetData.categoryName, null);

      setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, confirmed: true } : m)));
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Failed to ${ERROR_LABELS[type]}: ${err.message}`, type: 'text', isError: true },
      ]);
    }
  }, [currentUser]);

  const handlePickDateRange = useCallback(async (idx, presetLabel, originalQuestion) => {
    const range = getDateRangeForPreset(presetLabel);
    if (!range) return;

    setSessionDateRange(range);
    setMessages((prev) => prev.map((msg, i) => (i === idx ? { ...msg, resolved: true } : msg)));

    if (!originalQuestion) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Got it! Using ${range.label} for your questions.`, type: 'text' },
      ]);
      return;
    }

    setLoading(true);
    try {
      const result = await processMessage(originalQuestion, expenses, customCategories, range, budgets, currencyInfoRef.current);
      setMessages((prev) => [...prev, { role: 'assistant', content: result.message, type: 'text' }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, something went wrong: ${err.message}`, type: 'text', isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, [expenses, customCategories, budgets]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }, [sendMessage, input]);

  return {
    isOpen, setIsOpen,
    messages,
    input, setInput,
    loading,
    sessionDateRange, setSessionDateRange,
    sendMessage,
    handleDismiss,
    handleConfirmAction,
    handlePickDateRange,
    handleKeyDown,
  };
}
