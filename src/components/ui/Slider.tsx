import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Aurora slider (stake duration / amount share): 6px track, mint→cyan gradient fill,
 * 20px white knob with a 4px mint ring. Implemented as a native range input so keyboard,
 * touch-free dragging and RTL all work for free (fill mirrors via inset-inline logic in ui.css).
 *
 * `marks` renders the tick labels under the track (e.g. 1 week … 4 years).
 */
export function SliderBase({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  ariaLabel,
  marks,
  disabled,
  className,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (next: number) => void;
  ariaLabel: string;
  marks?: { value: number; label: ReactNode }[];
  disabled?: boolean;
  className?: string;
}): ReactNode {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div className={cn('w-full', className)}>
      <input
        type="range"
        className="aurora-slider"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange?.(Number(event.target.value))}
        style={{ ['--fill' as string]: `${pct}%` } as React.CSSProperties}
      />
      {marks?.length ? (
        <div className="mt-2 flex justify-between text-[10.5px] text-text2">
          {marks.map((mark) => (
            <span key={mark.value} className={cn('num', Math.abs(mark.value - value) < (step || 1) / 2 && 'text-acc')}>
              {mark.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
