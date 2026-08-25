import { useState, useCallback, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears, parseISO } from 'date-fns';

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
        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());
        filtered = expenses.filter(e => { const d = parseISO(e.date); return d >= start && d <= end; });
        break;
      }
      case 'lastMonth': {
        const last = subMonths(new Date(), 1);
        const start = startOfMonth(last);
        const end = endOfMonth(last);
        filtered = expenses.filter(e => { const d = parseISO(e.date); return d >= start && d <= end; });
        break;
      }
      case 'thisYear': {
        const start = startOfYear(new Date());
        const end = endOfYear(new Date());
        filtered = expenses.filter(e => { const d = parseISO(e.date); return d >= start && d <= end; });
        break;
      }
      case 'lastYear': {
        const last = subYears(new Date(), 1);
        const start = startOfYear(last);
        const end = endOfYear(last);
        filtered = expenses.filter(e => { const d = parseISO(e.date); return d >= start && d <= end; });
        break;
      }
      case 'custom': {
        const start = parseISO(customDateRange.startDate);
        const end = parseISO(customDateRange.endDate);
        filtered = expenses.filter(e => { const d = parseISO(e.date); return d >= start && d <= end; });
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
