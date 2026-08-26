/* istanbul ignore file */
import {
  LuUpload, LuFileText, LuFileSpreadsheet, LuLoader,
  LuX, LuSparkles, LuZap, LuLightbulb, LuBarChart2,
} from 'react-icons/lu';
import ExpenseTable from '../UI/ExpenseTable';
import CuteEmptyFace from '../UI/CuteEmptyFace';
import { useReportData } from '../../hooks/useReportData';
import { useReportExport } from '../../hooks/useReportExport';
import { useExpenses } from '../../hooks/useExpenses';
import PageHeader from '../UI/PageHeader';
import ChartCard from '../UI/ChartCard';
import { useDateFilter } from '../../hooks/useDateFilter';
import { useDateRangeContext } from '../../context/DateRangeContext';
import PieChart from '../Charts/PieChart';
import LineChart from '../Charts/LineChart';
import DateFilterBar, { FILTER_BUTTONS_REPORTS } from '../UI/DateFilterBar';
import '../../styles/main.css';

export default function Reports() {
  const { expenses } = useExpenses();
  const dateRangeCtx = useDateRangeContext();
  const {
    filteredExpenses, dateFilter, setDateFilter,
    customDateRange, setCustomDateRange,
    pickedMonth, setPickedMonth, availableMonths,
  } = useDateFilter(expenses, 'thisMonth', dateRangeCtx);
  const { totalAmount, averageAmount, categoryData, monthlyData, topCategory, spendingInsights } = useReportData(filteredExpenses);

  const {
    isGeneratingPDF,
    showExportOptions, setShowExportOptions,
    aiSummary, setAiSummary,
    aiSummaryLoading,
    aiSummaryError, setAiSummaryError,
    exportDropdownRef,
    getFilterLabel,
    handleGenerateSummary,
    exportToCSV,
    generatePDF,
  } = useReportExport({ filteredExpenses, dateFilter, customDateRange, totalAmount, averageAmount, categoryData, topCategory });

  return (
    <div className="reports-container">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Comprehensive analysis of your spending patterns"
        action={
          <div className="export-actions" ref={exportDropdownRef}>
            <button
              onClick={handleGenerateSummary}
              disabled={aiSummaryLoading || filteredExpenses.length === 0}
              className="btn btn-ai-summary"
            >
              {aiSummaryLoading ? <LuLoader size={15} /> : <LuSparkles size={15} />}
              {aiSummaryLoading ? 'Generating…' : 'AI Summary'}
            </button>
            <div className="export-btn-wrapper">
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="btn btn-secondary"
              >
                <LuUpload size={15} />
                Export
              </button>
              {showExportOptions && (
                <div className="export-dropdown">
                  <button onClick={generatePDF} className="export-option" disabled={isGeneratingPDF}>
                    {isGeneratingPDF ? <LuLoader size={14} /> : <LuFileText size={14} />}
                    {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}
                  </button>
                  <button onClick={exportToCSV} className="export-option">
                    <LuFileSpreadsheet size={14} />
                    Export as CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      />

      <div className="filter-controls">
        <div className="filter-section">
          <DateFilterBar
            dateFilter={dateFilter}
            onChange={setDateFilter}
            customDateRange={customDateRange}
            onCustomDateRangeChange={setCustomDateRange}
            pickedMonth={pickedMonth}
            onPickedMonthChange={setPickedMonth}
            availableMonths={availableMonths}
            buttons={FILTER_BUTTONS_REPORTS}
          />
        </div>
      </div>

      <div id="report-content" className="report-content">
        <div className="filter-display">
          <div className="filter-badge">{getFilterLabel()}</div>
          <div className="filter-stats">
            <span>{filteredExpenses.length} transactions</span>
            <span>•</span>
            <span>${totalAmount.toFixed(2)} total</span>
          </div>
        </div>

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
          <div className="insights-section">
            <h3 className="section-heading-icon"><LuLightbulb size={18} /> Spending Insights</h3>
            <div className="insights-list">
              {spendingInsights.map((insight, index) => (
                <div key={index} className="insight-item">
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="charts-section-wrapper">
          <div className="section-subheader">
            <h3 className="section-heading-icon"><LuBarChart2 size={18} /> Charts & Visualizations</h3>
          </div>
          <div className="charts-section">
            <ChartCard title="Spending by Category" isEmpty={filteredExpenses.length === 0}>
              <PieChart data={categoryData} />
            </ChartCard>
            <ChartCard title="Monthly Trend" isEmpty={filteredExpenses.length === 0}>
              <LineChart data={monthlyData} />
            </ChartCard>
          </div>
        </div>

        <div className="expenses-table-section">
          <div className="section-subheader">
            <h3>Detailed Expenses</h3>
            <p>Complete breakdown of all transactions in the selected period</p>
          </div>
          <ExpenseTable
            expenses={filteredExpenses}
            itemsPerPage={15}
            emptyIcon={<CuteEmptyFace size={96} />}
            emptyMessage="No expenses found"
            emptySubMessage="No expenses match the selected date range"
          />
        </div>
      </div>
    </div>
  );
}
