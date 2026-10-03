/* istanbul ignore file */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuMail, LuCheckCircle } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import AuthLayout from './AuthLayout';
import AuthSubmitButton from './AuthSubmitButton';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const { error, setError, message, setMessage, loading, setLoading } = useAuthForm();
  const { resetPassword } = useAuth();

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
    } catch (error) {
      console.error('Password reset error:', error);
      switch (error.code) {
        case 'email_address_invalid':
        case 'validation_failed':
          setError('Invalid email format');
          break;
        case 'over_email_send_rate_limit':
        case 'over_request_rate_limit':
          setError('Too many requests. Please try again later');
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
              disabled={!!message}
            />
          </div>
        </div>

        <AuthSubmitButton loading={loading} loadingText="Sending..." disabled={!!message}>
          {message ? (
            <>
              <LuCheckCircle size={16} />
              Link Sent
            </>
          ) : (
            <>
              <LuMail size={16} />
              Send Reset Link
            </>
          )}
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
