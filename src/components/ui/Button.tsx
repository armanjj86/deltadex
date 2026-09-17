import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Aurora button.
 * Variants follow the frames: `primary` = mint fill + dark text + glow (hero CTA),
 * `ghost` = glass fill, `outline` = hairline, `danger` = rose tint, `link` = text-only.
 * Sizes: sm 11.5px labels, md 13px (nav/settings), lg 50px CTA (swap widget).
 */
export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-acc text-btn-fg font-bold hover:brightness-105 active:brightness-95 [box-shadow:var(--glow-btn)]',
  ghost: 'bg-surface text-text font-semibold border border-hair hover:bg-surface-alt hover:border-acc-bd',
  outline: 'bg-transparent text-acc font-bold border border-acc-bd hover:bg-acc-dim',
  danger: 'bg-down-dim text-down font-bold border border-[color-mix(in_srgb,var(--down)_35%,transparent)] hover:brightness-110',
  link: 'bg-transparent text-text2 font-semibold hover:text-acc underline-offset-4',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[11.5px] rounded-pill',
  md: 'h-10 px-4 text-[13px] rounded-btn',
  lg: 'h-[50px] px-6 text-[15px] rounded-btnLg',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks interaction — used for pending wallet steps. */
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leadingIcon,
  trailingIcon,
  fullWidth,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps): ReactNode {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap',
        'transition-[filter,background-color,border-color,color] duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--acc)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
}
