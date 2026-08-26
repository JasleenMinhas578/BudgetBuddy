/* istanbul ignore file */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LuKey, LuShieldCheck } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { validatePassword } from '../../utils/validatePassword';
import AuthLayout from './AuthLayout';
import AuthSubmitButton from './AuthSubmitButton';
import PasswordInput from '../UI/PasswordInput';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oobCode, setOobCode] = useState(null);
  const { error, setError, loading, setLoading } = useAuthForm();
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (code) {
      setOobCode(code);
    } else {
      setError('Invalid or missing reset link. Please request a new password reset.');
    }
  }, [searchParams, setError]);

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

      if (!oobCode) {
        setError('Invalid reset code. Please request a new password reset.');
        return;
      }

      setLoading(true);
      await updatePassword(oobCode, password);
      navigate('/login', {
        state: { message: 'Password reset successful! Please login with your new password.' }
      });
    } catch (error) {
      switch (error.code) {
        case 'auth/expired-action-code':
          setError('The password reset link has expired. Please request a new one.');
          break;
        case 'auth/invalid-action-code':
          setError('Invalid reset link. Please request a new password reset.');
          break;
        case 'auth/weak-password':
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
      logoIcon={<LuKey size={32} />}
      title="Set New Password"
      subtitle="Enter your new password below"
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

        <AuthSubmitButton loading={loading} loadingText="Resetting password..." disabled={!oobCode}>
          <LuShieldCheck size={16} />
          Reset Password
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
