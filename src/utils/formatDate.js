import { format, parseISO } from 'date-fns';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  const monthIndex = parseInt(month, 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) return dateString;
  return `${MONTHS[monthIndex]} ${day}, ${year}`;
}

export function safeFormatDate(dateStr, fmt) {
  if (!dateStr) return '';
  try { return format(parseISO(dateStr), fmt); } catch { return ''; }
}

export const toAmount = (v) => (typeof v === 'number' ? v : 0);
