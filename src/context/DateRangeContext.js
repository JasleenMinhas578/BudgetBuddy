import { createContext, useContext, useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import { useAuth } from './AuthContext';
import { getUserSettings } from '../services/settingsService';

const DateRangeContext = createContext(null);
const today = () => format(new Date(), 'yyyy-MM-dd');
const currentMonth = () => format(new Date(), 'yyyy-MM');

export function DateRangeProvider({ children }) {
  const { currentUser } = useAuth();
  const [dateFilter, setDateFilter] = useState('thisMonth');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
    endDate: today(),
  });
  const [pickedMonth, setPickedMonth] = useState(currentMonth());

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
    <DateRangeContext.Provider value={{ dateFilter, setDateFilter, customDateRange, setCustomDateRange, pickedMonth, setPickedMonth }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRangeContext() {
  return useContext(DateRangeContext);
}
