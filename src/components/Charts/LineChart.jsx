import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useCurrency } from '../../context/CurrencyContext';
import '../../styles/main.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function getChartColors() {
  const theme = document.documentElement.dataset.theme;
  const isDark = theme === 'dark' || (theme !== 'light' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  return {
    text: isDark ? '#e2e8f0' : '#334155',
    grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
  };
}

export default function LineChart({ data }) {
  const { formatAmount } = useCurrency();
  const { text, grid } = getChartColors();
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: text,
          font: { family: "'Inter', sans-serif" },
        },
      },
    },
    scales: {
      x: {
        grid: { color: grid },
        ticks: { color: text },
      },
      y: {
        beginAtZero: true,
        grid: { color: grid },
        ticks: {
          color: text,
          callback: (value) => formatAmount(value),
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
