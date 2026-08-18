import type { Config } from 'tailwindcss';

// WhoCan — Tailwind CSS Configuration
// Based on Untitled UI PRO v4.0
// Brand: #A54AFF  |  Font: Poppins  |  Radius: pill for interactive, 16px for containers

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      // ─── Colors ────────────────────────────────────────────────────────
      colors: {
        brand: {
          25: '#FDFAFF', 50: '#F8F0FF', 100: '#EFDBFF', 200: '#DFBAFF',
          300: '#CA90FF', 400: '#B86CFF', 500: '#A54AFF', 600: '#8C2EE8',
          700: '#7220CC', 800: '#5A15A8', 900: '#3E0D78', 950: '#270849',
        },
        gray: {
          25: '#FCFCFD', 50: '#F9FAFB', 100: '#F2F4F7', 200: '#EAECF0',
          300: '#D0D5DD', 400: '#98A2B3', 500: '#667085', 600: '#475467',
          700: '#344054', 800: '#1D2939', 900: '#101828', 950: '#0C111D',
        },
        error: {
          25: '#FFFBFA', 50: '#FEF3F2', 100: '#FEE4E2', 200: '#FECDCA',
          300: '#FDA29B', 400: '#F97066', 500: '#F04438', 600: '#D92D20',
          700: '#B42318', 800: '#912018', 900: '#7A271A', 950: '#55160C',
        },
        warning: {
          25: '#FFFCF5', 50: '#FFFAEB', 100: '#FEF0C7', 200: '#FEDF89',
          300: '#FEC84B', 400: '#FDB022', 500: '#F79009', 600: '#DC6803',
          700: '#B54708', 800: '#93370D', 900: '#7A2E0E', 950: '#4E1D09',
        },
        success: {
          25: '#F6FEF9', 50: '#ECFDF3', 100: '#DCFAE6', 200: '#ABEFC6',
          300: '#75E0A7', 400: '#47CD89', 500: '#17B26A', 600: '#079455',
          700: '#067647', 800: '#085D3A', 900: '#074D31', 950: '#053321',
        },
        blue: {
          25: '#F5FAFF', 50: '#EFF8FF', 100: '#D1E9FF', 200: '#B2DDFF',
          300: '#84CAFF', 400: '#53B1FD', 500: '#2E90FA', 600: '#1570EF',
          700: '#175CD3', 800: '#1849A9', 900: '#194185', 950: '#102A56',
        },
        'blue-light': {
          25: '#F5FBFF', 50: '#F0F9FF', 100: '#E0F2FE', 200: '#B9E6FE',
          300: '#7CD4FD', 400: '#36BFFA', 500: '#0BA5EC', 600: '#0086C9',
          700: '#026AA2', 800: '#065986', 900: '#0B4A6F', 950: '#062C41',
        },
        indigo: {
          25: '#F5F8FF', 50: '#EEF4FF', 100: '#E0EAFF', 200: '#C7D7FD',
          300: '#A4BCFD', 400: '#8098F9', 500: '#6172F3', 600: '#444CE7',
          700: '#3538CD', 800: '#2D31A6', 900: '#2D3282', 950: '#1F235B',
        },
        violet: {
          25: '#FBFAFF', 50: '#F5F3FF', 100: '#ECE9FE', 200: '#DDD6FE',
          300: '#C4B5FD', 400: '#A78BFA', 500: '#8B5CF6', 600: '#7C3AED',
          700: '#6D28D9', 800: '#5B21B6', 900: '#4C1D95', 950: '#2E1065',
        },
        fuchsia: {
          25: '#FEFAFF', 50: '#FDF4FF', 100: '#FBE8FF', 200: '#F6D0FE',
          300: '#EEAAFD', 400: '#E479F7', 500: '#D444F1', 600: '#BA24D5',
          700: '#9F1AB1', 800: '#821890', 900: '#6F1877', 950: '#47104C',
        },
        pink: {
          25: '#FEF6FB', 50: '#FDF2FA', 100: '#FCE7F6', 200: '#FCCEEE',
          300: '#FAA7E0', 400: '#F670C7', 500: '#EE46BC', 600: '#DD2590',
          700: '#C11574', 800: '#9E165F', 900: '#851651', 950: '#4E0D30',
        },
        rose: {
          25: '#FFF5F6', 50: '#FFF1F3', 100: '#FFE4E8', 200: '#FECDD6',
          300: '#FEA3B4', 400: '#FD6F8E', 500: '#F63D68', 600: '#E31B54',
          700: '#C01048', 800: '#A11043', 900: '#89123E', 950: '#510B24',
        },
        orange: {
          25: '#FEFAF5', 50: '#FEF6EE', 100: '#FDEAD7', 200: '#F9DBAF',
          300: '#F7B27A', 400: '#F38744', 500: '#EF6820', 600: '#E04F16',
          700: '#B93815', 800: '#932F19', 900: '#772917', 950: '#511C10',
        },
        yellow: {
          25: '#FEFDF0', 50: '#FEFBE8', 100: '#FEF7C3', 200: '#FEEE95',
          300: '#FDE272', 400: '#FAC515', 500: '#EAAA08', 600: '#CA8504',
          700: '#A15C07', 800: '#854A0E', 900: '#713B12', 950: '#542C0D',
        },
        green: {
          25: '#F6FEF9', 50: '#EDFCF2', 100: '#D3F8DF', 200: '#AAF0C4',
          300: '#73E2A3', 400: '#3CCB7F', 500: '#16B364', 600: '#099250',
          700: '#087443', 800: '#095C37', 900: '#084C2E', 950: '#052E1C',
        },
        teal: {
          25: '#F6FEFC', 50: '#F0FDF9', 100: '#CCFBEF', 200: '#99F6E0',
          300: '#5FE9D0', 400: '#2ED3B7', 500: '#15B79E', 600: '#0E9384',
          700: '#107569', 800: '#125D56', 900: '#134E48', 950: '#0A2926',
        },
        cyan: {
          25: '#F5FEFF', 50: '#ECFDFF', 100: '#CFF9FE', 200: '#A5F0FC',
          300: '#67E3F9', 400: '#22CCEE', 500: '#06AED4', 600: '#088AB2',
          700: '#0E7090', 800: '#155B75', 900: '#164C63', 950: '#0D2D3A',
        },
      },

      // ─── Typography ────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        xs:            ['12px', { lineHeight: '18px' }],
        sm:            ['14px', { lineHeight: '20px' }],
        md:            ['16px', { lineHeight: '24px' }],
        lg:            ['18px', { lineHeight: '28px' }],
        xl:            ['20px', { lineHeight: '30px' }],
        'display-xs':  ['24px', { lineHeight: '32px',  letterSpacing: '0em' }],
        'display-sm':  ['30px', { lineHeight: '38px',  letterSpacing: '0em' }],
        'display-md':  ['36px', { lineHeight: '44px',  letterSpacing: '-0.02em' }],
        'display-lg':  ['48px', { lineHeight: '60px',  letterSpacing: '-0.02em' }],
        'display-xl':  ['60px', { lineHeight: '72px',  letterSpacing: '-0.02em' }],
        'display-2xl': ['72px', { lineHeight: '90px',  letterSpacing: '-0.02em' }],
      },
      fontWeight: {
        regular:  '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
      },

      // ─── Spacing ───────────────────────────────────────────────────────
      spacing: {
        '0.5': '2px',  '1': '4px',   '1.5': '6px',  '2': '8px',
        '2.5': '10px', '3': '12px',  '3.5': '14px', '4': '16px',
        '4.5': '18px', '5': '20px',  '6': '24px',   '7': '28px',
        '8': '32px',   '9': '36px',  '10': '40px',  '11': '44px',
        '12': '48px',  '14': '56px', '15': '60px',  '16': '64px',
        '18': '72px',  '20': '80px', '24': '96px',  '30': '120px',
        '40': '160px', '48': '192px','60': '240px',  '80': '320px',
        '96': '384px',
      },

      // ─── Border Radius ─────────────────────────────────────────────────
      // interactive (buttons, inputs, dropdowns) → full pill
      // container   (cards, modals, panels)       → 16px
      borderRadius: {
        none:    '0px',
        xxs:     '2px',
        xs:      '4px',
        sm:      '6px',
        DEFAULT: '8px',
        md:      '8px',
        lg:      '10px',
        xl:      '12px',
        '2xl':   '16px',
        '3xl':   '20px',
        '4xl':   '24px',
        full:    '9999px',
      },

      // ─── Box Shadows ───────────────────────────────────────────────────
      boxShadow: {
        xs:            '0px 1px 2px rgba(16, 24, 40, 0.05)',
        sm:            '0px 1px 3px rgba(16, 24, 40, 0.10), 0px 1px 2px rgba(16, 24, 40, 0.06)',
        md:            '0px 4px 8px -2px rgba(16, 24, 40, 0.10), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
        lg:            '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
        xl:            '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
        '2xl':         '0px 24px 48px -12px rgba(16, 24, 40, 0.18)',
        '3xl':         '0px 32px 64px -12px rgba(16, 24, 40, 0.14)',
        'focus-brand': '0px 0px 0px 4px rgba(165, 74, 255, 0.24)',
        'focus-error': '0px 0px 0px 4px rgba(240, 68, 56, 0.24)',
        'focus-gray':  '0px 0px 0px 4px rgba(152, 162, 179, 0.20)',
        none:          'none',
      },

      // ─── Background Images (gradient utilities) ────────────────────────
      backgroundImage: {
        'brand-gradient':       'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #C985FF 0%, #B05AFF 50%, #9040EE 100%)',
        'brand-gradient-subtle':'linear-gradient(135deg, #F8F0FF 0%, #EFDBFF 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
