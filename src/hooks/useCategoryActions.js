import { useState } from 'react';
import {
  addCategory,
  updateCategory,
  reassignAndDeleteCategory,
  reassignCategoryExpenses,
  renameCategoryExpenses,
  hideDefaultCategory,
} from '../services/categoryService';
import { updateCategoryBudget } from '../services/budgetService';

export function useCategoryActions(currentUser, allCategories, showToast, budgets) {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState(null);
  const [pendingEditCategory, setPendingEditCategory] = useState(null);

  const handleAddCategory = async (categoryName, onSuccess) => {
    if (!currentUser) {
      showToast('Please log in to add categories.', 'error');
      return;
    }
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    if (trimmed.length > 25) {
      showToast('Category name must be 25 characters or fewer.', 'error');
      return;
    }
    const existingNames = allCategories.map(c => c.name.toLowerCase());
    if (existingNames.includes(trimmed.toLowerCase())) {
      showToast(`Category "${trimmed}" already exists.`, 'error');
      return;
    }
    setIsLoading(true);
    try {
      await addCategory(currentUser.uid, { name: trimmed });
      onSuccess?.();
      showToast(`Category "${trimmed}" added successfully!`, 'success');
    } catch {
      showToast('Failed to add category. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    if (!currentUser) {
      showToast('Please log in to edit categories.', 'error');
      return;
    }
    setPendingEditCategory(category);
  };

  const confirmEditCategory = async (newName) => {
    const trimmed = newName.trim();
    if (!trimmed || !pendingEditCategory) return;
    const { id, name, isDefault } = pendingEditCategory;
    if (isDefault) {
      showToast('Default categories cannot be renamed.', 'error');
      setPendingEditCategory(null);
      return;
    }
    if (trimmed.length > 25) {
      showToast('Category name must be 25 characters or fewer.', 'error');
      return;
    }
    const existingNames = allCategories
      .filter(c => c.name !== name)
      .map(c => c.name.toLowerCase());
    if (existingNames.includes(trimmed.toLowerCase())) {
      showToast(`"${trimmed}" already exists.`, 'error');
      return;
    }
    setPendingEditCategory(null);
    setIsLoading(true);
    try {
      await updateCategory(currentUser.uid, id, { name: trimmed });
      await renameCategoryExpenses(currentUser.uid, name, trimmed);
      const oldBudget = budgets?.categories?.[name];
      if (oldBudget != null) {
        await updateCategoryBudget(currentUser.uid, trimmed, oldBudget);
        await updateCategoryBudget(currentUser.uid, name, null);
      }
      showToast(`Category renamed to "${trimmed}"!`, 'success');
    } catch {
      showToast('Failed to rename category. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = (categoryId, categoryName, isDefault = false, expenseCount = 0) => {
    if (!currentUser) {
      showToast('Please log in to delete categories.', 'error');
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
        await reassignCategoryExpenses(currentUser.uid, name);
      } else {
        await reassignAndDeleteCategory(currentUser.uid, id, name);
      }
      const expenseNote = expenseCount > 0
        ? `. ${expenseCount} expense${expenseCount !== 1 ? 's' : ''} reassigned to "Other"`
        : '';
      showToast(`Category "${name}" deleted${expenseNote}.`, 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    pendingDeleteCategory, setPendingDeleteCategory,
    pendingEditCategory, setPendingEditCategory,
    handleAddCategory,
    handleEditCategory,
    confirmEditCategory,
    handleDeleteCategory,
    confirmDeleteCategory,
  };
}
