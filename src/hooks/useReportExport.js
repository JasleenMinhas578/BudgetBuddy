import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import { generateSummary } from '../services/aiService';
import { safeFormatDate } from '../utils/formatDate';
import { getDateFilterFlatLabel } from '../utils/dateFilterLabel';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';

export function useReportExport({ filteredExpenses, dateFilter, customDateRange, totalAmount, averageAmount, categoryData, topCategory }) {
  const { currentUser } = useAuth();
  const { formatAmount, homeCurrency, currency, homeSymbol, currencySymbol: displaySymbol, liveRates } = useCurrency();
  const currencyInfo = { homeCurrency, homeSymbol, displayCurrency: currency, displaySymbol, liveRates };
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState(null);

  useEffect(() => {
    setAiSummary(null);
    setAiSummaryError(null);
  }, [dateFilter, customDateRange]);

  const getFilterLabel = () => getDateFilterFlatLabel(dateFilter, { customDateRange });

  const handleGenerateSummary = async () => {
    setAiSummaryLoading(true);
    setAiSummaryError(null);
    setAiSummary(null);
    try {
      const idToken = await currentUser?.getIdToken().catch(() => null);
      const raw = await generateSummary(filteredExpenses, getFilterLabel(), currencyInfo, idToken);
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
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    setPdfError(null);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      const C = {
        teal:       [79, 209, 197],
        dark:       [15, 23, 42],
        textPri:    [15, 23, 42],
        textSec:    [100, 116, 139],
        white:      [255, 255, 255],
        lightGray:  [248, 250, 252],
        borderGray: [226, 232, 240],
        footerText: [148, 163, 184],
      };

      const catPalette = [
        [79, 209, 197], [99, 102, 241], [251, 146, 60],
        [34, 197, 94],  [236, 72, 153], [234, 179, 8],
        [168, 85, 247], [239, 68, 68],
      ];

      // ── HEADER ─────────────────────────────────────────────
      pdf.setFillColor(...C.dark);
      pdf.rect(0, 0, pageWidth, 48, 'F');
      pdf.setFillColor(...C.teal);
      pdf.rect(0, 0, 5, 48, 'F');

      pdf.setTextColor(...C.white);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BudgetBuddy', margin + 5, 22);

      pdf.setTextColor(...C.teal);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Expense Report', margin + 5, 32);

      pdf.setTextColor(...C.footerText);
      pdf.setFontSize(8.5);
      pdf.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, pageWidth - margin, 20, { align: 'right' });
      pdf.text(getFilterLabel(), pageWidth - margin, 30, { align: 'right' });

      // ── STAT CARDS ──────────────────────────────────────────
      let y = 62;
      const stats = [
        { label: 'Total Spent',    value: formatAmount(totalAmount) },
        { label: 'Transactions',   value: filteredExpenses.length.toString() },
        { label: 'Avg Transaction', value: formatAmount(averageAmount) },
        { label: 'Top Category',   value: topCategory ? (topCategory.length > 11 ? topCategory.substring(0, 9) + '…' : topCategory) : 'None' },
      ];
      const cardW = (contentWidth - 9) / 4;
      const cardH = 22;
      stats.forEach((stat, i) => {
        const cx = margin + i * (cardW + 3);
        pdf.setFillColor(...C.lightGray);
        pdf.roundedRect(cx, y, cardW, cardH, 2, 2, 'F');
        pdf.setFillColor(...C.teal);
        pdf.rect(cx, y, cardW, 1.5, 'F');
        pdf.setTextColor(...C.textSec);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(stat.label.toUpperCase(), cx + cardW / 2, y + 9, { align: 'center' });
        pdf.setTextColor(...C.textPri);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(stat.value, cx + cardW / 2, y + 18, { align: 'center' });
      });
      y += cardH + 16;

      // ── SPENDING BY CATEGORY ────────────────────────────────
      if (categoryData.labels.length > 0) {
        pdf.setFillColor(...C.teal);
        pdf.rect(margin, y, 3, 10, 'F');
        pdf.setTextColor(...C.textPri);
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Spending by Category', margin + 7, y + 7.5);
        y += 16;

        const barMax = contentWidth * 0.45;
        const labelCol = margin + 42 + barMax + 4;
        const labelAreaW = pageWidth - margin - labelCol;
        categoryData.labels.forEach((cat, i) => {
          const amount = categoryData.datasets[0].data[i];
          const pct = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
          const barW = (pct / 100) * barMax;
          const color = catPalette[i % catPalette.length];

          pdf.setTextColor(...C.textPri);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text(cat, margin, y + 4.5);

          pdf.setFillColor(...C.borderGray);
          pdf.roundedRect(margin + 42, y, barMax, 6, 1, 1, 'F');
          if (barW > 0) {
            pdf.setFillColor(...color);
            pdf.roundedRect(margin + 42, y, barW, 6, 1, 1, 'F');
          }

          pdf.setTextColor(...C.textSec);
          pdf.setFontSize(8.5);
          pdf.setFont('helvetica', 'normal');
          pdf.text(
            `${pct.toFixed(1)}%  ·  ${formatAmount(amount)}`,
            labelCol,
            y + 4.5,
            { maxWidth: labelAreaW },
          );
          y += 12;
        });

        // section divider
        pdf.setDrawColor(...C.borderGray);
        pdf.setLineWidth(0.3);
        pdf.line(margin, y + 2, pageWidth - margin, y + 2);
        y += 10;
      }

      // ── DETAILED EXPENSES TABLE ─────────────────────────────
      if (filteredExpenses.length > 0) {
        pdf.setFillColor(...C.teal);
        pdf.rect(margin, y, 3, 10, 'F');
        pdf.setTextColor(...C.textPri);
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Detailed Expenses', margin + 7, y + 7.5);
        y += 16;

        const colW = [28, 38, 0, 28];
        colW[2] = contentWidth - colW[0] - colW[1] - colW[3];
        const colX = [
          margin,
          margin + colW[0],
          margin + colW[0] + colW[1],
          margin + colW[0] + colW[1] + colW[2],
        ];
        const rowH = 7;
        const amountRightX = colX[3] + colW[3] - 2; // 2mm inset from right edge
        const headers = ['Date', 'Category', 'Title', 'Amount'];

        const drawTableHeader = (startY) => {
          pdf.setFillColor(...C.dark);
          pdf.rect(margin, startY, contentWidth, rowH + 2, 'F');
          pdf.setTextColor(...C.white);
          pdf.setFontSize(8.5);
          pdf.setFont('helvetica', 'bold');
          headers.forEach((h, i) => {
            if (i === 3) pdf.text(h, amountRightX, startY + 6, { align: 'right' });
            else         pdf.text(h, colX[i] + 2, startY + 6);
          });
          return startY + rowH + 2;
        };

        y = drawTableHeader(y);

        filteredExpenses.forEach((expense, rowIdx) => {
          if (y > pageHeight - 25) {
            pdf.addPage();
            y = margin;
            y = drawTableHeader(y);
          }
          if (rowIdx % 2 === 0) {
            pdf.setFillColor(...C.lightGray);
            pdf.rect(margin, y, contentWidth, rowH, 'F');
          }
          pdf.setTextColor(...C.textPri);
          pdf.setFontSize(8.5);
          pdf.setFont('helvetica', 'normal');

          pdf.text(safeFormatDate(expense.date, 'MMM dd') || '—', colX[0] + 2, y + 5);
          pdf.text(expense.category ?? '—', colX[1] + 2, y + 5);
          const title = expense.title ?? '—';
          pdf.text(title.length > 32 ? title.substring(0, 29) + '...' : title, colX[2] + 2, y + 5);

          pdf.setTextColor(...C.teal);
          pdf.setFont('helvetica', 'bold');
          pdf.text(
            formatAmount(typeof expense.amount === 'number' ? expense.amount : 0),
            amountRightX, y + 5, { align: 'right' },
          );
          y += rowH;
        });

        // Total row
        pdf.setFillColor(...C.dark);
        pdf.rect(margin, y, contentWidth, rowH + 2, 'F');
        pdf.setTextColor(...C.white);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TOTAL', colX[0] + 2, y + 6);
        pdf.setTextColor(...C.teal);
        pdf.text(formatAmount(totalAmount), amountRightX, y + 6, { align: 'right' });
      }

      // ── FOOTER (every page) ─────────────────────────────────
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFillColor(...C.dark);
        pdf.rect(0, pageHeight - 12, pageWidth, 12, 'F');
        pdf.setFillColor(...C.teal);
        pdf.rect(0, pageHeight - 12, 5, 12, 'F');
        pdf.setTextColor(...C.footerText);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Generated by BudgetBuddy', margin + 5, pageHeight - 4.5);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 4.5, { align: 'right' });
      }

      pdf.save(`BudgetBuddy-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setPdfError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return {
    isGeneratingPDF,
    pdfError, setPdfError,
    aiSummary, setAiSummary,
    aiSummaryLoading,
    aiSummaryError, setAiSummaryError,
    handleGenerateSummary,
    exportToCSV,
    generatePDF,
  };
}
