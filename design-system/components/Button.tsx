import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type ButtonHierarchy =
  | 'primary'
  | 'secondary-color'
  | 'secondary-gray'
  | 'tertiary-color'
  | 'tertiary-gray'
  | 'link-color'
  | 'link-gray';

export type ButtonIcon = 'default' | 'dot-leading' | 'only';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  hierarchy?: ButtonHierarchy;
  icon?: ButtonIcon;
  destructive?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  dotColor?: string;
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

// ─── Size Tokens ─────────────────────────────────────────────────────────────

const sizeStyles: Record<ButtonSize, {
  height: string;
  paddingX: string;
  paddingY: string;
  fontSize: string;
  lineHeight: string;
  gap: string;
  iconSize: string;
  dotSize: string;
  iconOnlyPadding: string;
}> = {
  sm: {
    height: '36px',
    paddingX: '14px',
    paddingY: '8px',
    fontSize: '14px',
    lineHeight: '20px',
    gap: '6px',
    iconSize: '20px',
    dotSize: '8px',
    iconOnlyPadding: '8px',
  },
  md: {
    height: '40px',
    paddingX: '16px',
    paddingY: '10px',
    fontSize: '14px',
    lineHeight: '20px',
    gap: '6px',
    iconSize: '20px',
    dotSize: '8px',
    iconOnlyPadding: '10px',
  },
  lg: {
    height: '44px',
    paddingX: '18px',
    paddingY: '10px',
    fontSize: '16px',
    lineHeight: '24px',
    gap: '8px',
    iconSize: '20px',
    dotSize: '8px',
    iconOnlyPadding: '10px',
  },
  xl: {
    height: '48px',
    paddingX: '20px',
    paddingY: '12px',
    fontSize: '16px',
    lineHeight: '24px',
    gap: '8px',
    iconSize: '20px',
    dotSize: '10px',
    iconOnlyPadding: '12px',
  },
  '2xl': {
    height: '60px',
    paddingX: '28px',
    paddingY: '16px',
    fontSize: '18px',
    lineHeight: '28px',
    gap: '10px',
    iconSize: '24px',
    dotSize: '10px',
    iconOnlyPadding: '16px',
  },
};

// ─── Hierarchy Styles ─────────────────────────────────────────────────────────
// hover field: hex string = backgroundColor swap
//              string starting with 'linear-gradient' = backgroundImage swap

const hierarchyStyles: Record<ButtonHierarchy, {
  base: React.CSSProperties;
  hover: string;
  disabled: React.CSSProperties;
  destructiveBase?: React.CSSProperties;
  destructiveHover?: string;
}> = {
  primary: {
    base: {
      backgroundImage: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)',
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      border: '1px solid transparent',
      boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
    },
    hover: 'linear-gradient(135deg, #C985FF 0%, #B05AFF 50%, #9040EE 100%)',
    disabled: {
      backgroundImage: 'none',
      backgroundColor: '#F8F0FF',
      color: '#CA90FF',
      border: '1px solid #F8F0FF',
      boxShadow: 'none',
    },
    destructiveBase: {
      backgroundImage: 'none',
      backgroundColor: '#D92D20',
      color: '#FFFFFF',
      border: '1px solid #D92D20',
    },
    destructiveHover: '#B42318',
  },
  'secondary-color': {
    base: {
      backgroundColor: '#FFFFFF',
      color: '#7220CC',
      border: '1px solid #CA90FF',
      boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
    },
    hover: '#F8F0FF',
    disabled: {
      backgroundColor: '#FFFFFF',
      color: '#CA90FF',
      border: '1px solid #DFBAFF',
      boxShadow: 'none',
    },
    destructiveBase: {
      backgroundColor: '#FFFFFF',
      color: '#B42318',
      border: '1px solid #FDA29B',
    },
    destructiveHover: '#FEF3F2',
  },
  'secondary-gray': {
    base: {
      backgroundColor: '#FFFFFF',
      color: '#344054',
      border: '1px solid #D0D5DD',
      boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
    },
    hover: '#F9FAFB',
    disabled: {
      backgroundColor: '#FFFFFF',
      color: '#98A2B3',
      border: '1px solid #EAECF0',
      boxShadow: 'none',
    },
    destructiveBase: {
      backgroundColor: '#FFFFFF',
      color: '#B42318',
      border: '1px solid #FDA29B',
    },
    destructiveHover: '#FEF3F2',
  },
  'tertiary-color': {
    base: {
      backgroundColor: 'transparent',
      color: '#7220CC',
      border: '1px solid transparent',
      boxShadow: 'none',
    },
    hover: '#F8F0FF',
    disabled: {
      backgroundColor: 'transparent',
      color: '#CA90FF',
      border: '1px solid transparent',
      boxShadow: 'none',
    },
    destructiveBase: {
      backgroundColor: 'transparent',
      color: '#B42318',
      border: '1px solid transparent',
    },
    destructiveHover: '#FFF1F3',
  },
  'tertiary-gray': {
    base: {
      backgroundColor: 'transparent',
      color: '#475467',
      border: '1px solid transparent',
      boxShadow: 'none',
    },
    hover: '#F9FAFB',
    disabled: {
      backgroundColor: 'transparent',
      color: '#98A2B3',
      border: '1px solid transparent',
      boxShadow: 'none',
    },
    destructiveBase: {
      backgroundColor: 'transparent',
      color: '#B42318',
      border: '1px solid transparent',
    },
    destructiveHover: '#FFF1F3',
  },
  'link-color': {
    base: {
      backgroundColor: 'transparent',
      color: '#7220CC',
      border: 'none',
      boxShadow: 'none',
      padding: '0',
      height: 'auto',
    },
    hover: 'transparent',
    disabled: {
      backgroundColor: 'transparent',
      color: '#CA90FF',
      border: 'none',
      boxShadow: 'none',
    },
    destructiveBase: {
      backgroundColor: 'transparent',
      color: '#B42318',
      border: 'none',
    },
    destructiveHover: 'transparent',
  },
  'link-gray': {
    base: {
      backgroundColor: 'transparent',
      color: '#475467',
      border: 'none',
      boxShadow: 'none',
      padding: '0',
      height: 'auto',
    },
    hover: 'transparent',
    disabled: {
      backgroundColor: 'transparent',
      color: '#98A2B3',
      border: 'none',
      boxShadow: 'none',
    },
    destructiveBase: {
      backgroundColor: 'transparent',
      color: '#B42318',
      border: 'none',
    },
    destructiveHover: 'transparent',
  },
};

const FOCUS_RING       = '0px 0px 0px 4px rgba(165, 74, 255, 0.24)';
const FOCUS_RING_ERROR = '0px 0px 0px 4px rgba(240, 68, 56, 0.24)';
const FOCUS_RING_GRAY  = '0px 0px 0px 4px rgba(152, 162, 179, 0.20)';

function isGradient(value: string): boolean {
  return value.startsWith('linear-gradient') || value.startsWith('radial-gradient');
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  size = 'md',
  hierarchy = 'primary',
  icon = 'default',
  destructive = false,
  leadingIcon,
  trailingIcon,
  dotColor,
  loading = false,
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}, ref) => {
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const sz = sizeStyles[size];
  const hs = hierarchyStyles[hierarchy];

  const isDisabled = disabled || loading;
  const isLink = hierarchy === 'link-color' || hierarchy === 'link-gray';
  const isIconOnly = icon === 'only';

  const baseStyle = destructive && hs.destructiveBase ? hs.destructiveBase : hs.base;
  const hoverValue = destructive && hs.destructiveHover ? hs.destructiveHover : hs.hover;

  const hoverOverride: React.CSSProperties =
    !isDisabled && hovered && !isLink
      ? isGradient(hoverValue)
        ? { backgroundImage: hoverValue }
        : { backgroundColor: hoverValue }
      : {};

  const isGrayVariant =
    hierarchy === 'secondary-gray' ||
    hierarchy === 'tertiary-gray' ||
    hierarchy === 'link-gray';

  const focusOverride: React.CSSProperties =
    !isDisabled && focused
      ? {
          boxShadow: destructive
            ? FOCUS_RING_ERROR
            : isGrayVariant
              ? `${(baseStyle as any).boxShadow || ''}, ${FOCUS_RING_GRAY}`.replace(/^,\s*/, '')
              : `${(baseStyle as any).boxShadow || ''}, ${FOCUS_RING}`.replace(/^,\s*/, ''),
        }
      : {};

  const computedStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sz.gap,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: sz.fontSize,
    lineHeight: sz.lineHeight,
    fontWeight: 600,
    letterSpacing: '0',
    borderRadius: '9999px',
    textDecoration: 'none',
    transition: 'background-image 0.15s, background-color 0.15s, box-shadow 0.15s, border-color 0.15s',
    width: fullWidth ? '100%' : undefined,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    outline: 'none',
    ...(isDisabled ? hs.disabled : baseStyle),
    ...(isIconOnly
      ? { padding: sz.iconOnlyPadding, width: sz.height, height: sz.height }
      : isLink
        ? { padding: '0', height: 'auto' }
        : { paddingLeft: sz.paddingX, paddingRight: sz.paddingX, paddingTop: sz.paddingY, paddingBottom: sz.paddingY, height: sz.height }
    ),
    ...hoverOverride,
    ...(!isDisabled && hovered && isLink ? { textDecoration: 'underline' } : {}),
    ...focusOverride,
    ...style,
  };

  const dotStyle: React.CSSProperties = {
    width: sz.dotSize,
    height: sz.dotSize,
    borderRadius: '50%',
    backgroundColor: dotColor || (destructive ? '#F04438' : '#A54AFF'),
    flexShrink: 0,
  };

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      style={computedStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    >
      {loading && (
        <svg
          style={{ animation: 'spin 1s linear infinite', width: sz.iconSize, height: sz.iconSize }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {!loading && icon === 'dot-leading' && <span style={dotStyle} />}
      {!loading && icon === 'default' && leadingIcon && (
        <span style={{ width: sz.iconSize, height: sz.iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {leadingIcon}
        </span>
      )}
      {!loading && !isIconOnly && <span>{children}</span>}
      {!loading && icon === 'default' && trailingIcon && (
        <span style={{ width: sz.iconSize, height: sz.iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {trailingIcon}
        </span>
      )}
      {!loading && isIconOnly && (
        <span style={{ width: sz.iconSize, height: sz.iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

// ─── Close / X Button ─────────────────────────────────────────────────────────

export interface CloseButtonProps extends Omit<ButtonProps, 'children' | 'icon'> {}

export const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>((props, ref) => (
  <Button ref={ref} icon="only" hierarchy="tertiary-gray" aria-label="Close" {...props}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Button>
));

CloseButton.displayName = 'CloseButton';

// ─── Social Buttons ───────────────────────────────────────────────────────────

export type SocialProvider = 'google' | 'apple' | 'facebook' | 'twitter' | 'figma' | 'dribbble';

export interface SocialButtonProps extends Omit<ButtonProps, 'hierarchy' | 'icon'> {
  provider: SocialProvider;
  label?: string;
}

const socialIcons: Record<SocialProvider, React.ReactNode> = {
  google: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M18.17 10.21c0-.65-.06-1.28-.17-1.88H10v3.56h4.59a3.93 3.93 0 0 1-1.7 2.57v2.13h2.76c1.62-1.49 2.52-3.7 2.52-6.38Z" fill="#4285F4"/>
      <path d="M10 19a9.74 9.74 0 0 0 6.75-2.47l-2.76-2.13A6.16 6.16 0 0 1 10 15.46a6.13 6.13 0 0 1-5.76-4.24H1.38v2.2A10 10 0 0 0 10 19Z" fill="#34A853"/>
      <path d="M4.24 11.22A6.1 6.1 0 0 1 3.92 10a6.1 6.1 0 0 1 .32-1.22V6.58H1.38A10 10 0 0 0 0 10c0 1.61.39 3.14 1.07 4.49l2.86-2.22.31-.05Z" fill="#FBBC05"/>
      <path d="M10 3.96a5.4 5.4 0 0 1 3.82 1.49l2.86-2.86A9.6 9.6 0 0 0 10 .5 10 10 0 0 0 1.07 5.51l2.86 2.22A6.15 6.15 0 0 1 10 3.96Z" fill="#EA4335"/>
    </svg>
  ),
  apple: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M14.5 10.3c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.8 3-.8s1.8.8 3 .7c1.2 0 2-1.1 2.8-2.2.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.7Z" fill="currentColor"/>
      <path d="M12.1 3.5c.6-.8 1.1-1.9 1-3-.9.1-2.1.6-2.8 1.5-.6.7-1.1 1.8-1 2.8 1 0 2-.5 2.8-1.3Z" fill="currentColor"/>
    </svg>
  ),
  facebook: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M20 10a10 10 0 1 0-11.56 9.87V12.89H6V10h2.44V7.85c0-2.41 1.44-3.74 3.63-3.74 1.05 0 2.15.19 2.15.19v2.37h-1.21c-1.19 0-1.56.74-1.56 1.5V10h2.66l-.43 2.89H11.44v6.98A10.01 10.01 0 0 0 20 10Z" fill="#1877F2"/>
    </svg>
  ),
  twitter: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M15.17 1.5h2.83L11.88 8.2 19 18.5h-5.86l-4.42-5.78L3.85 18.5H1l6.48-7.41L1 1.5h6L11.34 6.8l3.83-5.3Zm-.99 15.3h1.57L5.9 3.1H4.22l9.96 13.7Z" fill="currentColor"/>
    </svg>
  ),
  figma: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6.67 20A3.33 3.33 0 0 0 10 16.67V13.33H6.67a3.33 3.33 0 1 0 0 6.67Z" fill="#0ACF83"/>
      <path d="M3.33 10a3.33 3.33 0 0 1 3.34-3.33H10v6.66H6.67A3.33 3.33 0 0 1 3.33 10Z" fill="#A259FF"/>
      <path d="M3.33 3.33A3.33 3.33 0 0 1 6.67 0H10v6.67H6.67A3.33 3.33 0 0 1 3.33 3.33Z" fill="#F24E1E"/>
      <path d="M10 0h3.33a3.33 3.33 0 0 1 0 6.67H10V0Z" fill="#FF7262"/>
      <path d="M16.67 10a3.33 3.33 0 1 1-6.67 0 3.33 3.33 0 0 1 6.67 0Z" fill="#1ABCFE"/>
    </svg>
  ),
  dribbble: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 0a10 10 0 1 0 0 20A10 10 0 0 0 10 0Z" fill="#EA4C89"/>
      <path d="M10 0a10 10 0 1 0 0 20A10 10 0 0 0 10 0Z" fill="url(#dribbble)"/>
      <defs><radialGradient id="dribbble" cx="50%" cy="0%" r="120%" fx="50%" fy="0%"><stop offset="0%" stopColor="#EA4C89"/><stop offset="100%" stopColor="#C13584"/></radialGradient></defs>
    </svg>
  ),
};

export const SocialButton = React.forwardRef<HTMLButtonElement, SocialButtonProps>(({
  provider,
  label,
  size = 'md',
  ...props
}, ref) => {
  const hasLabel = Boolean(label);

  return (
    <Button
      ref={ref}
      size={size}
      hierarchy="secondary-gray"
      icon={hasLabel ? 'default' : 'only'}
      leadingIcon={socialIcons[provider]}
      {...props}
    >
      {hasLabel ? label : socialIcons[provider]}
    </Button>
  );
});

SocialButton.displayName = 'SocialButton';

// ─── App Store Badges ──────────────────────────────────────────────────────────

export type AppStore = 'app-store' | 'google-play' | 'galaxy-store' | 'appgallery' | 'f-droid';

export interface AppStoreBadgeProps {
  store: AppStore;
  href?: string;
  style?: React.CSSProperties;
  className?: string;
}

const storeLabels: Record<AppStore, { top: string; bottom: string }> = {
  'app-store':    { top: 'Download on the', bottom: 'App Store' },
  'google-play':  { top: 'GET IT ON',        bottom: 'Google Play' },
  'galaxy-store': { top: 'Available on',     bottom: 'Galaxy Store' },
  appgallery:     { top: 'Explore it on',    bottom: 'AppGallery' },
  'f-droid':      { top: 'Get it on',        bottom: 'F-Droid' },
};

export const AppStoreBadge: React.FC<AppStoreBadgeProps> = ({ store, href, style, className }) => {
  const label = storeLabels[store];

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: '#101828',
    color: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #344054',
    textDecoration: 'none',
    cursor: 'pointer',
    fontFamily: 'Poppins, system-ui, sans-serif',
    ...style,
  };

  const content = (
    <>
      <div style={{ fontSize: '8px', lineHeight: '10px' }}>{label.top}</div>
      <div style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 600 }}>{label.bottom}</div>
    </>
  );

  if (href) {
    return (
      <a href={href} style={badgeStyle} className={className}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>{content}</div>
      </a>
    );
  }

  return (
    <div style={badgeStyle} className={className}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>{content}</div>
    </div>
  );
};
