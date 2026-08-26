import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LuLayoutDashboard,
  LuCreditCard,
  LuTag,
  LuBarChart2,
  LuSettings,
  LuLogOut,
  LuX,
  LuChevronLeft,
  LuChevronRight,
} from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import BudgetBuddyLogo from '../UI/BudgetBuddyLogo';
import UserAvatar from '../UI/UserAvatar';
import '../../styles/main.css';

const navItems = [
  { path: '/dashboard',            label: 'Dashboard',  Icon: LuLayoutDashboard },
  { path: '/dashboard/expenses',   label: 'Expenses',   Icon: LuCreditCard      },
  { path: '/dashboard/categories', label: 'Categories', Icon: LuTag             },
  { path: '/dashboard/reports',    label: 'Reports',    Icon: LuBarChart2       },
  { path: '/dashboard/settings',   label: 'Settings',   Icon: LuSettings        },
];

const Sidebar = forwardRef(({ sidebarOpen, setSidebarOpen, onTouchStart, onMouseDown, isDragging, isMobile, onLogoutClick }, ref) => {
  const { currentUser } = useAuth();

  return (
    <div
      ref={ref}
      className={`sidebar ${sidebarOpen ? 'open' : ''} ${isDragging ? 'dragging' : ''} ${isMobile ? 'mobile' : 'desktop'}`}
      onTouchStart={onTouchStart}
      onMouseDown={onMouseDown}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo-container">
          <BudgetBuddyLogo size={36} />
          <h1 className="sidebar-logo">BudgetBuddy</h1>
        </div>

        {isMobile ? (
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <LuX size={16} />
          </button>
        ) : (
          <button
            className="sidebar-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            aria-label="Toggle sidebar"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {sidebarOpen ? <LuChevronLeft size={16} /> : <LuChevronRight size={16} />}
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/dashboard'}
            className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            onClick={(e) => {
              e.stopPropagation();
              if (isMobile) setTimeout(() => setSidebarOpen(false), 150);
            }}
          >
            <span className="nav-icon"><Icon size={18} /></span>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {currentUser && (
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar-container">
                <UserAvatar user={currentUser} />
                <span className="user-status">Online</span>
              </div>
              {currentUser.displayName && (
                <p className="user-display-name">{currentUser.displayName}</p>
              )}
              <p className="user-email">{currentUser.email}</p>
            </div>
            <button type="button" onClick={onLogoutClick} className="btn btn-secondary btn-logout">
              <LuLogOut size={15} />
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
