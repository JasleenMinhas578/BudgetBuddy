/* istanbul ignore file */
import { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears, parseISO } from 'date-fns';
import PieChart from '../Charts/PieChart';
import LineChart from '../Charts/LineChart';
import jsPDF from 'jspdf';
import '../../styles/main.css';

export default function Reports() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
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



  const filterExpenses = useCallback(() => {
    let filtered = [...expenses];
    switch (dateFilter) {
      case 'today':
        const today = format(new Date(), 'yyyy-MM-dd');
        filtered = expenses.filter(expense => expense.date === today);
        break;
      case 'thisMonth':
        const now = new Date();
        const startOfThisMonth = startOfMonth(now);
        const endOfThisMonth = endOfMonth(now);
        filtered = expenses.filter(expense => {
          const expenseDate = parseISO(expense.date);
          return expenseDate >= startOfThisMonth && expenseDate <= endOfThisMonth;
        });
        break;
      case 'lastMonth':
        const lastMonth = subMonths(new Date(), 1);
        const startOfLastMonth = startOfMonth(lastMonth);
        const endOfLastMonth = endOfMonth(lastMonth);
        filtered = expenses.filter(expense => {
          const expenseDate = parseISO(expense.date);
          return expenseDate >= startOfLastMonth && expenseDate <= endOfLastMonth;
        });
        break;
      case 'thisYear':
        const thisYear = new Date();
        const startOfThisYear = startOfYear(thisYear);
        const endOfThisYear = endOfYear(thisYear);
        filtered = expenses.filter(expense => {
          const expenseDate = parseISO(expense.date);
          return expenseDate >= startOfThisYear && expenseDate <= endOfThisYear;
        });
        break;
      case 'lastYear':
        const lastYear = subYears(new Date(), 1);
        const startOfLastYear = startOfYear(lastYear);
        const endOfLastYear = endOfYear(lastYear);
        filtered = expenses.filter(expense => {
          const expenseDate = parseISO(expense.date);
          return expenseDate >= startOfLastYear && expenseDate <= endOfLastYear;
        });
        break;
      case 'custom':
        filtered = expenses.filter(expense => {
          const expenseDate = parseISO(expense.date);
          const startDate = parseISO(customDateRange.startDate);
          const endDate = parseISO(customDateRange.endDate);
          return expenseDate >= startDate && expenseDate <= endDate;
        });
        break;
      default:
        filtered = expenses;
    }
    // Sort filtered expenses by date (most recent first)
    filtered.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });
    setFilteredExpenses(filtered);
  }, [expenses, dateFilter, customDateRange]);

  useEffect(() => {
    filterExpenses();
  }, [expenses, dateFilter, customDateRange, filterExpenses]);

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
      const month = format(parseISO(expense.date), 'MMM yyyy');
      if (monthlyMap[month]) {
        monthlyMap[month] += expense.amount;
      } else {
        monthlyMap[month] = expense.amount;
      }
    });
    
    const sortedMonths = Object.keys(monthlyMap).sort((a, b) => {
      return new Date(a) - new Date(b);
    });
    
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
        format(parseISO(expense.date), 'yyyy-MM-dd'),
        expense.category,
        `"${expense.title}"`,
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
          pdf.text(format(parseISO(expense.date), 'MMM dd'), xPos, yPosition);
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
        pdf.text('Generated by FinTrack', margin, pageHeight - 10);
      }
      
      const fileName = `fin-track-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
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

  return (
    <div className="reports-container">
      <div className="section-header">
        <div className="header-content">
          <h2>Reports & Analytics</h2>
          <p className="section-subtitle">Comprehensive analysis of your spending patterns</p>
        </div>
        <div className="export-actions">
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
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${dateFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDateFilter('all')}
            >
              All Time
            </button>
            <button 
              className={`filter-btn ${dateFilter === 'today' ? 'active' : ''}`}
              onClick={() => setDateFilter('today')}
            >
              Today
            </button>
            <button 
              className={`filter-btn ${dateFilter === 'thisMonth' ? 'active' : ''}`}
              onClick={() => setDateFilter('thisMonth')}
            >
              This Month
            </button>
            <button 
              className={`filter-btn ${dateFilter === 'lastMonth' ? 'active' : ''}`}
              onClick={() => setDateFilter('lastMonth')}
            >
              Last Month
            </button>
            <button 
              className={`filter-btn ${dateFilter === 'thisYear' ? 'active' : ''}`}
              onClick={() => setDateFilter('thisYear')}
            >
              This Year
            </button>
            <button 
              className={`filter-btn ${dateFilter === 'lastYear' ? 'active' : ''}`}
              onClick={() => setDateFilter('lastYear')}
            >
              Last Year
            </button>
            <button 
              className={`filter-btn ${dateFilter === 'custom' ? 'active' : ''}`}
              onClick={() => setDateFilter('custom')}
            >
              Custom Range
            </button>
          </div>
          
          {dateFilter === 'custom' && (
            <div className="custom-date-range">
              <div className="date-inputs">
                <div className="date-input">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                  />
                </div>
                <div className="date-input">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Content */}
      <div id="report-content" className="report-content">
        {/* Current Filter Display */}
        <div className="filter-display">
          <div className="filter-badge">
            <span>📅</span>
            {getFilterLabel()}
          </div>
          <div className="filter-stats">
            <span>{filteredExpenses.length} transactions</span>
            <span>•</span>
            <span>${totalAmount.toFixed(2)} total</span>
          </div>
        </div>

        {/* Spending Insights */}
        {getSpendingInsights().length > 0 && (
          <div className="insights-section">
            <h3>💡 Spending Insights</h3>
            <div className="insights-list">
              {getSpendingInsights().map((insight, index) => (
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
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>
                        <span className="date-cell">
                          {format(parseISO(expense.date), 'MMM dd, yyyy')}
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

// Helper function for category icons

const getCategoryIcon = (category) => {
  const icons = {
    'Food': '🍕',
    'Transport': '🚗',
    'Entertainment': '🎬',
    'Utilities': '💡',
    'Rent': '🏠',
    'Other': '📦'
  };
  return icons[category] || '📊';
};