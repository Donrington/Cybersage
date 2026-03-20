import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cybersage: {
          charcoal: '#1A1A1A',
          rose: '#D81159',
          plum: '#8F2D56',
          emerald: '#00FF9C',
          cream: '#F9FFF6',
        },
      },
      fontFamily: {
        sans: 'var(--font-geist-sans)',
        mono: 'var(--font-geist-mono)',
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1', fontWeight: '700' }],
      },
      letterSpacing: {
        tighter: '-0.05em',
      },
    },
  },
  plugins: [],
};

export default config;
