import React from 'react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: NavItem[];
}

export interface SidebarNavProps {
  items: NavItem[];
  activeKey?: string;
  onSelect?: (key: string) => void;
  collapsed?: boolean;
  logo?: React.ReactNode;
  footerItems?: NavItem[];
  userProfile?: {
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
  };
  style?: React.CSSProperties;
}

// ─── Sidebar Navigation ───────────────────────────────────────────────────────

export const SidebarNav: React.FC<SidebarNavProps> = ({
  items,
  activeKey,
  onSelect,
  collapsed = false,
  logo,
  footerItems,
  userProfile,
  style,
}) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const renderItem = (item: NavItem, depth = 0): React.ReactNode => {
    const isActive = activeKey === item.key;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded.has(item.key);
    const indent = depth * 16;

    const itemStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
      padding: `8px ${collapsed ? '8px' : '12px'}`,
      paddingLeft: collapsed ? '8px' : `${12 + indent}px`,
      borderRadius: '6px',
      border: 'none',
      backgroundColor: isActive ? '#F4EBFF' : 'transparent',
      color: isActive ? '#6941C6' : '#344054',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: isActive ? 600 : 500,
      cursor: item.disabled ? 'not-allowed' : 'pointer',
      opacity: item.disabled ? 0.5 : 1,
      textAlign: 'left',
      textDecoration: 'none',
      transition: 'background-color 0.15s, color 0.15s',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      justifyContent: collapsed ? 'center' : 'flex-start',
    };

    const iconStyle: React.CSSProperties = {
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    };

    const el = (
      <div key={item.key}>
        <button
          style={itemStyle}
          onClick={() => {
            if (item.disabled) return;
            if (hasChildren) toggleExpand(item.key);
            if (!hasChildren) { item.onClick?.(); onSelect?.(item.key); }
          }}
          disabled={item.disabled}
          aria-current={isActive ? 'page' : undefined}
          title={collapsed ? item.label : undefined}
        >
          {item.icon && <span style={iconStyle}>{item.icon}</span>}
          {!collapsed && (
            <>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && (
                <Badge size="sm" color="brand" label={String(item.badge)} badgeStyle="pill-filled" />
              )}
              {hasChildren && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </>
          )}
        </button>
        {hasChildren && isExpanded && !collapsed && (
          <div style={{ marginTop: '2px' }}>
            {item.children!.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );

    return el;
  };

  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      width: collapsed ? '72px' : '280px',
      height: '100%',
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid #EAECF0',
      transition: 'width 0.2s',
      fontFamily: 'Inter, system-ui, sans-serif',
      ...style,
    }}>
      {/* Logo */}
      {logo && (
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #EAECF0', flexShrink: 0 }}>
          {logo}
        </div>
      )}

      {/* Main nav */}
      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto', overflowX: 'hidden' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {items.map(item => <li key={item.key}>{renderItem(item)}</li>)}
        </ul>
      </nav>

      {/* Footer items */}
      {footerItems && footerItems.length > 0 && (
        <div style={{ padding: '8px', borderTop: '1px solid #EAECF0' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {footerItems.map(item => <li key={item.key}>{renderItem(item)}</li>)}
          </ul>
        </div>
      )}

      {/* User profile */}
      {userProfile && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid #EAECF0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          overflow: 'hidden',
        }}>
          <Avatar
            src={userProfile.avatar}
            initials={userProfile.initials}
            size="md"
          />
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 600, color: '#344054', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userProfile.name}
              </div>
              <div style={{ fontSize: '14px', lineHeight: '20px', color: '#667085', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userProfile.email}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

// ─── Top Navigation Bar ───────────────────────────────────────────────────────

export interface TopNavProps {
  logo?: React.ReactNode;
  items?: NavItem[];
  activeKey?: string;
  onSelect?: (key: string) => void;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}

export const TopNav: React.FC<TopNavProps> = ({
  logo,
  items = [],
  activeKey,
  onSelect,
  actions,
  style,
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      padding: '0 24px',
      height: '64px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #EAECF0',
      fontFamily: 'Inter, system-ui, sans-serif',
      ...style,
    }}>
      {logo && <div style={{ flexShrink: 0 }}>{logo}</div>}

      {items.length > 0 && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
          {items.map(item => {
            const isActive = activeKey === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { item.onClick?.(); onSelect?.(item.key); }}
                disabled={item.disabled}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isActive ? '#F4EBFF' : 'transparent',
                  color: isActive ? '#6941C6' : '#344054',
                  fontSize: '14px', lineHeight: '20px', fontWeight: isActive ? 600 : 500,
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  opacity: item.disabled ? 0.5 : 1,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  textDecoration: 'none',
                }}
              >
                {item.icon && <span style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center' }}>{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </header>
  );
};
