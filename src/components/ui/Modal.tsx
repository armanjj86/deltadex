'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Close animation length — keep in sync with .dd-overlay[data-state=closing] in ui.css. */
const EXIT_MS = 150;

/**
 * Aurora modal: fixed dim + blur overlay, 400px panel, #0B1411, radius 24, triple shadow with a
 * faint mint halo (see .aurora-modal in ui.css). Escape + backdrop click close it; focus is moved
 * into the panel and trapped with Tab so the wallet flow stays keyboard-usable.
 *
 * Three rules learned the hard way (Phase 1 + Phase 3 QA):
 *  - it fades/pops in and out (CSS keyframes, no animation lib);
 *  - while open it sets `html.dd-lock-scroll` (overflow: clip) instead of `body { overflow: hidden }`,
 *    because hiding the scrollbar moved the whole page under the sticky topnav;
 *  - **it renders through a portal into `<body>`.** The wallet modal is mounted inside the sticky
 *    topnav (`z-50` + `backdrop-filter` = its own stacking context), and any `fixed` element inside
 *    that context is painted *within the header's* stacking order — `z-[80]` did not help, so the
 *    panel was covered by the page below and looked "empty / cut off" (Phase 3 QA report). Portaling
 *    escapes the context; SSR-safe because `mounted` is false during the server pass.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 400,
  closeLabel = 'Close',
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
  /** Accessible/visible name of the ✕ button (i18n from the caller). */
  closeLabel?: string;
  /** id of the title node, for aria-labelledby (defaults to a generated id). */
  labelledById?: string;
  className?: string;
}): ReactNode {
  const panelRef = useRef<HTMLDivElement | null>(null);
  /** Only after mount: `document` does not exist during prerender. */
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  useEffect(() => setPortalHost(document.body), []);
  const restoreRef = useRef<Element | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = labelledById ?? 'aurora-modal-title';

  /** `mounted` drives render, `closing` drives the exit animation. */
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setClosing(false);
      setMounted(true);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    timerRef.current = setTimeout(() => {
      setClosing(false);
      setMounted(false);
    }, EXIT_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, mounted]);

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
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.add('dd-lock-scroll');
    restoreRef.current = document.activeElement;
    document.addEventListener('keydown', onKeyDown, true);
    // Focus the first interactive element (or the panel) once painted.
    const raf = requestAnimationFrame(() => {
      const target =
        panelRef.current?.querySelector<HTMLElement>('input,button,[tabindex]:not([tabindex="-1"])') ??
        panelRef.current;
      target?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove('dd-lock-scroll');
      document.removeEventListener('keydown', onKeyDown, true);
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus();
    };
  }, [mounted, onKeyDown]);

  if (!mounted || !portalHost) return null;

  return createPortal(
    <div
      data-state={closing ? 'closing' : 'open'}
      className="dd-overlay fixed inset-0 z-[80] flex items-center justify-center p-6"
      style={{ background: 'rgba(3,8,6,.66)', backdropFilter: 'blur(7px)' }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !closing) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn('dd-panel aurora-modal max-h-full w-full overflow-y-auto p-6 outline-none', className)}
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
            aria-label={closeLabel}
            title={closeLabel}
            className="grid size-7 shrink-0 place-items-center rounded-pill border border-hair bg-surface text-text2 transition-colors hover:text-text hover:border-acc-bd"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>

        <div className="mt-5">{children}</div>
        {footer ? <div className="mt-5 border-t border-hair pt-4">{footer}</div> : null}
      </div>
    </div>,
    portalHost,
  );
}
