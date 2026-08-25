import { useState, useRef, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { getExpenses, addExpense } from '../../services/database';
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

export default function AIChat() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  const sendMessage = useCallback(async (text) => {
    const trimmed = text?.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: trimmed, type: 'text' }]);
    setInput('');
    setLoading(true);

    try {
      const result = await processMessage(trimmed, expenses, customCategories);

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
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.message, type: 'text' },
        ]);
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
  }, [loading, expenses, customCategories]);

  const handleConfirmExpense = async (expenseData, idx) => {
    try {
      await addExpense(currentUser.uid, expenseData);
      setMessages((prev) =>
        prev.map((msg, i) => (i === idx ? { ...msg, confirmed: true } : msg))
      );
      // Refresh local expenses cache so subsequent AI queries are up to date
      const updated = await getExpenses(currentUser.uid);
      setExpenses(updated);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Failed to add expense: ${err.message}`, type: 'text', isError: true },
      ]);
    }
  };

  const handleDismissExpense = (idx) => {
    setMessages((prev) =>
      prev.map((msg, i) => (i === idx ? { ...msg, dismissed: true } : msg))
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Don't render if not logged in — hooks are all above this point
  if (!currentUser) return null;

  return (
    <div className="ai-chat-widget">
      {/* ── Chat Panel ── */}
      {isOpen && (
        <div className="ai-chat-panel">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <span className="ai-chat-avatar">🤖</span>
              <div>
                <h3>BudgetBuddy AI</h3>
                <span className="ai-chat-status">Powered by Gemini · Free</span>
              </div>
            </div>
            <button className="ai-chat-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="ai-chat-messages">
            {messages.length === 0 && (
              <div className="ai-chat-welcome">
                <p>
                  Hi! I can help you <strong>add expenses</strong> and answer <strong>questions about your spending</strong>.
                  Try one of these:
                </p>
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
                {msg.type === 'expense_confirm' && !msg.confirmed && !msg.dismissed ? (
                  <div className="ai-expense-confirm">
                    <p>{msg.content}</p>
                    <div className="ai-expense-card">
                      <div className="ai-expense-row">
                        <span>Title</span>
                        <strong>{msg.expenseData.title}</strong>
                      </div>
                      <div className="ai-expense-row">
                        <span>Amount</span>
                        <strong>${Number(msg.expenseData.amount).toFixed(2)}</strong>
                      </div>
                      <div className="ai-expense-row">
                        <span>Category</span>
                        <strong>{msg.expenseData.category}</strong>
                      </div>
                      <div className="ai-expense-row">
                        <span>Date</span>
                        <strong>{msg.expenseData.date}</strong>
                      </div>
                    </div>
                    <div className="ai-expense-actions">
                      <button
                        className="btn-confirm"
                        onClick={() => handleConfirmExpense(msg.expenseData, i)}
                      >
                        ✓ Add Expense
                      </button>
                      <button
                        className="btn-dismiss"
                        onClick={() => handleDismissExpense(i)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : msg.confirmed ? (
                  <div className="ai-expense-confirm">
                    <p>{msg.content}</p>
                    <div className="ai-expense-confirmed">✓ Expense added successfully!</div>
                  </div>
                ) : msg.dismissed ? (
                  <div className="ai-expense-confirm">
                    <p>{msg.content}</p>
                    <div className="ai-expense-dismissed">Cancelled</div>
                  </div>
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
              ➤
            </button>
          </div>
        </div>
      )}

      {/* ── Toggle Button ── */}
      <button
        className={`ai-chat-toggle${isOpen ? ' ai-chat-toggle--open' : ''}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
      >
        {isOpen ? '✕' : '🤖'}
      </button>
    </div>
  );
}
