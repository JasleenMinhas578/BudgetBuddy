import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LuWallet, LuLogIn } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import AuthLayout from './AuthLayout';
import AuthSubmitButton from './AuthSubmitButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { error, setError, message, setMessage, loading, setLoading } = useAuthForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
        case 'auth/invalid-credential':
          setError('Invalid email or password');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/invalid-email':
          setError('Invalid email format');
          break;
        case 'auth/too-many-requests':
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
      logoIcon={<LuWallet size={32} />}
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
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
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
