import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * A span for a value formatted by `src/lib/format` inside a client tree (topnav, footer, modals).
 *
 * It used to convert digits to Persian; since the Phase 2 QA decision every numeral stays Latin in
 * both languages, so this component is now only a *marker*: with `latin` it wraps the value in
 * `<span lang="en" dir="ltr" class="num">` (the `.num` contract: tabular mono, never re-ordered by
 * bidi), otherwise it renders a plain span. Keeping it as a component means feature pages have one
 * place to change if a future rule ever reintroduces localized digits.
 */
export function LocaleText({
  locale,
  value,
  latin = false,
  className,
  children,
}: {
  locale: Locale_ignored;
  /** The string to render — usually the output of a helper in `src/lib/format.ts`. */
  value?: string;
  /** Wrap in `.num` (prices, gas, addresses, hashes, any tabular figure). */
  latin?: boolean;
  className?: string;
  children?: ReactNode;
}): ReactNode {
  void locale;
  const text = children ?? value ?? '';
  return latin ? (
    <span lang="en" dir="ltr" className={cn('num', className)}>
      {text}
    </span>
  ) : (
    <span className={className}>{text}</span>
  );
}

/** Accepted so callers can keep passing the locale; formatting no longer depends on it. */
type Locale_ignored = string;
