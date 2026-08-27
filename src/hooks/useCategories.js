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
    } catch {}
    return () => unsub();
  }, [currentUser]);

  return categories;
}
