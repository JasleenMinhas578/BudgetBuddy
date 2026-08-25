/* istanbul ignore file */
import { useState, useEffect, useRef } from 'react';
import { getCategoryIcon } from '../../utils/getCategoryIcon';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { useDateFilter } from '../../hooks/useDateFilter';
import { format, parseISO, parse } from 'date-fns';
import PieChart from '../Charts/PieChart';
import LineChart from '../Charts/LineChart';
import DateFilterBar, { FILTER_BUTTONS_REPORTS } from '../UI/DateFilterBar';
import jsPDF from 'jspdf';
import Pagination from '../UI/Pagination';
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
  const { filteredExpenses, dateFilter, setDateFilter, customDateRange, setCustomDateRange } = useDateFilter(expenses, 'all');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState(null);
  const exportDropdownRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const { currentUser } = useAuth();



  useEffect(() => {
    if (!currentUser) return;
  
    let unsubscribe = () => {};
  
    const setupListener = async () => {
      try {
        const qExpenses = query(
          collection(db, 'users', currentUser.uid, 'expenses'),
          orderBy('createdAt', 'desc')
        );
        
        unsubscribe = onSnapshot(qExpenses, (querySnapshot) => {
          const expensesData = [];
          querySnapshot.forEach((doc) => {
            expensesData.push({ id: doc.id, ...doc.data() });
          });
          setExpenses(expensesData);
        }, (error) => {
          console.error("Error in expenses listener:", error);
        });
  
      } catch (error) {
        console.error("Error setting up listener:", error);
      }
    };
  
    setupListener();
  
    return () => {
      // Cleanup function
      try {
        if (typeof unsubscribe === 'function') unsubscribe();
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
    };
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

  const getCategoryData = () => {
    const categoryMap = {};
    
    filteredExpenses.forEach(expense => {
      if (categoryMap[expense.category]) {
        categoryMap[expense.category] += expense.amount;
      } else {
        categoryMap[expense.category] = expense.amount;
      }
    });
    
    return {
      labels: Object.keys(categoryMap),
      datasets: [{
        data: Object.values(categoryMap),
        backgroundColor: [
          '#4fd1c5', '#f687b3', '#f6ad55', '#68d391', '#63b3ed', '#b794f4',
          '#fc8181', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#fb7185'
        ]
      }]
    };
  };

  const getMonthlyData = () => {
    const monthlyMap = {};

    filteredExpenses.forEach(expense => {
      const month = safeFormatDate(expense.date, 'MMM yyyy');
      if (!month) return;
      monthlyMap[month] = (monthlyMap[month] || 0) + expense.amount;
    });

    // parse() from date-fns correctly handles 'MMM yyyy'; new Date() does not.
    const sortedMonths = Object.keys(monthlyMap).sort((a, b) =>
      parse(a, 'MMM yyyy', new Date()) - parse(b, 'MMM yyyy', new Date())
    );
    
    return {
      labels: sortedMonths,
      datasets: [{
        label: 'Monthly Spending',
        data: sortedMonths.map(month => monthlyMap[month]),
        borderColor: '#4fd1c5',
        backgroundColor: 'rgba(79, 209, 197, 0.1)',
        tension: 0.4
      }]
    };
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Title', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredExpenses.map(expense => [
        safeFormatDate(expense.date, 'yyyy-MM-dd') || expense.date || '',
        `"${(expense.category || '').replace(/"/g, '""')}"`,
        `"${(expense.title || '').replace(/"/g, '""')}"`,
        expense.amount.toFixed(2)
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
          
          pdf.text(expense.category, xPos, yPosition);
          xPos += columnWidths[1];
          
          // Truncate title if too long
          const title = expense.title.length > 25 ? expense.title.substring(0, 22) + '...' : expense.title;
          pdf.text(title, xPos, yPosition);
          xPos += columnWidths[2];
          
          pdf.text(`$${expense.amount.toFixed(2)}`, xPos, yPosition);
          
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

  // Helper to get the top category and its amount
  const getTopCategory = () => {
    const categoryMap = {};
    filteredExpenses.forEach(expense => {
      if (categoryMap[expense.category]) {
        categoryMap[expense.category] += expense.amount;
      } else {
        categoryMap[expense.category] = expense.amount;
      }
    });
    let topCategory = null;
    let maxAmount = 0;
    for (const [cat, amt] of Object.entries(categoryMap)) {
      if (amt > maxAmount) {
        topCategory = cat;
        maxAmount = amt;
      }
    }
    return { topCategory, maxAmount };
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;
  const categoryData = getCategoryData();
  const monthlyData = getMonthlyData();
  const { topCategory, maxAmount } = getTopCategory();

  // Pagination logic for expenses table
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  // Reset to first page when filtered expenses change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredExpenses.length, currentPage, totalPages]);

  const getFilterLabel = () => {
    switch (dateFilter) {
      case 'today': return 'Today';
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'thisYear': return 'This Year';
      case 'lastYear': return 'Last Year';
      case 'custom': return `Custom Range (${format(parseISO(customDateRange.startDate), 'MMM dd, yyyy')} - ${format(parseISO(customDateRange.endDate), 'MMM dd, yyyy')})`;
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

  const getSpendingInsights = () => {
    if (filteredExpenses.length === 0) return [];
    const insights = [];
    const topCategoryPercentage = totalAmount > 0 ? (maxAmount / totalAmount) * 100 : 0;
    if (topCategory && topCategoryPercentage > 50) {
      insights.push(`You spend ${topCategoryPercentage.toFixed(1)}% of your money on ${topCategory}`);
    }
    if (averageAmount > 100) {
      insights.push(`Your average transaction is $${averageAmount.toFixed(2)}, consider reviewing larger expenses`);
    }
    if (filteredExpenses.length > 50) {
      insights.push(`You have ${filteredExpenses.length} transactions in this period`);
    }
    return insights;
  };

  const spendingInsights = getSpendingInsights();

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
            <span>{aiSummaryLoading ? '⏳' : '✨'}</span>
            {aiSummaryLoading ? 'Generating…' : 'AI Summary'}
          </button>
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="btn btn-secondary"
          >
            <span>📤</span>
            Export
          </button>
          {showExportOptions && (
            <div className="export-dropdown">
              <button onClick={generatePDF} className="export-option" disabled={isGeneratingPDF}>
                <span>{isGeneratingPDF ? '⏳' : '📄'}</span>
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}
              </button>
              <button onClick={exportToCSV} className="export-option">
                <span>📊</span>
                Export as CSV
              </button>
            </div>
          )}
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
                <span>✨</span>
                <h3>AI Spending Summary</h3>
              </div>
              <button
                className="ai-summary-close"
                onClick={() => { setAiSummary(null); setAiSummaryError(null); }}
                aria-label="Close summary"
              >✕</button>
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
                <span className="ai-summary-powered">⚡ Powered by Gemini</span>
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
            <h3>💡 Spending Insights</h3>
            <div className="insights-list">
              {spendingInsights.map((insight, index) => (
                <div key={index} className="insight-item">
                  <span>💡</span>
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon">
              <span>💰</span>
            </div>
            <div className="card-content">
              <h3>Total Spent</h3>
              <p className="card-amount">${totalAmount.toFixed(2)}</p>
              <p className="card-subtitle">{getFilterLabel()}</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon">
              <span>📊</span>
            </div>
            <div className="card-content">
              <h3>Transactions</h3>
              <p className="card-amount">{filteredExpenses.length}</p>
              <p className="card-subtitle">Total transactions</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon">
              <span>📈</span>
            </div>
            <div className="card-content">
              <h3>Average</h3>
              <p className="card-amount">${averageAmount.toFixed(2)}</p>
              <p className="card-subtitle">Per transaction</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon">
              <span>🏆</span>
            </div>
            <div className="card-content">
              <h3>Top Category</h3>
              <p className="card-amount">
                {topCategory ? topCategory : 'None'}
              </p>
              <p className="card-subtitle">Highest spending</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <div className="chart-card">
              <h3>Spending by Category</h3>
              <div className="chart-wrapper">
                <PieChart data={categoryData} />
              </div>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-card">
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
          
          {filteredExpenses.length > 0 ? (
            <>
            <div className="expenses-table-container">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Title</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>
                        <span className="date-cell">
                          {safeFormatDate(expense.date, 'MMM dd, yyyy') || '—'}
                        </span>
                      </td>
                      <td>
                        <div className="category-cell">
                          <span className="category-icon">
                            {getCategoryIcon(expense.category)}
                          </span>
                          <span className="category-name">{expense.category}</span>
                        </div>
                      </td>
                      <td>
                        <span className="expense-title">{expense.title}</span>
                      </td>
                      <td>
                        <span className="amount-cell">${expense.amount.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredExpenses.length}
              />
            )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h4>No expenses found</h4>
              <p>No expenses match the selected date range</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

