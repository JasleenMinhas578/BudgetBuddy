import { LuMoreVertical, LuPencil, LuTrash2 } from 'react-icons/lu';

export default function CategoryKebabMenu({ isOpen, onToggle, onEdit, onDelete }) {
  return (
    <div className="category-menu-wrapper">
      <button
        className="btn-kebab"
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        aria-label="Category options"
      >
        <LuMoreVertical size={15} />
      </button>
      {isOpen && (
        <div className="category-kebab-menu">
          <button
            className="category-menu-item"
            onMouseDown={(e) => { e.stopPropagation(); onEdit(); }}
          >
            <LuPencil size={13} />
            Edit
          </button>
          <button
            className="category-menu-item category-menu-item--danger"
            onMouseDown={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <LuTrash2 size={13} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
