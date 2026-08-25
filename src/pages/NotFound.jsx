import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuWallet, LuHome, LuBarChart2, LuBanknote } from 'react-icons/lu';
import '../styles/main.css';

export default function NotFound() {
  return (
    <div className="not-found-container">
      {/* Animated background */}
      <div className="not-found-bg">
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
          <div className="brand-icon"><LuWallet size={24} /></div>
          <h1 className="logo">BudgetBuddy</h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="nav-links"
        >
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/login" className="nav-link primary">Login</Link>
        </motion.div>
      </nav>

      <main className="not-found-main">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="not-found-content"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="error-code"
          >
            404
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="error-title"
          >
            Oops! Page Not Found
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="error-description"
          >
            The page you're looking for seems to have wandered off into the financial void.
            <br />
            Don't worry, we'll help you get back on track!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="error-actions"
          >
            <Link to="/" className="btn btn-primary btn-hero">
              <LuHome size={16} />
              Go Home
            </Link>
            <Link to="/dashboard" className="btn btn-secondary btn-hero">
              <LuBarChart2 size={16} />
              Dashboard
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="error-illustration"
          >
            <div className="illustration-container">
              <div className="money-icon"><LuBanknote size={48} /></div>
              <div className="question-mark">?</div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

