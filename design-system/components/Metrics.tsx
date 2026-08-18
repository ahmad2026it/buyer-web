import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MetricTrend = 'up' | 'down' | 'neutral';

export interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: MetricTrend;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  description?: string;
  chart?: React.ReactNode;
  style?: React.CSSProperties;
}

// ─── Trend Icon ───────────────────────────────────────────────────────────────

const TrendArrow: React.FC<{ trend: MetricTrend }> = ({ trend }) => {
  if (trend === 'neutral') return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d={trend === 'up' ? 'M3 11L8 6l5 5' : 'M3 5l5 5 5-5'}
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
};

// ─── MetricCard ───────────────────────────────────────────────────────────────

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  badge,
  description,
  chart,
  style,
}) => {
  const trendColors = {
    up:      { bg: '#ECFDF3', text: '#067647', border: '#A9EFC5' },
    down:    { bg: '#FEF3F2', text: '#B42318', border: '#FECDCA' },
    neutral: { bg: '#F9FAFB', text: '#344054', border: '#EAECF0' },
  };
  const tc = trendColors[trend];

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #EAECF0',
      borderRadius: '12px',
      boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.10), 0px 1px 2px rgba(16, 24, 40, 0.06)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      fontFamily: 'Inter, system-ui, sans-serif',
      ...style,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <div style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: '#475467' }}>
            {title}
          </div>
          <div style={{ fontSize: '36px', lineHeight: '44px', fontWeight: 600, color: '#101828', letterSpacing: '-0.02em' }}>
            {value}
          </div>
        </div>
        {icon && (
          <div style={{
            width: '48px', height: '48px', borderRadius: '10px',
            border: '1px solid #EAECF0', backgroundColor: '#F9FAFB',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
        {badge}
      </div>

      {/* Chart area */}
      {chart && <div>{chart}</div>}

      {/* Bottom row */}
      {(change || description) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {change && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '2px 8px 2px 6px',
              borderRadius: '9999px',
              backgroundColor: tc.bg,
              border: `1px solid ${tc.border}`,
              color: tc.text,
              fontSize: '14px', lineHeight: '20px', fontWeight: 500,
            }}>
              <TrendArrow trend={trend} />
              {change}
            </span>
          )}
          {description && (
            <span style={{ fontSize: '14px', lineHeight: '20px', color: '#475467' }}>
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ─── MetricGrid ───────────────────────────────────────────────────────────────

export interface MetricGridProps {
  metrics: MetricCardProps[];
  columns?: 1 | 2 | 3 | 4;
  style?: React.CSSProperties;
}

export const MetricGrid: React.FC<MetricGridProps> = ({ metrics, columns = 4, style }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: '24px',
    ...style,
  }}>
    {metrics.map((m, i) => <MetricCard key={i} {...m} />)}
  </div>
);
