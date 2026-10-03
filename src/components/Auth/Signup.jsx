import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuUserPlus } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { validatePassword } from '../../utils/validatePassword';
import { CURRENCIES, guessHomeCurrency } from '../../utils/currencyUtils';
import AuthLayout from './AuthLayout';
import AuthSubmitButton from './AuthSubmitButton';
import PasswordInput from '../UI/PasswordInput';

export default function Signup() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [homeCurrency, setHomeCurrency] = useState(() => guessHomeCurrency());
  const { error, setError, loading, setLoading } = useAuthForm();
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Please enter a display name');
      return;
    }

    if (displayName.trim().length > 15) {
      setError('Display name must be 15 characters or fewer');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const { needsConfirmation } = await signup(email, password, displayName.trim(), homeCurrency);
      // With "Confirm email" on in Supabase, the emailed code has to be
      // entered before the account can log in; with it off, we're signed in.
      if (needsConfirmation) {
        navigate('/confirm-signup', { state: { email } });
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      switch (error.code) {
        case 'user_already_exists':
        case 'email_exists':
          setError('An account with this email already exists');
          break;
        case 'email_address_invalid':
        case 'validation_failed':
          setError('Please enter a valid email address');
          break;
        case 'weak_password':
          setError('Password is too weak. Please choose a stronger password');
          break;
        case 'over_email_send_rate_limit':
        case 'over_request_rate_limit':
          setError('Too many attempts. Please try again later.');
          break;
        default:
          setError('Failed to create an account');
          break;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      backTo="/"
      title="Join BudgetBuddy"
      subtitle="Create your account and start tracking your finances"
      error={error}
      footer={<p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="What should we call you?"
              maxLength={15}
              required
            />
          </div>
        </div>

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

        {/* Asked up front because amounts are stored as plain numbers in this
            currency — switching it later relabels past expenses instead of
            converting them. Display currency stays a Settings preference. */}
        <div className="form-group">
          <label htmlFor="homeCurrency">Home Currency</label>
          <select
            id="homeCurrency"
            value={homeCurrency}
            onChange={(e) => setHomeCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</option>
            ))}
          </select>
          <p className="auth-hint">The currency you'll enter expenses in. You can change how amounts are displayed later in Settings.</p>
        </div>

        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
        />

        <AuthSubmitButton loading={loading} loadingText="Creating account...">
          <LuUserPlus size={16} />
          Create Account
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
