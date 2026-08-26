import { useState, useCallback, useEffect, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns';

export function useDateFilter(expenses, defaultFilter = 'all', external = null) {
  const [localDateFilter, setLocalDateFilter] = useState(defaultFilter);
  const [localCustomDateRange, setLocalCustomDateRange] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [localPickedMonth, setLocalPickedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const dateFilter = external ? external.dateFilter : localDateFilter;
  const setDateFilter = external ? external.setDateFilter : setLocalDateFilter;
  const customDateRange = external ? external.customDateRange : localCustomDateRange;
  const setCustomDateRange = external ? external.setCustomDateRange : setLocalCustomDateRange;
  const pickedMonth = external ? external.pickedMonth : localPickedMonth;
  const setPickedMonth = external ? external.setPickedMonth : setLocalPickedMonth;
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  const filterExpenses = useCallback(() => {
    let filtered = [...expenses];
    switch (dateFilter) {
      case 'today': {
        const today = format(new Date(), 'yyyy-MM-dd');
        filtered = expenses.filter(e => e.date === today);
        break;
      }
      case 'thisWeek': {
        const start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const end = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        filtered = expenses.filter(e => e.date >= start && e.date <= end);
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
      case 'pickMonth': {
        if (pickedMonth) {
          const [yr, mo] = pickedMonth.split('-').map(Number);
          const base = new Date(yr, mo - 1, 1);
          const start = format(startOfMonth(base), 'yyyy-MM-dd');
          const end = format(endOfMonth(base), 'yyyy-MM-dd');
          filtered = expenses.filter(e => e.date >= start && e.date <= end);
        }
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
    filtered.sort((a, b) => {
      const ta = a.date ? new Date(a.date).getTime() : 0;
      const tb = b.date ? new Date(b.date).getTime() : 0;
      return tb - ta;
    });
    setFilteredExpenses(filtered);
  }, [expenses, dateFilter, customDateRange, pickedMonth]);

  useEffect(() => {
    filterExpenses();
  }, [filterExpenses]);

  const availableMonths = useMemo(
    () => new Set(expenses.filter(e => e.date).map(e => e.date.slice(0, 7))),
    [expenses]
  );

  return { filteredExpenses, dateFilter, setDateFilter, customDateRange, setCustomDateRange, pickedMonth, setPickedMonth, availableMonths };
}
