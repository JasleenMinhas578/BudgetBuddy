import '../../styles/modal.css';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {title && <h2 className="modal-title">{title}</h2>}
        {children}
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
} 