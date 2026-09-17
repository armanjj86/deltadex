import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Token circle (theme spec: .tok 32px / .tok-sm 26px, overlapping pair with a 2px surface ring).
 * Colors come from the four Aurora chip tokens; a token object may override with its own color
 * (Phase 3 data layer: `Token.chip` + `Token.glyph`).
 */
export type TokenChip = 'a' | 'b' | 'c' | 'd';

const CHIP_COLOR: Record<TokenChip, string> = {
  a: 'var(--tk-a)', // DELTA  (mint)
  b: 'var(--tk-b)', // WETH   (periwinkle)
  c: 'var(--tk-c)', // USDC   (teal)
  d: 'var(--tk-d)', // WBTC   (amber)
};

/** Same tint→on-tint logic as the theme; text is always the dark green `--btn-fg`. */
function styleFor(chip: TokenChip, customColor?: string): CSSProperties {
  const color = customColor ?? CHIP_COLOR[chip];
  return {
    background: `color-mix(in srgb, ${color} 18%, transparent)`,
    color,
    border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
  };
}

export interface TokenIconProps {
  symbol: string;
  chip?: TokenChip;
  /** Override the tint (e.g. an out-of-list token renders neutral). */
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Rendered instead of the first letter (a real logo image, later phases). */
  glyph?: ReactNode;
}

export function TokenIcon({ symbol, chip = 'a', color, size = 'md', className, glyph }: TokenIconProps): ReactNode {
  const dim = size === 'sm' ? 'size-[26px] text-[11px]' : size === 'lg' ? 'size-10 text-[15px]' : 'size-8 text-[13px]';
  return (
    <span
      aria-hidden
      className={cn('grid shrink-0 place-items-center rounded-full font-bold', dim, className)}
      style={styleFor(chip, color)}
    >
      {glyph ?? symbol.charAt(0)}
    </span>
  );
}

/** Overlapping pair — pool rows (DELTA / ETH). */
export function TokenIconPair({
  a,
  b,
  size = 'md',
}: {
  a: TokenIconProps;
  b: TokenIconProps;
  size?: 'sm' | 'md';
}): ReactNode {
  const dim = size === 'sm' ? 'size-[26px] text-[11px]' : 'size-8 text-[13px]';
  const ring = '2px solid var(--surface)';
  return (
    <span className={cn('flex shrink-0 items-center')}>
      <span className={cn('grid place-items-center rounded-full font-bold', dim)} style={{ ...styleFor(a.chip ?? 'a', a.color), boxShadow: 'none', outline: ring, outlineOffset: '-1px' }}>
        {a.glyph ?? a.symbol.charAt(0)}
      </span>
      <span
        className={cn('grid -ms-[9px] place-items-center rounded-full font-bold', dim)}
        style={{ ...styleFor(b.chip ?? 'b', b.color), outline: ring, outlineOffset: '-1px' }}
      >
        {b.glyph ?? b.symbol.charAt(0)}
      </span>
    </span>
  );
}
