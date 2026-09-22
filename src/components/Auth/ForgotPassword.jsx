/* istanbul ignore file */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuMail, LuCheckCircle } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import AuthLayout from './AuthLayout';
import AuthSubmitButton from './AuthSubmitButton';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const { error, setError, message, setMessage, loading, setLoading } = useAuthForm();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      setLoading(true);

      // Cognito's recovery flow is a short emailed code, not a clickable
      // link, so there's no continue-URL/redirect-domain config needed here.
      await resetPassword(email);
      setMessage('Check your email for a password reset code.');
      setTimeout(() => navigate('/reset-password', { state: { email } }), 1200);
    } catch (error) {
      console.error('Password reset error:', error);
      switch (error.code) {
        case 'UserNotFoundException':
          // Don't reveal whether the account exists — behave the same as success
          setMessage('Check your email for a password reset code.');
          setTimeout(() => navigate('/reset-password', { state: { email } }), 1200);
          break;
        case 'InvalidParameterException':
          setError('Invalid email format');
          break;
        case 'LimitExceededException':
          setError('Too many requests. Please try again later');
          break;
        default:
          setError('Failed to send reset code. Please try again.');
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
              Code Sent
            </>
          ) : (
            <>
              <LuMail size={16} />
              Send Reset Code
            </>
          )}
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
