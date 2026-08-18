import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TooltipTheme = 'dark' | 'light';
export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export interface TooltipProps {
  content: React.ReactNode;
  supportingText?: string;
  placement?: TooltipPlacement;
  theme?: TooltipTheme;
  delay?: number;
  disabled?: boolean;
  children: React.ReactElement;
}

// ─── Theme Tokens ─────────────────────────────────────────────────────────────

const themeTokens: Record<TooltipTheme, {
  bg: string;
  border: string;
  textColor: string;
  supportingColor: string;
  arrowColor: string;
  boxShadow: string;
}> = {
  dark: {
    bg: '#0C111D',
    border: '#1D2939',
    textColor: '#FFFFFF',
    supportingColor: '#98A2B3',
    arrowColor: '#0C111D',
    boxShadow: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
  },
  light: {
    bg: '#FFFFFF',
    border: '#EAECF0',
    textColor: '#344054',
    supportingColor: '#475467',
    arrowColor: '#FFFFFF',
    boxShadow: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
  },
};

// ─── Arrow Position Helpers ───────────────────────────────────────────────────

const ARROW_SIZE = 6;
const OFFSET = 8;

interface PositionStyle {
  tooltip: React.CSSProperties;
  arrow: React.CSSProperties;
}

function getPositionStyles(placement: TooltipPlacement): PositionStyle {
  const base: Record<string, PositionStyle> = {
    top: {
      tooltip: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: `${OFFSET}px` },
      arrow: { top: '100%', left: '50%', transform: 'translateX(-50%)', borderTopColor: 'inherit', borderBottomWidth: 0 },
    },
    'top-start': {
      tooltip: { bottom: '100%', left: 0, marginBottom: `${OFFSET}px` },
      arrow: { top: '100%', left: '16px', borderTopColor: 'inherit', borderBottomWidth: 0 },
    },
    'top-end': {
      tooltip: { bottom: '100%', right: 0, marginBottom: `${OFFSET}px` },
      arrow: { top: '100%', right: '16px', borderTopColor: 'inherit', borderBottomWidth: 0 },
    },
    bottom: {
      tooltip: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: `${OFFSET}px` },
      arrow: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', borderBottomColor: 'inherit', borderTopWidth: 0 },
    },
    'bottom-start': {
      tooltip: { top: '100%', left: 0, marginTop: `${OFFSET}px` },
      arrow: { bottom: '100%', left: '16px', borderBottomColor: 'inherit', borderTopWidth: 0 },
    },
    'bottom-end': {
      tooltip: { top: '100%', right: 0, marginTop: `${OFFSET}px` },
      arrow: { bottom: '100%', right: '16px', borderBottomColor: 'inherit', borderTopWidth: 0 },
    },
    left: {
      tooltip: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: `${OFFSET}px` },
      arrow: { left: '100%', top: '50%', transform: 'translateY(-50%)', borderLeftColor: 'inherit', borderRightWidth: 0 },
    },
    'left-start': {
      tooltip: { right: '100%', top: 0, marginRight: `${OFFSET}px` },
      arrow: { left: '100%', top: '16px', borderLeftColor: 'inherit', borderRightWidth: 0 },
    },
    'left-end': {
      tooltip: { right: '100%', bottom: 0, marginRight: `${OFFSET}px` },
      arrow: { left: '100%', bottom: '16px', borderLeftColor: 'inherit', borderRightWidth: 0 },
    },
    right: {
      tooltip: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: `${OFFSET}px` },
      arrow: { right: '100%', top: '50%', transform: 'translateY(-50%)', borderRightColor: 'inherit', borderLeftWidth: 0 },
    },
    'right-start': {
      tooltip: { left: '100%', top: 0, marginLeft: `${OFFSET}px` },
      arrow: { right: '100%', top: '16px', borderRightColor: 'inherit', borderLeftWidth: 0 },
    },
    'right-end': {
      tooltip: { left: '100%', bottom: 0, marginLeft: `${OFFSET}px` },
      arrow: { right: '100%', bottom: '16px', borderRightColor: 'inherit', borderLeftWidth: 0 },
    },
  };

  return base[placement] || base.top;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  supportingText,
  placement = 'top',
  theme = 'dark',
  delay = 300,
  disabled = false,
  children,
}) => {
  const [visible, setVisible] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const tt = themeTokens[theme];
  const pos = getPositionStyles(placement);

  const show = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  React.useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 9999,
    maxWidth: '240px',
    padding: supportingText ? '8px 12px' : '6px 12px',
    borderRadius: '8px',
    backgroundColor: tt.bg,
    border: `1px solid ${tt.border}`,
    boxShadow: tt.boxShadow,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    fontFamily: 'Inter, system-ui, sans-serif',
    ...pos.tooltip,
  };

  const arrowStyle: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderWidth: `${ARROW_SIZE}px`,
    borderStyle: 'solid',
    borderColor: 'transparent',
    pointerEvents: 'none',
    ...pos.arrow,
  };

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div role="tooltip" style={tooltipStyle}>
          <div style={{
            fontSize: '12px',
            lineHeight: '18px',
            fontWeight: 600,
            color: tt.textColor,
            whiteSpace: supportingText ? 'normal' : 'nowrap',
          }}>
            {content}
          </div>
          {supportingText && (
            <div style={{
              fontSize: '12px',
              lineHeight: '18px',
              fontWeight: 400,
              color: tt.supportingColor,
              marginTop: '4px',
              whiteSpace: 'normal',
            }}>
              {supportingText}
            </div>
          )}
          <div style={{
            ...arrowStyle,
            borderTopColor: placement.startsWith('top') ? tt.bg : 'transparent',
            borderBottomColor: placement.startsWith('bottom') ? tt.bg : 'transparent',
            borderLeftColor: placement.startsWith('left') ? tt.bg : 'transparent',
            borderRightColor: placement.startsWith('right') ? tt.bg : 'transparent',
          }} />
        </div>
      )}
    </span>
  );
};
