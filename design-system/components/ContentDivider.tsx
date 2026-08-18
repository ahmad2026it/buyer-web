import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContentDividerProps {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  align?: 'left' | 'center' | 'right';
  color?: string;
  style?: React.CSSProperties;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ContentDivider: React.FC<ContentDividerProps> = ({
  label,
  orientation = 'horizontal',
  align = 'center',
  color = '#EAECF0',
  style,
}) => {
  if (orientation === 'vertical') {
    return (
      <div style={{
        width: '1px',
        alignSelf: 'stretch',
        backgroundColor: color,
        flexShrink: 0,
        ...style,
      }} />
    );
  }

  if (!label) {
    return (
      <hr style={{
        border: 'none',
        borderTop: `1px solid ${color}`,
        margin: 0,
        ...style,
      }} />
    );
  }

  const lineStyle: React.CSSProperties = {
    flex: align === 'left' || align === 'right' ? undefined : 1,
    borderTop: `1px solid ${color}`,
    height: 0,
    ...(align === 'left' ? { width: '16px', flexShrink: 0 } : {}),
    ...(align === 'right' ? { width: '16px', flexShrink: 0 } : {}),
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontFamily: 'Inter, system-ui, sans-serif',
      ...style,
    }}>
      {align !== 'left' && <div style={lineStyle} />}
      <span style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: '#667085', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {label}
      </span>
      {align !== 'right' && <div style={{ ...lineStyle, flex: 1 }} />}
    </div>
  );
};
