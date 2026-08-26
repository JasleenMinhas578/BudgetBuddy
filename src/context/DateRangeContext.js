import { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from './AuthContext';
import { getUserSettings } from '../services/database';

const DateRangeContext = createContext(null);
const today = () => format(new Date(), 'yyyy-MM-dd');

export function DateRangeProvider({ children }) {
  const { currentUser } = useAuth();
  const [dateFilter, setDateFilter] = useState('thisMonth');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: today(),
    endDate: today(),
  });

  // On login, reset the filter to whatever the user saved as their default.
  // This runs every time currentUser changes (login / logout / switch account).
  useEffect(() => {
    if (!currentUser) {
      setDateFilter('thisMonth');
      return;
    }
    getUserSettings(currentUser.uid).then(settings => {
      if (settings.defaultDateFilter) {
        setDateFilter(settings.defaultDateFilter);
      }
    });
  }, [currentUser]);

  return (
    <DateRangeContext.Provider value={{ dateFilter, setDateFilter, customDateRange, setCustomDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRangeContext() {
  return useContext(DateRangeContext);
}
