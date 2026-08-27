import { useState, useEffect } from 'react';
import { LuUser, LuLock, LuCalendar } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useDateRangeContext } from '../../context/DateRangeContext';
import { saveUserSettings, getUserSettings } from '../../services/settingsService';
import '../../styles/main.css';

const DATE_RANGE_OPTIONS = [
  { value: 'today',     label: 'Today' },
  { value: 'thisWeek',  label: 'This Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisYear',  label: 'This Year' },
  { value: 'lastYear',  label: 'Last Year' },
  { value: 'all',       label: 'All Time' },
];

export default function Settings() {
  const { currentUser, updateDisplayName, resetPassword } = useAuth();
  const { setDateFilter } = useDateRangeContext();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState({ text: '', type: '' });

  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState({ text: '', type: '' });

  const [defaultRange, setDefaultRange] = useState('thisMonth');
  const [rangeLoading, setRangeLoading] = useState(false);
  const [rangeMsg, setRangeMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!currentUser) return;
    getUserSettings(currentUser.uid).then(settings => {
      if (settings.defaultDateFilter) setDefaultRange(settings.defaultDateFilter);
    });
  }, [currentUser]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      return setNameMsg({ text: 'Display name cannot be empty.', type: 'error' });
    }
    if (trimmed.length > 15) {
      return setNameMsg({ text: 'Display name must be 15 characters or fewer.', type: 'error' });
    }
    setNameLoading(true);
    setNameMsg({ text: '', type: '' });
    try {
      await updateDisplayName(trimmed);
      setNameMsg({ text: 'Display name updated successfully!', type: 'success' });
    } catch {
      setNameMsg({ text: 'Failed to update display name. Please try again.', type: 'error' });
    } finally {
      setNameLoading(false);
    }
  };

  const handleSaveDefaultRange = async () => {
    setRangeLoading(true);
    setRangeMsg({ text: '', type: '' });
    try {
      await saveUserSettings(currentUser.uid, { defaultDateFilter: defaultRange });
      setDateFilter(defaultRange);
      setRangeMsg({ text: 'Default date range saved!', type: 'success' });
    } catch {
      setRangeMsg({ text: 'Failed to save. Please try again.', type: 'error' });
    } finally {
      setRangeLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    setEmailLoading(true);
    setEmailMsg({ text: '', type: '' });
    try {
      await resetPassword(currentUser.email);
      setEmailMsg({
        text: `A password reset link has been sent to ${currentUser.email}. Check your inbox and click the link to set a new password.`,
        type: 'success',
      });
    } catch {
      setEmailMsg({ text: 'Failed to send reset email. Please try again.', type: 'error' });
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Account Settings</h1>
        <p className="settings-subtitle">Manage your profile and security preferences.</p>
      </div>

      {/* All 3 cards in one horizontal row */}
      <div className="settings-cards-grid">
        {/* Display Name */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"><LuUser size={22} /></span>
            <div>
              <h2 className="settings-card-title">Display Name</h2>
              <p className="settings-card-desc">This name appears across your dashboard.</p>
            </div>
          </div>

          <form onSubmit={handleUpdateName} className="settings-form">
            <div className="form-group">
              <label htmlFor="displayName">Name</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                maxLength={15}
              />
            </div>

            {nameMsg.text && (
              <p className={`settings-feedback ${nameMsg.type}`}>{nameMsg.text}</p>
            )}

            <button type="submit" className="btn btn-primary settings-btn" disabled={nameLoading}>
              {nameLoading ? 'Saving...' : 'Save Name'}
            </button>
          </form>
        </div>

        {/* Default Date Range */}
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

          {rangeMsg.text && (
            <p className={`settings-feedback ${rangeMsg.type}`}>{rangeMsg.text}</p>
          )}

          <button
            className="btn btn-primary settings-btn"
            onClick={handleSaveDefaultRange}
            disabled={rangeLoading}
          >
            {rangeLoading ? 'Saving...' : 'Save Default'}
          </button>
        </div>

        {/* Change Password */}
        <div className="settings-card settings-card-violet">
          <div className="settings-card-header">
            <span className="settings-card-icon"><LuLock size={22} /></span>
            <div>
              <h2 className="settings-card-title">Change Password</h2>
              <p className="settings-card-desc">
                We'll send a secure link to <strong>{currentUser?.email}</strong>. Open the email and click the link to choose a new password.
              </p>
            </div>
          </div>

          {emailMsg.text && (
            <p className={`settings-feedback ${emailMsg.type}`}>{emailMsg.text}</p>
          )}

          <button
            className="btn btn-primary settings-btn"
            onClick={handleSendResetEmail}
            disabled={emailLoading}
          >
            {emailLoading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </div>
      </div>
    </div>
  );
}
