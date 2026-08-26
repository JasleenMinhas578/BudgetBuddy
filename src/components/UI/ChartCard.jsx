export default function ChartCard({ title, children }) {
  return (
    <div className="chart-container">
      <div className="chart-card">
        <h3>{title}</h3>
        <div className="chart-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}
