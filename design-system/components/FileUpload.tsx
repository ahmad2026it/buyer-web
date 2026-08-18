import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress?: number;
  status?: 'uploading' | 'done' | 'error';
  error?: string;
  url?: string;
}

export interface FileUploadProps {
  onFiles?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  files?: UploadedFile[];
  onRemove?: (id: string) => void;
  disabled?: boolean;
  label?: string;
  hint?: string;
  style?: React.CSSProperties;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const FileUpload: React.FC<FileUploadProps> = ({
  onFiles,
  accept,
  multiple = false,
  maxSizeMB,
  files = [],
  onRemove,
  disabled = false,
  label,
  hint,
  style,
}) => {
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming);
    if (maxSizeMB) {
      const oversized = arr.filter(f => f.size > maxSizeMB * 1024 * 1024);
      if (oversized.length) { console.warn(`Files too large: ${oversized.map(f => f.name).join(', ')}`); }
    }
    onFiles?.(arr);
  };

  const zoneStyle: React.CSSProperties = {
    border: `2px dashed ${dragging ? '#7F56D9' : disabled ? '#EAECF0' : '#D0D5DD'}`,
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: dragging ? '#F9F5FF' : disabled ? '#F9FAFB' : '#FFFFFF',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'border-color 0.15s, background-color 0.15s',
    textAlign: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const UploadIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill={dragging ? '#F4EBFF' : '#F2F4F7'} />
      <path d="M13.333 26.667S10 26.667 10 23.333c0-3 2.333-4.333 4.667-4.333.083 0 .167 0 .25.003A5.667 5.667 0 0 1 20 15a5.667 5.667 0 0 1 5.667 5.667A4.333 4.333 0 0 1 26.667 26.667H13.333z" stroke={dragging ? '#7F56D9' : '#667085'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 22v6M17.5 24.5 20 22l2.5 2.5" stroke={dragging ? '#7F56D9' : '#667085'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'Inter, system-ui, sans-serif', ...style }}>
      {label && <label style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: '#344054' }}>{label}</label>}

      {/* Drop zone */}
      <div
        style={zoneStyle}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); if (!disabled) handleFiles(e.dataTransfer.files); }}
      >
        <UploadIcon />
        <div>
          <span style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 600, color: '#6941C6' }}>Click to upload</span>
          <span style={{ fontSize: '14px', lineHeight: '20px', color: '#475467' }}> or drag and drop</span>
        </div>
        {hint && <p style={{ margin: 0, fontSize: '12px', lineHeight: '18px', color: '#667085' }}>{hint}</p>}
        {maxSizeMB && !hint && (
          <p style={{ margin: 0, fontSize: '12px', lineHeight: '18px', color: '#667085' }}>Max {maxSizeMB}MB per file</p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {files.map(f => (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px',
              border: `1px solid ${f.status === 'error' ? '#FDA29B' : '#EAECF0'}`,
              borderRadius: '8px',
              backgroundColor: f.status === 'error' ? '#FEF3F2' : '#FFFFFF',
            }}>
              <div style={{ flexShrink: 0, color: '#667085' }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="6" fill="#F2F4F7" />
                  <path d="M19 8H11a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V12l-3-4z" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 8v4h3" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: '#344054', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.name}
                  </span>
                  <span style={{ fontSize: '14px', lineHeight: '20px', color: '#667085', flexShrink: 0 }}>
                    {formatBytes(f.size)}
                  </span>
                </div>
                {f.status === 'uploading' && f.progress !== undefined && (
                  <div style={{ marginTop: '6px', height: '4px', backgroundColor: '#EAECF0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${f.progress}%`, backgroundColor: '#7F56D9', borderRadius: '2px', transition: 'width 0.2s' }} />
                  </div>
                )}
                {f.status === 'error' && f.error && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', lineHeight: '18px', color: '#D92D20' }}>{f.error}</p>
                )}
              </div>
              {onRemove && (
                <button
                  onClick={() => onRemove(f.id)}
                  style={{ flexShrink: 0, width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer', color: '#667085', borderRadius: '8px' }}
                  aria-label="Remove file"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
