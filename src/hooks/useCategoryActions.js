import { useState } from 'react';
import {
  addCategory,
  updateCategory,
  deleteCategoryAndExpenses,
  hideDefaultCategory,
} from '../services/categoryService';

export function useCategoryActions(currentUser, allCategories, showToast) {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState(null);
  const [pendingEditCategory, setPendingEditCategory] = useState(null);

  // When showToast is not provided (backwards compat), manage local toast state
  const [localToast, setLocalToast] = useState(null);
  const toast = showToast ? undefined : localToast;
  const setToast = showToast ? undefined : setLocalToast;
  const notify = showToast ?? ((msg, type) => setLocalToast({ message: msg, type }));

  const handleAddCategory = async (categoryName, onSuccess) => {
    if (!currentUser) {
      notify('Please log in to add categories.', 'error');
      return;
    }
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    if (trimmed.length > 25) {
      notify('Category name must be 25 characters or fewer.', 'error');
      return;
    }
    const existingNames = allCategories.map(c => c.name.toLowerCase());
    if (existingNames.includes(trimmed.toLowerCase())) {
      notify(`Category "${trimmed}" already exists.`, 'error');
      return;
    }
    onSuccess?.();
    setIsLoading(true);
    try {
      await addCategory(currentUser.uid, { name: trimmed });
      notify(`Category "${trimmed}" added successfully!`, 'success');
    } catch {
      notify('Failed to add category. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    if (!currentUser) {
      notify('Please log in to edit categories.', 'error');
      return;
    }
    setPendingEditCategory(category);
  };

  const confirmEditCategory = async (newName) => {
    const trimmed = newName.trim();
    if (!trimmed || !pendingEditCategory) return;
    const { id, name, isDefault } = pendingEditCategory;
    if (isDefault) {
      notify('Default categories cannot be renamed.', 'error');
      setPendingEditCategory(null);
      return;
    }
    if (trimmed.length > 25) {
      notify('Category name must be 25 characters or fewer.', 'error');
      return;
    }
    const existingNames = allCategories
      .filter(c => c.name !== name)
      .map(c => c.name.toLowerCase());
    if (existingNames.includes(trimmed.toLowerCase())) {
      notify(`"${trimmed}" already exists.`, 'error');
      return;
    }
    setPendingEditCategory(null);
    setIsLoading(true);
    try {
      await updateCategory(currentUser.uid, id, { name: trimmed });
      notify(`Category renamed to "${trimmed}"!`, 'success');
    } catch {
      notify('Failed to rename category. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = (categoryId, categoryName, isDefault = false, expenseCount = 0) => {
    if (!currentUser) {
      notify('Please log in to delete categories.', 'error');
      return;
    }
    setPendingDeleteCategory({ id: categoryId, name: categoryName, isDefault, expenseCount });
  };

  const confirmDeleteCategory = async () => {
    if (!pendingDeleteCategory) return;
    const { id, name, isDefault, expenseCount } = pendingDeleteCategory;
    setPendingDeleteCategory(null);
    setIsLoading(true);
    try {
      if (isDefault) {
        await hideDefaultCategory(currentUser.uid, name);
      } else {
        await deleteCategoryAndExpenses(currentUser.uid, id, name);
      }
      const expenseNote = expenseCount > 0
        ? ` and ${expenseCount} expense${expenseCount !== 1 ? 's' : ''}`
        : '';
      notify(`Category "${name}"${expenseNote} deleted.`, 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      notify('Failed to delete category. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    // Only present when showToast not provided (legacy callers)
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
