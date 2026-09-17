/**
 * Locale contract (Phase 0). Phase 2 adds the next-intl middleware, the
 * locale switcher component and the number/date formatters on top of this.
 */
export const locales = ['en', 'fa'] as const;
export type Locale = (typeof locales)[number];

/** Default locale — English is the primary language of the prototype. */
export const defaultLocale: Locale = 'en';

/** Locales that render right-to-left. */
export const rtlLocales: Locale[] = ['fa'];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function dirOf(locale: Locale): 'ltr' | 'rtl' {
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}
