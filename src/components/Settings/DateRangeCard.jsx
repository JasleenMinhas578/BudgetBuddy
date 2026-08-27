import { useState, useEffect } from 'react';
import { LuCalendar } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useDateRangeContext } from '../../context/DateRangeContext';
import { saveUserSettings, getUserSettings } from '../../services/settingsService';

const DATE_RANGE_OPTIONS = [
  { value: 'today',     label: 'Today' },
  { value: 'thisWeek',  label: 'This Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisYear',  label: 'This Year' },
  { value: 'lastYear',  label: 'Last Year' },
  { value: 'all',       label: 'All Time' },
];

export default function DateRangeCard() {
  const { currentUser } = useAuth();
  const { setDateFilter } = useDateRangeContext();
  const [defaultRange, setDefaultRange] = useState('thisMonth');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!currentUser) return;
    getUserSettings(currentUser.uid).then(settings => {
      if (settings.defaultDateFilter) setDefaultRange(settings.defaultDateFilter);
    });
  }, [currentUser]);

  const handleSave = async () => {
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      await saveUserSettings(currentUser.uid, { defaultDateFilter: defaultRange });
      setDateFilter(defaultRange);
      setMsg({ text: 'Default date range saved!', type: 'success' });
    } catch {
      setMsg({ text: 'Failed to save. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-card settings-card-green">
      <div className="settings-card-header">
        <span className="settings-card-icon"><LuCalendar size={22} /></span>
        <div>
          <h2 className="settings-card-title">Default Date Range</h2>
          <p className="settings-card-desc">
            The date range shown on every page when you log in. You can still change it per session.
          </p>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="defaultRange">Date Range</label>
        <select
          id="defaultRange"
          value={defaultRange}
          onChange={e => setDefaultRange(e.target.value)}
          className="settings-select"
        >
          {DATE_RANGE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {msg.text && <p className={`settings-feedback ${msg.type}`}>{msg.text}</p>}
      <button className="btn btn-primary settings-btn" onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Default'}
      </button>
    </div>
  );
}
