import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/main.css';

/**
 * Toast Component
 * 
 * This component displays temporary notification messages with:
 * - Multiple message types (success, error, warning, info)
 * - Automatic dismissal after specified duration
 * - Smooth animations for entrance and exit
 * - Customizable styling based on message type
 * - Click to dismiss functionality
 * - Responsive design
 * 
 * Features:
 * - Auto-dismiss with configurable timeout
 * - Manual dismiss on click
 * - Type-based styling (success, error, warning, info)
 * - Smooth fade and slide animations
 * - Accessible design with proper ARIA labels
 * - Responsive layout for mobile devices
 * 
 * Props:
 * - message: The text to display
 * - type: Message type ('success', 'error', 'warning', 'info')
 * - isVisible: Boolean to control visibility
 * - onClose: Callback function when toast is dismissed
 * - duration: Auto-dismiss duration in milliseconds (default: 3000)
 */
export default function Toast({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose, 
  duration = 3000 
}) {
  /**
   * Handle automatic dismissal of toast
   * 
   * This effect:
   * 1. Starts a timer when toast becomes visible
   * 2. Automatically calls onClose after specified duration
   * 3. Cleans up timer when component unmounts or visibility changes
   * 4. Only runs if duration is greater than 0
   */
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      // Cleanup timer on unmount or when visibility changes
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  /**
   * Get icon based on message type
   * 
   * @param {string} toastType - Type of toast message
   * @returns {string} Unicode icon character
   */
  const getIcon = (toastType) => {
    switch (toastType) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  /**
   * Get CSS class name based on message type
   * 
   * @param {string} toastType - Type of toast message
   * @returns {string} CSS class name for styling
   */
  const getToastClass = (toastType) => {
    return `toast toast-${toastType}`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={getToastClass(type)}
          initial={{ opacity: 0, y: -50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.3 }}
          transition={{ 
            duration: 0.3,
            ease: "easeOut"
          }}
          onClick={onClose}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          {/* Toast icon */}
          <span className="toast-icon" aria-hidden="true">
            {getIcon(type)}
          </span>
          
          {/* Toast message */}
          <span className="toast-message">
            {message}
          </span>
          
          {/* Close button */}
          <button 
            className="toast-close"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close notification"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 