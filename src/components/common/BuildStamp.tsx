'use client';

import { useTranslations } from 'next-intl';
import { BUILD_MARKER, BUILD_SHA, BUILD_STATE } from '@/lib/build-stamp';
import { WalletStateBadge } from '@/components/wallet/WalletStateBadge';

/**
 * Footer build stamp + live wallet state (Phase 3 QA).
 *
 * It exists for one demo-critical reason: this prototype is reviewed by eye, and "the wallet work
 * is missing" turned out to be a *stale checkout / stale .next cache*, not a missing feature. So the
 * footer states (a) which commit built this page and (b) what the wallet store holds right now —
 * the live connection state is visible on every page, including the landing, without opening a modal.
 */
export function BuildStamp(): React.ReactNode {
  const t = useTranslations('footer');

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px] text-text2/70">
      <span className="num rounded-pill border border-hair bg-surface px-2 py-[3px] font-bold tracking-[0.02em]">
        {BUILD_MARKER} · <span title={`${BUILD_SHA}${BUILD_STATE ? ` (${BUILD_STATE})` : ''}`}>{BUILD_SHA}</span>
        {BUILD_STATE === 'modified' ? <span> · {t('stampDirty')}</span> : null}
      </span>
      <WalletStateBadge />
      <span>— {t('stampWalletHint')}</span>
    </div>
  );
}
