import { useState, useEffect, useCallback } from 'react';
import { subscribeToBudgets, updateCategoryBudget, updateMonthlyBudget } from '../services/budgetService';
import { useAuth } from '../context/AuthContext';

export function useBudgets() {
  const { currentUser } = useAuth();
  const [budgets, setBudgets] = useState({ monthly: null, categories: {} });

  useEffect(() => {
    if (!currentUser) return;
    let unsub = () => {};
    try {
      let cleanedLegacyZeros = false;
      unsub = subscribeToBudgets(currentUser.uid, (data) => {
        setBudgets(data);
        // Clean up legacy $0 entries once — only on the first snapshot so we don't
        // write back to Firestore on every subsequent budget update.
        if (!cleanedLegacyZeros) {
          cleanedLegacyZeros = true;
          const zeroCats = Object.entries(data.categories || {}).filter(([, v]) => v === 0);
          zeroCats.forEach(([name]) => updateCategoryBudget(currentUser.uid, name, null));
        }
      });
    } catch (err) {
      console.error('Budget listener setup error:', err);
    }
    return unsub;
  }, [currentUser]);

  const setCategoryBudget = useCallback((name, amount) =>
    updateCategoryBudget(currentUser?.uid, name, amount), [currentUser]);

  const setMonthlyBudget = useCallback((amount) =>
    updateMonthlyBudget(currentUser?.uid, amount), [currentUser]);

  return { budgets, setCategoryBudget, setMonthlyBudget };
}
