'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Aurora modal: fixed dim + blur overlay, 400px panel, #0B1411, radius 24, triple shadow with a
 * faint mint halo (see .aurora-modal in ui.css). Escape + backdrop click close it; focus is moved
 * into the panel and trapped with Tab so the wallet flow stays keyboard-usable.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 400,
  labelledById,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
  /** id of the title node, for aria-labelledby (defaults to a generated id). */
  labelledById?: string;
  className?: string;
}): ReactNode {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<Element | null>(null);
  const titleId = labelledById ?? 'aurora-modal-title';

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown, true);
    // Focus the first interactive element (or the panel) once painted.
    const raf = requestAnimationFrame(() => {
      const target =
        panelRef.current?.querySelector<HTMLElement>(
          'input,button,[tabindex]:not([tabindex="-1"])',
        ) ?? panelRef.current;
      target?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = overflow;
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus();
    };
  }, [open, onKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-6"
      style={{ background: 'rgba(3,8,6,.66)', backdropFilter: 'blur(7px)' }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn('aurora-modal max-h-full w-full overflow-y-auto p-6 outline-none', className)}
        style={{ maxWidth: width }}
        data-aurora-animate
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-[17px] font-bold tracking-[-0.015em]">
              {title}
            </h2>
            {subtitle ? <p className="mt-1 text-[12px] leading-snug text-text2">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-7 shrink-0 place-items-center rounded-pill border border-hair bg-surface text-text2 transition-colors hover:text-text hover:border-acc-bd"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>

        <div className="mt-5">{children}</div>
        {footer ? <div className="mt-5 border-t border-hair pt-4">{footer}</div> : null}
      </div>
    </div>
  );
}
