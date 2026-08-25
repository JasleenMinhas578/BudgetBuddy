import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuCheck, LuX, LuAlertTriangle, LuInfo } from 'react-icons/lu';
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
  // Keep a ref to the latest onClose so the timer effect doesn't need it as a dep.
  // Without this, every Firestore re-render creates a new inline arrow → new dep →
  // the timer resets before it fires and the toast never auto-dismisses.
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onCloseRef.current();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  /**
   * Get icon based on message type
   * 
   * @param {string} toastType - Type of toast message
   * @returns {string} Unicode icon character
   */
  const getIcon = (toastType) => {
    switch (toastType) {
      case 'success':  return <LuCheck size={16} />;
      case 'error':    return <LuX size={16} />;
      case 'warning':  return <LuAlertTriangle size={16} />;
      case 'info':
      default:         return <LuInfo size={16} />;
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
            <LuX size={14} aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 