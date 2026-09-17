import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Segmented tabs (swap ↔ limit, flexible ↔ fixed-term).
 * Presentational: pass value + onChange. `<Tabs/>` (client) keeps its own state for demos.
 */
export interface TabItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export function TabList({
  items,
  value,
  onChange,
  size = 'md',
  className,
  ariaLabel,
}: {
  items: TabItem[];
  value: string;
  onChange?: (id: string) => void;
  size?: 'sm' | 'md';
  className?: string;
  ariaLabel?: string;
}): ReactNode {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-1 rounded-btn border border-hair bg-field p-1',
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={item.disabled || !onChange}
            onClick={() => onChange?.(item.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-[9px] font-semibold whitespace-nowrap',
              'transition-colors duration-150',
              size === 'sm' ? 'h-7 px-2.5 text-[11.5px]' : 'h-8 px-3.5 text-[13px]',
              selected
                ? 'bg-acc-dim text-acc border border-acc-bd'
                : 'border border-transparent text-text2 hover:text-text',
              item.disabled && 'text-text3 hover:text-text3',
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
