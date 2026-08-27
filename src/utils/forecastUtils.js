export function getMonthEndForecast(filteredExpenses) {
  const now = new Date();
  const daysElapsed = now.getDate();
  if (filteredExpenses.length === 0) return null;

  const total = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const dailyAvg = total / daysElapsed;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return { forecast: dailyAvg * daysInMonth, dailyAvg };
}
