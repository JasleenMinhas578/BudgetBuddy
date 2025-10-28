import { useState, useEffect} from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/main.css';

export default function DashboardOverview() {
  // State management for data
  const [recentExpenses, setRecentExpenses] = useState([]);
  
  // Get current user from authentication context
  const { currentUser } = useAuth();

  // Debug logging for development
  console.log('currentUser:', currentUser);
  if (currentUser) {
    console.log('Firestore path:', `users/${currentUser.uid}/expenses`);
  }

  useEffect(() => {
    if (currentUser) {
      console.log('Firestore path:', `users/${currentUser.uid}/expenses`);
      
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
        
        // Get the 5 most recent expenses for the recent activity section
        setRecentExpenses(sortedExpenses.slice(0, 5));
      });

      
      
      const unsubscribeCategories = onSnapshot(qCategories, (querySnapshot) => {
        const categoriesData = [];
        querySnapshot.forEach((doc) => {
          categoriesData.push({ id: doc.id, ...doc.data() });
        });
      });

      // Cleanup function to remove listeners when component unmounts
      return () => {
        unsubscribeExpenses();
        unsubscribeCategories();
      };
    }
  }, [currentUser]);

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
          <h1>Welcome back!</h1>
          <p className="welcome-subtitle">Here's what's happening with your finances today.</p>
        </div>
        <div className="welcome-illustration">
          <div className="illustration-circle">
            <span>💰</span>
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