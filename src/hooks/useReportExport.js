import { useState, useRef, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import { generateSummary } from '../services/aiService';

const safeFormatDate = (dateStr, fmt) => {
  if (!dateStr) return '';
  try { return format(parseISO(dateStr), fmt); } catch { return ''; }
};

export function useReportExport({ filteredExpenses, dateFilter, customDateRange, totalAmount, averageAmount, categoryData, topCategory }) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState(null);
  const exportDropdownRef = useRef(null);

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

  useEffect(() => {
    setAiSummary(null);
    setAiSummaryError(null);
  }, [dateFilter, customDateRange]);

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

  const handleGenerateSummary = async () => {
    setAiSummaryLoading(true);
    setAiSummaryError(null);
    setAiSummary(null);
    try {
      const raw = await generateSummary(filteredExpenses, getFilterLabel());
      setAiSummary(raw.charAt(0).toUpperCase() + raw.slice(1));
    } catch (err) {
      setAiSummaryError(err.message);
    } finally {
      setAiSummaryLoading(false);
    }
  };

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

      pdf.setFillColor(79, 209, 197);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BudgetBuddy Expense Report', margin, 25);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, margin, 35);

      yPosition = 50;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Report Summary', margin, yPosition);
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date Range: ${getFilterLabel()}`, margin, yPosition); yPosition += 6;
      pdf.text(`Total Transactions: ${filteredExpenses.length}`, margin, yPosition); yPosition += 6;
      pdf.text(`Total Amount: $${totalAmount.toFixed(2)}`, margin, yPosition); yPosition += 6;
      pdf.text(`Average Transaction: $${averageAmount.toFixed(2)}`, margin, yPosition);
      yPosition += 15;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Statistics', margin, yPosition);
      yPosition += 10;
      const stats = [
        { label: 'Total Spent', value: `$${totalAmount.toFixed(2)}` },
        { label: 'Transactions', value: filteredExpenses.length.toString() },
        { label: 'Average Amount', value: `$${averageAmount.toFixed(2)}` },
        { label: 'Top Category', value: topCategory || 'None' },
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

      if (filteredExpenses.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Detailed Expenses', margin, yPosition);
        yPosition += 10;
        const tableHeaders = ['Date', 'Category', 'Title', 'Amount'];
        const columnWidths = [30, 40, 80, 30];
        let xPos = margin;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        tableHeaders.forEach((header, index) => {
          pdf.text(header, xPos, yPosition);
          xPos += columnWidths[index];
        });
        yPosition += 5;
        pdf.setFont('helvetica', 'normal');
        filteredExpenses.forEach((expense) => {
          if (yPosition > pageHeight - 30) { pdf.addPage(); yPosition = margin; }
          xPos = margin;
          pdf.text(safeFormatDate(expense.date, 'MMM dd') || '—', xPos, yPosition); xPos += columnWidths[0];
          pdf.text(expense.category ?? '—', xPos, yPosition); xPos += columnWidths[1];
          const rawTitle = expense.title ?? '—';
          pdf.text(rawTitle.length > 25 ? rawTitle.substring(0, 22) + '...' : rawTitle, xPos, yPosition); xPos += columnWidths[2];
          pdf.text(`$${(typeof expense.amount === 'number' ? expense.amount : 0).toFixed(2)}`, xPos, yPosition);
          yPosition += 5;
        });
      }

      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, pageHeight - 10);
        pdf.text('Generated by BudgetBuddy', margin, pageHeight - 10);
      }
      pdf.save(`BudgetBuddy-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return {
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
  };
}
