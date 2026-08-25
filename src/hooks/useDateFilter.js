import { useState, useCallback, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns';

export function useDateFilter(expenses, defaultFilter = 'all') {
  const [dateFilter, setDateFilter] = useState(defaultFilter);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  const filterExpenses = useCallback(() => {
    let filtered = [...expenses];
    switch (dateFilter) {
      case 'today': {
        const today = format(new Date(), 'yyyy-MM-dd');
        filtered = expenses.filter(e => e.date === today);
        break;
      }
      case 'thisMonth': {
        const start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        const end = format(endOfMonth(new Date()), 'yyyy-MM-dd');
        filtered = expenses.filter(e => e.date >= start && e.date <= end);
        break;
      }
      case 'lastMonth': {
        const last = subMonths(new Date(), 1);
        const start = format(startOfMonth(last), 'yyyy-MM-dd');
        const end = format(endOfMonth(last), 'yyyy-MM-dd');
        filtered = expenses.filter(e => e.date >= start && e.date <= end);
        break;
      }
      case 'thisYear': {
        const start = format(startOfYear(new Date()), 'yyyy-MM-dd');
        const end = format(endOfYear(new Date()), 'yyyy-MM-dd');
        filtered = expenses.filter(e => e.date >= start && e.date <= end);
        break;
      }
      case 'lastYear': {
        const last = subYears(new Date(), 1);
        const start = format(startOfYear(last), 'yyyy-MM-dd');
        const end = format(endOfYear(last), 'yyyy-MM-dd');
        filtered = expenses.filter(e => e.date >= start && e.date <= end);
        break;
      }
      case 'custom': {
        const { startDate, endDate } = customDateRange;
        filtered = expenses.filter(e => e.date >= startDate && e.date <= endDate);
        break;
      }
      default:
        filtered = expenses;
    }
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFilteredExpenses(filtered);
  }, [expenses, dateFilter, customDateRange]);

  useEffect(() => {
    filterExpenses();
  }, [filterExpenses]);

  return { filteredExpenses, dateFilter, setDateFilter, customDateRange, setCustomDateRange };
}
