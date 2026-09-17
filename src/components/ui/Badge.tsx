import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * 22px status badge (theme spec: radius 7px, 11.5px/700).
 * `up` = mint fill (pending rewards, APR), `down` = rose (negative moves),
 * `acc` = mint tint (fee tiers, "Detected"), `neutral` = glass, `outline` = dashed border
 * (used for `AUDITED` on the landing pill row), `outlineUp`/`outlineDown` for table deltas.
 */
export type BadgeTone = 'up' | 'down' | 'acc' | 'neutral' | 'outline' | 'outlineUp' | 'outlineDown';

const TONES: Record<BadgeTone, string> = {
  up: 'bg-acc-dim text-acc border border-acc-bd',
  down: 'bg-down-dim text-down border border-[color-mix(in_srgb,var(--down)_30%,transparent)]',
  acc: 'bg-acc text-btn-fg border-0',
  neutral: 'bg-surface text-text2 border border-hair',
  outline: 'bg-transparent text-acc border border-dashed border-acc-bd uppercase tracking-[0.08em]',
  outlineUp: 'bg-transparent text-up border border-[color-mix(in_srgb,var(--up)_30%,transparent)]',
  outlineDown: 'bg-transparent text-down border border-[color-mix(in_srgb,var(--down)_30%,transparent)]',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
  title,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
  title?: string;
}): ReactNode {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex h-[22px] shrink-0 items-center gap-1 rounded-[7px] px-2 text-[11.5px] font-bold leading-none',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
