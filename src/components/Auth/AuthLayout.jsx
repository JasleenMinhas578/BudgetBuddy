import { useNavigate } from 'react-router-dom';
import { LuArrowLeft, LuAlertTriangle, LuCheckCircle } from 'react-icons/lu';
import { motion } from 'framer-motion';
import BudgetBuddyLogo from '../UI/BudgetBuddyLogo';
import '../../styles/main.css';

export default function AuthLayout({ backTo, logoIcon, title, subtitle, error, message, footer, children }) {
  const navigate = useNavigate();
  const backLabel = backTo === '/' ? 'Go back to home' : 'Go back';

  return (
    <div className="auth-container">
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
            onClick={() => navigate(backTo)}
            className="btn-back"
            aria-label={backLabel}
          >
            <LuArrowLeft size={16} />
            Back
          </button>
        </div>

        <div className="auth-brand">
          <div className="auth-logo"><BudgetBuddyLogo size={56} /></div>
          <h2 className="auth-title">{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
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

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="auth-success"
          >
            <LuCheckCircle size={16} />
            {message}
          </motion.div>
        )}

        {children}

        {footer && <div className="auth-footer">{footer}</div>}
      </motion.div>
    </div>
  );
}
