import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getExpenses, deleteExpense as deleteExpenseService } from '../../services/expenseService';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Bills', 'Health', 'Shopping', 'Education', 'Other'];

export default function ExpenseList() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(!!currentUser);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortKey, setSortKey] = useState('description');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    getExpenses(currentUser.uid)
      .then(data => {
        setExpenses(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load expenses');
        setLoading(false);
      });
  }, [currentUser]);

  const filtered = categoryFilter
    ? expenses.filter(e => e.category === categoryFilter)
    : expenses;

  const sorted = [...filtered].sort((a, b) => {
    let aVal, bVal;
    switch (sortKey) {
      case 'category':
        aVal = a.category || '';
        bVal = b.category || '';
        break;
      case 'description':
        aVal = a.description || '';
        bVal = b.description || '';
        break;
      case 'amount':
        aVal = a.amount || 0;
        bVal = b.amount || 0;
        break;
      default:
        return 0;
    }
    if (typeof aVal === 'string') {
      const cmp = aVal.localeCompare(bVal);
      return sortOrder === 'asc' ? cmp : -cmp;
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const handleDeleteConfirm = async () => {
    const id = deleteTarget.id;
    setDeleteTarget(null);
    try {
      await deleteExpenseService(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch {
      setDeleteError('Failed to delete expense');
    }
  };

  if (loading) return <div>Loading expenses</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {deleteError && <div>{deleteError}</div>}

      <div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value)}
        >
          <option value="description">Description</option>
          <option value="category">Category</option>
          <option value="amount">Amount</option>
        </select>

        <button onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}>
          {sortOrder === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      {filtered.length === 0 && categoryFilter && (
        <div>Try changing the category filter</div>
      )}

      <AnimatePresence>
        {sorted.map(expense => (
          <motion.div key={expense.id}>
            <span>{expense.description}</span>
            <span>${Number(expense.amount).toFixed(2)}</span>
            <span>{expense.date ? new Date(expense.date).toLocaleDateString() : ''}</span>
            <button
              title="Delete expense"
              aria-label="Delete expense"
              onClick={() => setDeleteTarget(expense)}
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {deleteTarget && (
        <div role="dialog">
          <h2>Delete Expense</h2>
          <p>Are you sure you want to delete this expense?</p>
          <button onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button onClick={handleDeleteConfirm}>Delete</button>
        </div>
      )}
    </div>
  );
}
