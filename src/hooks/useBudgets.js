import { useState, useEffect, useCallback } from 'react';
import { subscribeToBudgets, updateCategoryBudget, updateMonthlyBudget } from '../services/budgetService';
import { useAuth } from '../context/AuthContext';

export function useBudgets() {
  const { currentUser } = useAuth();
  const [budgets, setBudgets] = useState({ monthly: null, categories: {} });

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToBudgets(currentUser.uid, setBudgets);
    return unsub;
  }, [currentUser]);

  const setCategoryBudget = useCallback((name, amount) =>
    updateCategoryBudget(currentUser?.uid, name, amount), [currentUser]);

  const setMonthlyBudget = useCallback((amount) =>
    updateMonthlyBudget(currentUser?.uid, amount), [currentUser]);

  return { budgets, setCategoryBudget, setMonthlyBudget };
}
