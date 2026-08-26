// Fixed colour per default category — same across every chart in the app
const FIXED_COLORS = {
  'Food':          '#4fd1c5', // teal
  'Transport':     '#f6ad55', // amber
  'Entertainment': '#f687b3', // pink
  'Utilities':     '#68d391', // green
  'Rent':          '#63b3ed', // blue
  'Shopping':      '#f97316', // orange
  'Other':         '#b794f4', // violet
};

// Fallback pool for user-created categories
const COLOR_POOL = [
  '#fc8181', '#fbbf24', '#34d399', '#60a5fa',
  '#a78bfa', '#fb7185', '#38bdf8', '#f472b6',
];

// Deterministic hash so the same custom category name always picks the same colour
function hashName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h % COLOR_POOL.length;
}

export function getCategoryColor(categoryName) {
  if (!categoryName) return COLOR_POOL[0];
  return FIXED_COLORS[categoryName] ?? COLOR_POOL[hashName(categoryName)];
}
