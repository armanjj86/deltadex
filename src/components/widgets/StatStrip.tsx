import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Delta chip that sits next to a big number ("$128.4M" + "+4.1%").
 * Rule (ARCHITECTURE.md §8): never glue it to the value — `ms-2`, 12px, tinted background,
 * radius 6. `.num` keeps the digits LTR in both locales.
 */
export function StatDelta({
  value,
  tone = 'up',
  className,
}: {
  value: ReactNode;
  tone?: 'up' | 'down';
  className?: string;
}): ReactNode {
  return (
    <span
      className={cn(
        'num ms-2 inline-flex rounded-[6px] px-1.5 py-[2px] text-[12px] font-bold tracking-[0]',
        tone === 'up' ? 'bg-up-dim text-up' : 'bg-down-dim text-down',
        className,
      )}
    >
      {value}
    </span>
  );
}

export interface Stat {
  label: ReactNode;
  /** Rendered with .num (tabular mono). Keep it a string for prices/percentages. */
  value: ReactNode;
  delta?: ReactNode;
  deltaTone?: 'up' | 'down';
  hint?: ReactNode;
}

/**
 * Stat strip (landing: TVL / 24h volume / swaps today / veDELTA locked).
 * Hairline separators only, no boxes. `cols` is the number of columns; on `fa` mode nothing
 * changes because alignment is logical.
 */
export function StatStrip({
  stats,
  cols = 4,
  size = 'md',
  className,
}: {
  stats: Stat[];
  cols?: 2 | 3 | 4 | 6;
  size?: 'sm' | 'md';
  className?: string;
}): ReactNode {
  return (
    <div
      className={cn(
        'grid',
        cols === 2 && 'grid-cols-2',
        cols === 3 && 'grid-cols-3',
        cols === 4 && 'grid-cols-2 xl:grid-cols-4',
        cols === 6 && 'grid-cols-2 xl:grid-cols-6',
        className,
      )}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            'px-6 py-1',
            index % cols !== 0 && 'border-s border-hair',
            index >= cols && 'pt-4',
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text2">{stat.label}</p>
          <p
            className={cn(
              'num-line mt-1 font-extrabold tracking-[-0.02em]',
              size === 'md' ? 'text-[26px]' : 'text-[20px]',
            )}
          >
            <span className="num">{stat.value}</span>
            {stat.delta ? <StatDelta value={stat.delta} tone={stat.deltaTone ?? 'up'} /> : null}
          </p>
          {stat.hint ? <p className="mt-1 text-[11.5px] text-text2">{stat.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}
