import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  style?: React.CSSProperties;
}

const DefaultSeparator = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M6 12l4-4-4-4" stroke="#D0D5DD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 6.33L8 2l6 4.33V14a.67.67 0 0 1-.67.67H10v-4H6v4H2.67A.67.67 0 0 1 2 14V6.33Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator,
  maxItems,
  style,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const sep = separator || <DefaultSeparator />;

  let visible = items;
  let hasCollapse = false;
  if (maxItems && !expanded && items.length > maxItems) {
    visible = [items[0], { label: '…', onClick: () => setExpanded(true) }, ...items.slice(items.length - (maxItems - 1))];
    hasCollapse = true;
  }

  const itemStyle = (isLast: boolean, isCollapse: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: isLast ? 600 : 500,
    color: isLast ? '#344054' : '#667085',
    textDecoration: 'none',
    cursor: isCollapse ? 'pointer' : (isLast ? 'default' : 'pointer'),
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '6px',
    padding: '2px 4px',
    margin: '-2px -4px',
    transition: 'color 0.15s',
  });

  return (
    <nav aria-label="Breadcrumb" style={style}>
      <ol style={{ display: 'flex', alignItems: 'center', gap: '4px', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap' }}>
        {visible.map((item, i) => {
          const isLast = i === visible.length - 1;
          const isCollapse = item.label === '…' && hasCollapse;

          const content = (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {i === 0 && !item.icon && <HomeIcon />}
              {item.icon}
              {item.label !== '…' || !hasCollapse ? item.label : '…'}
            </span>
          );

          return (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {i > 0 && <span style={{ display: 'flex', alignItems: 'center' }}>{sep}</span>}
              {item.href && !isLast ? (
                <a href={item.href} onClick={item.onClick} style={itemStyle(false, false)}>
                  {content}
                </a>
              ) : (
                <span
                  onClick={isCollapse ? item.onClick : undefined}
                  style={itemStyle(isLast, isCollapse)}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
