/* istanbul ignore file */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LuShieldCheck } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { validatePassword } from '../../utils/validatePassword';
import AuthLayout from './AuthLayout';
import AuthSubmitButton from './AuthSubmitButton';
import PasswordInput from '../UI/PasswordInput';

export default function ResetPassword() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { error, setError, loading, setLoading } = useAuthForm();
  const { resetPasswordWithCode } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.message);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!email || !code) {
        setError('Email and code are required.');
        return;
      }

      setLoading(true);
      await resetPasswordWithCode(email, code, password);
      navigate('/login', {
        state: { message: 'Password reset successful! Please login with your new password.' }
      });
    } catch (error) {
      switch (error.code) {
        case 'ExpiredCodeException':
          setError('This code has expired. Please request a new one.');
          break;
        case 'CodeMismatchException':
          setError('Incorrect code. Please check your email and try again.');
          break;
        case 'InvalidPasswordException':
          setError('Password is too weak. Please choose a stronger password');
          break;
        default:
          setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      backTo="/login"
      title="Set New Password"
      subtitle="Enter the code we emailed you and your new password"
      error={error}
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
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="code">Reset Code</label>
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

        <PasswordInput
          id="password"
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your new password"
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your new password"
        />

        <AuthSubmitButton loading={loading} loadingText="Resetting password...">
          <LuShieldCheck size={16} />
          Reset Password
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
