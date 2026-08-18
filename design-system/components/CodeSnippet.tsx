import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CodeSnippetProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  showCopy?: boolean;
  style?: React.CSSProperties;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CodeSnippet: React.FC<CodeSnippetProps> = ({
  code,
  language,
  title,
  showLineNumbers = false,
  showCopy = true,
  style,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div style={{
      borderRadius: '12px',
      border: '1px solid #1F2A37',
      overflow: 'hidden',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      backgroundColor: '#0F172A',
      ...style,
    }}>
      {/* Header */}
      {(title || language || showCopy) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px',
          borderBottom: '1px solid #1F2A37',
          backgroundColor: '#1E293B',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mac-style dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {['#FF5F57','#FEBC2E','#28C840'].map((c, i) => (
                <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: c }} />
              ))}
            </div>
            {(title || language) && (
              <span style={{ fontSize: '13px', lineHeight: '20px', fontWeight: 500, color: '#94A3B8' }}>
                {title || language}
              </span>
            )}
          </div>
          {showCopy && (
            <button
              onClick={copy}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px', borderRadius: '6px',
                border: '1px solid #334155',
                backgroundColor: 'transparent',
                color: copied ? '#4ADE80' : '#94A3B8',
                fontSize: '12px', lineHeight: '18px', fontWeight: 500,
                fontFamily: 'Inter, system-ui, sans-serif',
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              aria-label={copied ? 'Copied!' : 'Copy code'}
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3 3 7-7" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
                  <path d="M9 5V3.5A1.5 1.5 0 0 0 7.5 2h-4A1.5 1.5 0 0 0 2 3.5v4A1.5 1.5 0 0 0 3.5 9H5" stroke="currentColor" strokeWidth="1.25" />
                </svg>
              )}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      )}

      {/* Code body */}
      <div style={{ overflowX: 'auto' }}>
        <pre style={{ margin: 0, padding: '16px 20px', fontSize: '14px', lineHeight: '24px', color: '#E2E8F0' }}>
          {showLineNumbers ? (
            <table style={{ borderSpacing: 0, width: '100%' }}>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td style={{ userSelect: 'none', paddingRight: '20px', textAlign: 'right', color: '#475569', fontSize: '13px', minWidth: '32px', verticalAlign: 'top' }}>
                      {i + 1}
                    </td>
                    <td style={{ whiteSpace: 'pre' }}>{line || ' '}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code style={{ display: 'block', whiteSpace: 'pre' }}>{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
};

// ─── Inline Code ──────────────────────────────────────────────────────────────

export const InlineCode: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <code style={{
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#F2F4F7',
    border: '1px solid #EAECF0',
    fontSize: '0.875em',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    color: '#C01574',
    ...style,
  }}>
    {children}
  </code>
);
