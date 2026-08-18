import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  hint?: string;
  error?: string;
  style?: React.CSSProperties;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isDisabled(d: Date, min?: Date, max?: Date) {
  if (min && d < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return true;
  if (max && d > new Date(max.getFullYear(), max.getMonth(), max.getDate())) return true;
  return false;
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

const Calendar: React.FC<{
  viewDate: Date;
  selected?: Date;
  onSelect: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
  minDate?: Date;
  maxDate?: Date;
}> = ({ viewDate, selected, onSelect, onPrev, onNext, minDate, maxDate }) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const btnBase: React.CSSProperties = {
    width: '40px', height: '40px', border: 'none', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', lineHeight: '20px', fontWeight: 400,
    fontFamily: 'Inter, system-ui, sans-serif', cursor: 'pointer',
  };

  return (
    <div style={{ padding: '16px', width: '320px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Month/Year nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button onClick={onPrev} style={{ ...btnBase, width: '36px', height: '36px', background: 'none', color: '#667085' }} aria-label="Previous month">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 600, color: '#344054' }}>
          {MONTHS[month]} {year}
        </span>
        <button onClick={onNext} style={{ ...btnBase, width: '36px', height: '36px', background: 'none', color: '#667085' }} aria-label="Next month">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
        {DAYS.map(d => (
          <div key={d} style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: '#344054' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isSelected = selected && isSameDay(d, selected);
          const isToday = isSameDay(d, today);
          const disabled = isDisabled(d, minDate, maxDate);
          return (
            <button
              key={i}
              onClick={() => !disabled && onSelect(d)}
              disabled={disabled}
              style={{
                ...btnBase,
                backgroundColor: isSelected ? '#7F56D9' : 'transparent',
                color: disabled ? '#D0D5DD' : isSelected ? '#FFFFFF' : isToday ? '#7F56D9' : '#344054',
                fontWeight: isSelected || isToday ? 600 : 400,
                cursor: disabled ? 'not-allowed' : 'pointer',
                border: isToday && !isSelected ? '1px solid #7F56D9' : 'none',
                margin: '0 auto',
              }}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── DatePicker ───────────────────────────────────────────────────────────────

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Pick a date',
  disabled = false,
  label,
  hint,
  error,
  style,
}) => {
  const [open, setOpen] = React.useState(false);
  const [viewDate, setViewDate] = React.useState(value || new Date());
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const formatted = value ? `${MONTHS[value.getMonth()]} ${value.getDate()}, ${value.getFullYear()}` : '';

  const inputBorder = error ? '#FDA29B' : open ? '#7F56D9' : '#D0D5DD';
  const inputShadow = error ? '0 0 0 4px #FEE4E2' : open ? '0 0 0 4px #F4EBFF' : '0px 1px 2px rgba(16, 24, 40, 0.05)';

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative', fontFamily: 'Inter, system-ui, sans-serif', ...style }}>
      {label && <label style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: '#344054' }}>{label}</label>}
      <button
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '44px', padding: '10px 14px',
          border: `1px solid ${inputBorder}`,
          borderRadius: '8px',
          backgroundColor: disabled ? '#F9FAFB' : '#FFFFFF',
          boxShadow: disabled ? 'none' : inputShadow,
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '16px', lineHeight: '24px',
          color: formatted ? '#101828' : '#667085',
          textAlign: 'left',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {formatted || placeholder}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, color: '#667085' }}>
          <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.67" />
          <path d="M3 8h14M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" />
        </svg>
      </button>

      {hint && !error && <p style={{ margin: 0, fontSize: '14px', lineHeight: '20px', color: '#475467' }}>{hint}</p>}
      {error && <p style={{ margin: 0, fontSize: '14px', lineHeight: '20px', color: '#D92D20' }}>{error}</p>}

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: '4px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #EAECF0',
          borderRadius: '12px',
          boxShadow: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
        }}>
          <Calendar
            viewDate={viewDate}
            selected={value}
            onSelect={d => { onChange?.(d); setOpen(false); }}
            onPrev={() => setViewDate(v => new Date(v.getFullYear(), v.getMonth() - 1, 1))}
            onNext={() => setViewDate(v => new Date(v.getFullYear(), v.getMonth() + 1, 1))}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      )}
    </div>
  );
};
