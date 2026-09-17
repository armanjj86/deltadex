/**
 * Locale-aware formatting (pulled forward from Phase 2 because the Topnav subtitle needs a
 * localized date). Rules from docs/design/glossary.md:
 *  - Prices/USD are ALWAYS Western digits and never "localized".
 *  - Ordinary dates: Gregorian for en, Jalali (Shomalī) for fa.
 *  - Numbers inside Persian prose may use Persian digits — done in Phase 2 with `formatNum`.
 */
import type { Locale } from '@/i18n/config';

/** "Tue, 3 Sep 2026" / «سه‌شنبه ۱۴۰۴/۰۶/۱۲» — Western digits kept for stability in the demo. */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR-u-ca-persian-nu-latn' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/** Short absolute date for deadlines: "Sep 3" / "۱۴۴/۰۶/۱۲". */
export function formatShortDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR-u-ca-persian-nu-latn' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/** Time + date for the history table (Phase 11 will use this). */
export function formatDateTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR-u-ca-persian-nu-latn' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** USD price string — always en-US, always Western digits, e.g. "$0.4218". */
export function formatUsd(value: number, digits = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
