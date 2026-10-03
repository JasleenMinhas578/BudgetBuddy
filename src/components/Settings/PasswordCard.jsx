import { useState } from 'react';
import { LuLock } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useCountdown } from '../../hooks/useCountdown';
import { EMAIL_COOLDOWN_SECONDS, isRateLimitError, rateLimitMessage, retryAfterSeconds } from '../../utils/emailRateLimit';

export default function PasswordCard() {
  const { currentUser, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  // Supabase allows one reset email per minute per address.
  const [cooldown, startCooldown] = useCountdown();

  const handleSend = async () => {
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      await resetPassword(currentUser.email);
      setMsg({
        text: `A password reset link has been sent to ${currentUser.email}. Open it to choose a new password.`,
        type: 'success',
      });
      startCooldown(EMAIL_COOLDOWN_SECONDS);
    } catch (error) {
      if (isRateLimitError(error)) {
        const wait = retryAfterSeconds(error);
        if (wait) startCooldown(wait);
        setMsg({ text: rateLimitMessage(wait), type: 'error' });
      } else {
        setMsg({ text: 'Failed to send reset link. Please try again.', type: 'error' });
      }
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
            We'll email a link to <strong>{currentUser?.email}</strong> where you can choose a new one.
          </p>
        </div>
      </div>
      {msg.text && <p className={`settings-feedback ${msg.type}`}>{msg.text}</p>}
      <button className="btn btn-primary settings-btn" onClick={handleSend} disabled={loading || cooldown > 0}>
        {loading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send Reset Link'}
      </button>
    </div>
  );
}
