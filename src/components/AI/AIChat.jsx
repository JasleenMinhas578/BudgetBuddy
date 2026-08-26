import { useState, useRef, useEffect, useCallback } from 'react';
import { LuBot, LuWallet, LuX, LuCheck, LuSend } from 'react-icons/lu';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { getExpenses, addExpense, addCategory, deleteExpense, updateExpense, deleteCategory, updateCategory } from '../../services/database';
import { processMessage } from '../../services/aiService';
import './AIChat.css';

const SUGGESTED_QUESTIONS = [
  "What's my total spending this month?",
  "Which category do I spend most on?",
  "What's my highest expense this month?",
  "How much did I spend on food?",
  "What's my average daily spending?",
  "Add $25 for coffee today",
];

const DATE_PRESETS = ['Today', 'This Week', 'This Month', 'Last Month', 'This Year', 'All Time'];

const buildPresetRange = (label) => {
  const today = new Date();
  const fmt = (d) => d.toISOString().split('T')[0];
  switch (label) {
    case 'Today':
      return { label: 'today', from: fmt(today), to: fmt(today) };
    case 'This Week': {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      return { label: 'this week', from: fmt(start), to: fmt(today) };
    }
    case 'This Month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { label: 'this month', from: fmt(start), to: fmt(today) };
    }
    case 'Last Month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { label: 'last month', from: fmt(start), to: fmt(end) };
    }
    case 'This Year':
      return { label: 'this year', from: `${today.getFullYear()}-01-01`, to: fmt(today) };
    case 'All Time':
      return { label: 'all time', from: '2000-01-01', to: fmt(today) };
    default:
      return null;
  }
};

const ACTION_TYPES = ['expense_confirm', 'category_confirm', 'delete_expense_confirm', 'edit_expense_confirm', 'delete_category_confirm', 'edit_category_confirm'];

const getPendingReminder = (currentMessages) => {
  const pending = currentMessages.filter(m => ACTION_TYPES.includes(m.type) && !m.confirmed && !m.dismissed);
  if (!pending.length) return null;
  const labels = pending.map(m => {
    if (m.type === 'expense_confirm')        return `add expense "${m.expenseData?.title}"`;
    if (m.type === 'category_confirm')       return `add category "${m.categoryData?.name}"`;
    if (m.type === 'delete_expense_confirm') return `delete expense "${m.deleteExpenseData?.title}"`;
    if (m.type === 'edit_expense_confirm')   return `update expense "${m.editExpenseData?.title}"`;
    if (m.type === 'delete_category_confirm') return `delete category "${m.deleteCategoryData?.name}"`;
    if (m.type === 'edit_category_confirm')  return `rename category "${m.editCategoryData?.name}"`;
    return '';
  }).filter(Boolean);
  return `Just a reminder — you haven't confirmed: ${labels.join(', ')}. Scroll up to confirm or cancel.`;
};

export default function AIChat() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [sessionDateRange, setSessionDateRange] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const widgetRef = useRef(null);
  const messagesRef = useRef([]);

  // Keep ref in sync so sendMessage can read current messages without stale closure
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Restore messages from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('ai-chat-messages');
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);

  // Persist messages to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem('ai-chat-messages', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Fetch expenses + subscribe to custom categories when chat opens
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    getExpenses(currentUser.uid)
      .then(setExpenses)
      .catch(console.error);

    const q = query(collection(db, 'users', currentUser.uid, 'categories'));
    const unsub = onSnapshot(q, (snap) => {
      const cats = [];
      snap.forEach((doc) => cats.push({ id: doc.id, ...doc.data() }));
      setCustomCategories(cats);
    });
    return unsub;
  }, [isOpen, currentUser]);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // Close on outside click only when no conversation has started
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (messages.length === 0 && widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, messages.length]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text?.trim();
    if (!trimmed || loading) return;

    // Snapshot pending state BEFORE this message so we only remind about pre-existing unconfirmed cards
    const hadPendingBefore = messagesRef.current.some(
      m => ACTION_TYPES.includes(m.type) && !m.confirmed && !m.dismissed
    );

    setMessages((prev) => [...prev, { role: 'user', content: trimmed, type: 'text' }]);
    setInput('');
    setLoading(true);

    try {
      const result = await processMessage(trimmed, expenses, customCategories, sessionDateRange);

      if (result.intent === 'ADD_EXPENSE' && result.expenseData) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: result.message,
            type: 'expense_confirm',
            expenseData: result.expenseData,
            confirmed: false,
            dismissed: false,
          },
        ]);
      } else if (result.intent === 'ADD_CATEGORY' && result.categoryData) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: result.message,
            type: 'category_confirm',
            categoryData: result.categoryData,
            confirmed: false,
            dismissed: false,
          },
        ]);
      } else if (result.intent === 'DELETE_EXPENSE' && result.deleteExpenseData) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: result.message,
            type: 'delete_expense_confirm',
            deleteExpenseData: result.deleteExpenseData,
            confirmed: false,
            dismissed: false,
          },
        ]);
      } else if (result.intent === 'EDIT_EXPENSE' && result.editExpenseData) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: result.message,
            type: 'edit_expense_confirm',
            editExpenseData: result.editExpenseData,
            confirmed: false,
            dismissed: false,
          },
        ]);
      } else if (result.intent === 'DELETE_CATEGORY' && result.deleteCategoryData) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: result.message,
            type: 'delete_category_confirm',
            deleteCategoryData: result.deleteCategoryData,
            confirmed: false,
            dismissed: false,
          },
        ]);
      } else if (result.intent === 'EDIT_CATEGORY' && result.editCategoryData) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: result.message,
            type: 'edit_category_confirm',
            editCategoryData: result.editCategoryData,
            confirmed: false,
            dismissed: false,
          },
        ]);
      } else if (result.intent === 'SET_DATE_RANGE' && result.dateRange) {
        setSessionDateRange(result.dateRange);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.message, type: 'text' },
        ]);
      } else if (result.intent === 'ASK_DATE_RANGE') {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.message, type: 'date_range_picker', resolved: false, originalQuestion: trimmed },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.message, type: 'text' },
        ]);
      }

      // Only remind if there were ALREADY pending cards before this message
      if (hadPendingBefore) {
        setMessages((prev) => {
          const reminder = getPendingReminder(prev);
          if (!reminder) return prev;
          return [...prev, { role: 'assistant', content: reminder, type: 'reminder' }];
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, something went wrong: ${err.message}`,
          type: 'text',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, expenses, customCategories, sessionDateRange]);

  const handleDismiss = (idx) => {
    setMessages((prev) =>
      prev.map((msg, i) => (i === idx ? { ...msg, dismissed: true } : msg))
    );
  };

  const handleConfirmAction = async (msg, idx) => {
    const { type } = msg;
    const needsExpenseRefresh = ['expense_confirm', 'delete_expense_confirm', 'edit_expense_confirm'];
    const errorLabels = {
      expense_confirm:         'add expense',
      category_confirm:        'add category',
      delete_expense_confirm:  'delete expense',
      edit_expense_confirm:    'update expense',
      delete_category_confirm: 'delete category',
      edit_category_confirm:   'rename category',
    };
    try {
      if (type === 'expense_confirm')         await addExpense(currentUser.uid, msg.expenseData);
      else if (type === 'category_confirm')   await addCategory(currentUser.uid, { name: msg.categoryData.name });
      else if (type === 'delete_expense_confirm') await deleteExpense(currentUser.uid, msg.deleteExpenseData.id);
      else if (type === 'edit_expense_confirm')   await updateExpense(currentUser.uid, msg.editExpenseData.id, msg.editExpenseData.updates);
      else if (type === 'delete_category_confirm') await deleteCategory(currentUser.uid, msg.deleteCategoryData.id);
      else if (type === 'edit_category_confirm')   await updateCategory(currentUser.uid, msg.editCategoryData.id, { name: msg.editCategoryData.newName });

      setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, confirmed: true } : m)));
      if (needsExpenseRefresh.includes(type)) setExpenses(await getExpenses(currentUser.uid));
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Failed to ${errorLabels[type]}: ${err.message}`, type: 'text', isError: true },
      ]);
    }
  };

  const handlePickDateRange = useCallback(async (idx, presetLabel, originalQuestion) => {
    const range = buildPresetRange(presetLabel);
    if (!range) return;

    setSessionDateRange(range);
    setMessages((prev) =>
      prev.map((msg, i) => (i === idx ? { ...msg, resolved: true } : msg))
    );

    if (!originalQuestion) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Got it! Using ${range.label} for your questions.`, type: 'text' },
      ]);
      return;
    }

    setLoading(true);
    try {
      const result = await processMessage(originalQuestion, expenses, customCategories, range);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.message, type: 'text' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, something went wrong: ${err.message}`, type: 'text', isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, [expenses, customCategories]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Don't render if not logged in — hooks are all above this point
  if (!currentUser) return null;

  return (
    <div className="ai-chat-widget" ref={widgetRef}>
      {/* ── Chat Panel ── */}
      {isOpen && (
        <div className="ai-chat-panel">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <span className="ai-chat-avatar"><LuBot size={28} /></span>
              <div>
                <h3>BudgetBuddy AI</h3>
                {sessionDateRange ? (
                  <span className="ai-chat-status">
                    Showing: <strong>{sessionDateRange.label}</strong>
                    <button
                      className="ai-date-range-clear"
                      onClick={() => setSessionDateRange(null)}
                      title="Clear date range"
                    >
                      ×
                    </button>
                  </span>
                ) : (
                  <span className="ai-chat-status">Powered by Gemini · Free</span>
                )}
              </div>
            </div>
            <button className="ai-chat-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <LuX size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Messages */}
          <div className="ai-chat-messages">
            {messages.length === 0 && (
              <div className="ai-chat-welcome">
                <div className="ai-chat-welcome-header">
                  <span className="ai-chat-welcome-emoji"><LuWallet size={24} /></span>
                  <div className="ai-chat-welcome-text">
                    <h4>Hey! I'm your budget assistant.</h4>
                    <p>Add expenses in plain English or ask questions about your spending — I'll look up your real data.</p>
                  </div>
                </div>
                <p className="ai-suggestions-label">Try asking</p>
                <div className="ai-chat-suggestions">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      className="ai-suggestion-chip"
                      onClick={() => sendMessage(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`ai-message ai-message--${msg.role}${msg.isError ? ' ai-error-message' : ''}`}
              >
                {msg.type === 'date_range_picker' ? (
                  <div className="ai-date-range-picker">
                    <p>{msg.content}</p>
                    {!msg.resolved && (
                      <>
                        <div className="ai-date-preset-grid">
                          {DATE_PRESETS.map((label) => (
                            <button
                              key={label}
                              className="ai-date-preset-btn"
                              onClick={() => handlePickDateRange(i, label, msg.originalQuestion)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <p className="ai-date-custom-hint">Or type a custom range below (e.g. "January 2026", "past 3 weeks")</p>
                      </>
                    )}
                  </div>
                ) : msg.type === 'category_confirm' && !msg.confirmed && !msg.dismissed ? (
                  <div className="ai-expense-confirm">
                    <p>{msg.content}</p>
                    <div className="ai-expense-card">
                      <div className="ai-expense-row">
                        <span>Category</span>
                        <strong>{msg.categoryData.name}</strong>
                      </div>
                    </div>
                    <div className="ai-expense-actions">
                      <button className="btn-confirm" onClick={() => handleConfirmAction(msg, i)}>
                        <LuCheck size={14} /> Add Category
                      </button>
                      <button className="btn-dismiss" onClick={() => handleDismiss(i)}>Cancel</button>
                    </div>
                  </div>
                ) : msg.type === 'delete_expense_confirm' && !msg.confirmed && !msg.dismissed ? (
                  <div className="ai-expense-confirm">
                    <p>{msg.content}</p>
                    <div className="ai-expense-card">
                      <div className="ai-expense-row"><span>Title</span><strong>{msg.deleteExpenseData.title}</strong></div>
                      <div className="ai-expense-row"><span>Amount</span><strong>${Number(msg.deleteExpenseData.amount).toFixed(2)}</strong></div>
                      <div className="ai-expense-row"><span>Category</span><strong>{msg.deleteExpenseData.category}</strong></div>
                      <div className="ai-expense-row"><span>Date</span><strong>{msg.deleteExpenseData.date}</strong></div>
                    </div>
                    <div className="ai-expense-actions">
                      <button className="btn-confirm btn-danger" onClick={() => handleConfirmAction(msg, i)}>Delete Expense</button>
                      <button className="btn-dismiss" onClick={() => handleDismiss(i)}>Cancel</button>
                    </div>
                  </div>
                ) : msg.type === 'edit_expense_confirm' && !msg.confirmed && !msg.dismissed ? (
                  <div className="ai-expense-confirm">
                    <p>{msg.content}</p>
                    <div className="ai-expense-card">
                      <div className="ai-expense-row"><span>Title</span><strong>{msg.editExpenseData.updates.title ?? msg.editExpenseData.title}</strong></div>
                      <div className="ai-expense-row"><span>Amount</span><strong>${Number(msg.editExpenseData.updates.amount ?? msg.editExpenseData.amount).toFixed(2)}</strong></div>
                      <div className="ai-expense-row"><span>Category</span><strong>{msg.editExpenseData.updates.category ?? msg.editExpenseData.category}</strong></div>
                      <div className="ai-expense-row"><span>Date</span><strong>{msg.editExpenseData.updates.date ?? msg.editExpenseData.date}</strong></div>
                    </div>
                    <div className="ai-expense-actions">
                      <button className="btn-confirm" onClick={() => handleConfirmAction(msg, i)}><LuCheck size={14} /> Save Changes</button>
                      <button className="btn-dismiss" onClick={() => handleDismiss(i)}>Cancel</button>
                    </div>
                  </div>
                ) : msg.type === 'delete_category_confirm' && !msg.confirmed && !msg.dismissed ? (
                  <div className="ai-expense-confirm">
                    <p>{msg.content}</p>
                    <div className="ai-expense-card">
                      <div className="ai-expense-row"><span>Category</span><strong>{msg.deleteCategoryData.name}</strong></div>
                    </div>
                    <div className="ai-expense-actions">
                      <button className="btn-confirm btn-danger" onClick={() => handleConfirmAction(msg, i)}>Delete Category</button>
                      <button className="btn-dismiss" onClick={() => handleDismiss(i)}>Cancel</button>
                    </div>
                  </div>
                ) : msg.type === 'edit_category_confirm' && !msg.confirmed && !msg.dismissed ? (
                  <div className="ai-expense-confirm">
                    <p>{msg.content}</p>
                    <div className="ai-expense-card">
                      <div className="ai-expense-row"><span>Current Name</span><strong>{msg.editCategoryData.name}</strong></div>
                      <div className="ai-expense-row"><span>New Name</span><strong>{msg.editCategoryData.newName}</strong></div>
                    </div>
                    <div className="ai-expense-actions">
                      <button className="btn-confirm" onClick={() => handleConfirmAction(msg, i)}><LuCheck size={14} /> Rename</button>
                      <button className="btn-dismiss" onClick={() => handleDismiss(i)}>Cancel</button>
                    </div>
                  </div>
                ) : msg.type === 'expense_confirm' && !msg.confirmed && !msg.dismissed ? (
                  <div className="ai-expense-confirm">
                    <p>{msg.content}</p>
                    <div className="ai-expense-card">
                      <div className="ai-expense-row"><span>Title</span><strong>{msg.expenseData.title}</strong></div>
                      <div className="ai-expense-row"><span>Amount</span><strong>${Number(msg.expenseData.amount).toFixed(2)}</strong></div>
                      <div className="ai-expense-row"><span>Category</span><strong>{msg.expenseData.category}</strong></div>
                      <div className="ai-expense-row"><span>Date</span><strong>{msg.expenseData.date}</strong></div>
                    </div>
                    <div className="ai-expense-actions">
                      <button className="btn-confirm" onClick={() => handleConfirmAction(msg, i)}>
                        <LuCheck size={14} /> Add Expense
                      </button>
                      <button className="btn-dismiss" onClick={() => handleDismiss(i)}>Cancel</button>
                    </div>
                  </div>
                ) : msg.confirmed ? (
                  <div className="ai-expense-confirm">
                    <p>{msg.content}</p>
                    <div className="ai-expense-confirmed">
                      <LuCheck size={14} /> {
                        msg.type === 'category_confirm' ? 'Category added successfully!' :
                        msg.type === 'delete_expense_confirm' ? 'Expense deleted!' :
                        msg.type === 'edit_expense_confirm' ? 'Expense updated!' :
                        msg.type === 'delete_category_confirm' ? 'Category deleted!' :
                        msg.type === 'edit_category_confirm' ? 'Category renamed!' :
                        'Expense added successfully!'
                      }
                    </div>
                  </div>
                ) : msg.dismissed ? (
                  <div className="ai-expense-confirm">
                    <p>{msg.content}</p>
                    <div className="ai-expense-dismissed">Cancelled</div>
                  </div>
                ) : msg.type === 'reminder' ? (
                  <p className="ai-reminder">{msg.content}</p>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            ))}

            {loading && (
              <div className="ai-message ai-message--assistant">
                <div className="ai-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="ai-chat-input-area">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about spending or add an expense…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="ai-chat-send"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <LuSend size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* ── Toggle Button ── */}
      <button
        className={`ai-chat-toggle${isOpen ? ' ai-chat-toggle--open' : ''}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
        title={isOpen ? 'Close chat' : 'Open BudgetBuddy AI'}
      >
        <LuBot size={28} />
      </button>
    </div>
  );
}
