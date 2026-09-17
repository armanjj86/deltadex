import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Inset "field" surfaces. The swap-style amount field is `AmountField`
 * (27px numerals + token pill + MAX), everything else uses `InputField`.
 * Both are uncontrolled by default and take a label/hint/error slot so feature code
 * never re-implements the markup.
 */

export type FieldSize = 'sm' | 'md' | 'lg';

const AMOUNT_SIZE: Record<FieldSize, string> = {
  sm: 'text-[18px] px-3 py-2.5',
  md: 'text-[22px] px-4 py-3',
  lg: 'text-[27px] px-4 py-4',
};

export interface AmountFieldProps {
  label: ReactNode;
  /** Always USD sub-line under the amount, e.g. ≈ $421.80 (never localized). */
  usdSub?: ReactNode;
  value?: string;
  onValueChange?: (next: string) => void;
  /** Right slot: usually <TokenChip/>. */
  token?: ReactNode;
  size?: FieldSize;
  error?: ReactNode;
  hint?: ReactNode;
  maxAction?: { label: ReactNode; onClick: () => void };
  disabled?: boolean;
  placeholder?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
}

export function AmountField({
  label,
  usdSub,
  value,
  onValueChange,
  token,
  size = 'lg',
  error,
  hint,
  maxAction,
  disabled,
  placeholder = '0.0',
  inputMode = 'decimal',
}: AmountFieldProps): ReactNode {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 px-1 pb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text2">{label}</span>
        <div className="flex items-center gap-2">
          {usdSub ? <span className="num text-[11.5px] text-text2">{usdSub}</span> : null}
          {maxAction ? (
            <button
              type="button"
              {...(maxAction.onClick ? { onClick: maxAction.onClick } : {})}
              disabled={disabled}
              className={cn(
                'num rounded-pill border border-acc-bd bg-acc-dim px-1.5 py-[2px] text-[10px] font-bold text-acc',
                'hover:brightness-110 disabled:opacity-50',
              )}
            >
              {maxAction.label}
            </button>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          'aurora-field flex items-center gap-3',
          AMOUNT_SIZE[size],
          disabled && 'opacity-60',
          error && 'border-[color-mix(in_srgb,var(--down)_45%,transparent)]',
        )}
      >
        <input
          className="num min-w-0 flex-1 bg-transparent font-bold outline-none placeholder:text-text2"
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          disabled={disabled}
          dir="ltr"
        />
        {token}
      </div>

      {error ? <p className="mt-1.5 px-1 text-[11.5px] text-down">{error}</p> : null}
      {!error && hint ? <p className="mt-1.5 px-1 text-[11.5px] text-text2">{hint}</p> : null}
    </div>
  );
}

export interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Force LTR (addresses, percentages) — Persian placeholders still render RTL. */
  ltr?: boolean;
}

export function InputField({
  label,
  hint,
  error,
  leading,
  trailing,
  ltr,
  className,
  ...input
}: InputFieldProps): ReactNode {
  return (
    <label className="block w-full">
      {label ? (
        <span className="mb-1.5 block px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text2">
          {label}
        </span>
      ) : null}
      <span
        className={cn(
          'aurora-field flex items-center gap-2.5 px-3.5 py-2.5',
          error && 'border-[color-mix(in_srgb,var(--down)_45%,transparent)]',
          input.disabled && 'opacity-60',
        )}
      >
        {leading}
        <input
          {...input}
          dir={ltr ? 'ltr' : input.dir}
          className={cn('min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-text2', ltr && 'num', className)}
        />
        {trailing}
      </span>
      {error ? <span className="mt-1.5 block px-1 text-[11.5px] text-down">{error}</span> : null}
      {!error && hint ? <span className="mt-1.5 block px-1 text-[11.5px] text-text2">{hint}</span> : null}
    </label>
  );
}
