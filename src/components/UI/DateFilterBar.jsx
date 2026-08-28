import { getDateFilterLabel as getActivePeriodLabel } from '../../utils/dateFilterLabel';
import { format, parseISO } from 'date-fns';

export const FILTER_BUTTONS_DEFAULT = [
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
  const currentYear = new Date().getFullYear();
  const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => currentYear - i);

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

  const periodLabel = getActivePeriodLabel(dateFilter, { pickedMonth, customDateRange });

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
            <div className="date-input-overlay-wrapper">
              <span className="date-input-display">
                {customDateRange.startDate
                  ? format(parseISO(customDateRange.startDate), 'MMMM d, yyyy')
                  : 'Select date'}
              </span>
              <input
                type="date"
                value={customDateRange.startDate}
                onChange={e => onCustomDateRangeChange(prev => ({ ...prev, startDate: e.target.value }))}
                className="date-input-picker"
              />
            </div>
          </div>
          <div className="date-input">
            <label>To</label>
            <div className="date-input-overlay-wrapper">
              <span className="date-input-display">
                {customDateRange.endDate
                  ? format(parseISO(customDateRange.endDate), 'MMMM d, yyyy')
                  : 'Select date'}
              </span>
              <input
                type="date"
                value={customDateRange.endDate}
                onChange={e => onCustomDateRangeChange(prev => ({ ...prev, endDate: e.target.value }))}
                className="date-input-picker"
              />
            </div>
          </div>
          {customDateRange.startDate && customDateRange.endDate && customDateRange.endDate < customDateRange.startDate && (
            <p style={{ color: 'var(--color-error, #ef4444)', fontSize: '0.8rem', marginTop: '6px', gridColumn: '1/-1' }}>
              End date must be on or after the start date.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
