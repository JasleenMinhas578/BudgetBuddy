import { useRef, useEffect } from 'react';
import { LuBot, LuWallet, LuX, LuSend } from 'react-icons/lu';
import { useAIChat } from '../../hooks/useAIChat';
import ChatMessage from './ChatMessage';
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
                    <button key={q} className="ai-suggestion-chip" onClick={() => sendMessage(q)}>
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
