import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute Component
 * 
 * This component acts as a wrapper to protect routes that require authentication.
 * It checks if a user is currently logged in and either:
 * - Renders the protected content if authenticated
 * - Redirects to login page if not authenticated
 * 
 * Usage:
 * <PrivateRoute>
 *   <ProtectedComponent />
 * </PrivateRoute>
 * 
 * @param {Object} children - React components to render if user is authenticated
 * @returns {JSX.Element} Either the protected content or a redirect to login
 */
export default function PrivateRoute({ children }) {
  // Get the current user from authentication context
  const { currentUser } = useAuth();
  
  // If user is logged in, render the protected content
  // If not logged in, redirect to login page
  return currentUser ? children : <Navigate to="/login" />;
}