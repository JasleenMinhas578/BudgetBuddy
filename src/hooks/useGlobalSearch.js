import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from './useExpenses';
import { subscribeToCategories } from '../services/categoryService';
import {
  LuShoppingCart, LuCar, LuTag, LuZap, LuHome,
  LuGamepad2, LuHeart, LuBook, LuPlane, LuMoreHorizontal,
} from 'react-icons/lu';

const DEFAULT_CATEGORY_ICONS = {
  Food: LuShoppingCart,
  Transport: LuCar,
  Entertainment: LuGamepad2,
  Utilities: LuZap,
  Rent: LuHome,
  Health: LuHeart,
  Education: LuBook,
  Travel: LuPlane,
  Other: LuMoreHorizontal,
};

const MAX_RESULTS = 4;

export function useGlobalSearch(query) {
  const { currentUser } = useAuth();
  const { expenses } = useExpenses();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    let unsub = () => {};
    try {
      unsub = subscribeToCategories(currentUser.uid, (data) => {
        if (data) setCategories(data);
      });
    } catch (e) {
      console.error('useGlobalSearch: category subscribe failed', e);
    }
    return () => unsub();
  }, [currentUser]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { expenses: [], categories: [] };

    const matchedExpenses = expenses
      .filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        String(e.amount ?? '').includes(q)
      )
      .slice(0, MAX_RESULTS)
      .map(e => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: e.date,
      }));

    const allCategoryNames = [
      ...Object.keys(DEFAULT_CATEGORY_ICONS).map(name => ({ name, isDefault: true })),
      ...categories.map(c => ({ name: c.name, isDefault: false })),
    ];

    const matchedCategories = allCategoryNames
      .filter(c => c.name?.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS)
      .map(c => {
        const Icon = DEFAULT_CATEGORY_ICONS[c.name] || LuTag;
        const total = expenses
          .filter(e => e.category === c.name)
          .reduce((sum, e) => sum + (e.amount || 0), 0);
        return { name: c.name, Icon, total };
      });

    return { expenses: matchedExpenses, categories: matchedCategories };
  }, [query, expenses, categories]);

  return results;
}
