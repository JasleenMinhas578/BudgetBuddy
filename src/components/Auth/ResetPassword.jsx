/* istanbul ignore file */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import '../../styles/main.css';

/**
 * ResetPassword Component
 * 
 * This component handles password reset confirmation by:
 * - Extracting the reset code from the URL (oobCode)
 * - Allowing users to enter and confirm a new password
 * - Validating password strength and confirmation match
 * - Updating the password in Firebase
 * - Redirecting to login page on success
 * 
 * Features:
 * - Password strength validation
 * - Password confirmation matching
 * - Firebase password reset confirmation
 * - Responsive design with animations
 * - Error message display
 * - Loading state management
 */
export default function ResetPassword() {
  // Form state management
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oobCode, setOobCode] = useState(null);
  
  // Get authentication functions from context
  const { updatePassword } = useAuth();
  
  // Navigation hook and URL search params
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /**
   * Extract the reset code from URL on component mount
   */
  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (code) {
      setOobCode(code);
    } else {
      setError('Invalid or missing reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  /**
   * Validate password strength
   * 
   * Checks if password meets security requirements:
   * - At least 8 characters long
   * - Contains at least one uppercase letter
   * - Contains at least one lowercase letter
   * - Contains at least one number
   * 
   * @param {string} password - Password to validate
   * @returns {Object} Validation result with isValid boolean and message
   */
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!minLength) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!hasUpperCase) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!hasLowerCase) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!hasNumber) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }

    return { isValid: true, message: 'Password meets all requirements' };
  };

  /**
   * Handle form submission
   * 
   * This function:
   * 1. Prevents default form submission
   * 2. Validates password strength
   * 3. Checks password confirmation match
   * 4. Updates password using the reset code
   * 5. Redirects to login page on success
   * 6. Displays error message on failure
   * 
   * @param {Event} e - Form submission event
   */
  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      // Clear any previous error messages
      setError('');
      
      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.message);
        return;
      }
      
      // Check if passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!oobCode) {
        setError('Invalid reset code. Please request a new password reset.');
        return;
      }
      
      // Set loading state to show spinner/disable form
      setLoading(true);
      
      // Update password using the reset code
      await updatePassword(oobCode, password);
      
      // Redirect to login page on successful password reset
      navigate('/login', { 
        state: { message: 'Password reset successful! Please login with your new password.' }
      });
    } catch (error) {
      // Display error message to user
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
      // Always reset loading state
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      {/* Background decoration */}
      <div className="auth-bg">
        <div className="auth-shape auth-shape-1"></div>
        <div className="auth-shape auth-shape-2"></div>
        <div className="auth-shape auth-shape-3"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-card"
      >
        <div className="auth-header">
          <button 
            onClick={() => navigate('/login')} 
            className="btn-back"
            aria-label="Go back to login"
          >
            <span>←</span>
            Back
          </button>
        </div>
        
        <div className="auth-brand">
          <div className="auth-logo">🔑</div>
          <h2 className="auth-title">Set New Password</h2>
          <p className="auth-subtitle">Enter your new password below</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="auth-error"
          >
            <span className="error-icon">⚠️</span>
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <div className="input-wrapper" style={{position: 'relative'}}>
              <input 
                type={showPassword ? "text" : "password"}
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required 
              />
              <span
                className="input-eye"
                onClick={() => setShowPassword((v) => !v)}
                style={{position: 'absolute', right: '1em', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1.2em', color: '#94a3b8'}}
                tabIndex={0}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                role="button"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(v => !v); }}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="input-wrapper" style={{position: 'relative'}}>
              <input 
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required 
              />
              <span
                className="input-eye"
                onClick={() => setShowConfirmPassword((v) => !v)}
                style={{position: 'absolute', right: '1em', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1.2em', color: '#94a3b8'}}
                tabIndex={0}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                role="button"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowConfirmPassword(v => !v); }}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </div>
          
          <motion.button 
            disabled={loading || !oobCode} 
            type="submit" 
            className="btn btn-primary auth-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="loading-spinner">
                <div className="spinner"></div>
                Resetting password...
              </span>
            ) : (
              <>
                <span>🔐</span>
                Reset Password
              </>
            )}
          </motion.button>
        </form>
        
        <div className="auth-footer">
          <p>Remember your password? <Link to="/login" className="auth-link">Sign In</Link></p>
        </div>
      </motion.div>
    </div>
  );
}

