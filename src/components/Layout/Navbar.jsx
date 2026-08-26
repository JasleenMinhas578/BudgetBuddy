import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LuMenu,
  LuLayoutDashboard,
  LuCreditCard,
  LuTag,
  LuBarChart2,
  LuSettings,
  LuLogOut,
  LuSearch,
  LuX,
  LuTarget,
} from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../UI/UserAvatar';
import '../../styles/main.css';

export default function Navbar({ setSidebarOpen, onLogoutClick }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const getPageMeta = () => {
    const path = location.pathname;
    if (path === '/dashboard')             return { title: 'Dashboard',  Icon: LuLayoutDashboard };
    if (path.includes('/expenses'))        return { title: 'Expenses',   Icon: LuCreditCard      };
    if (path.includes('/categories'))      return { title: 'Categories', Icon: LuTag             };
    if (path.includes('/goals'))           return { title: 'Goals',      Icon: LuTarget          };
    if (path.includes('/reports'))         return { title: 'Reports',    Icon: LuBarChart2       };
    if (path.includes('/settings'))        return { title: 'Settings',   Icon: LuSettings        };
    return                                        { title: 'Dashboard',  Icon: LuLayoutDashboard };
  };

  const { title, Icon: PageIcon } = getPageMeta();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/dashboard/expenses?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/dashboard/expenses');
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
          <LuMenu size={20} />
        </button>

        <div className="navbar-breadcrumb">
          <span className="page-icon"><PageIcon size={20} /></span>
          <h1 className="page-title">{title}</h1>
        </div>
      </div>

      <form className="navbar-search" onSubmit={handleSearch} role="search">
        <div className="search-input-wrapper">
          <LuSearch size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search expenses, categories…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search expenses"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <LuX size={14} />
            </button>
          )}
        </div>
      </form>

      <div className="navbar-right">
        <div className="navbar-user">
          {currentUser && (
            <button
              type="button"
              className="user-profile"
              onClick={onLogoutClick}
              title="Click to logout"
            >
              <UserAvatar user={currentUser} />
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
