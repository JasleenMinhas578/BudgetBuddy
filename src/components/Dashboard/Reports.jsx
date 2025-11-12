import { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestoreConfig';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import '../../styles/main.css';
import '../../styles/dashboard-fixes.css';

export default function Reports() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
  
    let unsubscribe = () => {};
  
    const setupListener = async () => {
      try {
        const qExpenses = query(
          collection(db, 'users', currentUser.uid, 'expenses'),
          orderBy('createdAt', 'desc')
        );
        
        unsubscribe = onSnapshot(qExpenses, (querySnapshot) => {
          const expensesData = [];
          querySnapshot.forEach((doc) => {
            expensesData.push({ id: doc.id, ...doc.data() });
          });
          setExpenses(expensesData);
        }, (error) => {
          console.error("Error in expenses listener:", error);
        });
  
      } catch (error) {
        console.error("Error setting up listener:", error);
      }
    };
  
    setupListener();
  
    return () => {
      // Cleanup function
      try {
        if (typeof unsubscribe === 'function') unsubscribe();
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
    };
  }, [currentUser]);



  const filterExpenses = useCallback(() => {
    let filtered = [...expenses];
    switch (dateFilter) {
      case 'today':
        const today = format(new Date(), 'yyyy-MM-dd');
        filtered = expenses.filter(expense => expense.date === today);
        break;
      case 'thisMonth':
        const now = new Date();
        const startOfThisMonth = startOfMonth(now);
        const endOfThisMonth = endOfMonth(now);
        filtered = expenses.filter(expense => {
          const expenseDate = parseISO(expense.date);
          return expenseDate >= startOfThisMonth && expenseDate <= endOfThisMonth;
        });
        break;
      case 'lastMonth':
        const lastMonth = subMonths(new Date(), 1);
        const startOfLastMonth = startOfMonth(lastMonth);
        const endOfLastMonth = endOfMonth(lastMonth);
        filtered = expenses.filter(expense => {
          const expenseDate = parseISO(expense.date);
          return expenseDate >= startOfLastMonth && expenseDate <= endOfLastMonth;
        });
        break;
      case 'thisYear':
        const thisYear = new Date();
        const startOfThisYear = startOfYear(thisYear);
        const endOfThisYear = endOfYear(thisYear);
        filtered = expenses.filter(expense => {
          const expenseDate = parseISO(expense.date);
          return expenseDate >= startOfThisYear && expenseDate <= endOfThisYear;
        });
        break;
      case 'lastYear':
        const lastYear = subYears(new Date(), 1);
        const startOfLastYear = startOfYear(lastYear);
        const endOfLastYear = endOfYear(lastYear);
        filtered = expenses.filter(expense => {
          const expenseDate = parseISO(expense.date);
          return expenseDate >= startOfLastYear && expenseDate <= endOfLastYear;
        });
        break;
      case 'custom':
        filtered = expenses.filter(expense => {
          const expenseDate = parseISO(expense.date);
          const startDate = parseISO(customDateRange.startDate);
          const endDate = parseISO(customDateRange.endDate);
          return expenseDate >= startDate && expenseDate <= endDate;
        });
        break;
      default:
        filtered = expenses;
    }
    // Sort filtered expenses by date (most recent first)
    filtered.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });
    setFilteredExpenses(filtered);
  }, [expenses, dateFilter, customDateRange]);

  useEffect(() => {
    filterExpenses();
  }, [expenses, dateFilter, customDateRange, filterExpenses]);

  const getCategoryData = () => {
    const categoryMap = {};
    
    filteredExpenses.forEach(expense => {
      if (categoryMap[expense.category]) {
        categoryMap[expense.category] += expense.amount;
      } else {
        categoryMap[expense.category] = expense.amount;
      }
    });
    
    return {
    };
  };
    
    return {
    };
  }

        {/* Detailed Expenses Table */}
        <div className="expenses-table-section">
          <div className="section-subheader">
            <h3>Detailed Expenses</h3>
            <p>Complete breakdown of all transactions in the selected period</p>
          </div>
          
          {filteredExpenses.length > 0 ? (
            <div className="expenses-table-container">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Title</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>
                        <span className="date-cell">
                          {format(parseISO(expense.date), 'MMM dd, yyyy')}
                        </span>
                      </td>
                      <td>
                        <span className="expense-title">{expense.title}</span>
                      </td>
                      <td>
                        <span className="amount-cell">${expense.amount.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h4>No expenses found</h4>
              <p>No expenses match the selected date range</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}