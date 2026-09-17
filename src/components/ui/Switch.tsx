import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * 42×24 switch, 18px knob (theme spec). Off track is `--switch-off`; on track is the mint accent
 * with the accent glow. Used by: MEV protection, auto-compound, Pro tools, hide-small-balances.
 */
export function SwitchBase({
  checked,
  onChange,
  label,
  disabled,
  size = 'md',
  className,
}: {
  checked: boolean;
  onChange?: (next: boolean) => void;
  /** Accessible name — required, never rely on visual context. */
  label: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}): ReactNode {
  const box = size === 'sm' ? { w: 34, h: 20, knob: 14, travel: 14 } : { w: 42, h: 24, knob: 18, travel: 18 };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled || !onChange}
      // Handler is only attached when a real callback exists: server-rendered
      // elements must never hand a freshly created function to a Client Component.
      {...(onChange ? { onClick: () => onChange(!checked) } : {})}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full border',
        'transition-[background-color,box-shadow] duration-200 ease-out',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--acc)]',
        disabled && 'opacity-50',
        !disabled && onChange && 'cursor-pointer',
        checked ? 'border-acc-bd bg-acc' : 'border-hair bg-switch-off',
        className,
      )}
      style={{
        width: box.w,
        height: box.h,
        boxShadow: checked ? 'var(--glow-btn)' : 'inset 0 1px 2px rgba(0,0,0,.4)',
      }}
    >
      {/* Position is static (inset-inline-start: 3px) and the travel is a transform, so the
          slide animates on the compositor and mirrors itself in RTL (see .dd-switch-knob). */}
      <span
        className={cn('dd-switch-knob absolute rounded-full bg-white', checked && 'is-on')}
        style={{ width: box.knob, height: box.knob }}
      />
    </button>
  );
}
