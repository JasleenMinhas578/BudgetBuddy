import { useState } from 'react';
import {
  addCategory,
  updateCategory,
  deleteCategoryAndExpenses,
  hideDefaultCategory,
} from '../services/categoryService';

export function useCategoryActions(currentUser, allCategories) {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState(null);
  const [pendingEditCategory, setPendingEditCategory] = useState(null);

  const handleAddCategory = async (categoryName, onSuccess) => {
    if (!currentUser) {
      setToast({ message: 'Please log in to add categories.', type: 'error' });
      return;
    }
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    if (trimmed.length > 25) {
      setToast({ message: 'Category name must be 25 characters or fewer.', type: 'error' });
      return;
    }
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

  const handleEditCategory = (category) => {
    if (!currentUser) {
      setToast({ message: 'Please log in to edit categories.', type: 'error' });
      return;
    }
    setPendingEditCategory(category);
  };

  const confirmEditCategory = async (newName) => {
    const trimmed = newName.trim();
    if (!trimmed || !pendingEditCategory) return;
    const { id, name, isDefault } = pendingEditCategory;
    if (isDefault) {
      setToast({ message: 'Default categories cannot be renamed.', type: 'error' });
      setPendingEditCategory(null);
      return;
    }
    if (trimmed.length > 25) {
      setToast({ message: 'Category name must be 25 characters or fewer.', type: 'error' });
      return;
    }
    const existingNames = allCategories
      .filter(c => c.name !== name)
      .map(c => c.name.toLowerCase());
    if (existingNames.includes(trimmed.toLowerCase())) {
      setToast({ message: `"${trimmed}" already exists.`, type: 'error' });
      return;
    }
    setPendingEditCategory(null);
    setIsLoading(true);
    try {
      await updateCategory(currentUser.uid, id, { name: trimmed });
      setToast({ message: `Category renamed to "${trimmed}"!`, type: 'success' });
    } catch {
      setToast({ message: 'Failed to rename category. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = (categoryId, categoryName, isDefault = false) => {
    if (!currentUser) {
      setToast({ message: 'Please log in to delete categories.', type: 'error' });
      return;
    }
    setPendingDeleteCategory({ id: categoryId, name: categoryName, isDefault });
  };

  const confirmDeleteCategory = async () => {
    if (!pendingDeleteCategory) return;
    const { id, name, isDefault } = pendingDeleteCategory;
    setPendingDeleteCategory(null);
    setIsLoading(true);
    try {
      if (isDefault) {
        await hideDefaultCategory(currentUser.uid, name);
      } else {
        await deleteCategoryAndExpenses(currentUser.uid, id, name);
      }
      setToast({ message: `Category "${name}" deleted.`, type: 'success' });
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
    pendingEditCategory, setPendingEditCategory,
    handleAddCategory,
    handleEditCategory,
    confirmEditCategory,
    handleDeleteCategory,
    confirmDeleteCategory,
  };
}
