const CATEGORY_ICONS = {
  'Food': '🍕',
  'Transport': '🚗',
  'Entertainment': '🎬',
  'Utilities': '💡',
  'Rent': '🏠',
  'Other': '📦'
};

export function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || '📊';
}
