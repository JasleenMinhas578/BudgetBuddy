import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/main.css';

export default function Navbar({ setSidebarOpen }) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.includes('/expenses')) return 'Expenses';
    if (path.includes('/categories')) return 'Categories';
    if (path.includes('/reports')) return 'Reports';
    if (path.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  const getPageIcon = () => {
    const path = location.pathname;
    if (path === '/dashboard') return '📊';
    if (path.includes('/expenses')) return '💸';
    if (path.includes('/categories')) return '📂';
    if (path.includes('/reports')) return '📈';
    if (path.includes('/settings')) return '⚙️';
    return '📊';
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
      <button 
        className="navbar-menu-btn" 
        onClick={() => setSidebarOpen(prev => !prev)}
          aria-label="Toggle sidebar"
      >
          <span className="menu-icon">☰</span>
      </button>
      
        <div className="navbar-breadcrumb">
          <span className="page-icon">{getPageIcon()}</span>
          <h1 className="page-title">{getPageTitle()}</h1>
        </div>
      </div>
      
      <div className="navbar-right">
      <div className="navbar-user">
        {currentUser && (
            <button 
              className="user-profile"
              onClick={handleLogout}
              title="Click to logout"
            >
          <div className="user-avatar">
                <span>{currentUser.email.charAt(0).toUpperCase()}</span>
              </div>
              <div className="user-info">
                <span className="user-name">
                  {currentUser.displayName || currentUser.email.split('@')[0]}
                </span>
                <span className="user-role">Click to logout</span>
              </div>
              <span className="logout-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </span>
            </button>
        )}
        </div>
      </div>
    </nav>
  );
}