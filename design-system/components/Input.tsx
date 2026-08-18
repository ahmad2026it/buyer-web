import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type InputSize = 'sm' | 'md';
export type InputState = 'default' | 'hover' | 'focused' | 'filled' | 'error' | 'disabled';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  label?: string;
  hint?: string;
  errorMessage?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  leadingText?: string;
  trailingText?: string;
  state?: InputState;
  fullWidth?: boolean;
}

// ─── Size Tokens ──────────────────────────────────────────────────────────────

const inputSizeTokens: Record<InputSize, {
  height: string;
  paddingX: string;
  paddingY: string;
  fontSize: string;
  lineHeight: string;
  iconSize: string;
}> = {
  sm: {
    height: '40px',
    paddingX: '12px',
    paddingY: '8px',
    fontSize: '14px',
    lineHeight: '20px',
    iconSize: '16px',
  },
  md: {
    height: '44px',
    paddingX: '14px',
    paddingY: '10px',
    fontSize: '16px',
    lineHeight: '24px',
    iconSize: '20px',
  },
};

// ─── State Styles ─────────────────────────────────────────────────────────────

interface StateStyle {
  border: string;
  boxShadow: string;
  bg: string;
}

const stateStyles: Record<Exclude<InputState, 'hover'>, StateStyle> = {
  default: {
    border: '1px solid #D0D5DD',
    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
    bg: '#FFFFFF',
  },
  focused: {
    border: '1px solid #9E77ED',
    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), 0px 0px 0px 4px rgba(127, 86, 217, 0.24)',
    bg: '#FFFFFF',
  },
  filled: {
    border: '1px solid #D0D5DD',
    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
    bg: '#FFFFFF',
  },
  error: {
    border: '1px solid #FDA29B',
    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), 0px 0px 0px 4px rgba(240, 68, 56, 0.24)',
    bg: '#FFFFFF',
  },
  disabled: {
    border: '1px solid #D0D5DD',
    boxShadow: 'none',
    bg: '#F9FAFB',
  },
};

// ─── Input Component ──────────────────────────────────────────────────────────

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  size = 'md',
  label,
  hint,
  errorMessage,
  leadingIcon,
  trailingIcon,
  leadingText,
  trailingText,
  state: stateProp,
  fullWidth = false,
  disabled,
  onFocus,
  onBlur,
  style,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const isDisabled = disabled || stateProp === 'disabled';
  const isError = stateProp === 'error' || Boolean(errorMessage);
  const state: Exclude<InputState, 'hover'> = isDisabled
    ? 'disabled'
    : isError
      ? 'error'
      : isFocused
        ? 'focused'
        : (stateProp as Exclude<InputState, 'hover'>) || 'default';

  const sz = inputSizeTokens[size];
  const ss = stateStyles[state];

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: fullWidth ? '100%' : undefined,
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    color: isDisabled ? '#98A2B3' : '#344054',
  };

  const inputWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    backgroundColor: ss.bg,
    border: ss.border,
    boxShadow: ss.boxShadow,
    overflow: 'hidden',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  const prefixAddonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: `${sz.paddingY} ${sz.paddingX}`,
    borderRight: '1px solid #D0D5DD',
    backgroundColor: '#F9FAFB',
    color: '#667085',
    fontSize: sz.fontSize,
    lineHeight: sz.lineHeight,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  };

  const suffixAddonStyle: React.CSSProperties = {
    ...prefixAddonStyle,
    borderRight: 'none',
    borderLeft: '1px solid #D0D5DD',
  };

  const iconStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sz.iconSize,
    height: sz.iconSize,
    color: '#667085',
    flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    width: '100%',
    height: sz.height,
    padding: `${sz.paddingY} ${sz.paddingX}`,
    paddingLeft: leadingIcon || leadingText ? '0' : sz.paddingX,
    paddingRight: trailingIcon ? '0' : sz.paddingX,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: sz.fontSize,
    lineHeight: sz.lineHeight,
    fontWeight: 400,
    color: isDisabled ? '#98A2B3' : '#101828',
    fontFamily: 'Inter, system-ui, sans-serif',
    cursor: isDisabled ? 'not-allowed' : 'text',
  };

  const hintStyle: React.CSSProperties = {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 400,
    color: isError ? '#F04438' : '#475467',
  };

  return (
    <div style={wrapperStyle}>
      {label && <label style={labelStyle}>{label}</label>}

      <div style={inputWrapperStyle}>
        {leadingText && <div style={prefixAddonStyle}>{leadingText}</div>}
        {leadingIcon && (
          <div style={{ ...iconStyle, marginLeft: sz.paddingX }}>
            {leadingIcon}
          </div>
        )}

        <input
          ref={ref}
          disabled={isDisabled}
          style={inputStyle}
          onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
          {...props}
        />

        {trailingIcon && (
          <div style={{ ...iconStyle, marginRight: sz.paddingX }}>
            {trailingIcon}
          </div>
        )}
        {isError && !trailingIcon && (
          <div style={{ ...iconStyle, marginRight: sz.paddingX, color: '#F04438' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 5.33v2.67M8 10.67h.007M14.667 8A6.667 6.667 0 1 1 1.333 8a6.667 6.667 0 0 1 13.334 0Z"
                stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        {trailingText && <div style={suffixAddonStyle}>{trailingText}</div>}
      </div>

      {(hint || errorMessage) && (
        <p style={hintStyle}>{errorMessage || hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// ─── Textarea ─────────────────────────────────────────────────────────────────

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  hint?: string;
  errorMessage?: string;
  state?: Exclude<InputState, 'hover'>;
  fullWidth?: boolean;
  minRows?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  hint,
  errorMessage,
  state: stateProp,
  fullWidth = false,
  disabled,
  minRows = 4,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const isDisabled = disabled || stateProp === 'disabled';
  const isError = stateProp === 'error' || Boolean(errorMessage);
  const state = isDisabled ? 'disabled' : isError ? 'error' : isFocused ? 'focused' : stateProp || 'default';

  const ss = stateStyles[state as keyof typeof stateStyles];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: fullWidth ? '100%' : undefined, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {label && (
        <label style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: isDisabled ? '#98A2B3' : '#344054' }}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        disabled={isDisabled}
        rows={minRows}
        style={{
          width: fullWidth ? '100%' : undefined,
          padding: '10px 14px',
          borderRadius: '8px',
          border: ss.border,
          boxShadow: ss.boxShadow,
          backgroundColor: ss.bg,
          fontSize: '16px',
          lineHeight: '24px',
          color: isDisabled ? '#98A2B3' : '#101828',
          fontFamily: 'Inter, system-ui, sans-serif',
          outline: 'none',
          resize: 'vertical',
          cursor: isDisabled ? 'not-allowed' : 'text',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
        {...props}
      />
      {(hint || errorMessage) && (
        <p style={{ fontSize: '14px', lineHeight: '20px', color: isError ? '#F04438' : '#475467', margin: 0 }}>
          {errorMessage || hint}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// ─── OTP / Verification Code Input ───────────────────────────────────────────

export interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value = '',
  onChange,
  error = false,
  disabled = false,
}) => {
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const digits = value.split('').slice(0, length);
  while (digits.length < length) digits.push('');

  const handleChange = (index: number, char: string) => {
    const cleaned = char.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    onChange?.(next.join(''));
    if (cleaned && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange?.(pasted.padEnd(length, '').slice(0, length));
    const focusIdx = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const cellStyle = (isFilled: boolean, isError: boolean): React.CSSProperties => ({
    width: '64px',
    height: '64px',
    textAlign: 'center',
    fontSize: '48px',
    lineHeight: '60px',
    fontWeight: 500,
    color: '#101828',
    fontFamily: 'Inter, system-ui, sans-serif',
    border: `1px solid ${isError ? '#FDA29B' : isFilled ? '#D0D5DD' : '#D0D5DD'}`,
    borderRadius: '8px',
    boxShadow: isError
      ? '0px 1px 2px rgba(16, 24, 40, 0.05), 0px 0px 0px 4px rgba(240, 68, 56, 0.24)'
      : '0px 1px 2px rgba(16, 24, 40, 0.05)',
    outline: 'none',
    backgroundColor: disabled ? '#F9FAFB' : '#FFFFFF',
    cursor: disabled ? 'not-allowed' : 'text',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  });

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          style={cellStyle(Boolean(digit), error)}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${i + 1} of ${length}`}
        />
      ))}
    </div>
  );
};

// ─── Checkbox ─────────────────────────────────────────────────────────────────

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  size?: 'sm' | 'md';
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  hint,
  size = 'md',
  indeterminate = false,
  disabled,
  checked,
  onChange,
  ...props
}, ref) => {
  const internalRef = React.useRef<HTMLInputElement>(null);
  const resolvedRef = (ref || internalRef) as React.RefObject<HTMLInputElement>;

  React.useEffect(() => {
    if (resolvedRef.current) {
      resolvedRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate, resolvedRef]);

  const boxSize = size === 'sm' ? '16px' : '20px';
  const iconSize = size === 'sm' ? '10px' : '12px';

  const boxStyle: React.CSSProperties = {
    position: 'relative',
    width: boxSize,
    height: boxSize,
    borderRadius: '4px',
    border: `1px solid ${checked || indeterminate ? '#7F56D9' : '#D0D5DD'}`,
    backgroundColor: checked || indeterminate ? '#7F56D9' : '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'background-color 0.15s, border-color 0.15s',
  };

  return (
    <label style={{
      display: 'flex',
      alignItems: label ? 'flex-start' : 'center',
      gap: '8px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <span style={{ position: 'relative', marginTop: hint ? '2px' : 0 }}>
        <input
          ref={resolvedRef}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'inherit', margin: 0 }}
          {...props}
        />
        <span style={boxStyle}>
          {checked && !indeterminate && (
            <svg width={iconSize} height={iconSize} viewBox="0 0 12 12" fill="none">
              <path d="M10 3L4.5 8.5 2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {indeterminate && (
            <svg width={iconSize} height={iconSize} viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </span>
      {(label || hint) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {label && (
            <span style={{ fontSize: size === 'sm' ? '14px' : '14px', lineHeight: '20px', fontWeight: 500, color: disabled ? '#98A2B3' : '#344054' }}>
              {label}
            </span>
          )}
          {hint && (
            <span style={{ fontSize: '14px', lineHeight: '20px', color: disabled ? '#98A2B3' : '#475467' }}>
              {hint}
            </span>
          )}
        </div>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

// ─── Radio ────────────────────────────────────────────────────────────────────

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  hint?: string;
  size?: 'sm' | 'md';
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(({
  label,
  hint,
  size = 'md',
  disabled,
  checked,
  ...props
}, ref) => {
  const boxSize = size === 'sm' ? '16px' : '20px';
  const dotSize = size === 'sm' ? '6px' : '8px';

  return (
    <label style={{
      display: 'flex',
      alignItems: label ? 'flex-start' : 'center',
      gap: '8px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <span style={{ position: 'relative', flexShrink: 0, marginTop: hint ? '2px' : 0 }}>
        <input
          ref={ref}
          type="radio"
          checked={checked}
          disabled={disabled}
          style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'inherit', margin: 0 }}
          {...props}
        />
        <span style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: boxSize,
          height: boxSize,
          borderRadius: '50%',
          border: `1px solid ${checked ? '#7F56D9' : '#D0D5DD'}`,
          backgroundColor: checked ? '#F9F5FF' : '#FFFFFF',
          opacity: disabled ? 0.4 : 1,
          transition: 'border-color 0.15s',
        }}>
          {checked && (
            <span style={{
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              backgroundColor: '#7F56D9',
            }} />
          )}
        </span>
      </span>
      {(label || hint) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {label && (
            <span style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: disabled ? '#98A2B3' : '#344054' }}>
              {label}
            </span>
          )}
          {hint && (
            <span style={{ fontSize: '14px', lineHeight: '20px', color: disabled ? '#98A2B3' : '#475467' }}>
              {hint}
            </span>
          )}
        </div>
      )}
    </label>
  );
});

Radio.displayName = 'Radio';

// ─── Toggle / Switch ──────────────────────────────────────────────────────────

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  label?: string;
  hint?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  hint,
}) => {
  const trackW = size === 'sm' ? '36px' : '44px';
  const trackH = size === 'sm' ? '20px' : '24px';
  const thumbSize = size === 'sm' ? '16px' : '20px';
  const thumbOffset = size === 'sm' ? '16px' : '20px';
  const padding = '2px';

  return (
    <label style={{
      display: 'flex',
      alignItems: label ? 'flex-start' : 'center',
      gap: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange?.(!checked)}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          width: trackW,
          height: trackH,
          borderRadius: '9999px',
          backgroundColor: checked ? '#7F56D9' : '#F2F4F7',
          border: `1px solid ${checked ? '#7F56D9' : '#D0D5DD'}`,
          flexShrink: 0,
          opacity: disabled ? 0.4 : 1,
          transition: 'background-color 0.2s, border-color 0.2s',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span style={{
          position: 'absolute',
          left: checked ? `calc(100% - ${thumbSize} - ${padding})` : padding,
          width: thumbSize,
          height: thumbSize,
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.10), 0px 1px 2px rgba(16, 24, 40, 0.06)',
          transition: 'left 0.2s',
        }} />
      </span>
      {(label || hint) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {label && (
            <span style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: disabled ? '#98A2B3' : '#344054' }}>
              {label}
            </span>
          )}
          {hint && (
            <span style={{ fontSize: '14px', lineHeight: '20px', color: '#475467' }}>
              {hint}
            </span>
          )}
        </div>
      )}
    </label>
  );
};

// ─── Select ───────────────────────────────────────────────────────────────────

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: InputSize;
  label?: string;
  hint?: string;
  errorMessage?: string;
  placeholder?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  size = 'md',
  label,
  hint,
  errorMessage,
  placeholder,
  fullWidth = false,
  disabled,
  options,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const isError = Boolean(errorMessage);
  const sz = inputSizeTokens[size];

  const state = disabled ? 'disabled' : isError ? 'error' : isFocused ? 'focused' : 'default';
  const ss = stateStyles[state];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: fullWidth ? '100%' : undefined, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {label && (
        <label style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: disabled ? '#98A2B3' : '#344054' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          ref={ref}
          disabled={disabled}
          style={{
            width: fullWidth ? '100%' : undefined,
            height: sz.height,
            padding: `${sz.paddingY} 40px ${sz.paddingY} ${sz.paddingX}`,
            borderRadius: '8px',
            border: ss.border,
            boxShadow: ss.boxShadow,
            backgroundColor: ss.bg,
            fontSize: sz.fontSize,
            lineHeight: sz.lineHeight,
            color: disabled ? '#98A2B3' : '#101828',
            fontFamily: 'Inter, system-ui, sans-serif',
            appearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <span style={{
          position: 'absolute',
          right: sz.paddingX,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: '#667085',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {(hint || errorMessage) && (
        <p style={{ fontSize: '14px', lineHeight: '20px', color: isError ? '#F04438' : '#475467', margin: 0 }}>
          {errorMessage || hint}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
