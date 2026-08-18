import React from 'react';

// ─── Progress Bar ─────────────────────────────────────────────────────────────

export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';
export type ProgressColor = 'brand' | 'success' | 'warning' | 'error' | 'gray';

export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: ProgressSize;
  color?: ProgressColor;
  label?: string;
  showValue?: boolean;
  striped?: boolean;
  style?: React.CSSProperties;
}

const progressSizes: Record<ProgressSize, string> = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
};

const progressColors: Record<ProgressColor, { track: string; fill: string }> = {
  brand:   { track: '#F4EBFF', fill: '#7F56D9' },
  success: { track: '#DCFAE6', fill: '#17B26A' },
  warning: { track: '#FEF0C7', fill: '#F79009' },
  error:   { track: '#FEE4E2', fill: '#F04438' },
  gray:    { track: '#EAECF0', fill: '#667085' },
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'sm',
  color = 'brand',
  label,
  showValue = false,
  style,
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const ct = progressColors[color];
  const height = progressSizes[size];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && <span style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: '#344054', fontFamily: 'Inter, system-ui, sans-serif' }}>{label}</span>}
          {showValue && <span style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: '#344054', fontFamily: 'Inter, system-ui, sans-serif' }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        style={{
          width: '100%',
          height,
          borderRadius: '9999px',
          backgroundColor: ct.track,
          overflow: 'hidden',
        }}
      >
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: '9999px',
          backgroundColor: ct.fill,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
};

// ─── Circular Progress ────────────────────────────────────────────────────────

export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: ProgressColor;
  label?: React.ReactNode;
  style?: React.CSSProperties;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 64,
  strokeWidth = 8,
  color = 'brand',
  label,
  style,
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct / 100);
  const ct = progressColors[color];

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={ct.track} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={ct.fill} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      {label && (
        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12px', fontWeight: 600, color: '#344054' }}>
          {label}
        </div>
      )}
    </div>
  );
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

const spinnerSizes: Record<SpinnerSize, number> = { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 };

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = '#7F56D9',
  style,
  className,
}) => {
  const px = spinnerSizes[size];

  return (
    <svg
      width={px} height={px}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
      role="status"
      style={{ animation: 'spin 0.75s linear infinite', ...style }}
      className={className}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};
