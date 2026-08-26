export const FILTER_BUTTONS_DEFAULT = [
  { key: 'today',     label: 'Today'        },
  { key: 'thisWeek',  label: 'This Week'    },
  { key: 'thisMonth', label: 'This Month'   },
  { key: 'lastMonth', label: 'Last Month'   },
  { key: 'thisYear',  label: 'This Year'    },
  { key: 'lastYear',  label: 'Last Year'    },
  { key: 'all',       label: 'All Time'     },
  { key: 'custom',    label: 'Custom Range' },
];

export const FILTER_BUTTONS_REPORTS = [
  { key: 'all',       label: 'All Time'     },
  { key: 'today',     label: 'Today'        },
  { key: 'thisWeek',  label: 'This Week'    },
  { key: 'thisMonth', label: 'This Month'   },
  { key: 'lastMonth', label: 'Last Month'   },
  { key: 'thisYear',  label: 'This Year'    },
  { key: 'lastYear',  label: 'Last Year'    },
  { key: 'custom',    label: 'Custom Range' },
];

export default function DateFilterBar({
  dateFilter,
  onChange,
  customDateRange,
  onCustomDateRangeChange,
  buttons = FILTER_BUTTONS_DEFAULT,
  onPageReset,
}) {
  return (
    <div className="date-filter-bar">
      <div className="filter-buttons">
        {buttons.map(({ key, label }) => (
          <button
            key={key}
            className={`filter-btn ${dateFilter === key ? 'active' : ''}`}
            onClick={() => { onChange(key); onPageReset?.(); }}
          >
            {label}
          </button>
        ))}
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
