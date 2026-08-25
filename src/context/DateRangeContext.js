import { createContext, useContext, useState } from 'react';
import { format } from 'date-fns';

const DateRangeContext = createContext(null);

const today = () => format(new Date(), 'yyyy-MM-dd');

export function DateRangeProvider({ children }) {
  const [dateFilter, setDateFilterState] = useState(
    () => localStorage.getItem('bb_date_filter') || 'thisMonth'
  );
  const [customDateRange, setCustomDateRangeState] = useState(() => {
    try {
      const stored = localStorage.getItem('bb_custom_date_range');
      return stored ? JSON.parse(stored) : { startDate: today(), endDate: today() };
    } catch {
      return { startDate: today(), endDate: today() };
    }
  });

  const setDateFilter = (val) => {
    setDateFilterState(val);
    try { localStorage.setItem('bb_date_filter', val); } catch {}
  };

  const setCustomDateRange = (range) => {
    setCustomDateRangeState(range);
    try { localStorage.setItem('bb_custom_date_range', JSON.stringify(range)); } catch {}
  };

  return (
    <DateRangeContext.Provider value={{ dateFilter, setDateFilter, customDateRange, setCustomDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRangeContext() {
  return useContext(DateRangeContext);
}
