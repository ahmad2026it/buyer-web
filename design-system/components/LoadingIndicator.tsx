import React from 'react';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

const shimmerKeyframes = `
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
`;

let shimmerInjected = false;
function injectShimmer() {
  if (shimmerInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
  shimmerInjected = true;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = '16px', borderRadius = '4px', style }) => {
  injectShimmer();
  return (
    <div style={{
      width, height,
      borderRadius,
      background: 'linear-gradient(90deg, #F2F4F7 25%, #E4E7EC 50%, #F2F4F7 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  );
};

// ─── Skeleton Presets ─────────────────────────────────────────────────────────

export const SkeletonText: React.FC<{ lines?: number; lastWidth?: string; style?: React.CSSProperties }> = ({ lines = 3, lastWidth = '60%', style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} width={i === lines - 1 ? lastWidth : '100%'} height="16px" />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{
    border: '1px solid #EAECF0', borderRadius: '12px', padding: '24px',
    display: 'flex', flexDirection: 'column', gap: '16px',
    fontFamily: 'Inter, system-ui, sans-serif', ...style,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Skeleton width="40px" height="40px" borderRadius="50%" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Skeleton width="40%" height="14px" />
        <Skeleton width="25%" height="12px" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number; style?: React.CSSProperties }> = ({ rows = 5, cols = 4, style }) => (
  <div style={{ border: '1px solid #EAECF0', borderRadius: '12px', overflow: 'hidden', ...style }}>
    {/* Header */}
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, padding: '12px 24px', backgroundColor: '#F9FAFB', borderBottom: '1px solid #EAECF0', gap: '16px' }}>
      {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} width="60%" height="12px" />)}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, padding: '16px 24px', borderBottom: r < rows - 1 ? '1px solid #EAECF0' : 'none', gap: '16px' }}>
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} width={c === 0 ? '80%' : `${40 + Math.floor(Math.random() * 40)}%`} height="14px" />
        ))}
      </div>
    ))}
  </div>
);

// ─── Page Loader ──────────────────────────────────────────────────────────────

export interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message, fullScreen = false }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
    ...(fullScreen ? { position: 'fixed', inset: 0, backgroundColor: '#FFFFFF', zIndex: 9999 } : { padding: '48px' }),
    fontFamily: 'Inter, system-ui, sans-serif',
  }}>
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="17" stroke="#EAECF0" strokeWidth="4" />
      <path d="M20 3a17 17 0 0 1 17 17" stroke="#7F56D9" strokeWidth="4" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
    {message && <p style={{ margin: 0, fontSize: '14px', lineHeight: '20px', color: '#475467' }}>{message}</p>}
  </div>
);
