import { useState, useRef, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import '../styles/main.css';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open on desktop
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [showEdgeIndicator, setShowEdgeIndicator] = useState(false);
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  
  // Check if we're on mobile
  const isMobile = () => window.innerWidth <= 768;
  
  // Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (isMobile()) {
        setSidebarOpen(false); // Closed by default on mobile
      } else {
        setSidebarOpen(true); // Open by default on desktop
      }
    };
    
    // Set initial state
    handleResize();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const handleOverlayClick = (e) => {
    // Don't close sidebar if clicking on sidebar itself
    if (e.target.closest('.sidebar')) {
      return;
    }
    setSidebarOpen(false);
  };

  const handleTouchStart = (e) => {
    if (isMobile()) {
      // Only start dragging if it's not a click on a navigation link or button
      const target = e.target.closest('.sidebar-link, .sidebar-close, .sidebar-toggle, button');
      if (!target) {
        const touch = e.touches[0];
        setDragStartX(touch.clientX);
        // Add a small delay to prevent accidental drags
        setTimeout(() => setIsDragging(true), 50);
      }
    }
  };

  const handleMouseDown = (e) => {
    if (isMobile()) {
      // Only start dragging if it's not a click on a navigation link or button
      const target = e.target.closest('.sidebar-link, .sidebar-close, .sidebar-toggle, button');
      if (!target) {
        setDragStartX(e.clientX);
        // Add a small delay to prevent accidental drags
        setTimeout(() => setIsDragging(true), 50);
      }
    }
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !isMobile()) return;
    const touch = e.touches[0];
    const currentX = touch.clientX;
    const deltaX = currentX - dragStartX;
    e.preventDefault();
    if (Math.abs(deltaX) > 30) {
      if (sidebarOpen) {
        if (deltaX < -30) {
          setSidebarOpen(false);
          setIsDragging(false);
        }
      } else {
        if (deltaX > 30) {
          setSidebarOpen(true);
          setIsDragging(false);
        }
      }
    }
  }, [isDragging, isMobile, dragStartX, sidebarOpen]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !isMobile()) return;
    const currentX = e.clientX;
    const deltaX = currentX - dragStartX;
    if (Math.abs(deltaX) > 30) {
      if (sidebarOpen) {
        if (deltaX < -30) {
          setSidebarOpen(false);
          setIsDragging(false);
        }
      } else {
        if (deltaX > 30) {
          setSidebarOpen(true);
          setIsDragging(false);
        }
      }
    }
  }, [isDragging, isMobile, dragStartX, sidebarOpen]);

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global event listeners for mouse/touch events (mobile only)
  useEffect(() => {
    if (isDragging && isMobile()) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, sidebarOpen, dragStartX, handleMouseMove, handleTouchMove]);

  // Add touch/mouse event listeners to the page edges (mobile only)
  useEffect(() => {
    if (!isMobile()) return;
    
    const handleEdgeTouch = (e) => {
      const touch = e.touches[0];
      const x = touch.clientX;
      
      // If touch is within 20px of left edge, allow opening
      if (x <= 20 && !sidebarOpen) {
        setShowEdgeIndicator(true);
        setTimeout(() => setShowEdgeIndicator(false), 2000);
        setSidebarOpen(true);
      }
    };

    const handleEdgeMouse = (e) => {
      const x = e.clientX;
      
      // If mouse is within 20px of left edge, allow opening
      if (x <= 20 && !sidebarOpen) {
        setShowEdgeIndicator(true);
        setTimeout(() => setShowEdgeIndicator(false), 2000);
        setSidebarOpen(true);
      }
    };

    const handleMouseMove = (e) => {
      const x = e.clientX;
      if (x <= 20 && !sidebarOpen) {
        setShowEdgeIndicator(true);
      } else {
        setShowEdgeIndicator(false);
      }
    };

    document.addEventListener('touchstart', handleEdgeTouch);
    document.addEventListener('mousedown', handleEdgeMouse);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('touchstart', handleEdgeTouch);
      document.removeEventListener('mousedown', handleEdgeMouse);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Edge Swipe Indicator (mobile only) */}
      {isMobile() && (
        <div className={`edge-swipe-indicator ${showEdgeIndicator ? 'show' : ''}`} />
      )}
      
      {/* Sidebar Overlay (mobile only) */}
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
      />
      
      <div className="dashboard-main">
        <Navbar setSidebarOpen={setSidebarOpen} />
        
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}