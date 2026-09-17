import type { CSSProperties, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Hairline data table (theme spec: grid layout, 46px leading token column, 1px top separators,
 * uppercase micro headers, numbers right-aligned with tabular figures).
 * Rows are `TableGrid` too, so the same `template` drives head and body — no <table> semantics
 * needed for a prototype, and RTL mirrors automatically because we use text-start/end.
 */

export type Align = 'start' | 'end' | 'center';

const ALIGN_CLASS: Record<Align, string> = {
  start: 'text-start',
  end: 'text-end',
  center: 'text-center',
};

export function TableGrid({
  template,
  head,
  className,
  children,
  onClick,
}: {
  /** e.g. "46px minmax(0,1fr) 120px 120px 96px 28px" */
  template: string;
  head?: boolean;
  className?: string;
  children?: ReactNode;
  /** Makes the row clickable (pool/position rows navigate to detail). */
  onClick?: () => void;
}): ReactNode {
  const style = { gridTemplateColumns: template } as CSSProperties;
  const box = cn('aurora-tbl w-full', head && 'is-head', className);
  if (onClick) {
    return (
      <button
        type="button"
        {...(onClick ? { onClick: onClick as () => void } : {})}
        style={style}
        className={cn(box, 'text-start transition-colors hover:bg-surface-alt')}
      >
        {children}
      </button>
    );
  }
  return (
    <div style={style} className={box}>
      {children}
    </div>
  );
}

export function TCell({
  children,
  align = 'start',
  numeric,
  muted,
  strong,
  className,
}: {
  children?: ReactNode;
  align?: Align;
  /** mono + tabular + LTR-isolated (prices, APR, amounts) */
  numeric?: boolean;
  muted?: boolean;
  strong?: boolean;
  className?: string;
}): ReactNode {
  return (
    <div
      className={cn(
        'tbl-cell min-w-0 truncate',
        ALIGN_CLASS[align],
        numeric && 'num',
        strong && 'font-bold',
        muted && 'text-text2',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SimplePagination({
  page,
  pageCount,
  onPage,
  labels,
}: {
  page: number;
  pageCount: number;
  onPage?: (next: number) => void;
  /** i18n labels from the caller (never hardcode strings here). */
  labels: { prev: string; next: string; of: (page: number, total: number) => string };
}): ReactNode {
  const arrow = (dir: 'prev' | 'next', disabled: boolean) => (
    <button
      type="button"
      disabled={disabled}
      {...(onPage ? { onClick: () => onPage(dir === 'prev' ? page - 1 : page + 1) } : {})}
      aria-label={dir === 'prev' ? labels.prev : labels.next}
      className={cn(
        'grid size-7 place-items-center rounded-pill border border-hair bg-surface text-text2 transition-colors',
        !disabled && onPage && 'hover:border-acc-bd hover:text-text',
        (disabled || !onPage) && 'opacity-40',
      )}
    >
      {dir === 'prev' ? <ChevronLeft className="size-3.5 rtl:rotate-180" aria-hidden /> : <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden />}
    </button>
  );

  return (
    <div className="flex items-center justify-end gap-3">
      <span className="num text-[11.5px] text-text2">{labels.of(page, pageCount)}</span>
      {arrow('prev', page <= 1)}
      {arrow('next', page >= pageCount)}
    </div>
  );
}
