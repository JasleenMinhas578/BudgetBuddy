import { format, startOfWeek, endOfWeek, subMonths, subYears } from 'date-fns';

export function getDateFilterLabel(dateFilter, { pickedMonth, customDateRange } = {}) {
  const now = new Date();
  switch (dateFilter) {
    case 'today':
      return { heading: 'Today', sub: format(now, 'MMM d, yyyy') };
    case 'thisWeek': {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });
      return { heading: 'This Week', sub: `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}` };
    }
    case 'thisMonth':
      return { heading: 'This Month', sub: format(now, 'MMMM yyyy') };
    case 'lastMonth':
      return { heading: 'Last Month', sub: format(subMonths(now, 1), 'MMMM yyyy') };
    case 'pickMonth': {
      if (!pickedMonth) return null;
      const [yr, mo] = pickedMonth.split('-').map(Number);
      return { heading: 'Selected Month', sub: format(new Date(yr, mo - 1, 1), 'MMMM yyyy') };
    }
    case 'thisYear':
      return { heading: 'This Year', sub: format(now, 'yyyy') };
    case 'lastYear':
      return { heading: 'Last Year', sub: format(subYears(now, 1), 'yyyy') };
    case 'custom': {
      const { startDate, endDate } = customDateRange || {};
      if (!startDate || !endDate) return null;
      const s = new Date(startDate + 'T00:00:00');
      const e = new Date(endDate + 'T00:00:00');
      return { heading: 'Custom Range', sub: `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}` };
    }
    case 'all':
      return { heading: 'All Time', sub: null };
    default:
      return null;
  }
}

export function getDateFilterFlatLabel(dateFilter, { pickedMonth, customDateRange } = {}) {
  const result = getDateFilterLabel(dateFilter, { pickedMonth, customDateRange });
  if (!result) return 'All Time';
  return result.sub ? `${result.heading} (${result.sub})` : result.heading;
}
