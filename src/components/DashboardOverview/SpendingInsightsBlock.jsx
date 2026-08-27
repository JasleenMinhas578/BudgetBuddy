import { useState } from 'react';
import {
  LuChevronDown, LuChevronUp, LuSparkles,
  LuLoader, LuX, LuZap, LuLightbulb,
} from 'react-icons/lu';

export default function SpendingInsightsBlock({
  exportDropdownRef,
  handleGenerateSummary,
  aiSummaryLoading,
  aiSummary,
  setAiSummary,
  aiSummaryError,
  setAiSummaryError,
  spendingInsights,
  hasExpenses,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="spending-insights-block">
      <div className="spending-insights-toggle" aria-expanded={isOpen}>
        <button className="spending-insights-expand" onClick={() => setIsOpen(o => !o)}>
          <span className="spending-insights-toggle-left">
            <LuLightbulb size={18} />
            <span>Spending Insights</span>
          </span>
        </button>
        <div className="spending-insights-toggle-right" ref={exportDropdownRef}>
          <button
            onClick={handleGenerateSummary}
            disabled={aiSummaryLoading || !hasExpenses}
            className="btn btn-primary btn-sm"
          >
            {aiSummaryLoading ? <LuLoader size={14} /> : <LuSparkles size={14} />}
            {aiSummaryLoading ? 'Generating…' : 'AI Summary'}
          </button>
          <button
            className="spending-insights-chevron"
            onClick={() => setIsOpen(o => !o)}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="spending-insights-content">
          {(aiSummary || aiSummaryError) && (
            <div className="ai-summary-card">
              <div className="ai-summary-header">
                <div className="ai-summary-title">
                  <LuSparkles size={16} />
                  <h3>AI Spending Summary</h3>
                </div>
                <button
                  className="ai-summary-close"
                  onClick={() => { setAiSummary(null); setAiSummaryError(null); }}
                  aria-label="Close summary"
                >
                  <LuX size={14} />
                </button>
              </div>
              <div className="ai-summary-body">
                {aiSummaryError ? (
                  <p className="ai-summary-error">{aiSummaryError}</p>
                ) : (
                  <p className="ai-summary-text">{aiSummary}</p>
                )}
              </div>
              {!aiSummaryError && (
                <div className="ai-summary-footer">
                  <span className="ai-summary-powered"><LuZap size={12} /> Powered by Gemini</span>
                  <button
                    className="ai-summary-regenerate"
                    onClick={handleGenerateSummary}
                    disabled={aiSummaryLoading}
                  >
                    ↻ Regenerate
                  </button>
                </div>
              )}
            </div>
          )}

          {spendingInsights.length > 0 && (
            <div className="insights-list">
              {spendingInsights.map((insight, index) => (
                <div key={index} className="insight-item">
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
