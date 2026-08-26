import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../../styles/main.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarChart({ data, options: overrides = {} }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 0, ...(overrides.layout || {}) },
    plugins: {
      legend: { position: 'top', labels: { color: '#e2e8f0' } },
      ...(overrides.plugins || {}),
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#e2e8f0' },
        ...(overrides.scales?.x || {}),
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#e2e8f0' },
        ...(overrides.scales?.y || {}),
      },
    },
  };

  return <Bar options={options} data={data} />;
}