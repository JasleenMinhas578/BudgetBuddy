import { useState } from 'react';
import { LuChevronDown, LuChevronUp, LuBarChart2 } from 'react-icons/lu';
import ChartCard from '../UI/ChartCard';
import PieChart from '../Charts/PieChart';
import LineChart from '../Charts/LineChart';

export default function ChartsBlock({ isEmpty, categoryData, monthlyData }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="spending-insights-block" id="report-content">
      <div className="spending-insights-toggle" aria-expanded={isOpen}>
        <button className="spending-insights-expand" onClick={() => setIsOpen(o => !o)}>
          <span className="spending-insights-toggle-left">
            <LuBarChart2 size={18} />
            <span>Charts &amp; Visualizations</span>
          </span>
        </button>
        <button
          className="spending-insights-chevron"
          onClick={() => setIsOpen(o => !o)}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
        >
          {isOpen ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="spending-insights-content">
          <div className="charts-section">
            <ChartCard title="Spending by Category" isEmpty={isEmpty}>
              <PieChart data={categoryData} />
            </ChartCard>
            <ChartCard title="Monthly Trend" isEmpty={isEmpty}>
              <LineChart data={monthlyData} />
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}
