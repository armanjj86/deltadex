/**
 * Locale contract + next-intl routing (Phase 2).
 *
 * This module is the single source of truth for the locale list: `src/i18n/request.ts`,
 * `src/middleware.ts`, the layouts and every typed import go through it. Phase 0/1 had the same
 * constants in `src/i18n/config.ts`; they moved here so the middleware can use the routing config
 * without a cycle.
 */
import { defineRouting } from 'next-intl/routing';

/** Supported locales. Order matters: the first entry is the fallback for detection. */
export const locales = ['en', 'fa'] as const;
export type Locale = (typeof locales)[number];

/** Default locale — English is the primary language of the prototype. */
export const defaultLocale: Locale = 'en';

/** Locales that render right-to-left. */
export const rtlLocales: readonly Locale[] = ['fa'] as const;

export const routing = defineRouting({
  locales,
  defaultLocale,
  /**
   * `always` keeps `/{locale}/...` on every route, so switching language is a prefix swap and the
   * middleware persists the choice in a cookie (`NEXT_LOCALE`) — a bare `/` then lands on the
   * language the user last chose.
   */
  localePrefix: 'always',
});

export function isLocale(value: string | undefined): value is Locale {
  return value != null && (locales as readonly string[]).includes(value);
}

export function dirOf(locale: Locale): 'ltr' | 'rtl' {
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

export function isRtl(locale: Locale): boolean {
  return dirOf(locale) === 'rtl';
}

/** The other locale — the target of the switcher (only two locales exist by design). */
export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'fa' : 'en';
}

/**
 * Swap the `/{locale}` prefix of a pathname and keep the rest of it (`/fa/ui-gallery` →
 * `/en/ui-gallery`, `/fa` → `/en`). Phase 2 deliberately keeps the remaining segments identical in
 * both languages — localized pathnames (`/fa/مبادله`) are not worth the link churn in a localhost
 * prototype. Search strings survive because `usePathname()` never returns them and we rebuild the
 * href from the pathname only; add `window.location.search` at the call site if a future route
 * relies on query params.
 */
export function swapLocalePath(pathname: string, to: Locale): string {
  const parts = pathname.split('/'); // ['', 'fa', 'ui-gallery']
  const rest = isLocale(parts[1]) ? '/' + parts.slice(2).join('/') : pathname;
  return `/${to}${rest === '/' ? '' : rest}`;
}
