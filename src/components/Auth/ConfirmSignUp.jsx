import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LuShieldCheck } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import AuthLayout from './AuthLayout';
import AuthSubmitButton from './AuthSubmitButton';

export default function ConfirmSignUp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { confirmSignup, resendConfirmationCode } = useAuth();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const { error, setError, message, setMessage, loading, setLoading } = useAuthForm();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await confirmSignup(email, code);
      navigate('/login', {
        state: { message: 'Email confirmed! Please sign in.' },
      });
    } catch (error) {
      switch (error.code) {
        case 'CodeMismatchException':
          setError('Incorrect code. Please check your email and try again.');
          break;
        case 'ExpiredCodeException':
          setError('This code has expired. Request a new one below.');
          break;
        default:
          setError('Failed to confirm your account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      setError('');
      setMessage('');
      await resendConfirmationCode(email);
      setMessage('A new code has been sent to your email.');
    } catch {
      setError('Failed to resend code. Please check the email address.');
    }
  }

  return (
    <AuthLayout
      backTo="/login"
      title="Confirm Your Email"
      subtitle="Enter the code we emailed you to finish creating your account"
      error={error}
      message={message}
      footer={
        <p>
          Didn't get a code?{' '}
          <button
            type="button"
            className="auth-link"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
            onClick={handleResend}
          >
            Resend code
          </button>
        </p>
      }
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
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="code">Confirmation Code</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              inputMode="numeric"
              required
            />
          </div>
        </div>

        <AuthSubmitButton loading={loading} loadingText="Confirming...">
          <LuShieldCheck size={16} />
          Confirm Account
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
