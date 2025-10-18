import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/main.css';

const Sidebar = forwardRef(({ sidebarOpen, setSidebarOpen, onTouchStart, onMouseDown, isDragging, isMobile }, ref) => {
  const { currentUser, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/dashboard/expenses', label: 'Expenses', icon: '💸' },
    { path: '/dashboard/categories', label: 'Categories', icon: '📂' },
    { path: '/dashboard/reports', label: 'Reports', icon: '📈' }
  ];

  return (
    <div 
      ref={ref}
      className={`sidebar ${sidebarOpen ? 'open' : ''} ${isDragging ? 'dragging' : ''} ${isMobile ? 'mobile' : 'desktop'}`}
      onTouchStart={onTouchStart}
      onMouseDown={onMouseDown}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo-container">
          <div className="logo-icon">💰</div>
        <h1 className="sidebar-logo">BudgetBuddy</h1>
        </div>
        {isMobile ? (
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        ) : (
          <button 
            className="sidebar-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            aria-label="Toggle sidebar"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        )}
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
        <NavLink 
            key={item.path}
            to={item.path} 
            end={item.path === '/dashboard'}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
            onClick={(e) => {
              // Prevent drag events from interfering with navigation
              e.stopPropagation();
              // Close sidebar on mobile after navigation
              if (isMobile) {
                setTimeout(() => setSidebarOpen(false), 150);
              }
            }}
        >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
        </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        {currentUser && (
          <div className="user-section">
          <div className="user-info">
              <div className="user-avatar">
                <span>{currentUser.email.charAt(0).toUpperCase()}</span>
              </div>
              <div className="user-details">
                <p className="user-email">{currentUser.email}</p>
                <p className="user-status">Online</p>
              </div>
            </div>
            <button onClick={logout} className="btn btn-secondary btn-logout">
              <span>🚪</span>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;