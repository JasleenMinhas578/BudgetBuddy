import { useState } from 'react';
import { Link} from 'react-router-dom';
import { motion } from 'framer-motion';
import '../../styles/main.css';

/**
 * Login Component
 * 
 * This component handles user authentication by providing a login form.
 * It includes:
 * - Email and password input fields
 * - Form validation
 * - Error handling and display
 * - Loading states
 * - Navigation to dashboard upon successful login
 * 
 * Features:
 * - Real-time form validation
 * - Firebase authentication integration
 * - Responsive design with animations
 * - Error message display
 * - Loading state management
 */
export default function Login() {
  // Form state management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
            <span>←</span>
            Back
          </button>
        </div>
        
        <div className="auth-brand">
          <div className="auth-logo">💰</div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your FinTrack account</p>
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
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              required 
            />
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
                Signing in...
              </span>
            ) : (
              <>
                <span>🚀</span>
                Sign In
              </>
            )}
          </motion.button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link></p>
        </div>
      </motion.div>
    </div>
  );
}