import { motion } from 'framer-motion';

export default function AuthSubmitButton({ loading, loadingText, disabled, children }) {
  return (
    <motion.button
      disabled={loading || disabled}
      type="submit"
      className="btn btn-primary auth-btn"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {loading ? (
        <span className="loading-spinner">
          <div className="spinner"></div>
          {loadingText}
        </span>
      ) : children}
    </motion.button>
  );
}
