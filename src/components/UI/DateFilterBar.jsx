import { format, startOfWeek, endOfWeek, subMonths, subYears } from 'date-fns';

function getActivePeriodLabel(dateFilter, pickedMonth, customDateRange) {
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

export const FILTER_BUTTONS_DEFAULT = [
  { key: 'today',      label: 'Today'        },
  { key: 'thisWeek',   label: 'This Week'    },
  { key: 'thisMonth',  label: 'This Month'   },
  { key: 'lastMonth',  label: 'Last Month'   },
  { key: 'pickMonth',  label: 'Select Month' },
  { key: 'thisYear',   label: 'This Year'    },
  { key: 'lastYear',   label: 'Last Year'    },
  { key: 'all',        label: 'All Time'     },
  { key: 'custom',     label: 'Custom Range' },
];

export const FILTER_BUTTONS_REPORTS = [
  { key: 'all',        label: 'All Time'     },
  { key: 'today',      label: 'Today'        },
  { key: 'thisWeek',   label: 'This Week'    },
  { key: 'thisMonth',  label: 'This Month'   },
  { key: 'lastMonth',  label: 'Last Month'   },
  { key: 'pickMonth',  label: 'Select Month' },
  { key: 'thisYear',   label: 'This Year'    },
  { key: 'lastYear',   label: 'Last Year'    },
  { key: 'custom',     label: 'Custom Range' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => currentYear - i);

export default function DateFilterBar({
  dateFilter,
  onChange,
  customDateRange,
  onCustomDateRangeChange,
  pickedMonth,
  onPickedMonthChange,
  availableMonths,
  buttons = FILTER_BUTTONS_DEFAULT,
  onPageReset,
  title = 'Date Range',
}) {
  // Build sorted list of "yyyy-MM" values with data, newest first
  const monthOptions = availableMonths && availableMonths.size > 0
    ? [...availableMonths].sort((a, b) => b.localeCompare(a)).map(value => {
        const [yr, mo] = value.split('-').map(Number);
        return { value, label: `${MONTH_NAMES[mo - 1]} ${yr}` };
      })
    : YEAR_OPTIONS.flatMap(yr =>
        MONTH_NAMES.map((name, i) => ({
          value: `${yr}-${String(i + 1).padStart(2, '0')}`,
          label: `${name} ${yr}`,
        }))
      );

  const periodLabel = getActivePeriodLabel(dateFilter, pickedMonth, customDateRange);

  return (
    <div className="date-filter-bar">
      <div className="date-filter-header">
        <span className="date-filter-label">{title}</span>
        {periodLabel && (
          <p className="date-filter-period">
            <strong>{periodLabel.heading}</strong>
            {periodLabel.sub && <span> · {periodLabel.sub}</span>}
          </p>
        )}
      </div>
      <div className="filter-buttons">
        {buttons.map(({ key, label }) => {
          if (key === 'pickMonth') {
            return (
              <select
                key={key}
                className={`filter-btn ${dateFilter === 'pickMonth' ? 'active' : ''}`}
                value={dateFilter === 'pickMonth' ? pickedMonth : ''}
                onChange={e => {
                  if (!e.target.value) return;
                  onChange('pickMonth');
                  onPickedMonthChange(e.target.value);
                  onPageReset?.();
                }}
              >
                <option value="" disabled>{label}</option>
                {monthOptions.map(({ value, label: optLabel }) => (
                  <option key={value} value={value}>{optLabel}</option>
                ))}
              </select>
            );
          }
          return (
            <button
              key={key}
              className={`filter-btn ${dateFilter === key ? 'active' : ''}`}
              onClick={() => { onChange(key); onPageReset?.(); }}
            >
              {label}
            </button>
          );
        })}
      </div>
      {dateFilter === 'custom' && (
        <div className="custom-date-inputs">
          <div className="date-input">
            <label>From</label>
            <input
              type="date"
              value={customDateRange.startDate}
              onChange={e => onCustomDateRangeChange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div className="date-input">
            <label>To</label>
            <input
              type="date"
              value={customDateRange.endDate}
              onChange={e => onCustomDateRangeChange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
