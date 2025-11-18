/* istanbul ignore file */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import '../../styles/main.css';

/**
 * ForgotPassword Component
 * 
 * This component handles password reset requests by:
 * - Allowing users to enter their email address
 * - Sending a password reset email via Firebase
 * - Providing user feedback and error handling
 * - Navigation back to login page
 * 
 * Features:
 * - Email validation
 * - Firebase password reset email integration
 * - Responsive design with animations
 * - Success and error message display
 * - Loading state management
 */
export default function ForgotPassword() {
  // Form state management
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get authentication functions from context
  const { resetPassword } = useAuth();
  
  // Navigation hook for redirecting
  const navigate = useNavigate();

  /**
   * Handle form submission
   * 
   * This function:
   * 1. Prevents default form submission
   * 2. Clears any previous errors/messages
   * 3. Sets loading state
   * 4. Sends password reset email
   * 5. Displays success message or error
   * 
   * @param {Event} e - Form submission event
   */
  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      // Clear any previous error messages
      setError('');
      setMessage('');
      
      // Set loading state to show spinner/disable form
      setLoading(true);
      
      // Configure action code settings to use our custom reset password page
      // Firebase will append the oobCode parameter to this URL
      const resetUrl = `${window.location.origin}/reset-password`;
      
      // For local development, you might need to use localhost explicitly
      // For production, use your actual domain
      const actionCodeSettings = {
        url: resetUrl,
        handleCodeInApp: false, // For web apps, set to false so the link opens in browser
      };
      
      console.log('Sending password reset email to:', email);
      console.log('Reset URL will be:', resetUrl);
      console.log('Current origin:', window.location.origin);
      
      // Send password reset email via Firebase
      // Note: If you get "unauthorized-continue-uri" error, you need to add your domain
      // to Firebase Console → Authentication → Settings → Authorized domains
      try {
        await resetPassword(email, actionCodeSettings);
      } catch (urlError) {
        // If custom URL fails, try without it (uses Firebase default)
        if (urlError.code === 'auth/unauthorized-continue-uri' || urlError.code === 'auth/invalid-continue-uri') {
          console.warn('Custom URL not authorized, trying with Firebase default...');
          console.warn('Please add your domain to Firebase Console → Authentication → Settings → Authorized domains');
          // Fallback: use Firebase default email (will redirect to your app)
          await resetPassword(email);
        } else {
          throw urlError; // Re-throw if it's a different error
        }
      }
      
      // Display success message (only reached if email was sent successfully)
      setMessage('Check your email for password reset instructions. If you don\'t see it, check your spam folder.');
    } catch (error) {
      // Log the full error for debugging
      console.error('Password reset error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Display error message to user
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/invalid-email':
          setError('Invalid email format');
          break;
        case 'auth/too-many-requests':
          setError('Too many requests. Please try again later');
          break;
        case 'auth/invalid-continue-uri':
          setError('Invalid redirect URL. Please contact support.');
          break;
        case 'auth/unauthorized-continue-uri':
          setError('Unauthorized redirect URL. The domain must be authorized in Firebase.');
          break;
        default:
          setError(`Failed to send reset email: ${error.message || 'Please try again.'}`);
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
          <div className="auth-logo">🔐</div>
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Enter your email to receive password reset instructions</p>
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

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="auth-success"
            style={{
              backgroundColor: '#d1fae5',
              color: '#065f46',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>✅</span>
            {message}
          </motion.div>
        )}
        
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
                disabled={!!message}
              />
            </div>
          </div>
          
          <motion.button 
            disabled={loading || !!message} 
            type="submit" 
            className="btn btn-primary auth-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="loading-spinner">
                <div className="spinner"></div>
                Sending...
              </span>
            ) : message ? (
              <>
                <span>✅</span>
                Email Sent
              </>
            ) : (
              <>
                <span>📧</span>
                Send Reset Link
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

