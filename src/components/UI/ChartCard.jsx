import CuteEmptyFace from './CuteEmptyFace';

export default function ChartCard({ title, children, isEmpty = false }) {
  return (
    <div className="chart-container">
      <div className="chart-card">
        <h3>{title}</h3>
        <div className="chart-wrapper">
          {isEmpty
            ? (
              <div className="chart-empty-state">
                <CuteEmptyFace size={96} />
                <p className="chart-empty-text">No data yet</p>
              </div>
            )
            : children
          }
        </div>
      </div>
    </div>
  );
}
