import '../../styles/modal.css';

export default function Modal({ isOpen, onClose, title, ariaLabel, children }) {
  if (!isOpen) return null;
  const dialogLabel = title || ariaLabel || 'Modal dialog';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
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
          onClick={onClose}
        >
          <span aria-hidden="true">×</span>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
} 