import type { Config } from 'tailwindcss';

/**
 * Tailwind is only a thin mapping layer on top of the Aurora CSS variables
 * (see src/styles/tokens.css). Never hardcode a color in here — if a token is
 * missing, add it to tokens.css first, then expose it below.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        field: 'var(--field)',
        hair: 'var(--border)',
        text: 'var(--text)',
        text2: 'var(--text2)',
        acc: 'var(--acc)',
        acc2: 'var(--acc2)',
        'acc-dim': 'var(--acc-dim)',
        'acc-bd': 'var(--acc-bd)',
        up: 'var(--up)',
        'up-dim': 'var(--up-dim)',
        down: 'var(--down)',
        'down-dim': 'var(--down-dim)',
        'btn-fg': 'var(--btn-fg)',
      },
      fontFamily: {
        body: ['var(--font-en)', 'system-ui', 'sans-serif'],
        num: ['var(--font-num)', 'ui-monospace', 'monospace'],
        fa: ['var(--font-fa)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '22px',
        btn: '12px',
        btnLg: '14px',
        pill: '11px',
        brand: '10px',
      },
      boxShadow: {
        widget: '0 24px 70px rgba(0,0,0,.55)',
        soft: '0 10px 30px rgba(0,0,0,.35)',
        glow: '0 10px 30px rgba(44,224,163,.28)',
        mark: '0 0 26px rgba(44,224,163,.40)',
      },
    },
  },
  plugins: [],
};

export default config;
