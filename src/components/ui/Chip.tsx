import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Generic Aurora chip: 36px filter chip (active = mint text on mint tint + accent border),
 * small label chip (topnav "DEX", landing "AUDITED"), and clickable chip button.
 */
export type ChipSize = 'sm' | 'md';

export interface ChipProps {
  size?: ChipSize;
  active?: boolean;
  /** Renders <button> when provided (keyboard + aria handled). */
  onClick?: () => void;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** dashed accent border (AUDITED / MAX style) */
  outline?: boolean;
  className?: string;
  children: ReactNode;
  title?: string;
}

export function Chip({
  size = 'md',
  active = false,
  onClick,
  leading,
  trailing,
  outline = false,
  className,
  children,
  title,
}: ChipProps): ReactNode {
  const base = cn(
    'inline-flex shrink-0 select-none items-center gap-2 whitespace-nowrap rounded-pill border',
    'transition-colors duration-150',
    size === 'md' ? 'h-9 px-3.5 text-[12.5px]' : 'h-7 px-2.5 text-[11px] font-bold',
    outline
      ? 'border-dashed border-acc-bd bg-acc-dim text-acc'
      : active
        ? 'border-acc-bd bg-acc-dim text-acc'
        : 'border-hair bg-surface text-text2 hover:text-text hover:border-acc-bd',
    onClick && 'cursor-pointer',
    className,
  );

  const inner = (
    <>
      {leading}
      {children}
      {trailing}
    </>
  );

  if (onClick) {
    return (
      <button type="button" title={title} aria-pressed={active} {...(onClick ? { onClick: onClick as () => void } : {})} className={base}>
        {inner}
      </button>
    );
  }
  return (
    <span title={title} className={base}>
      {inner}
    </span>
  );
}
