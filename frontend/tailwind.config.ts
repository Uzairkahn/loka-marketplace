import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Dusk-market palette — deliberately not the default cream/terracotta look.
        deep: '#0F1B1E',
        surface: '#16262B',
        'surface-raised': '#1D2F35',
        amber: {
          DEFAULT: '#E8A33D',
          soft: '#F0BE70',
        },
        teal: {
          DEFAULT: '#4FB0A5',
          soft: '#7FC9C0',
        },
        ink: {
          primary: '#F2EFE9',
          muted: '#9AA8A6',
          faint: '#6C7A79',
        },
        danger: '#E8654B',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
      borderRadius: {
        card: '0.875rem',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(232, 163, 61, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
