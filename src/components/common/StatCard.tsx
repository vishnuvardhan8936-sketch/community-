import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconColorClass?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColorClass = 'stat-icon-blue',
  trend,
}) => {
  return (
    <div className="stat-card animate-fade-in">
      <div>
        <div className="stat-card-header">
          <span className="stat-card-title">{title}</span>
          <div className={`stat-icon-badge ${iconColorClass}`}>{icon}</div>
        </div>
        <div className="stat-card-value">{value}</div>
      </div>
      {(subtitle || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
          {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
          {trend && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: trend.isPositive ? '#16a34a' : '#64748b',
                backgroundColor: trend.isPositive ? '#f0fdf4' : '#f1f5f9',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
              }}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
