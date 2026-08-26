import { useState, useEffect } from 'react';
import { subscribeToExpenses } from '../services/expenseService';
import { useAuth } from '../context/AuthContext';

export function useExpenses() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    let unsubscribe = () => {};
    try {
      unsubscribe = subscribeToExpenses(currentUser.uid, (data, err) => {
        if (!err && data !== null) setExpenses(data);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error loading expenses:', error);
      setLoading(false);
    }
    return () => unsubscribe();
  }, [currentUser]);

  return { expenses, loading };
}
