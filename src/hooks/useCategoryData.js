import { useMemo } from 'react';
import { getCategoryColor } from '../utils/getCategoryColor';
import { validCategory } from '../utils/categoryUtils';

export function useCategoryData(filteredExpenses, allCategories) {
  const categoryData = useMemo(() => {
    const categoryMap = {};

    // Seed every known category with 0 so they appear in the chart even with no spend.
    // If a category was deleted, expenses for it are added on the fly so they aren't silently lost.
    allCategories.forEach((cat) => {
      if (validCategory(cat.name)) categoryMap[cat.name] = 0;
    });

    filteredExpenses.forEach((expense) => {
      if (!validCategory(expense.category)) return;
      if (!Object.prototype.hasOwnProperty.call(categoryMap, expense.category)) {
        categoryMap[expense.category] = 0;
      }
      categoryMap[expense.category] += expense.amount || 0;
    });

    const labels = [];
    const data = [];
    const backgroundColor = [];

    Object.entries(categoryMap).forEach(([label, value]) => {
      if (value > 0 && validCategory(label)) {
        labels.push(label);
        data.push(value);
        backgroundColor.push(getCategoryColor(label));
      }
    });

    return { labels, datasets: [{ label: 'Spending', data, backgroundColor }] };
  }, [filteredExpenses, allCategories]);

  const totalSpent = useMemo(
    () => categoryData.datasets[0].data.reduce((sum, val) => sum + val, 0),
    [categoryData]
  );

  return { categoryData, totalSpent };
}
