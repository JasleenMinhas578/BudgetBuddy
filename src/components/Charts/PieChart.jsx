import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../../styles/main.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function getChartTextColor() {
  const theme = document.documentElement.dataset.theme;
  if (theme === 'light') return '#334155';
  if (theme === 'dark') return '#e2e8f0';
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e2e8f0' : '#334155';
}

export default function PieChart({ data }) {
  const options = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: getChartTextColor(),
          font: { family: "'Inter', sans-serif" },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return <Pie data={data} options={options} />;
}
