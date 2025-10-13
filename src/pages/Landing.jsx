import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../styles/main.css';

export default function Landing() {
  return (
    <div className="landing-container">
      {/* Animated background */}
      <div className="landing-bg">
        <div className="bg-gradient"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <nav className="landing-nav">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="nav-brand"
        >
          <div className="brand-icon">💰</div>
        <h1 className="logo">BudgetBuddy</h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="nav-links"
        >
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/signup" className="nav-link primary">Get Started</Link>
        </motion.div>
      </nav>
      
      <main className="landing-main">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hero"
        >
          <div className="hero-content">
            <h1 className="hero-title">
              Master Your <span className="accent">Financial Future</span>
            </h1>
            <p className="hero-subtitle">
              Transform your spending habits with intelligent expense tracking, 
              beautiful visualizations, and actionable insights that help you 
              achieve your financial goals.
            </p>
          <div className="hero-cta">
              <Link to="/signup" className="btn btn-primary btn-hero">
                <span>🚀</span>
                Start Your Journey
              </Link>
              <Link to="/login" className="btn btn-secondary btn-hero">
                <span>🔐</span>
                Sign In
              </Link>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hero-visual"
          >
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dot red"></div>
                <div className="preview-dot yellow"></div>
                <div className="preview-dot green"></div>
              </div>
              <div className="preview-content">
                <div className="preview-chart">
                  <div className="chart-bar bar-1"></div>
                  <div className="chart-bar bar-2"></div>
                  <div className="chart-bar bar-3"></div>
                  <div className="chart-bar bar-4"></div>
                </div>
                <div className="preview-stats">
                  <div className="stat-item">
                    <div className="stat-icon">📊</div>
                    <div className="stat-text">Smart Analytics</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">💡</div>
                    <div className="stat-text">Insights</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        
        
      </main>
    </div>
  );
}