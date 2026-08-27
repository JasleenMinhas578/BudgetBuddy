import { useMemo } from 'react';
import { parse, parseISO } from 'date-fns';
import { getCategoryColor } from '../utils/getCategoryColor';
import { safeFormatDate, toAmount } from '../utils/formatDate';
import { validCategory } from '../utils/categoryUtils';
import { useCurrency } from '../context/CurrencyContext';

export function useReportData(filteredExpenses) {
  const { formatAmount } = useCurrency();
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
    const { labels, datasets } = categoryData;
    const amounts = datasets[0].data;
    let topCategory = null;
    let maxAmount = 0;
    labels.forEach((label, i) => {
      if (amounts[i] > maxAmount) { topCategory = label; maxAmount = amounts[i]; }
    });
    return { topCategory, maxAmount };
  }, [categoryData]);

  const spendingInsights = useMemo(() => {
    if (filteredExpenses.length === 0) return [];
    const insights = [];

    // Top category by percentage
    const topPct = totalAmount > 0 ? (maxAmount / totalAmount) * 100 : 0;
    if (topCategory && topPct > 25)
      insights.push(`${topCategory} takes up ${topPct.toFixed(0)}% of your spending this period.`);

    // Largest single expense
    const largest = filteredExpenses.reduce(
      (max, e) => toAmount(e.amount) > toAmount(max.amount) ? e : max,
      filteredExpenses[0]
    );
    if (largest?.title)
      insights.push(`Your largest expense was "${largest.title}" at ${formatAmount(toAmount(largest.amount))}.`);

    // Most frequent category by count (skip if same as top-spend category)
    const countMap = {};
    filteredExpenses.forEach(e => {
      if (validCategory(e.category)) countMap[e.category] = (countMap[e.category] || 0) + 1;
    });
    const topByCount = Object.entries(countMap).sort(([, a], [, b]) => b - a)[0];
    if (topByCount && topByCount[1] >= 3 && topByCount[0] !== topCategory)
      insights.push(`You made ${topByCount[1]} purchases in ${topByCount[0]} — your most active category.`);

    // Day of week with most spending
    const dayMap = {};
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    filteredExpenses.forEach(e => {
      if (!e.date) return;
      try {
        const day = DAYS[parseISO(e.date).getDay()];
        dayMap[day] = (dayMap[day] || 0) + toAmount(e.amount);
      } catch {}
    });
    const topDay = Object.entries(dayMap).sort(([, a], [, b]) => b - a)[0];
    if (topDay)
      insights.push(`You spend the most on ${topDay[0]}s (${formatAmount(topDay[1])} total).`);

    // Average transaction
    if (averageAmount >= 5)
      insights.push(`Your average transaction is ${formatAmount(averageAmount)}.`);

    // Transaction count
    if (filteredExpenses.length >= 5)
      insights.push(`You logged ${filteredExpenses.length} transactions this period.`);

    return insights.slice(0, 5);
  }, [filteredExpenses, totalAmount, maxAmount, topCategory, averageAmount, formatAmount]);

  return { totalAmount, averageAmount, categoryData, monthlyData, topCategory, maxAmount, spendingInsights };
}
