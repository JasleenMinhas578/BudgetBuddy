import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PrivateRoute Component
 * 
 * This component provides route protection by:
 * - Checking if user is authenticated
 * - Redirecting unauthenticated users to login
 * - Preserving intended destination for post-login redirect
 * - Showing loading state while checking authentication
 * - Providing seamless user experience
 * 
 * Features:
 * - Authentication state checking
 * - Automatic redirect to login for unauthenticated users
 * - Preservation of intended destination URL
 * - Loading state management
 * - Seamless integration with React Router
 * - Support for nested protected routes
 * 
 * Props:
 * - children: React components to render if authenticated
 * - redirectTo: Optional custom redirect path (default: '/login')
 * 
 * Usage:
 * <PrivateRoute>
 *   <ProtectedComponent />
 * </PrivateRoute>
 */
export default function PrivateRoute({ children, redirectTo = '/login' }) {
  // Get current location for redirect preservation
  const location = useLocation();
  
  // Get authentication context to check user state
  const { currentUser, loading } = useAuth();

  /**
   * Show loading state while checking authentication
   * 
   * This prevents flashing of login form or protected content
   * while Firebase is determining the user's authentication state
   */
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  /**
   * Redirect unauthenticated users to login
   * 
   * This function:
   * 1. Checks if user is not authenticated
   * 2. Redirects to login page with current location as state
   * 3. Preserves intended destination for post-login redirect
   * 
   * The state object allows the login component to redirect
   * users back to their intended destination after successful login
   */
  if (!currentUser) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  /**
   * Render protected content for authenticated users
   * 
   * If user is authenticated and not loading, render the
   * children components (protected route content)
   */
  return children;
} 