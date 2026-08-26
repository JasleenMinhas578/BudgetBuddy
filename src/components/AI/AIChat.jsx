import { useRef, useEffect, useState } from 'react';
import { LuBot, LuWallet, LuX, LuSend, LuInfo } from 'react-icons/lu';
import { useAIChat } from '../../hooks/useAIChat';
import ChatMessage from './ChatMessage';
import './AIChat.css';

const SUGGESTED_GROUPS = [
  {
    label: 'Spending questions',
    questions: [
      "What's my total spending this month?",
      "Which category do I spend the most on?",
      "What's my average daily spending?",
      "How much did I spend last month?",
      "What are my top 3 expenses?",
      "What's my highest single expense?",
    ],
  },
  {
    label: 'Add expenses',
    questions: [
      "Add $25 for coffee today",
      "Log $50 for groceries",
      "Spent $80 on transport this week",
    ],
  },
  {
    label: 'Goals & budgets',
    questions: [
      "Set my food budget to $400",
      "Am I over budget anywhere?",
      "How much of my food budget is left?",
      "What's my total monthly budget?",
      "Remove my entertainment goal",
      "Update my rent goal to $1500",
    ],
  },
];

export default function AIChat() {
  const {
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
  } = useAIChat();

  const [showCapabilities, setShowCapabilities] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const widgetRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // Close on outside click only when conversation hasn't started
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (messages.length === 0 && widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, messages.length, setIsOpen]);

  return (
    <div className="ai-chat-widget" ref={widgetRef}>
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
                    >×</button>
                  </span>
                ) : (
                  <span className="ai-chat-status">Powered by Gemini · Free</span>
                )}
              </div>
            </div>
            <div className="ai-chat-header-actions">
              <button
                className={`ai-chat-info-btn${showCapabilities ? ' active' : ''}`}
                onClick={() => setShowCapabilities((v) => !v)}
                aria-label="What can I ask?"
                title="What can I ask?"
              >
                <LuInfo size={16} />
              </button>
              <button className="ai-chat-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
                <LuX size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Capabilities panel — slides down from header */}
          {showCapabilities && (
            <div className="ai-capabilities-panel">
              <p className="ai-capabilities-title">Things you can ask me</p>
              {SUGGESTED_GROUPS.map((group) => (
                <div key={group.label} className="ai-capabilities-group">
                  <span className="ai-capabilities-group-label">{group.label}</span>
                  <div className="ai-capabilities-chips">
                    {group.questions.map((q) => (
                      <button
                        key={q}
                        className="ai-suggestion-chip"
                        onClick={() => { sendMessage(q); setShowCapabilities(false); }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

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
                {SUGGESTED_GROUPS.map((group) => (
                  <div key={group.label} className="ai-suggestion-group">
                    <span className="ai-suggestion-group-label">{group.label}</span>
                    <div className="ai-chat-suggestions">
                      {group.questions.map((q) => (
                        <button key={q} className="ai-suggestion-chip" onClick={() => sendMessage(q)}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`ai-message ai-message--${msg.role}${msg.isError ? ' ai-error-message' : ''}`}
              >
                <ChatMessage
                  msg={msg}
                  index={i}
                  onConfirm={handleConfirmAction}
                  onDismiss={handleDismiss}
                  onPickDateRange={handlePickDateRange}
                />
              </div>
            ))}

            {loading && (
              <div className="ai-message ai-message--assistant">
                <div className="ai-typing"><span /><span /><span /></div>
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

      {/* Toggle button */}
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
