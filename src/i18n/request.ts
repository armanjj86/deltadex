import { getRequestConfig } from 'next-intl/server';
import { IntlErrorCode } from 'next-intl';
import { defaultLocale, isLocale, type Locale } from './routing';

/**
 * Request-scoped i18n config (next-intl v4). The middleware (`src/middleware.ts`) owns locale
 * detection and resolution; this file only maps the resolved locale to a dictionary and decides how
 * a bad locale or a missing key behaves. A missing key must never produce a blank demo screen, so
 * `missingMessage` falls back to the key instead of throwing.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    now: new Date(),
    messages: (await import(`./dictionaries/${locale}.json`)).default,
    onError(error) {
      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        // Loud in the terminal, invisible to the demo audience.
        console.error('[i18n] missing message:', error.message);
      } else {
        console.error('[i18n]', error);
      }
    },
    getMessageFallback({ namespace, key }) {
      return namespace ? `${namespace}.${key}` : key;
    },
  };
});
