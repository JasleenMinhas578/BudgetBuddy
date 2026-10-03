import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LuLogIn, LuEye, LuEyeOff } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { clearSignedOutReason, signedOutReason } from '../../utils/idleSession';
import AuthLayout from './AuthLayout';
import AuthSubmitButton from './AuthSubmitButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { error, setError, message, setMessage, loading, setLoading } = useAuthForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Signed out by the idle timer — say so, once.
  useEffect(() => {
    const reason = signedOutReason();
    if (reason) {
      setMessage(reason);
      clearSignedOutReason();
    }
  }, [setMessage]);

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, setMessage]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      switch (error.code) {
        case 'invalid_credentials':
          setError('Invalid email or password');
          break;
        case 'email_not_confirmed':
          navigate('/confirm-signup', { state: { email } });
          break;
        case 'email_address_invalid':
        case 'validation_failed':
          setError('Invalid email format');
          break;
        case 'over_request_rate_limit':
          setError('Too many attempts. Please try again later.');
          break;
        default:
          setError('Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      backTo="/"
      title="Welcome Back"
      subtitle="Sign in to your BudgetBuddy account"
      error={error}
      message={message}
      footer={<p>Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link></p>}
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
          <div className="form-group-header">
            <label htmlFor="password">Password</label>
            <Link to="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
          </div>
          <div className="input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <span
              className="input-eye"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(v => !v); }}
            >
              {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
            </span>
          </div>
        </div>

        <AuthSubmitButton loading={loading} loadingText="Signing in...">
          <LuLogIn size={16} />
          Sign In
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
