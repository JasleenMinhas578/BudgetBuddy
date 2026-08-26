export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="section-header">
      <div className="header-content">
        <h2>{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
