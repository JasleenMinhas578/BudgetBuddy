import { useState, useRef, useEffect, useCallback } from 'react';

export function useSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [showEdgeIndicator, setShowEdgeIndicator] = useState(false);
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const edgeTimerRef = useRef(null);
  const dragTimerRef = useRef(null);

  const isMobile = useCallback(() => window.innerWidth <= 768, []);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(!isMobile());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target.closest('.sidebar')) return;
    setSidebarOpen(false);
  };

  const startDrag = (x, e) => {
    if (!isMobile()) return;
    if (!e.target.closest('.sidebar-link, .sidebar-close, .sidebar-toggle, button')) {
      setDragStartX(x);
      dragTimerRef.current = setTimeout(() => setIsDragging(true), 50);
    }
  };

  const handleTouchStart = (e) => startDrag(e.touches[0].clientX, e);
  const handleMouseDown = (e) => startDrag(e.clientX, e);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !isMobile()) return;
    const deltaX = e.touches[0].clientX - dragStartX;
    e.preventDefault();
    if (Math.abs(deltaX) > 30) {
      if (sidebarOpen && deltaX < -30) { setSidebarOpen(false); setIsDragging(false); }
      if (!sidebarOpen && deltaX > 30) { setSidebarOpen(true); setIsDragging(false); }
    }
  }, [isDragging, isMobile, dragStartX, sidebarOpen]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !isMobile()) return;
    const deltaX = e.clientX - dragStartX;
    if (Math.abs(deltaX) > 30) {
      if (sidebarOpen && deltaX < -30) { setSidebarOpen(false); setIsDragging(false); }
      if (!sidebarOpen && deltaX > 30) { setSidebarOpen(true); setIsDragging(false); }
    }
  }, [isDragging, isMobile, dragStartX, sidebarOpen]);

  const handleTouchEnd = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (!isDragging || !isMobile()) return;
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
  }, [isDragging, handleMouseMove, handleTouchMove, isMobile]);

  useEffect(() => {
    if (!isMobile()) return;
    const openFromEdge = (x) => {
      if (x <= 20 && !sidebarOpen) {
        setShowEdgeIndicator(true);
        clearTimeout(edgeTimerRef.current);
        edgeTimerRef.current = setTimeout(() => setShowEdgeIndicator(false), 2000);
        setSidebarOpen(true);
      }
    };
    const handleEdgeTouch = (e) => openFromEdge(e.touches[0].clientX);
    const handleEdgeMouse = (e) => openFromEdge(e.clientX);
    const handleEdgeMouseMove = (e) => {
      setShowEdgeIndicator(e.clientX <= 20 && !sidebarOpen);
    };
    document.addEventListener('touchstart', handleEdgeTouch);
    document.addEventListener('mousedown', handleEdgeMouse);
    document.addEventListener('mousemove', handleEdgeMouseMove);
    return () => {
      document.removeEventListener('touchstart', handleEdgeTouch);
      document.removeEventListener('mousedown', handleEdgeMouse);
      document.removeEventListener('mousemove', handleEdgeMouseMove);
      clearTimeout(edgeTimerRef.current);
      clearTimeout(dragTimerRef.current);
    };
  }, [sidebarOpen, isMobile]);

  return {
    sidebarOpen, setSidebarOpen,
    isDragging,
    showEdgeIndicator,
    isMobile,
    sidebarRef, overlayRef,
    handleOverlayClick,
    handleTouchStart,
    handleMouseDown,
  };
}
