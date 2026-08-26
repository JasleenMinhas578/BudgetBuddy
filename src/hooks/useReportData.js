import { useMemo } from 'react';
import { format, parseISO, parse } from 'date-fns';
import { getCategoryColor } from '../utils/getCategoryColor';

const safeFormatDate = (dateStr, fmt) => {
  if (!dateStr) return '';
  try { return format(parseISO(dateStr), fmt); } catch { return ''; }
};

const validCategory = (c) =>
  c && c !== 'undefined' && c !== 'null' && typeof c === 'string' && c.trim() !== '';

const toAmount = (v) => (typeof v === 'number' ? v : 0);

export function useReportData(filteredExpenses) {
  const totalAmount = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + toAmount(e.amount), 0),
    [filteredExpenses]
  );

  const averageAmount = useMemo(
    () => (filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0),
    [filteredExpenses, totalAmount]
  );

  const categoryData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((e) => {
      if (!validCategory(e.category)) return;
      map[e.category] = (map[e.category] || 0) + toAmount(e.amount);
    });
    const labels = Object.keys(map).filter((l) => map[l] > 0);
    return {
      labels,
      datasets: [{ data: labels.map((l) => map[l]), backgroundColor: labels.map(getCategoryColor) }],
    };
  }, [filteredExpenses]);

  const monthlyData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((e) => {
      const month = safeFormatDate(e.date, 'MMM yyyy');
      if (!month) return;
      map[month] = (map[month] || 0) + toAmount(e.amount);
    });
    const sorted = Object.keys(map).sort(
      (a, b) => parse(a, 'MMM yyyy', new Date()) - parse(b, 'MMM yyyy', new Date())
    );
    return {
      labels: sorted,
      datasets: [{
        label: 'Monthly Spending',
        data: sorted.map((m) => map[m]),
        borderColor: '#4fd1c5',
        backgroundColor: 'rgba(79, 209, 197, 0.1)',
        tension: 0.4,
      }],
    };
  }, [filteredExpenses]);

  const { topCategory, maxAmount } = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((e) => {
      if (!validCategory(e.category)) return;
      map[e.category] = (map[e.category] || 0) + toAmount(e.amount);
    });
    let topCategory = null;
    let maxAmount = 0;
    for (const [cat, amt] of Object.entries(map)) {
      if (amt > maxAmount) { topCategory = cat; maxAmount = amt; }
    }
    return { topCategory, maxAmount };
  }, [filteredExpenses]);

  const spendingInsights = useMemo(() => {
    if (filteredExpenses.length === 0) return [];
    const insights = [];
    const topPct = totalAmount > 0 ? (maxAmount / totalAmount) * 100 : 0;
    if (topCategory && topPct > 30)
      insights.push(`You spend ${topPct.toFixed(1)}% of your money on ${topCategory}`);
    if (averageAmount > 20)
      insights.push(`Your average transaction is $${averageAmount.toFixed(2)}, consider reviewing larger expenses`);
    if (filteredExpenses.length > 10)
      insights.push(`You have ${filteredExpenses.length} transactions in this period`);
    return insights;
  }, [filteredExpenses, totalAmount, maxAmount, topCategory, averageAmount]);

  return { totalAmount, averageAmount, categoryData, monthlyData, topCategory, maxAmount, spendingInsights };
}
