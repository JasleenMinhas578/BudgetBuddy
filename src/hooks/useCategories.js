import { useState, useEffect } from 'react';
import { subscribeToCategories } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';

export function useCategories() {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    let unsub = () => {};
    try {
      unsub = subscribeToCategories(currentUser.uid, (data) => {
        if (data !== null) setCategories(data);
      });
    } catch (error) {
      console.error('Error setting up category subscription:', error);
    }
    return () => {
      try {
        if (typeof unsub === 'function') unsub();
      } catch (e) {
        console.error('Error during cleanup:', e);
      }
    };
  }, [currentUser]);

  return categories;
}
