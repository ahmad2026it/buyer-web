import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  group?: string;
  onSelect?: () => void;
  disabled?: boolean;
}

export interface CommandMenuProps {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
  emptyMessage?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CommandMenu: React.FC<CommandMenuProps> = ({
  open,
  onClose,
  items,
  placeholder = 'Search…',
  emptyMessage = 'No results found.',
}) => {
  const [query, setQuery] = React.useState('');
  const [activeIdx, setActiveIdx] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') {
        const item = filtered[activeIdx];
        if (item && !item.disabled) { item.onSelect?.(); onClose(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });

  if (!open) return null;

  const filtered = query
    ? items.filter(it => it.label.toLowerCase().includes(query.toLowerCase()) || it.description?.toLowerCase().includes(query.toLowerCase()))
    : items;

  const groups = Array.from(new Set(filtered.map(i => i.group || '')));

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(52, 64, 84, 0.7)', backdropFilter: 'blur(8px)' }} />

      {/* Panel */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '640px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
        border: '1px solid #EAECF0',
        overflow: 'hidden',
        margin: '0 24px',
      }}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #EAECF0', gap: '12px' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, color: '#667085' }}>
            <path d="M17.5 17.5l-4.35-4.35M14.167 8.333a5.833 5.833 0 1 1-11.667 0 5.833 5.833 0 0 1 11.667 0z" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIdx(0); }}
            placeholder={placeholder}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'none',
              fontSize: '16px', lineHeight: '24px', color: '#101828',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          />
          <kbd style={{
            flexShrink: 0, padding: '2px 6px', borderRadius: '6px',
            border: '1px solid #EAECF0', backgroundColor: '#F9FAFB',
            fontSize: '12px', lineHeight: '18px', color: '#667085',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: '14px', lineHeight: '20px', color: '#667085' }}>
              {emptyMessage}
            </div>
          ) : (
            groups.map(group => {
              const groupItems = filtered.filter(i => (i.group || '') === group);
              return (
                <div key={group}>
                  {group && (
                    <div style={{ padding: '8px 16px 4px', fontSize: '12px', lineHeight: '18px', fontWeight: 600, color: '#475467', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {group}
                    </div>
                  )}
                  {groupItems.map(item => {
                    const absIdx = filtered.indexOf(item);
                    const isActive = absIdx === activeIdx;
                    return (
                      <button
                        key={item.id}
                        disabled={item.disabled}
                        onClick={() => { if (!item.disabled) { item.onSelect?.(); onClose(); } }}
                        onMouseEnter={() => setActiveIdx(absIdx)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          width: '100%', padding: '8px 16px',
                          border: 'none', background: isActive ? '#F9F5FF' : 'transparent',
                          cursor: item.disabled ? 'not-allowed' : 'pointer',
                          opacity: item.disabled ? 0.5 : 1,
                          textAlign: 'left',
                        }}
                      >
                        {item.icon && (
                          <span style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: isActive ? '#7F56D9' : '#667085' }}>
                            {item.icon}
                          </span>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: isActive ? '#6941C6' : '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.label}
                          </div>
                          {item.description && (
                            <div style={{ fontSize: '12px', lineHeight: '18px', color: '#667085', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.description}
                            </div>
                          )}
                        </div>
                        {item.shortcut && (
                          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                            {item.shortcut.map((k, i) => (
                              <kbd key={i} style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #EAECF0', backgroundColor: '#F9FAFB', fontSize: '12px', lineHeight: '18px', color: '#475467', fontFamily: 'Inter, system-ui, sans-serif' }}>
                                {k}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
