'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';
import { otherLocale, swapLocalePath, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

/**
 * EN | فارسی toggle (Phase 2). Deliberately a tiny segmented control instead of a dropdown: the
 * design frames have no locale menu, and with exactly two locales a click on the *other* language
 * is the shortest possible interaction.
 *
 * It swaps the `/{locale}` prefix on the current path, so it works on every page including the
 * gallery, and the middleware mirrors the choice into the `NEXT_LOCALE` cookie on the next request.
 * `router.replace` (not `push`) keeps the browser history clean while demoing.
 */
export function LocaleSwitcher({
  locale,
  className,
  labels,
}: {
  locale: Locale;
  className?: string;
  labels: { en: string; fa: string; hint: string };
}): React.ReactNode {
  const pathname = usePathname();
  const router = useRouter();
  const target = otherLocale(locale);

  return (
    <button
      type="button"
      title={labels.hint}
      aria-label={labels.hint}
      onClick={() => router.replace(swapLocalePath(pathname || `/${locale}`, target))}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-pill border border-hair bg-surface px-3',
        'text-[12.5px] font-semibold text-text2 transition-colors hover:border-acc-bd hover:text-text',
        className,
      )}
    >
      <Languages className="size-4" aria-hidden />
      <span className="num" lang={target}>
        {target === 'fa' ? labels.fa : labels.en}
      </span>
    </button>
  );
}
