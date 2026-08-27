import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useCategories } from '../../hooks/useCategories';
import { useCurrency } from '../../context/CurrencyContext';
import { LuTag, LuTarget, LuTrendingUp, LuAlertTriangle, LuCheckCircle, LuPlus, LuGripVertical } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useBudgets } from '../../hooks/useBudgets';
import { useBudgetProgress } from '../../hooks/useBudgetProgress';
import { useExpenses } from '../../hooks/useExpenses';
import { useCategoryActions } from '../../hooks/useCategoryActions';
import { DEFAULT_CATEGORIES } from '../../utils/getCategoryIcon';
import { validCategory } from '../../utils/categoryUtils';
import { getCategoryColor } from '../../utils/getCategoryColor';
import PageHeader from '../UI/PageHeader';
import Modal from '../UI/Modal';
import AddCategoryModal from '../UI/AddCategoryModal';
import Toast from '../UI/Toast';
import { useToast } from '../../hooks/useToast';
import ChartCard from '../UI/ChartCard';
import BarChart from '../Charts/BarChart';
import ExpenseForm from '../Expense/ExpenseForm';
import ConfirmDialog from '../UI/ConfirmDialog';
import '../../styles/main.css';
import '../../styles/modal-forms.css';

function toDisplayStr(v) {
  if (v === null || v === undefined || v === '') return '';
  const n = parseFloat(v);
  return isNaN(n) ? '' : String(parseFloat(n.toFixed(2)));
}

// Input with an explicit Save button — button is disabled until the value changes
function GoalInput({ categoryName, initialValue, onSave }) {
  const normalized = toDisplayStr(initialValue);
  const [value, setValue] = useState(normalized);

  useEffect(() => {
    setValue(toDisplayStr(initialValue));
  }, [initialValue]);

  const isDirty = value !== normalized;

  const save = () => {
    if (!isDirty) return;
    const parsed = value === '' ? null : parseFloat(value);
    if (value !== '' && (Number.isNaN(parsed) || parsed < 0 || parsed > 1000000)) return;
    // $0 is treated the same as no goal — removes the budget entry
    onSave(categoryName, parsed === 0 ? null : parsed);
  };

  return (
    <>
      <input
        type="number"
        min="0"
        step="1"
        className="goal-input"
        placeholder="Add goal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && save()}
        onBlur={save}
      />
      <button
        className="goal-save-btn"
        onMouseDown={(e) => e.preventDefault()}
        onClick={save}
        disabled={!isDirty}
        title="Save goal"
      >
        Save
      </button>
    </>
  );
}

export default function Goals() {
  const { formatAmount, currencySymbol, toDisplayAmount, toHomeAmount } = useCurrency();
  // Budget amounts are stored in home currency. Inputs show display currency (toDisplayAmount/toHomeAmount
  // convert on read/write). formatAmount handles home→display for all rendered labels.
  const { currentUser } = useAuth();
  const { expenses } = useExpenses();
  const { budgets, setCategoryBudget } = useBudgets();
  // User types in display currency; we convert back to home currency before storing
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

  const {
    isLoading,
    handleAddCategory,
  } = useCategoryActions(currentUser, allCategories, showToast);

  // Always show current-month progress against goals
  const thisMonthExpenses = useMemo(() => {
    const now = new Date();
    const start = format(startOfMonth(now), 'yyyy-MM-dd');
    const end = format(endOfMonth(now), 'yyyy-MM-dd');
    return expenses.filter((e) => e.date >= start && e.date <= end);
  }, [expenses]);

  const { categoryProgress } = useBudgetProgress(thisMonthExpenses, allCategories, budgets);

  // Categories with a saved goal (> 0) always show in the main grid.
  const trackedCategories = useMemo(
    () => allCategories.filter((c) => (budgets.categories?.[c.name] ?? 0) > 0),
    [allCategories, budgets.categories]
  );

  const untrackedCategories = useMemo(
    () => allCategories.filter((c) => !((budgets.categories?.[c.name] ?? 0) > 0)),
    [allCategories, budgets.categories]
  );

  // Drag-to-reorder state for the active goals grid
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

  // Derive total monthly budget from sum of category goals
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
          // Ghost bars — show the ceiling without competing with spent colors
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
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible
          onClose={hideToast}
        />
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

      {/* Monthly summary — only shown once at least one goal is set */}
      {hasAnyBudget && (
        <div className="goals-summary-card">
          <div className="goals-summary-top">
            <div>
              <p className="goals-summary-label">Total Monthly Budget</p>
              <p className="goals-summary-total">{formatAmount(totalBudgeted)}</p>
            </div>
            <div className="goals-summary-right">
              <p className="goals-summary-spent">{formatAmount(totalSpent)} spent</p>
              {totalRemaining !== null && (
                <p className={`goals-summary-remaining${overStatus !== 'ok' ? ` goals-summary-remaining--${overStatus}` : ''}`}>
                  {totalRemaining >= 0
                    ? `${formatAmount(totalRemaining)} remaining`
                    : `${formatAmount(Math.abs(totalRemaining))} over budget`}
                </p>
              )}
            </div>
          </div>
          <div className="goals-overall-bar">
            <div
              className={`goals-overall-fill goals-overall-fill--${overStatus}`}
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <p className="goals-overall-pct">{overallPct.toFixed(0)}% of monthly budget used</p>

          {/* Insights — alerts for over-budget and near-limit categories */}
          {(overBudget.length > 0 || nearLimit.length > 0 || onTrack.length > 0) && (
            <div className="goals-insights">
              {overBudget.map((p) => (
                <div key={p.name} className="goals-insight goals-insight--danger">
                  <LuAlertTriangle size={15} />
                  <span>
                    <strong>{p.name}</strong> is over budget by {formatAmount(Math.abs(p.remaining))}
                  </span>
                </div>
              ))}
              {nearLimit.map((p) => (
                <div key={p.name} className="goals-insight goals-insight--warning">
                  <LuTrendingUp size={15} />
                  <span>
                    <strong>{p.name}</strong> is at {p.pct.toFixed(0)}% — {formatAmount(p.remaining)} left
                  </span>
                </div>
              ))}
              {onTrack.length > 0 && (
                <div className="goals-insight goals-insight--ok">
                  <LuCheckCircle size={15} />
                  <span>
                    {onTrack.map((p) => p.name).join(', ')} {onTrack.length === 1 ? 'is' : 'are'} on track
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Category goals grid */}
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

        {/* Main grid — tracked categories only */}
        {trackedCategories.length > 0 ? (
          <div className="goals-grid">
            {sortedTrackedCategories.map((category, index) => {
              const prog = categoryProgress.find((p) => p.name === category.name);
              const pct = prog?.pct !== null ? Math.min(prog.pct, 100) : 0;
              const isDragging = draggingIndex === index;
              const isDragOver = dragOverIndex === index && draggingIndex !== index;

              return (
                <div
                  key={category.name}
                  className={`goal-card goal-card--active${isDragging ? ' goal-card--dragging' : ''}${isDragOver ? ' goal-card--drag-over' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="goal-card-header">
                    <div
                      className="goal-icon"
                      style={{
                        color: getCategoryColor(category.name),
                        background: `${getCategoryColor(category.name)}26`,
                      }}
                    >
                      <category.Icon size={20} />
                    </div>
                    <div className="goal-info">
                      <h4>{category.name}</h4>
                      {prog?.spent > 0
                        ? <p className="goal-spent">{formatAmount(prog.spent)} spent this month</p>
                        : <p className="goal-spent">No spending yet</p>
                      }
                    </div>
                    <div className="goal-drag-handle" title="Drag to reorder">
                      <LuGripVertical size={16} />
                    </div>
                  </div>

                  <div className="goal-progress-bar">
                    <div
                      className={`goal-progress-fill goal-progress-fill--${prog?.status ?? 'ok'}`}
                      style={{
                        width: `${pct}%`,
                        ...( (!prog?.status || prog.status === 'ok') ? { background: 'var(--accent-teal)' } : {} ),
                      }}
                    />
                  </div>
                  <div className="goal-progress-meta">
                    <span className={`goal-remaining${prog?.status !== 'ok' ? ` goal-remaining--${prog?.status}` : ''}`}
                      style={(!prog?.status || prog.status === 'ok') ? { color: 'var(--accent-teal)' } : {}}>
                      {(prog?.remaining ?? 0) >= 0
                        ? `${formatAmount(prog?.remaining ?? 0)} left of ${formatAmount(prog?.budget ?? 0)}`
                        : `${formatAmount(Math.abs(prog?.remaining ?? 0))} over ${formatAmount(prog?.budget ?? 0)}`}
                    </span>
                    <span className={`goal-pct goal-pct--${prog?.status ?? 'ok'}`}
                      style={(!prog?.status || prog.status === 'ok') ? { color: 'var(--accent-teal)' } : {}}>
                      {Math.min(prog?.pct ?? 0, 999).toFixed(0)}%
                    </span>
                  </div>

                  <div className="goal-input-row">
                    <label className="goal-input-label">Monthly goal ({currencySymbol})</label>
                    <div className="goal-input-wrapper">
                      <GoalInput
                        categoryName={category.name}
                        initialValue={toDisplayAmount(budgets.categories?.[category.name] ?? null)}
                        onSave={saveGoalConverted}
                      />
                      <button
                        className="goal-remove-btn"
                        onClick={() => setPendingRemoveCategory(category.name)}
                        title="Remove goal"
                        aria-label={`Remove ${category.name} budget goal`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
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

      {/* Budget vs Spent chart — only when at least one goal is set */}
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
