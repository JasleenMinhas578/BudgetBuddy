import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../../styles/main.css';

/**
 * Register Chart.js components required for line charts
 * This must be done before using any Chart.js components
 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * LineChart Component
 * 
 * A reusable line chart component built with Chart.js that displays
 * time-series data in a linear format. Perfect for showing:
 * - Monthly spending trends
 * - Budget vs actual spending over time
 * - Any data that changes over time
 * 
 * Features:
 * - Responsive design that adapts to container size
 * - Smooth curved lines with tension
 * - Interactive tooltips on hover
 * - Grid lines for better readability
 * - Consistent styling with the app theme
 * 
 * @param {Object} props - Component props
 * @param {Object} props.data - Chart.js data object containing labels and datasets
 * @returns {JSX.Element} Rendered line chart component
 */
export default function LineChart({ data }) {
  // Chart configuration options
  const options = {
    responsive: true, // Make chart responsive to container size
    maintainAspectRatio: false, // Allow chart to fill container height
    plugins: {
      legend: {
        position: 'top', // Place legend at the top
        labels: {
          color: '#e2e8f0', // Light gray text color for dark theme compatibility
          font: {
            family: "'Inter', sans-serif" // Consistent font with app design
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)' // Subtle grid lines
        },
        ticks: {
          color: '#e2e8f0' // Light gray text color
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)' // Subtle grid lines
        },
        ticks: {
          color: '#e2e8f0', // Light gray text color
          callback: function(value) {
            // Format y-axis labels as currency
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="chart-wrapper">
      {/* Render the line chart with provided data and options */}
      <Line data={data} options={options} />
    </div>
  );
}