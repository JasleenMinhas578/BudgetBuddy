import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/main.css';

export default function Settings() {
  const { currentUser, updateDisplayName, resetPassword } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState({ text: '', type: '' });

  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState({ text: '', type: '' });

  const handleUpdateName = async (e) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      return setNameMsg({ text: 'Display name cannot be empty.', type: 'error' });
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

      {/* Display Name */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">👤</span>
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
              maxLength={50}
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

      {/* Change Password */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🔒</span>
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
          className="btn btn-secondary settings-btn"
          onClick={handleSendResetEmail}
          disabled={emailLoading}
        >
          {emailLoading ? 'Sending...' : 'Send Reset Email'}
        </button>
      </div>
    </div>
  );
}
