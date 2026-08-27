import { useState } from 'react';
import { LuLock } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';

export default function PasswordCard() {
  const { currentUser, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSend = async () => {
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      await resetPassword(currentUser.email);
      setMsg({
        text: `A password reset link has been sent to ${currentUser.email}. Check your inbox and click the link to set a new password.`,
        type: 'success',
      });
    } catch {
      setMsg({ text: 'Failed to send reset email. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
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
      {msg.text && <p className={`settings-feedback ${msg.type}`}>{msg.text}</p>}
      <button className="btn btn-primary settings-btn" onClick={handleSend} disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Email'}
      </button>
    </div>
  );
}
