import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TableColumn<T = any> {
  key: string;
  header: React.ReactNode;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  loading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T, index: number) => void;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectChange?: (keys: Set<string>) => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  stickyHeader?: boolean;
  striped?: boolean;
  compact?: boolean;
  style?: React.CSSProperties;
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────

const SortIcon: React.FC<{ active: boolean; dir?: 'asc' | 'desc' }> = ({ active, dir }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M8 3v10M4 7l4-4 4 4" stroke={active && dir === 'asc' ? '#6941C6' : '#98A2B3'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 9l-4 4-4-4" stroke={active && dir === 'desc' ? '#6941C6' : '#98A2B3'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export function Table<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyState,
  onRowClick,
  selectable = false,
  selectedKeys,
  onSelectChange,
  sortKey,
  sortDir,
  onSort,
  stickyHeader = false,
  striped = false,
  compact = false,
  style,
}: TableProps<T>) {
  const cellPaddingY = compact ? '12px' : '16px';
  const cellPaddingX = '24px';

  const allKeys = data.map(keyExtractor);
  const allSelected = selectedKeys ? allKeys.every(k => selectedKeys.has(k)) : false;
  const someSelected = selectedKeys ? allKeys.some(k => selectedKeys.has(k)) && !allSelected : false;

  const toggleAll = () => {
    if (!onSelectChange) return;
    if (allSelected) {
      onSelectChange(new Set());
    } else {
      onSelectChange(new Set(allKeys));
    }
  };

  const toggleRow = (key: string) => {
    if (!onSelectChange || !selectedKeys) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectChange(next);
  };

  const handleSort = (col: TableColumn<T>) => {
    if (!col.sortable || !onSort) return;
    const newDir = sortKey === col.key && sortDir === 'asc' ? 'desc' : 'asc';
    onSort(col.key, newDir);
  };

  const getCellValue = (col: TableColumn<T>, row: T, idx: number): React.ReactNode => {
    if (col.render) {
      const raw = col.accessor ? (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]) : undefined;
      return col.render(raw, row, idx);
    }
    if (!col.accessor) return null;
    if (typeof col.accessor === 'function') return col.accessor(row) as React.ReactNode;
    return String(row[col.accessor] ?? '');
  };

  const thStyle: React.CSSProperties = {
    padding: `12px ${cellPaddingX}`,
    textAlign: 'left',
    fontSize: '12px',
    lineHeight: '18px',
    fontWeight: 500,
    color: '#475467',
    backgroundColor: '#F9FAFB',
    borderBottom: '1px solid #EAECF0',
    whiteSpace: 'nowrap',
    fontFamily: 'Inter, system-ui, sans-serif',
    ...(stickyHeader ? { position: 'sticky', top: 0, zIndex: 1 } : {}),
  };

  const tdStyle = (idx: number): React.CSSProperties => ({
    padding: `${cellPaddingY} ${cellPaddingX}`,
    fontSize: '14px',
    lineHeight: '20px',
    color: '#101828',
    borderBottom: '1px solid #EAECF0',
    fontFamily: 'Inter, system-ui, sans-serif',
    backgroundColor: striped && idx % 2 === 1 ? '#F9FAFB' : '#FFFFFF',
    verticalAlign: 'middle',
  });

  const checkboxStyle: React.CSSProperties = {
    width: '16px', height: '16px',
    borderRadius: '4px',
    border: '1px solid #D0D5DD',
    cursor: 'pointer',
    accentColor: '#7F56D9',
  };

  return (
    <div style={{ borderRadius: '12px', border: '1px solid #EAECF0', overflow: 'hidden', ...style }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr>
              {selectable && (
                <th style={{ ...thStyle, width: '52px', paddingRight: '8px' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleAll}
                    style={checkboxStyle}
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ ...thStyle, width: col.width, minWidth: col.minWidth, textAlign: col.align || 'left', cursor: col.sortable ? 'pointer' : 'default' }}
                  onClick={() => handleSort(col)}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {col.header}
                    {col.sortable && <SortIcon active={sortKey === col.key} dir={sortKey === col.key ? sortDir : undefined} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {selectable && <td style={tdStyle(i)}><div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#EAECF0' }} /></td>}
                  {columns.map((col) => (
                    <td key={col.key} style={tdStyle(i)}>
                      <div style={{ height: '12px', borderRadius: '4px', backgroundColor: '#EAECF0', width: `${60 + Math.random() * 30}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ ...tdStyle(0), textAlign: 'center', padding: '48px 24px' }}>
                  {emptyState || (
                    <span style={{ color: '#667085' }}>No data available</span>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const key = keyExtractor(row, idx);
                const isSelected = selectedKeys?.has(key);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row, idx)}
                    style={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      backgroundColor: isSelected ? '#F9F5FF' : (striped && idx % 2 === 1 ? '#F9FAFB' : '#FFFFFF'),
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#F9FAFB'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = isSelected ? '#F9F5FF' : (striped && idx % 2 === 1 ? '#F9FAFB' : '#FFFFFF'); }}
                  >
                    {selectable && (
                      <td style={{ ...tdStyle(idx), width: '52px', paddingRight: '8px' }} onClick={e => { e.stopPropagation(); toggleRow(key); }}>
                        <input type="checkbox" checked={isSelected || false} onChange={() => toggleRow(key)} style={checkboxStyle} aria-label={`Select row ${idx + 1}`} />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} style={{ ...tdStyle(idx), textAlign: col.align || 'left' }}>
                        {getCellValue(col, row, idx)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
