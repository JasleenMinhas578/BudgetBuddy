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
        text: `A password reset code has been sent to ${currentUser.email}. Use it on the "Reset Password" page to set a new one.`,
        type: 'success',
      });
    } catch {
      setMsg({ text: 'Failed to send reset code. Please try again.', type: 'error' });
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
            We'll send a code to <strong>{currentUser?.email}</strong>. Use it on the "Reset Password" page to choose a new one.
          </p>
        </div>
      </div>
      {msg.text && <p className={`settings-feedback ${msg.type}`}>{msg.text}</p>}
      <button className="btn btn-primary settings-btn" onClick={handleSend} disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Code'}
      </button>
    </div>
  );
}
