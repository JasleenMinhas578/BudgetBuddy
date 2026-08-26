import { useState } from 'react';
import { addCategory, deleteCategory } from '../services/categoryService';

export function useCategoryActions(currentUser, allCategories) {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState(null);

  const handleAddCategory = async (categoryName, onSuccess) => {
    if (!currentUser) {
      setToast({ message: 'Please log in to add categories.', type: 'error' });
      return;
    }
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    const existingNames = allCategories.map(c => c.name.toLowerCase());
    if (existingNames.includes(trimmed.toLowerCase())) {
      setToast({ message: `Category "${trimmed}" already exists.`, type: 'error' });
      return;
    }
    onSuccess?.();
    setIsLoading(true);
    try {
      await addCategory(currentUser.uid, { name: trimmed });
      setToast({ message: `Category "${trimmed}" added successfully!`, type: 'success' });
    } catch {
      setToast({ message: 'Failed to add category. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = (categoryId, categoryName) => {
    if (!currentUser) {
      setToast({ message: 'Please log in to delete categories.', type: 'error' });
      return;
    }
    setPendingDeleteCategory({ id: categoryId, name: categoryName });
  };

  const confirmDeleteCategory = async () => {
    if (!pendingDeleteCategory) return;
    const { id, name } = pendingDeleteCategory;
    setPendingDeleteCategory(null);
    setIsLoading(true);
    try {
      await deleteCategory(currentUser.uid, id);
      setToast({ message: `Category "${name}" deleted successfully!`, type: 'success' });
    } catch (error) {
      console.error('Error deleting category:', error);
      setToast({ message: 'Failed to delete category. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    toast, setToast,
    pendingDeleteCategory, setPendingDeleteCategory,
    handleAddCategory,
    handleDeleteCategory,
    confirmDeleteCategory,
  };
}
