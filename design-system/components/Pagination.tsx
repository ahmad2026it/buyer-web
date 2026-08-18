import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginationProps {
  page: number;
  total: number;
  perPage?: number;
  onChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  variant?: 'default' | 'simple' | 'minimal';
  style?: React.CSSProperties;
}

// ─── Page Range Helper ────────────────────────────────────────────────────────

function getPageRange(page: number, total: number, siblings: number): (number | '…')[] {
  const totalNumbers = siblings * 2 + 3;
  if (total <= totalNumbers + 2) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const leftSibling = Math.max(page - siblings, 1);
  const rightSibling = Math.min(page + siblings, total);
  const showLeft = leftSibling > 2;
  const showRight = rightSibling < total - 1;
  const pages: (number | '…')[] = [1];
  if (showLeft) pages.push('…');
  for (let i = leftSibling; i <= rightSibling; i++) pages.push(i);
  if (showRight) pages.push('…');
  pages.push(total);
  return pages;
}

// ─── Button Styles ────────────────────────────────────────────────────────────

const btnBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '40px', height: '40px',
  borderRadius: '8px',
  border: '1px solid transparent',
  backgroundColor: 'transparent',
  fontSize: '14px', lineHeight: '20px', fontWeight: 500,
  fontFamily: 'Inter, system-ui, sans-serif',
  cursor: 'pointer',
  color: '#475467',
  transition: 'background-color 0.15s',
  outline: 'none',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Pagination: React.FC<PaginationProps> = ({
  page,
  total,
  perPage = 10,
  onChange,
  siblingCount = 1,
  showFirstLast = false,
  variant = 'default',
  style,
}) => {
  const hasPrev = page > 1;
  const hasNext = page < total;

  const navBtn = (dir: 'prev' | 'next'): React.CSSProperties => ({
    ...btnBase,
    width: 'auto', paddingLeft: '14px', paddingRight: '14px',
    gap: '8px',
    color: dir === 'prev' ? (hasPrev ? '#344054' : '#D0D5DD') : (hasNext ? '#344054' : '#D0D5DD'),
    cursor: (dir === 'prev' ? !hasPrev : !hasNext) ? 'not-allowed' : 'pointer',
    border: '1px solid #D0D5DD',
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
  });

  const ChevronLeft = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const ChevronRight = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (variant === 'simple') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', ...style }}>
        <button style={navBtn('prev')} disabled={!hasPrev} onClick={() => hasPrev && onChange(page - 1)}>
          <ChevronLeft /> Previous
        </button>
        <span style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: '#344054', fontFamily: 'Inter, system-ui, sans-serif' }}>
          Page {page} of {total}
        </span>
        <button style={navBtn('next')} disabled={!hasNext} onClick={() => hasNext && onChange(page + 1)}>
          Next <ChevronRight />
        </button>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...style }}>
        <button style={navBtn('prev')} disabled={!hasPrev} onClick={() => hasPrev && onChange(page - 1)}>
          <ChevronLeft /> Previous
        </button>
        <span style={{ fontSize: '14px', lineHeight: '20px', color: '#475467', fontFamily: 'Inter, system-ui, sans-serif' }}>
          Page {page} of {total}
        </span>
        <button style={navBtn('next')} disabled={!hasNext} onClick={() => hasNext && onChange(page + 1)}>
          Next <ChevronRight />
        </button>
      </div>
    );
  }

  const pages = getPageRange(page, total, siblingCount);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', ...style }}>
      <button style={{ ...navBtn('prev'), border: 'none', boxShadow: 'none', width: '40px', paddingLeft: 0, paddingRight: 0 }}
        disabled={!hasPrev} onClick={() => hasPrev && onChange(page - 1)} aria-label="Previous page">
        <ChevronLeft />
      </button>

      {pages.map((p, i) => p === '…' ? (
        <span key={`ellipsis-${i}`} style={{ ...btnBase, cursor: 'default', color: '#667085' }}>…</span>
      ) : (
        <button
          key={p}
          onClick={() => onChange(p as number)}
          style={{
            ...btnBase,
            backgroundColor: p === page ? '#F9F5FF' : 'transparent',
            color: p === page ? '#6941C6' : '#475467',
            fontWeight: p === page ? 600 : 500,
          }}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      <button style={{ ...navBtn('next'), border: 'none', boxShadow: 'none', width: '40px', paddingLeft: 0, paddingRight: 0 }}
        disabled={!hasNext} onClick={() => hasNext && onChange(page + 1)} aria-label="Next page">
        <ChevronRight />
      </button>
    </div>
  );
};
