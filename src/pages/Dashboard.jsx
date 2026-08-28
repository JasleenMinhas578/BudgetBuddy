import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Modal from '../components/UI/Modal';
import ExpenseForm from '../components/Expense/ExpenseForm';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../hooks/useSidebar';
import { LuPlus } from 'react-icons/lu';
import '../styles/main.css';

export default function Dashboard() {
  const { logout } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const {
    sidebarOpen, setSidebarOpen,
    isDragging,
    showEdgeIndicator,
    isMobile,
    sidebarRef, overlayRef,
    handleOverlayClick,
    handleTouchStart,
    handleMouseDown,
  } = useSidebar();

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {isMobile() && (
        <div className={`edge-swipe-indicator ${showEdgeIndicator ? 'show' : ''}`} />
      )}

      {isMobile() && (
        <div
          ref={overlayRef}
          className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
          onClick={handleOverlayClick}
          onTouchStart={handleTouchStart}
          onMouseDown={handleMouseDown}
        />
      )}

      <Sidebar
        ref={sidebarRef}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onTouchStart={handleTouchStart}
        onMouseDown={handleMouseDown}
        isDragging={isDragging}
        isMobile={isMobile()}
        onLogoutClick={() => setLogoutDialogOpen(true)}
        onAddExpense={() => setIsAddExpenseOpen(true)}
      />

      <div className="dashboard-main">
        <Navbar setSidebarOpen={setSidebarOpen} onLogoutClick={() => setLogoutDialogOpen(true)} />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>

      <button
        className="fab"
        onClick={() => setIsAddExpenseOpen(true)}
        aria-label="Add expense"
        title="Add expense"
      >
        <LuPlus size={22} />
      </button>

      <Modal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} title="Add New Expense">
        <ExpenseForm
          onExpenseAdded={() => setIsAddExpenseOpen(false)}
          onCancel={() => setIsAddExpenseOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={logoutDialogOpen}
        title="Logout"
        message={logoutError ? logoutError : 'Are you sure you want to logout?'}
        onConfirm={async () => {
          try {
            await logout();
          } catch (err) {
            console.error('Logout failed:', err);
            setLogoutError('Logout failed. Please try again.');
          }
        }}
        onCancel={() => { setLogoutDialogOpen(false); setLogoutError(''); }}
        variant="default"
      />
    </div>
  );
}
