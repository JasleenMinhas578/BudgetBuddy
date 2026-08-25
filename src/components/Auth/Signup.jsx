import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LuArrowLeft, LuWallet, LuAlertTriangle, LuUserPlus, LuEye, LuEyeOff,
} from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { validatePassword } from '../../utils/validatePassword';
import { motion } from 'framer-motion';
import '../../styles/main.css';


/**
 * Signup Component
 * 
 * This component handles user registration by providing a signup form with:
 * - Email and password input fields
 * - Password strength validation
 * - Form validation and error handling
 * - Loading states and user feedback
 * - Navigation to dashboard upon successful registration
 * 
 * Features:
 * - Real-time password strength checking
 * - Firebase authentication integration
 * - Responsive design with animations
 * - Comprehensive error message display
 * - Loading state management
 * - Password confirmation validation
 */
export default function Signup() {
  // Form state management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isActivationKey = (key) => key === 'Enter' || key === ' ';

  /**
   * Handle form submission
   * 
   * This function:
   * 1. Prevents default form submission
   * 2. Validates all form inputs
   * 3. Checks password strength requirements
   * 4. Verifies password confirmation matches
   * 5. Attempts to create user account
   * 6. Navigates to dashboard on success
   * 7. Displays error message on failure
   */
  async function handleSubmit(e) {
    e.preventDefault();
    
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
    
    try {
      // Set loading state to show spinner/disable form
      setLoading(true);
      
      // Attempt to create user account with Firebase
      await signup(email, password);
      
      // Redirect to dashboard on successful signup
      navigate('/dashboard');
    } catch (error) {
      // Display specific error messages based on Firebase error codes
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
            onClick={() => navigate('/')} 
            className="btn-back"
            aria-label="Go back to home"
          >
            <LuArrowLeft size={16} />
            Back
          </button>
        </div>
        
        <div className="auth-brand">
          <div className="auth-logo"><LuWallet size={32} /></div>
          <h2 className="auth-title">Join BudgetBuddy</h2>
          <p className="auth-subtitle">Create your account and start tracking your finances</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="auth-error"
          >
            <LuAlertTriangle size={16} className="error-icon" />
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              {/* <span className="input-icon">📧</span> */}
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
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              {/* <span className="input-icon">🔒</span> */}
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
              />
              <span
                className="input-eye"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={0}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                role="button"
                onKeyDown={e => { if (isActivationKey(e.key)) setShowPassword(v => !v); }}
              >
                {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              {/* <span className="input-icon">🔒</span> */}
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
              />
              <span
                className="input-eye"
                onClick={() => setShowConfirmPassword((v) => !v)}
                tabIndex={0}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                role="button"
                onKeyDown={e => { if (isActivationKey(e.key)) setShowConfirmPassword(v => !v); }}
              >
                {showConfirmPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
              </span>
            </div>
          </div>
          
          <motion.button 
            disabled={loading} 
            type="submit" 
            className="btn btn-primary auth-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="loading-spinner">
                <div className="spinner"></div>
                Creating account...
              </span>
            ) : (
              <>
                <LuUserPlus size={16} />
                Create Account
              </>
            )}
          </motion.button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
        </div>
      </motion.div>
    </div>
  );
}