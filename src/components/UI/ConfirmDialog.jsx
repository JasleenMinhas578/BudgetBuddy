import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/confirm-dialog.css';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, variant = 'danger' }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div className="cd-overlay" onClick={onCancel}>
      <div
        className="cd-box"
        role="alertdialog"
        aria-modal="true"
        aria-label={title || 'Confirmation'}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="cd-title">{title}</h3>}
        <p className="cd-message">{message}</p>
        <div className="cd-actions">
          <button type="button" className="cd-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`cd-btn-confirm cd-btn-confirm--${variant}`}
            onClick={onConfirm}
            autoFocus
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
