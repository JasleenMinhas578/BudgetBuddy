import { useState, useEffect, useMemo } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LuTag, LuPlus, LuFileText, LuFileSpreadsheet } from 'react-icons/lu';
import { useDateFilter } from '../../hooks/useDateFilter';
import { useDateRangeContext } from '../../context/DateRangeContext';
import { useExpenses } from '../../hooks/useExpenses';
import { useBudgets } from '../../hooks/useBudgets';
import { useBudgetProgress } from '../../hooks/useBudgetProgress';
import { useReportData } from '../../hooks/useReportData';
import { useReportExport } from '../../hooks/useReportExport';
import { DEFAULT_CATEGORIES } from '../../utils/getCategoryIcon';
import { validCategory } from '../../utils/categoryUtils';
import DateFilterBar from '../UI/DateFilterBar';
import BudgetBuddyLogo from '../UI/BudgetBuddyLogo';
import ExpenseTable from '../UI/ExpenseTable';
import Modal from '../UI/Modal';
import ExpenseForm from '../Expense/ExpenseForm';
import BudgetProgressPanel from './BudgetProgressPanel';
import { getMonthEndForecast } from '../../utils/forecastUtils';
import { useCurrency } from '../../context/CurrencyContext';
import BudgetAlertStrip from '../DashboardOverview/BudgetAlertStrip';
import SummaryCards from '../DashboardOverview/SummaryCards';
import SpendingInsightsBlock from '../DashboardOverview/SpendingInsightsBlock';
import ChartsBlock from '../DashboardOverview/ChartsBlock';
import Toast from '../UI/Toast';
import { useToast } from '../../hooks/useToast';
import '../../styles/main.css';


export default function DashboardOverview() {
  const { formatAmount } = useCurrency();
  const { expenses, loading, error: expensesError } = useExpenses();
  const { budgets, setCategoryBudget } = useBudgets();
  const firestoreCategories = useCategories();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('export') === 'open') {
      setExportModalOpen(true);
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate]);

  const allCategories = useMemo(() => [
    ...DEFAULT_CATEGORIES,
    ...firestoreCategories
      .filter(c => c && validCategory(c.name))
      .map(c => ({ ...c, Icon: LuTag })),
  ], [firestoreCategories]);

  const dateRangeCtx = useDateRangeContext();
  const { filteredExpenses, dateFilter, setDateFilter, customDateRange, setCustomDateRange, pickedMonth, setPickedMonth, availableMonths } = useDateFilter(expenses, 'thisMonth', dateRangeCtx);

  const { categoryProgress, closestToLimit } = useBudgetProgress(filteredExpenses, allCategories, budgets);

  const dangerCategories = categoryProgress.filter(c => c.status === 'danger');
  const warnCategories = categoryProgress.filter(c => c.status === 'warning');

  const recentExpenses = filteredExpenses.slice(0, 5);

  const { categoryData, monthlyData, spendingInsights, totalAmount: reportTotal, averageAmount: reportAvg, topCategory } = useReportData(filteredExpenses);

  const {
    isGeneratingPDF,
    pdfError, setPdfError,
    aiSummary, setAiSummary,
    aiSummaryLoading,
    aiSummaryError, setAiSummaryError,
    handleGenerateSummary,
    exportToCSV,
    generatePDF,
  } = useReportExport({ filteredExpenses, dateFilter, customDateRange, totalAmount: reportTotal, averageAmount: reportAvg, categoryData, topCategory });

  useEffect(() => {
    if (pdfError) { showToast(pdfError, 'error'); setPdfError(null); }
  }, [pdfError, setPdfError, showToast]);

  const forecastResult = dateFilter === 'thisMonth' ? getMonthEndForecast(filteredExpenses) : null;

  const isFirstTimeUser = !loading && expenses.length === 0;

  if (expensesError) {
    return (
      <div className="dashboard-overview">
        <p style={{ color: 'var(--color-danger, #e53e3e)', padding: '2rem' }}>
          Failed to load expenses. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      {toast && <Toast message={toast.message} type={toast.type} isVisible onClose={hideToast} />}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>{isFirstTimeUser ? 'Welcome!' : 'Welcome back!'}</h1>
          <p className="welcome-subtitle">
            {isFirstTimeUser
              ? 'Let\'s start tracking your expenses and take control of your finances.'
              : 'Here\'s what\'s happening with your finances today.'
            }
          </p>
        </div>
        <div className="welcome-illustration">
          <BudgetBuddyLogo size={80} />
        </div>
      </div>

      <div className="filter-controls">
        <DateFilterBar
          dateFilter={dateFilter}
          onChange={setDateFilter}
          customDateRange={customDateRange}
          onCustomDateRangeChange={setCustomDateRange}
          pickedMonth={pickedMonth}
          onPickedMonthChange={setPickedMonth}
          availableMonths={availableMonths}
        />
      </div>

      <BudgetAlertStrip
        dangerCategories={dangerCategories}
        warnCategories={warnCategories}
        formatAmount={formatAmount}
      />

      <SummaryCards
        totalSpent={reportTotal}
        averageExpense={reportAvg}
        transactionCount={filteredExpenses.length}
        topCategory={topCategory}
        closestToLimit={closestToLimit}
        formatAmount={formatAmount}
      />

      {['today', 'thisWeek', 'thisMonth', 'pickMonth'].includes(dateFilter) && (
        <BudgetProgressPanel
          expenses={expenses}
          allCategories={allCategories}
          budgets={budgets}
          forecastResult={forecastResult}
          setCategoryBudget={setCategoryBudget}
        />
      )}

      <div className="recent-activity">
        <div className="activity-header">
          <h3>Recent Expenses</h3>
          <div className="activity-header-actions">
            <button onClick={() => setIsAddExpenseOpen(true)} className="btn btn-primary">
              <LuPlus size={15} />
              Add Expense
            </button>
            <Link to="/dashboard/expenses" className="btn btn-secondary view-all-link">View All</Link>
          </div>
        </div>

        <ExpenseTable
          expenses={recentExpenses}
          showCategoryFilter={true}
          itemsPerPage={5}
          showPagination={false}
          emptyMessage="No expenses yet"
          emptySubMessage="Start tracking your expenses to see them here"
          emptyAction={
            <button onClick={() => setIsAddExpenseOpen(true)} className="btn btn-primary">
              Add First Expense
            </button>
          }
        />
      </div>

      <SpendingInsightsBlock
        handleGenerateSummary={handleGenerateSummary}
        aiSummaryLoading={aiSummaryLoading}
        aiSummary={aiSummary}
        setAiSummary={setAiSummary}
        aiSummaryError={aiSummaryError}
        setAiSummaryError={setAiSummaryError}
        spendingInsights={spendingInsights}
        hasExpenses={filteredExpenses.length > 0}
      />

      <ChartsBlock
        isEmpty={filteredExpenses.length === 0}
        categoryData={categoryData}
        monthlyData={monthlyData}
      />

      <Modal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} title="Add New Expense">
        <ExpenseForm
          onExpenseAdded={() => setIsAddExpenseOpen(false)}
          onCancel={() => setIsAddExpenseOpen(false)}
        />
      </Modal>

      <Modal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} title="Export Data">
        <div className="export-modal-body">
          <div className="export-modal-date-section">
            <p className="export-modal-date-label">Select date range</p>
            <DateFilterBar
              dateFilter={dateFilter}
              onChange={setDateFilter}
              customDateRange={customDateRange}
              onCustomDateRangeChange={setCustomDateRange}
              pickedMonth={pickedMonth}
              onPickedMonthChange={setPickedMonth}
              availableMonths={availableMonths}
            />
          </div>

          <div className="export-modal-options">
            <button
              className="export-modal-option"
              onClick={() => { generatePDF(); setExportModalOpen(false); }}
              disabled={isGeneratingPDF || filteredExpenses.length === 0}
            >
              <LuFileText size={22} />
              <div className="export-modal-option-text">
                <span className="export-modal-option-label">PDF Report</span>
                <span className="export-modal-option-desc">Formatted report with charts and summary</span>
              </div>
            </button>
            <button
              className="export-modal-option"
              onClick={() => { exportToCSV(); setExportModalOpen(false); }}
              disabled={filteredExpenses.length === 0}
            >
              <LuFileSpreadsheet size={22} />
              <div className="export-modal-option-text">
                <span className="export-modal-option-label">CSV Spreadsheet</span>
                <span className="export-modal-option-desc">Raw data for Excel or Google Sheets</span>
              </div>
            </button>
          </div>

          {filteredExpenses.length === 0 && (
            <p className="export-modal-empty">No expenses in the selected date range to export.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
