import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Glass card family (radius 22 + hairline border + backdrop blur).
 *  - `Card`        : plain glass (feature cards, panels)
 *  - `WidgetCard`  : heavier shadow — the swap/stake/bridge widgets
 *  - `featured`    : gradient wash + accent border (stake benefits, featured farm, vote card,
 *                    unclaimed-fees hero) — always opt-in, never automatic.
 */
export function Card({
  children,
  className,
  padded = true,
  featured = false,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  featured?: boolean;
  as?: 'div' | 'section' | 'article';
}): ReactNode {
  const Tag = as;
  return (
    <Tag
      className={cn(
        'relative rounded-card border border-hair bg-surface backdrop-blur-xl shadow-soft',
        padded && 'p-6',
        featured && 'border-acc-bd',
        className,
      )}
      style={
        featured
          ? { backgroundImage: 'linear-gradient(140deg, rgba(44,224,163,.12), rgba(53,199,232,.06))' }
          : undefined
      }
    >
      {children}
    </Tag>
  );
}

export function WidgetCard({ children, className }: { children: ReactNode; className?: string }): ReactNode {
  return (
    <div className={cn('relative rounded-card border border-hair bg-surface backdrop-blur-xl', className)} style={{ boxShadow: 'var(--sh-widget)' }}>
      {children}
    </div>
  );
}

/** Title row used inside cards: 13.5/600 label + optional right-side link. */
export function CardHeader({
  title,
  action,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <h3 className="text-[13.5px] font-semibold tracking-[-0.01em] text-text">{title}</h3>
      {action}
    </div>
  );
}

/** Page title block (dashboard "Overview" + mono subtitle line). */
export function PageHeader({
  title,
  subtitle,
  end,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  end?: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <div className={cn('flex items-end justify-between gap-6', className)}>
      <div>
        <h1 className="text-[27px] font-extrabold leading-tight tracking-[-0.02em]">{title}</h1>
        {subtitle ? (
          <p className="num mt-1 text-[12px] tracking-[0.01em] text-text2">{subtitle}</p>
        ) : null}
      </div>
      {end}
    </div>
  );
}
