import localFont from 'next/font/local';

/**
 * Self-hosted Latin faces (Next.js inlines the @font-face rules at build time —
 * the browser never reaches a CDN). The Persian face is a static @font-face in
 * src/styles/vazirmatn.css (+ ray.css once Ray is installed), because it must be
 * switchable by editing one CSS variable.
 *
 * Files live in public/fonts/ and are regenerated with `npm run fonts:sync`.
 */

export const spaceGrotesk = localFont({
  variable: '--font-space-grotesk',
  display: 'swap',
  adjustFontFallback: false,
  src: [
    { path: '../../public/fonts/space-grotesk/space-grotesk-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/space-grotesk/space-grotesk-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/space-grotesk/space-grotesk-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/space-grotesk/space-grotesk-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
});

export const ibmPlexMono = localFont({
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  adjustFontFallback: false,
  src: [
    { path: '../../public/fonts/ibm-plex-mono/ibm-plex-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/ibm-plex-mono/ibm-plex-mono-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/ibm-plex-mono/ibm-plex-mono-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/ibm-plex-mono/ibm-plex-mono-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
});

/** CSS variables to spread on <html> so every descendant sees both faces. */
export const fontVars = `${spaceGrotesk.variable} ${ibmPlexMono.variable}`;
