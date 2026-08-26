/* istanbul ignore file */
import { useState, useEffect, useRef } from 'react';
import {
  LuUpload, LuFileText, LuFileSpreadsheet, LuLoader,
  LuX, LuSparkles, LuZap,
  LuLightbulb,
  LuBarChart2,
} from 'react-icons/lu';
import ExpenseTable from '../UI/ExpenseTable';
import { useReportData } from '../../hooks/useReportData';
import { subscribeToExpenses } from '../../services/database';
import { useAuth } from '../../context/AuthContext';
import { useDateFilter } from '../../hooks/useDateFilter';
import { useDateRangeContext } from '../../context/DateRangeContext';
import { format, parseISO } from 'date-fns';
import PieChart from '../Charts/PieChart';
import LineChart from '../Charts/LineChart';
import DateFilterBar, { FILTER_BUTTONS_REPORTS } from '../UI/DateFilterBar';
import jsPDF from 'jspdf';
import { generateSummary } from '../../services/aiService';
import '../../styles/main.css';

// Gracefully format an expense date; returns '' for null/malformed values so
// a single bad Firestore document can't crash the entire Reports render.
const safeFormatDate = (dateStr, fmt) => {
  if (!dateStr) return '';
  try { return format(parseISO(dateStr), fmt); } catch { return ''; }
};

export default function Reports() {
  const [expenses, setExpenses] = useState([]);
  const dateRangeCtx = useDateRangeContext();
  const { filteredExpenses, dateFilter, setDateFilter, customDateRange, setCustomDateRange } = useDateFilter(expenses, 'thisMonth', dateRangeCtx);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState(null);
  const exportDropdownRef = useRef(null);
  const { currentUser } = useAuth();



  useEffect(() => {
    if (!currentUser) return;
    let unsubscribe = () => {};
    try {
      unsubscribe = subscribeToExpenses(currentUser.uid, (expensesData) => {
        if (expensesData !== null) setExpenses(expensesData);
      });
    } catch (error) {
      console.error("Error setting up listener:", error);
    }
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!showExportOptions) return;
    const handleClickOutside = (e) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target)) {
        setShowExportOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportOptions]);

  const { totalAmount, averageAmount, categoryData, monthlyData, topCategory, spendingInsights } = useReportData(filteredExpenses);

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Title', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredExpenses.map(expense => [
        safeFormatDate(expense.date, 'yyyy-MM-dd') || expense.date || '',
        `"${(expense.category || '').replace(/"/g, '""')}"`,
        `"${(expense.title || '').replace(/"/g, '""')}"`,
        (typeof expense.amount === 'number' ? expense.amount : 0).toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      
      let yPosition = margin;
      
      // Add header with proper colors
      pdf.setFillColor(79, 209, 197);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Header text in dark color
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BudgetBuddy Expense Report', margin, 25);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, margin, 35);
      
      yPosition = 50;
      
      // Add filter information with black text
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Report Summary', margin, yPosition);
      
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date Range: ${getFilterLabel()}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Total Transactions: ${filteredExpenses.length}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Total Amount: $${totalAmount.toFixed(2)}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Average Transaction: $${averageAmount.toFixed(2)}`, margin, yPosition);
      
      yPosition += 15;
      
      // Add summary statistics with black text
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Statistics', margin, yPosition);
      
      yPosition += 10;
      
      const stats = [
        { label: 'Total Spent', value: `$${totalAmount.toFixed(2)}` },
        { label: 'Transactions', value: filteredExpenses.length.toString() },
        { label: 'Average Amount', value: `$${averageAmount.toFixed(2)}` },
        { label: 'Top Category', value: topCategory ? topCategory : 'None' }
      ];
      
      stats.forEach((stat, index) => {
        const xPos = margin + (index % 2) * (contentWidth / 2);
        const yPos = yPosition + Math.floor(index / 2) * 8;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(stat.label, xPos, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(stat.value, xPos + 50, yPos);
      });
      
      yPosition += 25;
      
      // Add category breakdown with black text
      if (categoryData.labels.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Spending by Category', margin, yPosition);
        
        yPosition += 10;
        
        categoryData.labels.forEach((category, index) => {
          const amount = categoryData.datasets[0].data[index];
          const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${category}: $${amount.toFixed(2)} (${percentage.toFixed(1)}%)`, margin, yPosition);
          yPosition += 6;
        });
        
        yPosition += 10;
      }
      
      // Add detailed expenses table with black text
      if (filteredExpenses.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Detailed Expenses', margin, yPosition);
        
        yPosition += 10;
        
        // Table headers
        const headers = ['Date', 'Category', 'Title', 'Amount'];
        const columnWidths = [30, 40, 80, 30];
        let xPos = margin;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        headers.forEach((header, index) => {
          pdf.text(header, xPos, yPosition);
          xPos += columnWidths[index];
        });
        
        yPosition += 5;
        
        // Table content
        pdf.setFont('helvetica', 'normal');
        filteredExpenses.forEach((expense, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = margin;
          }
          
          xPos = margin;
          pdf.text(safeFormatDate(expense.date, 'MMM dd') || '—', xPos, yPosition);
          xPos += columnWidths[0];
          
          pdf.text(expense.category ?? '—', xPos, yPosition);
          xPos += columnWidths[1];
          
          // Truncate title if too long
          const rawTitle = expense.title ?? '—';
          const title = rawTitle.length > 25 ? rawTitle.substring(0, 22) + '...' : rawTitle;
          pdf.text(title, xPos, yPosition);
          xPos += columnWidths[2];
          
          pdf.text(`$${(typeof expense.amount === 'number' ? expense.amount : 0).toFixed(2)}`, xPos, yPosition);
          
          yPosition += 5;
        });
      }
      
      // Add footer with gray text
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, pageHeight - 10);
        pdf.text('Generated by BudgetBuddy', margin, pageHeight - 10);
      }
      
      const fileName = `BudgetBuddy-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getFilterLabel = () => {
    switch (dateFilter) {
      case 'today': return 'Today';
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'thisYear': return 'This Year';
      case 'lastYear': return 'Last Year';
      case 'custom': {
        const start = safeFormatDate(customDateRange.startDate, 'MMM dd, yyyy') || customDateRange.startDate || '';
        const end = safeFormatDate(customDateRange.endDate, 'MMM dd, yyyy') || customDateRange.endDate || '';
        return `Custom Range (${start} - ${end})`;
      }
      default: return 'All Time';
    }
  };

  // Clear summary whenever the date filter changes so it doesn't show stale data
  useEffect(() => {
    setAiSummary(null);
    setAiSummaryError(null);
  }, [dateFilter, customDateRange]);

  const handleGenerateSummary = async () => {
    setAiSummaryLoading(true);
    setAiSummaryError(null);
    setAiSummary(null);
    try {
      const raw = await generateSummary(filteredExpenses, getFilterLabel());
      // Ensure the paragraph starts with a capital letter
      const summary = raw.charAt(0).toUpperCase() + raw.slice(1);
      setAiSummary(summary);
    } catch (err) {
      setAiSummaryError(err.message);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  return (
    <div className="reports-container">
      <div className="section-header">
        <div className="header-content">
          <h2>Reports & Analytics</h2>
          <p className="section-subtitle">Comprehensive analysis of your spending patterns</p>
        </div>
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
      </div>

      {/* Date Filter Controls */}
      <div className="filter-controls">
        <div className="filter-section">
          <h3>Date Range</h3>
          <DateFilterBar
            dateFilter={dateFilter}
            onChange={setDateFilter}
            customDateRange={customDateRange}
            onCustomDateRangeChange={setCustomDateRange}
            buttons={FILTER_BUTTONS_REPORTS}
          />
        </div>
      </div>

      {/* Report Content */}
      <div id="report-content" className="report-content">
        {/* Current Filter Display */}
        <div className="filter-display">
          <div className="filter-badge">
            {getFilterLabel()}
          </div>
          <div className="filter-stats">
            <span>{filteredExpenses.length} transactions</span>
            <span>•</span>
            <span>${totalAmount.toFixed(2)} total</span>
          </div>
        </div>

        {/* AI Summary Card */}
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
              ><LuX size={14} /></button>
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

        {/* Spending Insights */}
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

        {/* Charts Section */}
        <div className="charts-section-wrapper">
          <div className="section-subheader">
            <h3 className="section-heading-icon"><LuBarChart2 size={18} /> Charts & Visualizations</h3>
          </div>
          <div className="charts-section">
            <div className="chart-container">
              <h3>Spending by Category</h3>
              <div className="chart-wrapper">
                <PieChart data={categoryData} />
              </div>
            </div>

            <div className="chart-container">
              <h3>Monthly Trend</h3>
              <div className="chart-wrapper">
                <LineChart data={monthlyData} />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Expenses Table */}
        <div className="expenses-table-section">
          <div className="section-subheader">
            <h3>Detailed Expenses</h3>
            <p>Complete breakdown of all transactions in the selected period</p>
          </div>
          
          <ExpenseTable
            expenses={filteredExpenses}
            itemsPerPage={15}
            emptyIcon={<LuBarChart2 size={48} />}
            emptyMessage="No expenses found"
            emptySubMessage="No expenses match the selected date range"
          />
        </div>
      </div>
    </div>
  );
}

