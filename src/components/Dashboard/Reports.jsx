import { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestoreConfig';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import '../../styles/main.css';
import '../../styles/dashboard-fixes.css';

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
      pdf.text('FinTrack Expense Report', margin, 25);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, margin, 35);
      
      yPosition = 50;
      

  );
}