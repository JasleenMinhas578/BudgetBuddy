import { useEffect, useRef } from 'react';

export function useClickOutside(ref, handler, enabled = true) {
  const handlerRef = useRef(handler);
  useEffect(() => { handlerRef.current = handler; });

  useEffect(() => {
    if (!enabled) return;
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handlerRef.current(e);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, enabled]);
}
