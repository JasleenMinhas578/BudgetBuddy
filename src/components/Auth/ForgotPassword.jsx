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

      const resetUrl = `${window.location.origin}/reset-password`;
      const actionCodeSettings = {
        url: resetUrl,
        handleCodeInApp: false,
      };

      try {
        await resetPassword(email, actionCodeSettings);
      } catch (urlError) {
        if (urlError.code === 'auth/unauthorized-continue-uri' || urlError.code === 'auth/invalid-continue-uri') {
          await resetPassword(email);
        } else {
          throw urlError;
        }
      }

      setMessage('Check your email for password reset instructions. If you don\'t see it, check your spam folder.');
    } catch (error) {
      console.error('Password reset error:', error);
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
          // Don't reveal whether the account exists — show the same success message
          setMessage('Check your email for password reset instructions. If you don\'t see it, check your spam folder.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email format');
          break;
        case 'auth/too-many-requests':
          setError('Too many requests. Please try again later');
          break;
        case 'auth/invalid-continue-uri':
          setError('Invalid redirect URL. Please contact support.');
          break;
        case 'auth/unauthorized-continue-uri':
          setError('Unauthorized redirect URL. The domain must be authorized in Firebase.');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
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
              Email Sent
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
