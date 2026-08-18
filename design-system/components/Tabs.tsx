import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  content?: React.ReactNode;
}

export type TabsVariant = 'underline' | 'pills' | 'pills-gray' | 'enclosed';
export type TabsSize = 'sm' | 'md' | 'lg';

export interface TabsProps {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

// ─── Size Tokens ──────────────────────────────────────────────────────────────

const tabSizes: Record<TabsSize, { paddingX: string; paddingY: string; fontSize: string; lineHeight: string; gap: string }> = {
  sm: { paddingX: '12px', paddingY: '8px',  fontSize: '14px', lineHeight: '20px', gap: '8px' },
  md: { paddingX: '12px', paddingY: '10px', fontSize: '14px', lineHeight: '20px', gap: '8px' },
  lg: { paddingX: '16px', paddingY: '12px', fontSize: '16px', lineHeight: '24px', gap: '10px' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey: controlled,
  defaultActiveKey,
  onChange,
  variant = 'underline',
  size = 'md',
  fullWidth = false,
  style,
}) => {
  const [internal, setInternal] = React.useState(defaultActiveKey || items[0]?.key);
  const active = controlled !== undefined ? controlled : internal;
  const sz = tabSizes[size];

  const setActive = (key: string) => {
    setInternal(key);
    onChange?.(key);
  };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: variant === 'underline' ? '0' : '4px',
    borderBottom: variant === 'underline' ? '1px solid #EAECF0' : 'none',
    padding: variant === 'pills' || variant === 'pills-gray' ? '4px' : '0',
    backgroundColor: variant === 'pills-gray' ? '#F2F4F7' : variant === 'enclosed' ? '#F9FAFB' : 'transparent',
    borderRadius: variant === 'pills' || variant === 'pills-gray' || variant === 'enclosed' ? '8px' : '0',
    border: variant === 'enclosed' ? '1px solid #EAECF0' : variant === 'underline' ? 'none' : undefined,
  };

  const getTabStyle = (item: TabItem): React.CSSProperties => {
    const isActive = item.key === active;
    const base: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: sz.gap,
      padding: `${sz.paddingY} ${sz.paddingX}`,
      cursor: item.disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: sz.fontSize,
      lineHeight: sz.lineHeight,
      fontWeight: isActive ? 600 : 500,
      border: 'none',
      background: 'none',
      outline: 'none',
      flex: fullWidth ? 1 : undefined,
      justifyContent: fullWidth ? 'center' : undefined,
      transition: 'color 0.15s, background-color 0.15s',
      opacity: item.disabled ? 0.5 : 1,
      whiteSpace: 'nowrap',
      textDecoration: 'none',
      borderRadius: variant === 'underline' ? '0' : '6px',
    };

    if (variant === 'underline') {
      return {
        ...base,
        color: isActive ? '#6941C6' : '#667085',
        borderBottom: isActive ? '2px solid #7F56D9' : '2px solid transparent',
        marginBottom: '-1px',
        paddingBottom: `calc(${sz.paddingY} - 1px)`,
      };
    }
    if (variant === 'pills') {
      return {
        ...base,
        color: isActive ? '#6941C6' : '#667085',
        backgroundColor: isActive ? '#F4EBFF' : 'transparent',
        borderRadius: '6px',
      };
    }
    if (variant === 'pills-gray') {
      return {
        ...base,
        color: isActive ? '#344054' : '#667085',
        backgroundColor: isActive ? '#FFFFFF' : 'transparent',
        boxShadow: isActive ? '0px 1px 2px rgba(16, 24, 40, 0.05)' : 'none',
        border: isActive ? '1px solid #EAECF0' : '1px solid transparent',
        borderRadius: '6px',
      };
    }
    if (variant === 'enclosed') {
      return {
        ...base,
        color: isActive ? '#344054' : '#667085',
        backgroundColor: isActive ? '#FFFFFF' : 'transparent',
        borderBottom: isActive ? '1px solid #FFFFFF' : '1px solid transparent',
        borderRadius: isActive ? '6px 6px 0 0' : '6px 6px 0 0',
        marginBottom: isActive ? '-1px' : '0',
      };
    }
    return base;
  };

  const activeContent = items.find(i => i.key === active)?.content;

  return (
    <div style={style}>
      <div role="tablist" style={navStyle}>
        {items.map((item) => (
          <button
            key={item.key}
            role="tab"
            aria-selected={item.key === active}
            aria-disabled={item.disabled}
            disabled={item.disabled}
            style={getTabStyle(item)}
            onClick={() => !item.disabled && setActive(item.key)}
          >
            {item.icon && (
              <span style={{ display: 'flex', alignItems: 'center', width: '20px', height: '20px' }}>
                {item.icon}
              </span>
            )}
            {item.label}
            {item.badge !== undefined && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '20px', height: '20px', padding: '0 6px',
                borderRadius: '9999px',
                backgroundColor: item.key === active ? '#F4EBFF' : '#F2F4F7',
                color: item.key === active ? '#6941C6' : '#344054',
                fontSize: '12px', fontWeight: 500, lineHeight: '18px',
              }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeContent && (
        <div role="tabpanel" style={{ paddingTop: '16px' }}>
          {activeContent}
        </div>
      )}
    </div>
  );
};
