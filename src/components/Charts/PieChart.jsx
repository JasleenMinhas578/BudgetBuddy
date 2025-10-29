import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../../styles/main.css';

/**
 * Register Chart.js components required for pie charts
 * This must be done before using any Chart.js components
 */
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * PieChart Component
 * 
 * A reusable pie chart component built with Chart.js that displays
 * categorical data in a circular format. Perfect for showing:
 * - Spending breakdown by category
 * - Budget allocation
 * - Any proportional data distribution
 * 
 * Features:
 * - Responsive design that adapts to container size
 * - Custom color palette for different categories
 * - Interactive tooltips on hover
 * - Legend display on the right side
 * - Consistent styling with the app theme
 * 
 * @param {Object} props - Component props
 * @param {Object} props.data - Chart.js data object containing labels and datasets
 * @returns {JSX.Element} Rendered pie chart component
 */
export default function PieChart({ data }) {
  // Chart configuration options
  const options = {
    plugins: {
      legend: {
        position: 'right', // Place legend on the right side
        labels: {
          color: '#e2e8f0', // Light gray text color for dark theme compatibility
          font: {
            family: "'Inter', sans-serif" // Consistent font with app design
          }
        }
      }
    },
    maintainAspectRatio: false // Allow chart to fill container height
  };

  return (
    <div className="chart-wrapper">
      {/* Render the pie chart with provided data and options */}
      <Pie data={data} options={options} />
    </div>
  );
}