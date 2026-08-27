import { useState, useMemo, useRef, useCallback } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useCategories } from '../../hooks/useCategories';
import { useCurrency } from '../../context/CurrencyContext';
import { LuTag, LuTarget, LuPlus } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useBudgets } from '../../hooks/useBudgets';
import { useBudgetProgress } from '../../hooks/useBudgetProgress';
import { useExpenses } from '../../hooks/useExpenses';
import { useCategoryActions } from '../../hooks/useCategoryActions';
import { DEFAULT_CATEGORIES } from '../../utils/getCategoryIcon';
import { validCategory } from '../../utils/categoryUtils';
import PageHeader from '../UI/PageHeader';
import Modal from '../UI/Modal';
import AddCategoryModal from '../UI/AddCategoryModal';
import Toast from '../UI/Toast';
import { useToast } from '../../hooks/useToast';
import ChartCard from '../UI/ChartCard';
import BarChart from '../Charts/BarChart';
import ExpenseForm from '../Expense/ExpenseForm';
import ConfirmDialog from '../UI/ConfirmDialog';
import { getCategoryColor } from '../../utils/getCategoryColor';
import GoalInput from '../Goals/GoalInput';
import GoalCard from '../Goals/GoalCard';
import BudgetSummaryCard from '../Goals/BudgetSummaryCard';
import '../../styles/main.css';
import '../../styles/modal-forms.css';

export default function Goals() {
  const { formatAmount, currencySymbol, toDisplayAmount, toHomeAmount } = useCurrency();
  const { currentUser } = useAuth();
  const { expenses } = useExpenses();
  const { budgets, setCategoryBudget } = useBudgets();
  const saveGoalConverted = useCallback(
    (name, displayVal) => setCategoryBudget(name, displayVal != null ? toHomeAmount(displayVal) : null),
    [setCategoryBudget, toHomeAmount]
  );
  const firestoreCategories = useCategories();
  const { toast, showToast, hideToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [pendingRemoveCategory, setPendingRemoveCategory] = useState(null);

  const allCategories = useMemo(() => [
    ...DEFAULT_CATEGORIES,
    ...firestoreCategories
      .filter((c) => c && validCategory(c.name))
      .map((c) => ({ ...c, Icon: LuTag })),
  ], [firestoreCategories]);

  const { isLoading, handleAddCategory } = useCategoryActions(currentUser, allCategories, showToast);

  const thisMonthExpenses = useMemo(() => {
    const now = new Date();
    const start = format(startOfMonth(now), 'yyyy-MM-dd');
    const end = format(endOfMonth(now), 'yyyy-MM-dd');
    return expenses.filter((e) => e.date >= start && e.date <= end);
  }, [expenses]);

  const { categoryProgress } = useBudgetProgress(thisMonthExpenses, allCategories, budgets);

  const trackedCategories = useMemo(
    () => allCategories.filter((c) => (budgets.categories?.[c.name] ?? 0) > 0),
    [allCategories, budgets.categories]
  );

  const untrackedCategories = useMemo(
    () => allCategories.filter((c) => !((budgets.categories?.[c.name] ?? 0) > 0)),
    [allCategories, budgets.categories]
  );

  // Drag-to-reorder state
  const [categoryOrder, setCategoryOrder] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`goalOrder_${currentUser?.uid}`)) || [];
    } catch { return []; }
  });
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const sortedTrackedCategories = useMemo(() => {
    if (!categoryOrder.length) {
      return [...trackedCategories].sort(
        (a, b) => (budgets.categories?.[b.name] ?? 0) - (budgets.categories?.[a.name] ?? 0)
      );
    }
    const orderMap = Object.fromEntries(categoryOrder.map((name, i) => [name, i]));
    return [...trackedCategories].sort((a, b) => {
      const ai = orderMap[a.name] ?? Infinity;
      const bi = orderMap[b.name] ?? Infinity;
      return ai - bi;
    });
  }, [trackedCategories, categoryOrder, budgets.categories]);

  const handleDragStart = (index) => {
    dragItem.current = index;
    setDraggingIndex(index);
  };
  const handleDragEnter = (index) => {
    dragOverItem.current = index;
    setDragOverIndex(index);
  };
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newOrder = [...sortedTrackedCategories];
      const [moved] = newOrder.splice(dragItem.current, 1);
      newOrder.splice(dragOverItem.current, 0, moved);
      const names = newOrder.map((c) => c.name);
      setCategoryOrder(names);
      localStorage.setItem(`goalOrder_${currentUser?.uid}`, JSON.stringify(names));
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const totalBudgeted = useMemo(
    () => Object.values(budgets.categories || {}).reduce((s, v) => s + (v || 0), 0),
    [budgets.categories]
  );
  const totalSpent = thisMonthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalRemaining = totalBudgeted > 0 ? totalBudgeted - totalSpent : null;
  const overallPct = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0;
  const overStatus = totalBudgeted > 0
    ? (totalSpent >= totalBudgeted ? 'danger' : totalSpent / totalBudgeted >= 0.8 ? 'warning' : 'ok')
    : 'ok';

  const categoriesWithBudget = categoryProgress.filter((p) => p.budget !== null);
  const overBudget = categoriesWithBudget.filter((p) => p.pct !== null && p.pct >= 100);
  const nearLimit = categoriesWithBudget.filter((p) => p.pct !== null && p.pct >= 80 && p.pct < 100);
  const onTrack = categoriesWithBudget.filter((p) => p.pct !== null && p.pct < 80);
  const hasAnyBudget = categoriesWithBudget.length > 0;

  const budgetChartData = useMemo(() => {
    const rows = categoryProgress.filter((p) => p.budget !== null);
    return {
      labels: rows.map((p) => p.name),
      datasets: [
        {
          label: 'Budget',
          data: rows.map((p) => p.budget),
          backgroundColor: rows.map(() => 'rgba(148, 163, 184, 0.15)'),
          borderColor: rows.map(() => 'rgba(148, 163, 184, 0.55)'),
          borderWidth: 2,
          borderRadius: 4,
        },
        {
          label: 'Spent',
          data: rows.map((p) => p.spent),
          backgroundColor: 'rgba(79, 209, 197, 0.75)',
          borderColor: '#4fd1c5',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [categoryProgress]);

  return (
    <div className="goals-container">
      {toast && (
        <Toast message={toast.message} type={toast.type} isVisible onClose={hideToast} />
      )}

      <PageHeader
        title="Budget Goals"
        subtitle="Set recurring monthly spending limits per category"
        action={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setIsExpenseModalOpen(true)} className="btn btn-secondary">
              <LuPlus size={16} />
              Add Expense
            </button>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-secondary">
              <LuPlus size={16} />
              Add Category
            </button>
          </div>
        }
      />

      {hasAnyBudget && (
        <BudgetSummaryCard
          totalBudgeted={totalBudgeted}
          totalSpent={totalSpent}
          totalRemaining={totalRemaining}
          overallPct={overallPct}
          overStatus={overStatus}
          overBudget={overBudget}
          nearLimit={nearLimit}
          onTrack={onTrack}
          formatAmount={formatAmount}
        />
      )}

      <div className="goals-section">
        <div className="section-subheader">
          <div>
            <h3>Active Goals</h3>
            <p>Categories you are tracking this month. Clear the field and save to remove a goal.</p>
          </div>
          {untrackedCategories.length > 0 && (
            <button className="btn btn-primary" onClick={() => setIsGoalModalOpen(true)}>
              <LuPlus size={16} />
              Set Goal
            </button>
          )}
        </div>

        {trackedCategories.length > 0 ? (
          <div className="goals-grid">
            {sortedTrackedCategories.map((category, index) => {
              const prog = categoryProgress.find((p) => p.name === category.name);
              return (
                <GoalCard
                  key={category.name}
                  category={category}
                  prog={prog}
                  index={index}
                  draggingIndex={draggingIndex}
                  dragOverIndex={dragOverIndex}
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                  onDragEnd={handleDragEnd}
                  currencySymbol={currencySymbol}
                  formatAmount={formatAmount}
                  goalValue={toDisplayAmount(budgets.categories?.[category.name] ?? null)}
                  onSave={saveGoalConverted}
                  onRemove={setPendingRemoveCategory}
                />
              );
            })}
          </div>
        ) : (
          <div className="goals-empty-state">
            <div className="goals-empty-icon"><LuTarget size={48} /></div>
            <h3>No goals set yet</h3>
            <p>Click "Set Goal" to add a monthly spending limit for any category.</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsGoalModalOpen(true)}>
              <LuPlus size={16} />
              Set Goal
            </button>
          </div>
        )}
      </div>

      {hasAnyBudget && (
        <div className="goals-chart-section">
          <div className="section-subheader">
            <div>
              <h3>Charts &amp; Visualizations</h3>
              <p>Visual breakdown of your spending against budget goals</p>
            </div>
          </div>
          <ChartCard title="Budget vs. Spent by Category">
            <BarChart
              data={budgetChartData}
              options={{
                scales: {
                  y: { ticks: { callback: (v) => formatAmount(v) } },
                  x: { grid: { display: false } },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (ctx) => ` ${ctx.dataset.label}: ${formatAmount(ctx.parsed.y)}`,
                    },
                  },
                },
              }}
            />
          </ChartCard>
        </div>
      )}

      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Set Category Goals">
        <div className="goal-picker-modal">
          <p className="goal-picker-hint">Enter a monthly spending limit for any category. Cards will appear instantly as you save.</p>
          <div className="goal-picker-list">
            {untrackedCategories.map((category) => (
              <div key={category.name} className="goal-picker-row">
                <div
                  className="goal-icon goal-icon--sm"
                  style={{
                    color: getCategoryColor(category.name),
                    background: `${getCategoryColor(category.name)}1a`,
                  }}
                >
                  <category.Icon size={16} />
                </div>
                <span className="goal-picker-name">{category.name}</span>
                <div className="goal-input-wrapper goal-input-wrapper--row">
                  <GoalInput
                    categoryName={category.name}
                    initialValue={null}
                    onSave={saveGoalConverted}
                  />
                </div>
              </div>
            ))}
            {untrackedCategories.length === 0 && (
              <p className="goal-picker-all-set">All categories have goals set.</p>
            )}
          </div>
          <div className="goal-picker-footer">
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(true)}>
              <LuPlus size={14} /> Add New Category
            </button>
            <button className="btn btn-primary" onClick={() => setIsGoalModalOpen(false)}>
              Done
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Add Expense">
        <ExpenseForm
          onExpenseAdded={() => setIsExpenseModalOpen(false)}
          onCancel={() => setIsExpenseModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingRemoveCategory}
        title="Remove Goal"
        message={pendingRemoveCategory ? <>Remove the <strong>{pendingRemoveCategory}</strong> monthly budget goal?</> : ''}
        onConfirm={() => { saveGoalConverted(pendingRemoveCategory, null); setPendingRemoveCategory(null); }}
        onCancel={() => setPendingRemoveCategory(null)}
        variant="danger"
      />

      <AddCategoryModal
        isOpen={isModalOpen}
        isLoading={isLoading}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddCategory}
      />
    </div>
  );
}
