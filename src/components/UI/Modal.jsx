import { useEffect, useRef } from 'react';
import { LuX } from 'react-icons/lu';
import '../../styles/modal.css';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Modal({ isOpen, onClose, title, ariaLabel, children }) {
  const modalRef = useRef(null);
  const triggerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      const firstFocusable = modalRef.current?.querySelector(FOCUSABLE);
      firstFocusable?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = Array.from(modalRef.current?.querySelectorAll(FOCUSABLE) ?? []);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;
  const dialogLabel = title || ariaLabel || 'Modal dialog';

  return (
    <div className="modal-overlay" onClick={() => onCloseRef.current()}>
      <div
        ref={modalRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-label={dialogLabel}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="modal-title">{title}</h2>}
        {children}
        <button
          type="button"
          className="modal-close"
          aria-label="Close dialog"
          onClick={() => onCloseRef.current()}
        >
          <LuX size={18} aria-hidden="true" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
}
