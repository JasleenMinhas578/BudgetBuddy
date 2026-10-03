/* istanbul ignore file */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuShieldCheck } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { validatePassword } from '../../utils/validatePassword';
import { authLinkError } from '../../supabaseClient';
import AuthLayout from './AuthLayout';
import AuthSubmitButton from './AuthSubmitButton';
import PasswordInput from '../UI/PasswordInput';

// Where the emailed reset link lands. A valid link signs the user in, so
// all that's left is choosing the new password for that session.
export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { error, setError, loading, setLoading } = useAuthForm();
  const { currentUser, updatePassword } = useAuth();
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

      setLoading(true);
      await updatePassword(password);
      navigate('/login', {
        state: { message: 'Password reset successful! Please login with your new password.' }
      });
    } catch (error) {
      switch (error.code) {
        case 'weak_password':
          setError('Password is too weak. Please choose a stronger password');
          break;
        case 'same_password':
          setError('New password must be different from your current one');
          break;
        default:
          setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (!currentUser) {
    return (
      <AuthLayout
        backTo="/login"
        title="Set New Password"
        subtitle="Open the reset link from your email to choose a new password"
        error={authLinkError ? 'That reset link is invalid or has expired. Please request a new one.' : ''}
        footer={<p><Link to="/forgot-password" className="auth-link">Send a new reset link</Link></p>}
      />
    );
  }

  return (
    <AuthLayout
      backTo="/login"
      title="Set New Password"
      subtitle={`Choose a new password for ${currentUser.email}`}
      error={error}
      footer={<p>Remember your password? <Link to="/login" className="auth-link">Sign In</Link></p>}
    >
      <form onSubmit={handleSubmit} className="auth-form">
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
