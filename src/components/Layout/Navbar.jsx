import { useLocation } from 'react-router-dom';
import {
  LuMenu,
  LuLayoutDashboard,
  LuCreditCard,
  LuTag,
  LuBarChart2,
  LuSettings,
  LuLogOut,
} from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import '../../styles/main.css';

export default function Navbar({ setSidebarOpen, onLogoutClick }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  const getPageMeta = () => {
    const path = location.pathname;
    if (path === '/dashboard')             return { title: 'Dashboard',  Icon: LuLayoutDashboard };
    if (path.includes('/expenses'))        return { title: 'Expenses',   Icon: LuCreditCard      };
    if (path.includes('/categories'))      return { title: 'Categories', Icon: LuTag             };
    if (path.includes('/reports'))         return { title: 'Reports',    Icon: LuBarChart2       };
    if (path.includes('/settings'))        return { title: 'Settings',   Icon: LuSettings        };
    return                                        { title: 'Dashboard',  Icon: LuLayoutDashboard };
  };

  const { title, Icon: PageIcon } = getPageMeta();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button
          className="navbar-menu-btn"
          onClick={() => setSidebarOpen(prev => !prev)}
          aria-label="Toggle sidebar"
        >
          <LuMenu size={20} />
        </button>

        <div className="navbar-breadcrumb">
          <span className="page-icon"><PageIcon size={20} /></span>
          <h1 className="page-title">{title}</h1>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          {currentUser && (
            <button
              type="button"
              className="user-profile"
              onClick={onLogoutClick}
              title="Click to logout"
            >
              <div className="user-avatar">
                <span>{(currentUser.displayName || currentUser.email).charAt(0).toUpperCase()}</span>
              </div>
              <div className="user-info">
                <span className="user-name">
                  {currentUser.displayName || currentUser.email.split('@')[0]}
                </span>
                <span className="user-role">Click to logout</span>
              </div>
              <span className="logout-icon" aria-hidden="true">
                <LuLogOut size={14} />
              </span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
