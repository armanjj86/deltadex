import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isLocale } from './config';

/**
 * Request-scoped i18n config (next-intl v4). Phase 2 will let the middleware own
 * the locale; for now we read it from the [locale] route segment and default to
 * English for any unhandled render (e.g. the "/" scaffold page or the 404 page).
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: string = typeof requested === 'string' && isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    now: new Date(),
    messages: (await import(`./dictionaries/${locale}.json`)).default,
  };
});
