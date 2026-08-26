import { format, parseISO } from 'date-fns';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${MONTHS[parseInt(month, 10) - 1]} ${day}, ${year}`;
}

export function safeFormatDate(dateStr, fmt) {
  if (!dateStr) return '';
  try { return format(parseISO(dateStr), fmt); } catch { return ''; }
}

export const toAmount = (v) => (typeof v === 'number' ? v : 0);

export const formatCurrency = (v) => `$${toAmount(v).toFixed(2)}`;
