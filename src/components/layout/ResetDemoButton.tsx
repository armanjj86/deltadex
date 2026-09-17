'use client';

import { useState, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { listDemoKeys, resetDemoData } from '@/lib/demo-persistence';

/**
 * One-click demo reset for the presenter: clears every `dd.v1.*` key and reloads, so stores
 * re-seed from the mock data. Two-step confirm (click once → "sure?" → click again) because the
 * presenter might hit it mid-demo by accident.
 */
export function ResetDemoButton({ label, confirmLabel }: { label: string; confirmLabel: string }): ReactNode {
  const [armed, setArmed] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  if (typeof window === 'undefined') return null;

  const visible = count === null ? undefined : count;

  return (
    <button
      type="button"
      onClick={() => {
        if (!armed) {
          setCount(listDemoKeys().length);
          setArmed(true);
          window.setTimeout(() => setArmed(false), 4000);
          return;
        }
        resetDemoData();
      }}
      title={visible ? `${label} (${visible})` : label}
      className={
        armed
          ? 'inline-flex h-7 items-center gap-1.5 rounded-pill border border-[color-mix(in_srgb,var(--down)_35%,transparent)] bg-down-dim px-2.5 text-[11.5px] font-bold text-down'
          : 'inline-flex h-7 items-center gap-1.5 rounded-pill border border-hair bg-surface px-2.5 text-[11.5px] font-semibold text-text2 transition-colors hover:border-acc-bd hover:text-text'
      }
    >
      <RotateCcw className="size-3" aria-hidden />
      {armed ? confirmLabel : label}
    </button>
  );
}
