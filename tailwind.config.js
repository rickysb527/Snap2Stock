/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#F6F8FA',
        surface: '#FFFFFF',
        ink: '#1F2937',
        'ink-muted': '#596579',
        line: '#D8DEE7',
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
        },
        selected: '#EFF6FF',
        success: {
          text: '#166534',
          bg: '#DCFCE7',
        },
        warning: {
          text: '#92400E',
          bg: '#FEF3C7',
        },
        danger: {
          text: '#B91C1C',
          bg: '#FEE2E2',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        control: '6px',
        section: '8px',
      },
      spacing: {
        4.5: '1.125rem',
      },
    },
  },
  plugins: [],
};
