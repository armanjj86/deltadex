import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { toFaDigits } from '@/lib/format';
import { isRtl, type Locale } from '@/i18n/routing';

/**
 * A span whose digits are converted to Persian when the active locale is Farsi.
 *
 * Why this exists: the formatting helpers are pure functions that take a `locale` argument, so they
 * can run in a server component — but anything rendered *inside* a client tree (topnav, footer,
 * modals) has no locale prop to pass. `<LocaleText locale value>` closes that gap without pulling
 * next-intl hooks into presentational components, and it wraps the output in `<span lang="en">` when
 * the digits must stay Latin (prices, addresses, hashes → the `.num` contract).
 */
export function LocaleText({
  locale,
  value,
  latin = false,
  separators = false,
  className,
  children,
}: {
  locale: Locale;
  /** The string to localize — usually the output of a helper in `src/lib/format.ts`. */
  value?: string;
  /** Keep Latin digits (USD prices, gas, token amounts inside mono chips). */
  latin?: boolean;
  /** Also convert `,`/`.` to Persian separators (only for numbers inside Persian prose). */
  separators?: boolean;
  className?: string;
  children?: ReactNode;
}): ReactNode {
  const raw = children == null ? (value ?? '') : null;
  const text =
    typeof raw === 'string' && isRtl(locale) && !latin ? toFaDigits(raw, { separators }) : (raw ?? children);
  return latin ? (
    <span lang="en" dir="ltr" className={cn('num', className)}>
      {text}
    </span>
  ) : (
    <span className={className}>{text}</span>
  );
}
