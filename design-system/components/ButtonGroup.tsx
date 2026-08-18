import React from 'react';
import { ButtonSize } from './Button';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ButtonGroupItem {
  key: string;
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface ButtonGroupProps {
  items: ButtonGroupItem[];
  selected?: string | string[];
  onSelect?: (key: string) => void;
  size?: ButtonSize;
  multiSelect?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const sizeTokens: Record<ButtonSize, { height: string; paddingX: string; fontSize: string; lineHeight: string; iconSize: string }> = {
  sm:  { height: '36px', paddingX: '14px', fontSize: '14px', lineHeight: '20px', iconSize: '20px' },
  md:  { height: '40px', paddingX: '16px', fontSize: '14px', lineHeight: '20px', iconSize: '20px' },
  lg:  { height: '44px', paddingX: '18px', fontSize: '16px', lineHeight: '24px', iconSize: '20px' },
  xl:  { height: '48px', paddingX: '20px', fontSize: '16px', lineHeight: '24px', iconSize: '20px' },
  '2xl':{ height:'60px', paddingX: '28px', fontSize: '18px', lineHeight: '28px', iconSize: '24px' },
};

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  items,
  selected,
  onSelect,
  size = 'md',
  multiSelect = false,
  style,
  className,
}) => {
  const sz = sizeTokens[size];

  const isSelected = (key: string): boolean => {
    if (!selected) return false;
    if (Array.isArray(selected)) return selected.includes(key);
    return selected === key;
  };

  const getItemStyle = (item: ButtonGroupItem, idx: number, total: number): React.CSSProperties => {
    const active = isSelected(item.key);
    const isFirst = idx === 0;
    const isLast = idx === total - 1;

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      height: sz.height,
      padding: item.label ? `0 ${sz.paddingX}` : `0 ${sz.paddingX}`,
      minWidth: !item.label ? sz.height : undefined,
      cursor: item.disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: sz.fontSize,
      lineHeight: sz.lineHeight,
      fontWeight: 600,
      border: '1px solid #D0D5DD',
      borderLeft: isFirst ? '1px solid #D0D5DD' : 'none',
      borderRadius: isFirst ? '8px 0 0 8px' : isLast ? '0 8px 8px 0' : '0',
      backgroundColor: active ? '#F9F5FF' : item.disabled ? '#F9FAFB' : '#FFFFFF',
      color: active ? '#6941C6' : item.disabled ? '#98A2B3' : '#344054',
      boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
      transition: 'background-color 0.15s, color 0.15s',
      userSelect: 'none',
      outline: 'none',
      position: 'relative',
      zIndex: active ? 1 : 0,
    };
  };

  return (
    <div
      style={{ display: 'inline-flex', ...style }}
      role={multiSelect ? 'group' : 'radiogroup'}
      className={className}
    >
      {items.map((item, idx) => (
        <button
          key={item.key}
          disabled={item.disabled}
          onClick={() => !item.disabled && onSelect?.(item.key)}
          style={getItemStyle(item, idx, items.length)}
          role={multiSelect ? 'checkbox' : 'radio'}
          aria-checked={isSelected(item.key)}
          aria-label={item.label || String(item.key)}
        >
          {item.icon && (
            <span style={{ width: sz.iconSize, height: sz.iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.icon}
            </span>
          )}
          {item.label && <span>{item.label}</span>}
        </button>
      ))}
    </div>
  );
};

// ─── Segmented Control (alias with different default styling intent) ───────────

export const SegmentedControl = ButtonGroup;
