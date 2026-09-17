import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { SwitchBase } from '@/components/ui/Switch';

/**
 * The "simple + Pro tools" pattern (theme spec §3): dashed bar listing advanced tools with one
 * switch on the inline-end. Toggling it is owned by the feature page (Phase 5+); this component
 * only renders the bar.
 */
export function ProToolsBar({
  title,
  items,
  caption,
  checked,
  onChange,
  switchLabel,
  icon,
  className,
}: {
  title: ReactNode;
  items: ReactNode[];
  caption?: ReactNode;
  checked?: boolean;
  onChange?: (next: boolean) => void;
  /** Accessible name for the switch (i18n string from the caller). */
  switchLabel: string;
  icon?: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[16px] border-[1.5px] border-dashed border-hair bg-surface/60 px-5 py-4',
        className,
      )}
    >
      <span className="grid size-9 place-items-center rounded-btn border border-acc-bd bg-acc-dim text-acc">
        {icon}
      </span>
      <p className="text-[13px] font-bold tracking-[-0.01em]">{title}</p>
      <ul className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-text2">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center gap-2.5">
            {index > 0 ? <span aria-hidden className="text-hair">·</span> : null}
            {item}
          </li>
        ))}
      </ul>
      <div className="ms-auto flex items-center gap-3">
        {caption ? <span className="text-[12px] text-text2">{caption}</span> : null}
        <SwitchBase label={switchLabel} checked={Boolean(checked)} onChange={onChange} />
      </div>
    </div>
  );
}
