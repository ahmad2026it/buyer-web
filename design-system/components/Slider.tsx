import React from 'react';

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  label?: string;
  hint?: string;
  onChange?: (value: number) => void;
  style?: React.CSSProperties;
}

export const Slider: React.FC<SliderProps> = ({
  value: controlled,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = false,
  label,
  hint,
  onChange,
  style,
}) => {
  const [internal, setInternal] = React.useState(defaultValue);
  const [focused, setFocused] = React.useState(false);
  const value = controlled !== undefined ? controlled : internal;
  const pct = ((value - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    setInternal(next);
    onChange?.(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'Inter, system-ui, sans-serif', ...style }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && <label style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: disabled ? '#98A2B3' : '#344054' }}>{label}</label>}
          {showValue && <span style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: disabled ? '#98A2B3' : '#344054' }}>{value}</span>}
        </div>
      )}

      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        {/* Track background */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '8px',
          borderRadius: '9999px', backgroundColor: '#EAECF0',
        }} />
        {/* Filled track */}
        <div style={{
          position: 'absolute', left: 0, width: `${pct}%`, height: '8px',
          borderRadius: '9999px', backgroundColor: disabled ? '#D0D5DD' : '#7F56D9',
          transition: 'width 0.05s',
        }} />
        {/* Native range input (invisible, handles interaction) */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            position: 'absolute', width: '100%', height: '100%',
            opacity: 0, cursor: disabled ? 'not-allowed' : 'pointer',
            margin: 0,
          }}
          aria-label={label}
        />
        {/* Custom thumb */}
        <div style={{
          position: 'absolute',
          left: `calc(${pct}% - 10px)`,
          width: '20px', height: '20px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          border: `1.5px solid ${disabled ? '#D0D5DD' : '#7F56D9'}`,
          boxShadow: focused
            ? '0px 0px 0px 4px rgba(127, 86, 217, 0.24), 0px 1px 3px rgba(16, 24, 40, 0.10)'
            : '0px 1px 3px rgba(16, 24, 40, 0.10), 0px 1px 2px rgba(16, 24, 40, 0.06)',
          transition: 'left 0.05s, box-shadow 0.15s',
          pointerEvents: 'none',
        }} />
      </div>

      {hint && (
        <p style={{ fontSize: '14px', lineHeight: '20px', color: '#475467', margin: 0 }}>{hint}</p>
      )}
    </div>
  );
};

// ─── Range Slider (two handles) ───────────────────────────────────────────────

export interface RangeSliderProps {
  value?: [number, number];
  defaultValue?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  onChange?: (value: [number, number]) => void;
  style?: React.CSSProperties;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  value: controlled,
  defaultValue = [20, 80],
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  label,
  onChange,
  style,
}) => {
  const [internal, setInternal] = React.useState<[number, number]>(defaultValue);
  const [low, high] = controlled || internal;
  const lowPct = ((low - min) / (max - min)) * 100;
  const highPct = ((high - min) / (max - min)) * 100;

  const updateLow = (v: number) => {
    const next: [number, number] = [Math.min(v, high - step), high];
    setInternal(next);
    onChange?.(next);
  };

  const updateHigh = (v: number) => {
    const next: [number, number] = [low, Math.max(v, low + step)];
    setInternal(next);
    onChange?.(next);
  };

  const trackStyle: React.CSSProperties = {
    position: 'absolute', left: 0, right: 0, height: '8px',
    borderRadius: '9999px', backgroundColor: '#EAECF0',
  };

  const fillStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${lowPct}%`,
    width: `${highPct - lowPct}%`,
    height: '8px',
    borderRadius: '9999px',
    backgroundColor: disabled ? '#D0D5DD' : '#7F56D9',
  };

  const thumbStyle = (pct: number): React.CSSProperties => ({
    position: 'absolute',
    left: `calc(${pct}% - 10px)`,
    width: '20px', height: '20px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${disabled ? '#D0D5DD' : '#7F56D9'}`,
    boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.10)',
    pointerEvents: 'none',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'Inter, system-ui, sans-serif', ...style }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: '#344054' }}>{label}</span>
          <span style={{ fontSize: '14px', lineHeight: '20px', color: '#344054' }}>{low} – {high}</span>
        </div>
      )}
      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={trackStyle} />
        <div style={fillStyle} />
        <input type="range" min={min} max={max} step={step} value={low} disabled={disabled}
          onChange={e => updateLow(Number(e.target.value))}
          style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: disabled ? 'not-allowed' : 'pointer', margin: 0, zIndex: 2 }} />
        <input type="range" min={min} max={max} step={step} value={high} disabled={disabled}
          onChange={e => updateHigh(Number(e.target.value))}
          style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: disabled ? 'not-allowed' : 'pointer', margin: 0, zIndex: 3 }} />
        <div style={thumbStyle(lowPct)} />
        <div style={thumbStyle(highPct)} />
      </div>
    </div>
  );
};
