import { useState } from 'react';
import Modal from './Modal';

export default function AddCategoryModal({ isOpen, isLoading, onClose, onAdd }) {
  const [name, setName] = useState('');

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Category">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAdd(name, handleClose);
        }}
        className="category-form"
      >
        <div className="form-group">
          <label htmlFor="categoryName">Category Name</label>
          <input
            id="categoryName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
            maxLength={25}
            required
          />
        </div>
        <div className="form-actions">
          <button type="button" onClick={handleClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary gradient-btn" disabled={isLoading}>
            Add Category
          </button>
        </div>
      </form>
    </Modal>
  );
}
