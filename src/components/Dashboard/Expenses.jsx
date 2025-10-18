import { useState} from 'react';
import Toast from '../UI/Toast';
import '../../styles/main.css';
import '../../styles/modal-forms.css';

export default function Expenses() {
  const [expenses] = useState([]);
  const [toast, setToast] = useState(null);

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

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
    <div className="expenses-container">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="expenses-table-container">
        {expenses.length > 0 ? (
        <table className="expenses-table">
          <thead>
            <tr>
                <th>Category</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
        </table>
        ) : (
          <div className="empty-state">
            <p>No expenses recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}