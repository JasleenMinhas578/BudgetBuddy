/* istanbul ignore file */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuMail, LuCheckCircle } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { useCountdown } from '../../hooks/useCountdown';
import { EMAIL_COOLDOWN_SECONDS, isRateLimitError, rateLimitMessage, retryAfterSeconds } from '../../utils/emailRateLimit';
import AuthLayout from './AuthLayout';
import AuthSubmitButton from './AuthSubmitButton';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const { error, setError, message, setMessage, loading, setLoading } = useAuthForm();
  const { resetPassword } = useAuth();
  // One reset email per address per minute (Supabase's limit) — the button
  // counts that down, then offers to send another.
  const [cooldown, startCooldown] = useCountdown();
  const sent = !!message;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      setLoading(true);

      // The emailed link opens /reset-password signed in. Supabase reports
      // success for unknown emails too, so this never reveals whether an
      // account exists.
      await resetPassword(email);
      setMessage('Check your email for a password reset link.');
      startCooldown(EMAIL_COOLDOWN_SECONDS);
    } catch (error) {
      console.error('Password reset error:', error);
      if (isRateLimitError(error)) {
        const wait = retryAfterSeconds(error);
        if (wait) startCooldown(wait);
        setError(rateLimitMessage(wait));
        return;
      }
      switch (error.code) {
        case 'email_address_invalid':
        case 'validation_failed':
          setError('Invalid email format');
          break;
        default:
          setError('Failed to send reset link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      backTo="/login"
      title="Reset Password"
      subtitle="Enter your email to receive password reset instructions"
      error={error}
      message={message}
      footer={<p>Remember your password? <Link to="/login" className="auth-link">Sign In</Link></p>}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={sent && cooldown > 0}
            />
          </div>
        </div>

        <AuthSubmitButton loading={loading} loadingText="Sending..." disabled={cooldown > 0}>
          {sent && cooldown > 0 ? (
            <>
              <LuCheckCircle size={16} />
              Link Sent · resend in {cooldown}s
            </>
          ) : cooldown > 0 ? (
            <>
              <LuMail size={16} />
              Send again in {cooldown}s
            </>
          ) : (
            <>
              <LuMail size={16} />
              {sent ? 'Send Again' : 'Send Reset Link'}
            </>
          )}
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
