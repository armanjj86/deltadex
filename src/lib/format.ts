/**
 * Locale-aware formatting (Phase 2). These are the only number/date helpers in the app — feature
 * pages must format through them instead of calling `toLocaleString`/`Intl` themselves, otherwise
 * the Persian/English rules below drift apart per screen.
 *
 * Locked rules (docs/design/glossary.md + AURORA-DESIGN-PROMPT.md §۴):
 *  - USD prices and on-chain quantities (gas, ratios, addresses, hashes, token symbols) stay
 *    Western-digit, LTR, monospace (`.num` / `.mono`).
 *  - ALL digits stay Latin (Western), in Farsi too — explicit user decision (Phase 2 QA): numbers
 *    are never localized, only the calendar and the text direction change. `formatNum` therefore
 *    always formats with `en` grouping so the mono/tabular rhythm never breaks.
 *  - Dates: Gregorian for `en`; Jalali (Shomalī) for `fa`.
 *  - Never put a localized date/number through `.num` on a whole row — use `.num-line` for the row
 *    and isolate only the atomic token.
 */
import type { Locale } from '@/i18n/routing';

/**
 * The ONE number locale. Latin digits + `,` thousands separators in both languages — kept as a
 * constant so nobody "fixes" a Farsi number by passing `locale` into `Intl.NumberFormat`.
 * (Persian digits were tried in Phase 2 and rejected: Ray/Vazirmatn digit shapes did not match the
 * Latin UI numerals, and tabular alignment read worse.)
 */
const NUM_LOCALE = 'en-GB';

/** Plain count: 41209 → "41,209" in both locales. */
export function formatNum(value: number, locale?: Locale, digits = 0): string {
  void locale; // accepted for call-site symmetry; digits are deliberately never localized
  return new Intl.NumberFormat(NUM_LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Token amount: trims trailing zeros (18290 → "18,290", 0.4218 → "0.4218"). */
export function formatTokenAmount(value: number, locale?: Locale, maxDigits = 4): string {
  void locale;
  return new Intl.NumberFormat(NUM_LOCALE, { maximumFractionDigits: maxDigits }).format(value);
}

/** USD price — ALWAYS en-US + Western digits, e.g. "$0.4218" (never localized). */
export function formatUsd(value: number, digits = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Big USD figures for stat strips: 128400000 → "$128.4M" (Western digits in both locales). */
export function formatCompactUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/** Signed percentage with a real minus sign and a Latin `%`: +12.4% / −1.1%. */
export function formatPct(value: number, digits = 1): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: 'exceptZero',
    unitDisplay: 'narrow',
  })
    .format(value / 100)
    .replace('-', '−');
}

/**
 * Full date: "Fri, 18 Sep 2026" / «جمعه ۱۴۰۴/۰۶/۲۷». Numeric slash form for `fa` because it is
 * far more scannable in a table than long month names, and it never needs bidi isolation.
 */
export function formatDate(date: Date, locale: Locale): string {
  if (locale === 'fa') {
    // Persian dates follow the browser's notion of "today" (no UTC override on purpose).
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(date)
    .replace(EN_MONTH_NORMALIZE, normalizeEnMonth);
}

/** Short absolute date for deadlines and table rows: "18 Sep" / «۱۴۰۴/۰۶/۲۷». */
export function formatShortDate(date: Date, locale: Locale): string {
  if (locale === 'fa') {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    .format(date)
    .replace(EN_MONTH_NORMALIZE, normalizeEnMonth);
}

/** Long Persian-friendly date with month names: "18 September 2026" / «۲۷ مرداد ۱۴۰۴». */
export function formatDateLong(date: Date, locale: Locale): string {
  return locale === 'fa'
    ? new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date)
    : new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(date);
}

/** 24h wall-clock time: "14:05" in both locales (browser clock, never the build machine's). */
export function formatTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR-u-nu-latn' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/** Date + time for history/notifications tables: "18 Sep 2026, 14:05" / «۱۴۰۴/۰۶/۲۷، ۱۴:۰۵». */
export function formatDateTime(date: Date, locale: Locale): string {
  if (locale === 'fa') {
    // Jalali short dates already carry the year: «1405/06/27، 14:05»
    return `${formatShortDate(date, locale)}، ${formatTime(date, locale)}`;
  }
  const day = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(date)
    .replace(EN_MONTH_NORMALIZE, normalizeEnMonth);
  return `${day}, ${formatTime(date, locale)}`;
}

/**
 * en-GB shortens September to "Sept" on some ICU builds; the design frames always say "Sep".
 * Normalising keeps a hard-coded string like `18 Sep 2026` in a snapshot/test valid.
 */
const EN_MONTH_NORMALIZE = /\b(Sept|Jul)\b/g;
function normalizeEnMonth(month: string): string {
  return month === 'Sept' ? 'Sep' : month;
}

/** Whole days between now and a future date (never negative — used for lock/deadline copy). */
export function daysUntil(date: Date, now: Date = new Date()): number {
  const MS = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((date.getTime() - now.getTime()) / MS));
}

/**
 * Lock-duration vocabulary of the veDELTA UI. Digits are always Latin (Phase 2 QA decision); the
 * unit labels come from the caller, so `fa` can render «1 سال و 6 ماه» without this layer ever
 * hard-coding a Persian word (the dictionaries stay the single source of strings).
 */
export function formatDuration(
  days: number,
  units: { year: string; months: string; days: string; and?: string } = {
    year: 'y',
    months: 'mo',
    days: 'd',
    and: ' ',
  },
): string {
  const join = units.and ?? ' ';
  const years = Math.floor(days / 365);
  const months = Math.round((days % 365) / 30);
  if (years && months) return `${years}${units.year}${join}${months}${units.months}`;
  if (years) return `${years}${units.year}`;
  if (months) return `${months}${units.months}`;
  return `${Math.max(1, days)}${units.days}`;
}
