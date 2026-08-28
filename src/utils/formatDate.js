import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';

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

export const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getCurrentMonthExpenses = (expenses) => {
  const now = new Date();
  const start = format(startOfMonth(now), 'yyyy-MM-dd');
  const end = format(endOfMonth(now), 'yyyy-MM-dd');
  return expenses.filter((e) => e.date >= start && e.date <= end);
};
