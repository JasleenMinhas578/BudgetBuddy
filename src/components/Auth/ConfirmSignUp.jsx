import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LuMail } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { useCountdown } from '../../hooks/useCountdown';
import { authLinkError } from '../../supabaseClient';
import { EMAIL_COOLDOWN_SECONDS, isRateLimitError, rateLimitMessage, retryAfterSeconds } from '../../utils/emailRateLimit';
import AuthLayout from './AuthLayout';
import AuthSubmitButton from './AuthSubmitButton';

// Shown after signup ("check your email"), and also where the emailed
// confirmation link lands: a valid link signs the user in, so go straight
// to the dashboard; an expired one shows an error and a way to resend.
export default function ConfirmSignUp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, resendConfirmation } = useAuth();
  const [email, setEmail] = useState(location.state?.email || '');
  const { error, setError, message, setMessage, loading, setLoading } = useAuthForm();
  // Supabase sends one email per address per minute. Signup just sent one,
  // so start the "Resend in 59s" countdown instead of letting the first
  // click fail with a rate-limit error.
  const [cooldown, startCooldown] = useCountdown();
  const justSent = !!location.state?.justSent;
  useEffect(() => {
    if (justSent) startCooldown(EMAIL_COOLDOWN_SECONDS);
  }, [justSent, startCooldown]);

  useEffect(() => {
    if (currentUser) navigate('/dashboard', { replace: true });
  }, [currentUser, navigate]);

  useEffect(() => {
    if (authLinkError) {
      setError('That confirmation link is invalid or has expired. Enter your email to get a new one.');
    }
  }, [setError]);

  async function handleResend(e) {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resendConfirmation(email);
      setMessage('A new confirmation link has been sent to your email.');
      startCooldown(EMAIL_COOLDOWN_SECONDS);
    } catch (error) {
      if (isRateLimitError(error)) {
        const wait = retryAfterSeconds(error);
        if (wait) startCooldown(wait);
        setError(rateLimitMessage(wait));
      } else {
        setError('Failed to resend the link. Please check the email address.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      backTo="/login"
      title="Confirm Your Email"
      subtitle="We emailed you a confirmation link — click it to finish creating your account"
      error={error}
      message={message}
    >
      <form onSubmit={handleResend} className="auth-form">
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
            />
          </div>
        </div>

        <AuthSubmitButton loading={loading} loadingText="Sending..." disabled={cooldown > 0}>
          <LuMail size={16} />
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Confirmation Link'}
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
