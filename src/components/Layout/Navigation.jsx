import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import '../../styles/main.css';

/**
 * Navigation Component
 * 
 * This component provides the main navigation bar with:
 * - Responsive navigation menu
 * - Authentication-aware navigation items
 * - Active route highlighting
 * - User profile and logout functionality
 * - Mobile hamburger menu
 * - Smooth animations and transitions
 * 
 * Features:
 * - Conditional navigation based on authentication state
 * - Active route indication with visual feedback
 * - Mobile-responsive design with hamburger menu
 * - User profile display and logout functionality
 * - Smooth animations for menu transitions
 * - Accessible navigation with proper ARIA labels
 * - Brand logo and navigation links
 */
export default function Navigation() {
  // Get current location for active route highlighting
  const location = useLocation();
  
  // Get navigation function for programmatic navigation
  const navigate = useNavigate();
  
  // Get authentication context for user state and logout
  const { currentUser, logout } = useAuth();
  
  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * Handle user logout
   * 
   * This function:
   * 1. Calls Firebase logout function
   * 2. Navigates to login page
   * 3. Handles any logout errors
   * 4. Closes mobile menu if open
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
    setIsMobileMenuOpen(false);
  };

  /**
   * Toggle mobile menu visibility
   * 
   * This function:
   * 1. Toggles the mobile menu state
   * 2. Prevents body scroll when menu is open
   * 3. Restores body scroll when menu closes
   */
  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    
    // Prevent body scroll when mobile menu is open
    if (newState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  /**
   * Close mobile menu
   * 
   * This function:
   * 1. Closes the mobile menu
   * 2. Restores body scroll
   */
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  /**
   * Check if a route is currently active
   * 
   * @param {string} path - Route path to check
   * @returns {boolean} True if route is active
   */
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  /**
   * Get navigation link class with active state
   * 
   * @param {string} path - Route path
   * @returns {string} CSS class name with active state if applicable
   */
  const getNavLinkClass = (path) => {
    return `nav-link ${isActiveRoute(path) ? 'active' : ''}`;
  };

  return (
    <nav className="navigation">
      {/* Navigation container */}
      <div className="nav-container">
        {/* Brand logo and name */}
        <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="brand-icon">💰</span>
            <span className="brand-name">Finance Tracker</span>
          </motion.div>
        </Link>

        {/* Desktop navigation menu */}
        <div className="nav-menu desktop-menu">
          {currentUser ? (
            // Authenticated user navigation
            <>
              <Link 
                to="/dashboard" 
                className={getNavLinkClass('/dashboard')}
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
              <Link 
                to="/expenses" 
                className={getNavLinkClass('/expenses')}
                onClick={closeMobileMenu}
              >
                Expenses
              </Link>
              <Link 
                to="/reports" 
                className={getNavLinkClass('/reports')}
                onClick={closeMobileMenu}
              >
                Reports
              </Link>
              
              {/* User profile dropdown */}
              <div className="user-profile">
                <span className="user-email">{currentUser.email}</span>
                <button 
                  className="logout-btn"
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            // Guest user navigation
            <>
              <Link 
                to="/login" 
                className={getNavLinkClass('/login')}
                onClick={closeMobileMenu}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className={getNavLinkClass('/signup')}
                onClick={closeMobileMenu}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile navigation menu */}
      <motion.div 
        className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? 'auto' : 0
        }}
        transition={{ duration: 0.3 }}
      >
        {currentUser ? (
          // Authenticated user mobile menu
          <>
            <Link 
              to="/dashboard" 
              className={getNavLinkClass('/dashboard')}
              onClick={closeMobileMenu}
            >
              Dashboard
            </Link>
            <Link 
              to="/expenses" 
              className={getNavLinkClass('/expenses')}
              onClick={closeMobileMenu}
            >
              Expenses
            </Link>
            <Link 
              to="/reports" 
              className={getNavLinkClass('/reports')}
              onClick={closeMobileMenu}
            >
              Reports
            </Link>
            
            {/* Mobile user profile */}
            <div className="mobile-user-profile">
              <span className="user-email">{currentUser.email}</span>
              <button 
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          // Guest user mobile menu
          <>
            <Link 
              to="/login" 
              className={getNavLinkClass('/login')}
              onClick={closeMobileMenu}
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className={getNavLinkClass('/signup')}
              onClick={closeMobileMenu}
            >
              Sign Up
            </Link>
          </>
        )}
      </motion.div>
    </nav>
  );
} 