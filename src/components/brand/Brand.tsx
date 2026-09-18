import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { DEMO_STORY } from '@/data/demo-story';

/**
 * Brand mark: the ▲ glyph rendered as SVG (sharp at 34px, 0.6KB instead of a 224KB PNG),
 * on the dark rounded square with the mint halo from the theme spec.
 * The raster marks stay available at `public/brand/` for the cover/large uses.
 */
export function BrandMark({ size = 34, className }: { size?: number; className?: string }): ReactNode {
  return (
    <span
      className={cn('grid shrink-0 place-items-center rounded-brand', className)}
      style={
        {
          width: size,
          height: size,
          background: 'var(--btn-fg)',
          border: '1px solid color-mix(in srgb, var(--acc) 30%, transparent)',
          boxShadow: 'var(--glow-mark)',
        } as CSSProperties
      }
    >
      <svg viewBox="0 0 32 32" width={size * 0.56} height={size * 0.56} aria-hidden focusable="false">
        <defs>
          <linearGradient id="dd-mark-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#2CE0A3" />
            <stop offset="1" stopColor="#35C7E8" />
          </linearGradient>
        </defs>
        <path d="M16 5.5 L27 26 H5 Z" fill="url(#dd-mark-grad)" />
      </svg>
    </span>
  );
}

/** Wordmark: Δ mark + "Delta" + optional DEX tag chip (frame 01/02 topnav). */
export function BrandLockup({
  tag = true,
  className,
  size = 34,
}: {
  tag?: boolean;
  className?: string;
  size?: number;
}): ReactNode {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <BrandMark size={size} />
      <span className="text-[19px] font-bold tracking-[-0.02em]">Delta</span>
      {tag ? (
        <span className="rounded-[7px] border border-acc-bd bg-acc-dim px-1.5 py-[2px] text-[9.5px] font-bold uppercase tracking-[0.1em] text-acc">
          DEX
        </span>
      ) : null}
    </span>
  );
}

/** Landing hero: "Trade like it's yours." with the gradient last word. */
export function HeroTitle({
  lead,
  gradWord,
  trailing = '.',
  className,
}: {
  lead: ReactNode;
  gradWord: ReactNode;
  /** Tail rendered AFTER the gradient span (a «.» for Latin, « است.» for Persian). */
  trailing?: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <h1 className={cn('text-[60px] font-extrabold leading-[1.05] tracking-[-0.028em]', className)}>
      {lead} <span className="grad-word">{gradWord}</span>
      {/* The tail renders outside .grad-word (in RTL, a leading space inside the message would get
          pulled into the gradient span). The space in front of it must be an nbsp **carried by the
          message itself** (`fa: "\u00a0است."`) — a literal space between JSX children is collapsed. */}
      {trailing ? <>{trailing}</> : null}
    </h1>
  );
}

/**
 * Token circle row from the landing hero ("12,400+ traders swapped this week").
 * Uses the four Aurora chip colors; the symbols are cosmetic, they are not real tokens.
 */
export function TokenGlyphRow({ className }: { className?: string }): ReactNode {
  const marks = [
    { glyph: 'Δ', color: 'var(--tk-a)' },
    { glyph: 'Ξ', color: 'var(--tk-b)' },
    { glyph: '$', color: 'var(--tk-c)' },
    { glyph: '◆', color: 'var(--tk-d)' },
  ];
  return (
    <span className={cn('flex items-center', className)} aria-hidden>
      {marks.map((mark, index) => (
        <span
          key={mark.glyph}
          className={cn(
            'grid size-8 place-items-center rounded-full border text-[12px] font-bold',
            index > 0 && '-ms-2',
          )}
          style={{
            background: `color-mix(in srgb, ${mark.color} 16%, transparent)`,
            borderColor: `color-mix(in srgb, ${mark.color} 34%, transparent)`,
            color: mark.color,
            boxShadow: '0 0 0 2px var(--bg)',
          }}
        >
          {mark.glyph}
        </span>
      ))}
    </span>
  );
}

/** Gas pill for the topnav — static value from the demo story until Phase 3 owns it. */
export function GasPill({ value = DEMO_STORY.gasGwei, className }: { value?: number; className?: string }): ReactNode {
  return (
    <span
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-pill border border-hair bg-surface px-3 text-[12px] text-text2',
        className,
      )}
    >
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden className="text-acc">
        <path d="M9 1 L3 9 h3.2 L8 15 L13 7 h-3.2 Z" fill="currentColor" />
      </svg>
      <span className="num text-[12px] font-medium text-text">{value} gwei</span>
    </span>
  );
}
