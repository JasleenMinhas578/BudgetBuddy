import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../../styles/main.css';

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
    
    <div className="auth-brand">
        <div className="auth-logo">💰</div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your FinTrack account</p>
    </div>
    
        <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <div className="input-wrapper">
            {/* <span className="input-icon">📧</span> */}

        </div>
        </div>
        
        <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="input-wrapper">
            {/* <span className="input-icon">🔒</span> */}
        </div>
        </div>
        
        <motion.button
        type="submit" 
        className="btn btn-primary auth-btn"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        >
        
        </motion.button>
    

    <div className="auth-footer">
        <p>Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link></p>
    </div>
    </motion.div>
    </div>
