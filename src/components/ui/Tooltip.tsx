import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * CSS-only tooltip (hover + keyboard focus, no JS, no dependency).
 * Used for the "coming soon" states (WalletConnect option, disabled Pro tools, Phase 3 notices).
 */
export function Tooltip({
  content,
  children,
  className,
  disabled,
}: {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  /** Hides the bubble entirely (e.g. tooltip not relevant at this width). */
  disabled?: boolean;
}): ReactNode {
  if (disabled) return <>{children}</>;
  return (
    <span className={cn('group/tt relative inline-flex', className)} tabIndex={0}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-[calc(100%+8px)] start-1/2 z-50 w-max max-w-[260px]',
          '-translate-x-1/2 rtl:translate-x-1/2 scale-95 opacity-0',
          'rounded-pill border border-hair bg-[#0b1411] px-2.5 py-1.5 text-[11.5px] leading-snug text-text shadow-soft',
          'transition-[opacity,transform] duration-150',
          'group-focus-visible/tt:scale-100 group-focus-visible/tt:opacity-100 group-hover/tt:scale-100 group-hover/tt:opacity-100',
        )}
      >
        {content}
      </span>
    </span>
  );
}
