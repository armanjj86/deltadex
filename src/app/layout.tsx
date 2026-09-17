import type { ReactNode } from 'react';
import '../styles/globals.css';

/**
 * Root layout: styles only. The document element (html/body, lang, dir, font vars)
 * is owned by src/app/[locale]/layout.tsx so that RTL can be set per locale.
 * Phase 2 moves the locale decision here and adds the next-intl middleware.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
