import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuUserPlus } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { validatePassword } from '../../utils/validatePassword';
import AuthLayout from './AuthLayout';
import AuthSubmitButton from './AuthSubmitButton';
import PasswordInput from '../UI/PasswordInput';

export default function Signup() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { error, setError, loading, setLoading } = useAuthForm();
  const { signup, updateDisplayName } = useAuth();
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
      await signup(email, password);
      try {
        await updateDisplayName(displayName.trim());
      } catch {
        // Account created — name update failed, user can set it in Settings
      }
      navigate('/dashboard');
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password');
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
