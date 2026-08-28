import { useState, useEffect } from 'react';
import { subscribeToUserPreferences } from '../services/categoryService';

export function useHiddenCategories(currentUser) {
  const [hiddenDefaults, setHiddenDefaults] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    let unsub = () => {};
    try {
      unsub = subscribeToUserPreferences(currentUser.uid, (prefs) => {
        setHiddenDefaults(prefs.hiddenDefaultCategories || []);
      });
    } catch (e) {
      console.error('Error subscribing to user preferences:', e);
    }
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [currentUser]);

  return hiddenDefaults;
}
