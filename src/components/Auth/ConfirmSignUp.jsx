import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LuMail } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { authLinkError } from '../../supabaseClient';
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
    } catch (error) {
      switch (error.code) {
        case 'over_email_send_rate_limit':
        case 'over_request_rate_limit':
          setError('Too many emails sent. Please wait a while and try again.');
          break;
        default:
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

        <AuthSubmitButton loading={loading} loadingText="Sending...">
          <LuMail size={16} />
          Resend Confirmation Link
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
