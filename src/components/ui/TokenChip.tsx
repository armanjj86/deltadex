import type { ReactNode } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { TokenIcon, type TokenChip as ChipTint } from './TokenIcon';

/**
 * The pill on the right side of a swap field: token circle + symbol + up/down chevrons.
 * Phase 5 wires `onClick` to the token-select modal; until then it is a button that does nothing.
 */
export function TokenChip({
  symbol,
  chip = 'a',
  onClick,
  disabled,
  className,
  glyph,
}: {
  symbol: string;
  chip?: ChipTint;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  glyph?: ReactNode;
}): ReactNode {
  const content = (
    <>
      <TokenIcon symbol={symbol} chip={chip} size="sm" glyph={glyph} />
      <span className="text-[13px] font-bold tracking-[-0.01em]">{symbol}</span>
      {!disabled && <ChevronsUpDown className="size-3.5 text-text2" aria-hidden />}
    </>
  );
  const box = cn(
    'inline-flex shrink-0 items-center gap-2 rounded-pill border border-hair bg-surface ps-1.5 pe-2.5 py-1.5',
    'transition-colors duration-150',
    !disabled && onClick && 'hover:border-acc-bd cursor-pointer',
    disabled && 'opacity-60 cursor-not-allowed',
    className,
  );

  if (!onClick) {
    return <span className={box}>{content}</span>;
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={box}>
      {content}
    </button>
  );
}
