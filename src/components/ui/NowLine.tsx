'use client';

import { useEffect, useState } from 'react';
import * as fmt from '@/lib/format';
import type { Locale } from '@/i18n/routing';

/** Nowruz 1403 — a stable reference date (local 12:00, so server and browser agree on the day). */
const FIXED_SAMPLE = new Date('2024-03-20T12:00:00');

/**
 * "Today" / wall clock, computed from the *browser* clock (Phase 2).
 *
 * Why a component instead of a helper call: `npm run build` prerenders these pages, and a
 * server-side `new Date()` would freeze the build machine's date (and UTC clock, which is hours away
 * from the demo audience's). So we render a fixed sample date on the server, then swap in the real
 * value after mount — no hydration mismatch, no wrong date in the built demo.
 */
export function NowLine({
  locale,
  kind = 'date',
  className,
}: {
  locale: Locale;
  /** `date` = fixed sample date · `dateNow` = today · `time` = clock · `dateTime` = both. */
  kind?: 'date' | 'dateNow' | 'time' | 'dateTime';
  className?: string;
}): React.ReactNode {
  const live = kind !== 'date';
  const [value, setValue] = useState(() => format(FIXED_SAMPLE, locale, kind));

  useEffect(() => {
    if (!live) return;
    const tick = () => setValue(format(new Date(), locale, kind));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [locale, kind, live]);

  return <span className={className}>{value}</span>;
}

function format(date: Date, locale: Locale, kind: 'date' | 'dateNow' | 'time' | 'dateTime'): string {
  switch (kind) {
    case 'time':
      return fmt.formatTime(date, locale);
    case 'dateTime':
      return fmt.formatDateTime(date, locale);
    default:
      return fmt.formatDate(date, locale);
  }
}
