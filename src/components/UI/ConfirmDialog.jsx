import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/confirm-dialog.css';

// onDismiss (Escape / clicking the backdrop) defaults to onCancel; dialogs
// whose Cancel button does something drastic can point it elsewhere.
export default function ConfirmDialog({
  isOpen, title, message, onConfirm, onCancel, onDismiss = onCancel,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger',
}) {
  const boxRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onDismiss(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onDismiss]);

  useEffect(() => {
    if (!isOpen || !boxRef.current) return;
    const focusable = Array.from(boxRef.current.querySelectorAll('button'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="cd-overlay" onClick={onDismiss}>
      <div
        className="cd-box"
        ref={boxRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={title || 'Confirmation'}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="cd-title">{title}</h3>}
        <div className="cd-message">{message}</div>
        <div className="cd-actions">
          <button type="button" className="cd-btn-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`cd-btn-confirm cd-btn-confirm--${variant}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
