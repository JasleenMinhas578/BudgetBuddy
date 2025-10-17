import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../../styles/main.css';

export default function Signup() {
  // Form state management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          <h2 className="auth-title">Join FinTrack</h2>
          <p className="auth-subtitle">Create your account and start tracking your finances</p>
        </div>

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
        <div className="input-wrapper" style={{position: 'relative'}}>
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
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="input-wrapper" style={{position: 'relative'}}>
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
            <span>🚀</span>
            Create Account
            </>
        )}
        </motion.button>
        
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
        </div>
      </motion.div>
    </div>
  );
}