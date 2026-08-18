// WhoCan — Typography Tokens
// Based on Untitled UI PRO v4.0
// Font: Poppins
// Add to HTML <head>: <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

export const fontFamilies = {
  sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
} as const;

export const fontWeights = {
  regular:  400,
  medium:   500,
  semibold: 600,
  bold:     700,
} as const;

// Font sizes in px
export const fontSizes = {
  xs:         '12px',
  sm:         '14px',
  md:         '16px',
  lg:         '18px',
  xl:         '20px',
  displayXs:  '24px',
  displaySm:  '30px',
  displayMd:  '36px',
  displayLg:  '48px',
  displayXl:  '60px',
  display2xl: '72px',
} as const;

// Line heights in px
export const lineHeights = {
  xs:         '18px',
  sm:         '20px',
  md:         '24px',
  lg:         '28px',
  xl:         '30px',
  displayXs:  '32px',
  displaySm:  '38px',
  displayMd:  '44px',
  displayLg:  '60px',
  displayXl:  '72px',
  display2xl: '90px',
} as const;

// Letter spacings
export const letterSpacings = {
  normal: '0em',
  tight:  '-0.02em',
} as const;

// Composed text styles — ready to spread into CSS/Tailwind
export const textStyles = {
  display2xl: {
    fontFamily:    fontFamilies.sans.join(', '),
    fontSize:      fontSizes.display2xl,
    lineHeight:    lineHeights.display2xl,
    letterSpacing: letterSpacings.tight,
  },
  displayXl: {
    fontFamily:    fontFamilies.sans.join(', '),
    fontSize:      fontSizes.displayXl,
    lineHeight:    lineHeights.displayXl,
    letterSpacing: letterSpacings.tight,
  },
  displayLg: {
    fontFamily:    fontFamilies.sans.join(', '),
    fontSize:      fontSizes.displayLg,
    lineHeight:    lineHeights.displayLg,
    letterSpacing: letterSpacings.tight,
  },
  displayMd: {
    fontFamily:    fontFamilies.sans.join(', '),
    fontSize:      fontSizes.displayMd,
    lineHeight:    lineHeights.displayMd,
    letterSpacing: letterSpacings.tight,
  },
  displaySm: {
    fontFamily:    fontFamilies.sans.join(', '),
    fontSize:      fontSizes.displaySm,
    lineHeight:    lineHeights.displaySm,
    letterSpacing: letterSpacings.normal,
  },
  displayXs: {
    fontFamily:    fontFamilies.sans.join(', '),
    fontSize:      fontSizes.displayXs,
    lineHeight:    lineHeights.displayXs,
    letterSpacing: letterSpacings.normal,
  },
  textXl: {
    fontFamily:    fontFamilies.sans.join(', '),
    fontSize:      fontSizes.xl,
    lineHeight:    lineHeights.xl,
    letterSpacing: letterSpacings.normal,
  },
  textLg: {
    fontFamily:    fontFamilies.sans.join(', '),
    fontSize:      fontSizes.lg,
    lineHeight:    lineHeights.lg,
    letterSpacing: letterSpacings.normal,
  },
  textMd: {
    fontFamily:    fontFamilies.sans.join(', '),
    fontSize:      fontSizes.md,
    lineHeight:    lineHeights.md,
    letterSpacing: letterSpacings.normal,
  },
  textSm: {
    fontFamily:    fontFamilies.sans.join(', '),
    fontSize:      fontSizes.sm,
    lineHeight:    lineHeights.sm,
    letterSpacing: letterSpacings.normal,
  },
  textXs: {
    fontFamily:    fontFamilies.sans.join(', '),
    fontSize:      fontSizes.xs,
    lineHeight:    lineHeights.xs,
    letterSpacing: letterSpacings.normal,
  },
} as const;

export type TextStyle = keyof typeof textStyles;
export type FontWeight = keyof typeof fontWeights;
