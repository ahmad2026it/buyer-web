import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DropdownItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  description?: string;
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  href?: string;
}

export interface DropdownSection {
  label?: string;
  items: DropdownItem[];
}

export interface DropdownProps {
  trigger: React.ReactElement;
  sections: DropdownSection[];
  onSelect?: (key: string) => void;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  width?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  sections,
  onSelect,
  placement = 'bottom-start',
  width = '240px',
  header,
  footer,
}) => {
  const [open, setOpen] = React.useState(false);
  const [focusedKey, setFocusedKey] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allItems = sections.flatMap(s => s.items);

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 9999,
    width,
    backgroundColor: '#FFFFFF',
    border: '1px solid #EAECF0',
    borderRadius: '8px',
    boxShadow: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
    overflow: 'hidden',
    ...(placement.startsWith('bottom') ? { top: 'calc(100% + 4px)' } : { bottom: 'calc(100% + 4px)' }),
    ...(placement.endsWith('start') ? { left: 0 } : { right: 0 }),
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'Escape') { setOpen(false); return; }
    const keys = allItems.filter(i => !i.disabled).map(i => i.key);
    const current = focusedKey ? keys.indexOf(focusedKey) : -1;
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedKey(keys[(current + 1) % keys.length]); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedKey(keys[(current - 1 + keys.length) % keys.length]); }
    if (e.key === 'Enter' && focusedKey) { handleSelect(focusedKey); }
  };

  const handleSelect = (key: string) => {
    const item = allItems.find(i => i.key === key);
    if (item?.disabled) return;
    onSelect?.(key);
    setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-flex' }} onKeyDown={handleKeyDown}>
      {React.cloneElement(trigger, {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setOpen(o => !o);
          trigger.props.onClick?.(e);
        },
        'aria-haspopup': 'menu',
        'aria-expanded': open,
      })}

      {open && (
        <div role="menu" style={menuStyle}>
          {header && (
            <div style={{ padding: '16px 16px 0', borderBottom: '1px solid #EAECF0', paddingBottom: '12px' }}>
              {header}
            </div>
          )}

          <div style={{ padding: '4px' }}>
            {sections.map((section, si) => (
              <div key={si}>
                {section.label && (
                  <div style={{
                    padding: '8px 10px 4px',
                    fontSize: '12px', lineHeight: '18px',
                    fontWeight: 500, color: '#667085',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    {section.label}
                  </div>
                )}
                {section.items.map((item) => {
                  const isFocused = focusedKey === item.key;
                  const itemStyle: React.CSSProperties = {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 10px',
                    borderRadius: '6px',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    backgroundColor: isFocused && !item.disabled ? '#F9FAFB' : 'transparent',
                    opacity: item.disabled ? 0.5 : 1,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '14px', lineHeight: '20px',
                    fontWeight: 500,
                    color: item.destructive ? '#B42318' : '#344054',
                    textDecoration: 'none',
                  };

                  const Content = () => (
                    <>
                      {item.icon && (
                        <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: item.destructive ? '#B42318' : '#667085' }}>
                          {item.icon}
                        </span>
                      )}
                      <span style={{ flex: 1 }}>
                        <span style={{ display: 'block' }}>{item.label}</span>
                        {item.description && (
                          <span style={{ display: 'block', fontSize: '12px', lineHeight: '18px', fontWeight: 400, color: item.destructive ? '#FDA29B' : '#667085' }}>
                            {item.description}
                          </span>
                        )}
                      </span>
                      {item.shortcut && (
                        <span style={{ fontSize: '12px', lineHeight: '18px', color: '#667085', fontWeight: 400 }}>
                          {item.shortcut}
                        </span>
                      )}
                      {item.trailingIcon && (
                        <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', color: '#667085', flexShrink: 0 }}>
                          {item.trailingIcon}
                        </span>
                      )}
                    </>
                  );

                  return item.href ? (
                    <a
                      key={item.key}
                      href={item.href}
                      role="menuitem"
                      style={itemStyle}
                      onMouseEnter={() => setFocusedKey(item.key)}
                      onMouseLeave={() => setFocusedKey(null)}
                      onClick={() => handleSelect(item.key)}
                    >
                      <Content />
                    </a>
                  ) : (
                    <div
                      key={item.key}
                      role="menuitem"
                      style={itemStyle}
                      onMouseEnter={() => setFocusedKey(item.key)}
                      onMouseLeave={() => setFocusedKey(null)}
                      onClick={() => handleSelect(item.key)}
                      tabIndex={-1}
                    >
                      <Content />
                    </div>
                  );
                })}
                {si < sections.length - 1 && (
                  <div style={{ height: '1px', backgroundColor: '#EAECF0', margin: '4px -4px' }} />
                )}
              </div>
            ))}
          </div>

          {footer && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid #EAECF0' }}>
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
