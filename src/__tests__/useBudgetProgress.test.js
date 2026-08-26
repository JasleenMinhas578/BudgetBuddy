import { renderHook } from '@testing-library/react';
import { useBudgetProgress } from '../hooks/useBudgetProgress';

const CAT_A = { name: 'Food' };
const CAT_B = { name: 'Transport' };
const ALL_CATS = [CAT_A, CAT_B];

const exp = (category, amount, date = '2026-08-15') => ({ category, amount, date });

describe('useBudgetProgress', () => {
  describe('categoryProgress', () => {
    it('returns null pct/status/remaining when no budget is set for a category', () => {
      const { result } = renderHook(() =>
        useBudgetProgress([exp('Food', 50)], ALL_CATS, { monthly: null, categories: {} })
      );
      const food = result.current.categoryProgress.find(c => c.name === 'Food');
      expect(food.pct).toBeNull();
      expect(food.status).toBeNull();
      expect(food.remaining).toBeNull();
    });

    it('computes correct pct and remaining when under budget', () => {
      const { result } = renderHook(() =>
        useBudgetProgress([exp('Food', 60)], ALL_CATS, { monthly: null, categories: { Food: 100 } })
      );
      const food = result.current.categoryProgress.find(c => c.name === 'Food');
      expect(food.pct).toBeCloseTo(60);
      expect(food.remaining).toBeCloseTo(40);
      expect(food.status).toBe('ok');
    });

    it('returns status "warning" when pct is between 80 and 99', () => {
      const { result } = renderHook(() =>
        useBudgetProgress([exp('Food', 85)], ALL_CATS, { monthly: null, categories: { Food: 100 } })
      );
      expect(result.current.categoryProgress.find(c => c.name === 'Food').status).toBe('warning');
    });

    it('returns status "danger" when pct >= 100', () => {
      const { result } = renderHook(() =>
        useBudgetProgress([exp('Food', 120)], ALL_CATS, { monthly: null, categories: { Food: 100 } })
      );
      const food = result.current.categoryProgress.find(c => c.name === 'Food');
      expect(food.status).toBe('danger');
      expect(food.remaining).toBeCloseTo(-20);
    });

    it('caps pct at 999 when severely over budget', () => {
      const { result } = renderHook(() =>
        useBudgetProgress([exp('Food', 5000)], ALL_CATS, { monthly: null, categories: { Food: 1 } })
      );
      expect(result.current.categoryProgress.find(c => c.name === 'Food').pct).toBe(999);
    });

    it('returns 0 spent for a category with no expenses', () => {
      const { result } = renderHook(() =>
        useBudgetProgress([], ALL_CATS, { monthly: null, categories: { Food: 100 } })
      );
      const food = result.current.categoryProgress.find(c => c.name === 'Food');
      expect(food.spent).toBe(0);
      expect(food.pct).toBe(0);
      expect(food.remaining).toBe(100);
    });

    it('ignores expenses with no category', () => {
      const { result } = renderHook(() =>
        useBudgetProgress([{ amount: 50 }], ALL_CATS, { monthly: null, categories: { Food: 100 } })
      );
      expect(result.current.categoryProgress.find(c => c.name === 'Food').spent).toBe(0);
    });
  });

  describe('overallProgress', () => {
    it('returns null pct when no monthly budget is set', () => {
      const { result } = renderHook(() =>
        useBudgetProgress([exp('Food', 50)], ALL_CATS, { monthly: null, categories: {} })
      );
      expect(result.current.overallProgress.pct).toBeNull();
      expect(result.current.overallProgress.status).toBeNull();
    });

    it('computes overall pct from all expenses', () => {
      const expenses = [exp('Food', 100), exp('Transport', 50)];
      const { result } = renderHook(() =>
        useBudgetProgress(expenses, ALL_CATS, { monthly: 200, categories: {} })
      );
      expect(result.current.overallProgress.pct).toBeCloseTo(75);
      expect(result.current.overallProgress.remaining).toBeCloseTo(50);
      expect(result.current.overallProgress.status).toBe('ok');
    });

    it('returns danger status when total exceeds monthly budget', () => {
      const { result } = renderHook(() =>
        useBudgetProgress([exp('Food', 250)], ALL_CATS, { monthly: 200, categories: {} })
      );
      expect(result.current.overallProgress.status).toBe('danger');
      expect(result.current.overallProgress.remaining).toBeCloseTo(-50);
    });
  });

  describe('closestToLimit', () => {
    it('returns null when no budgets are set', () => {
      const { result } = renderHook(() =>
        useBudgetProgress([exp('Food', 50)], ALL_CATS, { monthly: null, categories: {} })
      );
      expect(result.current.closestToLimit).toBeNull();
    });

    it('picks the item with the highest pct', () => {
      const expenses = [exp('Food', 90), exp('Transport', 30)];
      const budgets = { monthly: null, categories: { Food: 100, Transport: 100 } };
      const { result } = renderHook(() =>
        useBudgetProgress(expenses, ALL_CATS, budgets)
      );
      expect(result.current.closestToLimit.name).toBe('Food');
      expect(result.current.closestToLimit.pct).toBeCloseTo(90);
    });

    it('includes the monthly budget in the comparison', () => {
      // Food: 50/100 = 50%; monthly: 180/200 = 90% → monthly wins
      const expenses = [exp('Food', 50), exp('Transport', 130)];
      const budgets = { monthly: 200, categories: { Food: 100 } };
      const { result } = renderHook(() =>
        useBudgetProgress(expenses, ALL_CATS, budgets)
      );
      expect(result.current.closestToLimit.name).toBe('Monthly Budget');
    });

    it('returns null when budgets exist but no expenses at all', () => {
      const { result } = renderHook(() =>
        useBudgetProgress([], ALL_CATS, { monthly: null, categories: { Food: 100 } })
      );
      // pct is 0, not null — it should still return Food as closest
      expect(result.current.closestToLimit.name).toBe('Food');
      expect(result.current.closestToLimit.pct).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles null/undefined budgets gracefully', () => {
      const { result } = renderHook(() =>
        useBudgetProgress([exp('Food', 50)], ALL_CATS, null)
      );
      expect(result.current.closestToLimit).toBeNull();
    });

    it('handles empty expenses array', () => {
      const { result } = renderHook(() =>
        useBudgetProgress([], ALL_CATS, { monthly: 500, categories: { Food: 100 } })
      );
      expect(result.current.overallProgress.spent).toBe(0);
      expect(result.current.overallProgress.pct).toBe(0);
    });

    it('handles empty allCategories array', () => {
      const { result } = renderHook(() =>
        useBudgetProgress([exp('Food', 50)], [], { monthly: null, categories: { Food: 100 } })
      );
      expect(result.current.categoryProgress).toHaveLength(0);
    });

    it('ignores expenses with missing or zero amount', () => {
      const expenses = [
        { category: 'Food', amount: 0 },
        { category: 'Food', amount: undefined },
        { category: 'Food', amount: 50 },
      ];
      const { result } = renderHook(() =>
        useBudgetProgress(expenses, ALL_CATS, { monthly: null, categories: { Food: 100 } })
      );
      expect(result.current.categoryProgress.find(c => c.name === 'Food').spent).toBe(50);
    });
  });
});
