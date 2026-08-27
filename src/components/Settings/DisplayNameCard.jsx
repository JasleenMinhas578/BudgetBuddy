import { useState } from 'react';
import { LuUser } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';

export default function DisplayNameCard() {
  const { currentUser, updateDisplayName } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) return setMsg({ text: 'Display name cannot be empty.', type: 'error' });
    if (trimmed.length > 15) return setMsg({ text: 'Display name must be 15 characters or fewer.', type: 'error' });
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      await updateDisplayName(trimmed);
      setMsg({ text: 'Display name updated successfully!', type: 'success' });
    } catch {
      setMsg({ text: 'Failed to update display name. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-card">
      <div className="settings-card-header">
        <span className="settings-card-icon"><LuUser size={22} /></span>
        <div>
          <h2 className="settings-card-title">Display Name</h2>
          <p className="settings-card-desc">This name appears across your dashboard.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="settings-form">
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
        {msg.text && <p className={`settings-feedback ${msg.type}`}>{msg.text}</p>}
        <button type="submit" className="btn btn-primary settings-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Name'}
        </button>
      </form>
    </div>
  );
}
