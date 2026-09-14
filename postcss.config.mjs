export default {
  // postcss-import is included so `@import` in globals.css keeps working
  // (Next.js normally injects it, but a custom config replaces the defaults).
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
  },
};
