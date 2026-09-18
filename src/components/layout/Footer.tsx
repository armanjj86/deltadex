import type { ReactNode } from 'react';
import { BrandMark } from '@/components/brand/Brand';
import { ResetDemoButton } from '@/components/layout/ResetDemoButton';
import { BuildStamp } from '@/components/common/BuildStamp';

/**
 * Footer (frame 01): muted single row — copy + prototype note + Reset demo on the inline start,
 * text links on the inline end. External links are decorative in the prototype (no network calls),
 * which is why they render as plain text with a title tooltip instead of <a href>.
 */
export interface FooterLabels {
  docs: string;
  github: string;
  audit: string;
  bounty: string;
  copy: string;
  prototypeBadge: string;
  reset: string;
  resetConfirm: string;
  linkHint: string;
}

export function Footer({ labels }: { labels: FooterLabels }): ReactNode {
  const t = labels;
  const links = [t.docs, t.github, t.audit, t.bounty];

  return (
    <footer className="relative z-10 mt-auto border-t border-hair">
      <div className="mx-auto flex w-full max-w-[1328px] flex-wrap items-center gap-x-6 gap-y-3 px-14 py-6 text-[12.5px] text-text2">
        <div className="flex items-center gap-2.5">
          <BrandMark size={22} />
          <span>{t.copy}</span>
        </div>
        <span className="rounded-pill border border-dashed border-acc-bd bg-acc-dim px-2 py-[3px] text-[10.5px] font-bold uppercase tracking-[0.08em] text-acc">
          {t.prototypeBadge}
        </span>
        <ResetDemoButton label={t.reset} confirmLabel={t.resetConfirm} />
        <BuildStamp />
        <nav className="ms-auto flex items-center gap-5">
          {links.map((label) => (
            <span key={label} title={t.linkHint} className="cursor-default transition-colors hover:text-text">
              {label}
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
