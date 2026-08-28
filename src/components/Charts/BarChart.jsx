import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../../styles/main.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function getChartColors() {
  const theme = document.documentElement.dataset.theme;
  const isDark = theme === 'dark' || (theme !== 'light' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  return {
    text: isDark ? '#e2e8f0' : '#334155',
    grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
  };
}

export default function BarChart({ data, options: overrides = {} }) {
  const { text, grid } = getChartColors();
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 0, ...(overrides.layout || {}) },
    plugins: {
      legend: { position: 'top', labels: { color: text } },
      ...(overrides.plugins || {}),
    },
    scales: {
      x: {
        grid: { color: grid },
        ticks: { color: text },
        ...(overrides.scales?.x || {}),
      },
      y: {
        beginAtZero: true,
        grid: { color: grid },
        ticks: { color: text },
        ...(overrides.scales?.y || {}),
      },
    },
  };

  return <Bar options={options} data={data} />;
}
