import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

/**
 * Locale middleware (Phase 2). Responsibilities:
 *  - `/` → `/{locale}` using the `NEXT_LOCALE` cookie, else `Accept-Language`, else `defaultLocale`
 *  - keep the locale prefix on every page (`localePrefix: 'always'`)
 *  - write the locale cookie, so the choice survives navigation and reloads
 * `next.config.mjs` runs the plugin with the default request config (`src/i18n/request.ts`), which
 * reads the locale the middleware resolved.
 */
export default createMiddleware(routing);

/** Skip static files + Next internals; everything else is a page and gets locale handling. */
export const config = {
  matcher: ['/((?!api|_next|_vercel|favicon.ico|icon.svg|robots.txt|.*\\.[A-Za-z0-9]+$).*)'],
};
