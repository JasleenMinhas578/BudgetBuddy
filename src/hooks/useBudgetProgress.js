import { useMemo } from 'react';

const getStatus = (pct) => (pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'ok');

export function useBudgetProgress(filteredExpenses, allCategories, budgets) {
  return useMemo(() => {
    const { monthly = null, categories: catBudgets = {} } = budgets || {};

    const spendMap = {};
    filteredExpenses.forEach((e) => {
      if (e.category) spendMap[e.category] = (spendMap[e.category] || 0) + (e.amount || 0);
    });

    const categoryProgress = allCategories.map((cat) => {
      const spent = spendMap[cat.name] || 0;
      const rawBudget = catBudgets[cat.name];
      const budget = (rawBudget !== null && rawBudget !== undefined && rawBudget > 0) ? rawBudget : null;
      // budget===0 with any spending is 100%+ over; budget===null means no goal set
      const pct = budget !== null
        ? (budget > 0 ? Math.min((spent / budget) * 100, 999) : (spent > 0 ? 999 : 0))
        : null;
      return {
        name: cat.name,
        spent,
        budget,
        pct,
        remaining: budget !== null ? budget - spent : null,
        status: pct !== null ? getStatus(pct) : null,
      };
    });

    const totalSpent = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const overallPct = monthly > 0 ? Math.min((totalSpent / monthly) * 100, 999) : null;
    const overallProgress = {
      spent: totalSpent,
      budget: monthly,
      pct: overallPct,
      remaining: monthly !== null ? monthly - totalSpent : null,
      status: overallPct !== null ? getStatus(overallPct) : null,
    };

    const candidates = [...categoryProgress.filter((c) => c.pct !== null)];
    if (overallPct !== null) candidates.push({ name: 'Monthly Budget', ...overallProgress });
    const closestToLimit = candidates.sort((a, b) => b.pct - a.pct)[0] || null;

    return { categoryProgress, overallProgress, closestToLimit };
  }, [filteredExpenses, allCategories, budgets]);
}
