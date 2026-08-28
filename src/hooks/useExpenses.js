import { useState, useEffect } from 'react';
import { subscribeToExpenses } from '../services/expenseService';
import { useAuth } from '../context/AuthContext';

export function useExpenses() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let unsubscribe = () => {};
    try {
      unsubscribe = subscribeToExpenses(currentUser.uid, (data, err) => {
        if (err) {
          setError(err);
        } else if (data !== null) {
          setExpenses(data);
        }
        setLoading(false);
      });
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError(err);
      setLoading(false);
    }
    return () => unsubscribe();
  }, [currentUser]);

  return { expenses, loading, error };
}
