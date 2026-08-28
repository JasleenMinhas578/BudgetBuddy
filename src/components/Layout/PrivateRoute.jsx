import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PrivateRoute({ children, redirectTo = '/login' }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
} 