import { useState, useEffect} from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import '../../styles/main.css';


export default function DashboardOverview() {
  // State management for data
  const [expenses, setExpenses] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  
  // Get current user from authentication context
  const { currentUser } = useAuth();

  /**
   * Set up real-time data listeners for expenses and categories
   * This effect runs when the component mounts and when currentUser changes
   */
  useEffect(() => {
    if (currentUser) {
      // Set up real-time listener for expenses
      const qExpenses = query(
        collection(db, 'users', currentUser.uid, 'expenses'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribeExpenses = onSnapshot(qExpenses, (querySnapshot) => {
        const expensesData = [];
        querySnapshot.forEach((doc) => {
          expensesData.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort expenses by date (most recent first)
        const sortedExpenses = expensesData.sort((a, b) => {
          if (a.date && b.date) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          return 0;
        });
        
        setExpenses(sortedExpenses);
        // Get the 5 most recent expenses for the recent activity section
        setRecentExpenses(sortedExpenses.slice(0, 5));
      });


      // Cleanup function to remove listeners when component unmounts
      return () => {
        unsubscribeExpenses();
      };
    }
  }, [currentUser]);

  // Calculate summary statistics from expenses data
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate this month's expenses
  const thisMonthExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate average expense amount
  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  
  // Calculate top spending category
  const topCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const topCategoryName = Object.keys(topCategory).length > 0 
    ? Object.entries(topCategory).sort(([,a], [,b]) => b - a)[0][0]
    : 'None';

  // Check if this is a first-time user (no expenses yet)
  const isFirstTimeUser = expenses.length === 0;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${months[parseInt(month, 10) - 1]} ${day}, ${year}`;
  };

  return (
    <div className="dashboard-overview">
      {/* Welcome Section */}
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
          <div className="illustration-circle">
            <span>💰</span>
          </div>
        </div>
      </div>

      {/* Summary Cards - Key financial metrics */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <span>📊</span>
          </div>
          <div className="card-content">
            <h3>Total Expenses</h3>
            <p className="card-amount">${totalExpenses.toFixed(2)}</p>
            <p className="card-subtitle">All time</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <span>📅</span>
          </div>
          <div className="card-content">
            <h3>This Month</h3>
            <p className="card-amount">${thisMonthExpenses.toFixed(2)}</p>
            <p className="card-subtitle">Current month spending</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <span>📈</span>
          </div>
          <div className="card-content">
            <h3>Average</h3>
            <p className="card-amount">${averageExpense.toFixed(2)}</p>
            <p className="card-subtitle">Per transaction</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <span>🏆</span>
          </div>
          <div className="card-content">
            <h3>Top Category</h3>
            <p className="card-amount">{topCategoryName}</p>
            <p className="card-subtitle">Most spent category</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity">
        <div className="activity-header">
          <h3>Recent Expenses</h3>
          <a href="/dashboard/expenses" className="btn btn-primary view-all-link">View All</a>
        </div>
        
        <div className="activity-list">
          {recentExpenses.length > 0 ? (
            // Display recent expenses with details
            recentExpenses.map((expense) => (
              <div key={expense.id} className="activity-item">
                <div className="activity-icon">
                  <span>💸</span>
                </div>
                <div className="activity-content">
                  <h4>{expense.title}</h4>
                  <p>{expense.category} • {formatDate(expense.date)}</p>
                </div>
                <div className="activity-amount">
                  <span>${expense.amount.toFixed(2)}</span>
                </div>
              </div>
            ))
          ) : (
            // Empty state when no expenses exist
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h4>No expenses yet</h4>
              <p>Start tracking your expenses to see them here</p>
              <a href="/dashboard/expenses" className="btn btn-primary">Add First Expense</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 