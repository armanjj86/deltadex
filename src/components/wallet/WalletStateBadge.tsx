'use client';

import { useTranslations } from 'next-intl';
import { useWallet } from '@/store/wallet';
import { useMounted } from '@/hooks/use-mounted';

/**
 * The live connection state in one line (Phase 3 QA). Server-safe: it renders a neutral
 * "no session" pill until mounted, then mirrors `dd.v1.wallet` — the exact same store the topbar
 * chip reads. Placed in the footer and on placeholder routes so "is the wallet work actually
 * here?" is answerable without opening a modal.
 */
export function WalletStateBadge({ showLabel = true }: { showLabel?: boolean }): React.ReactNode {
  const t = useTranslations('footer');
  const wallet = useWallet();
  const mounted = useMounted();

  const short = wallet ? `${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)}` : null;
  const state = !mounted ? 'unknown' : wallet ? 'on' : 'off';

  return (
    <span
      className="flex items-center gap-1.5 rounded-pill border border-hair bg-surface px-2 py-[3px] text-[10.5px] text-text2/80"
      aria-live="polite"
      title={wallet?.address}
    >
      <span
        aria-hidden
        className={
          'size-1.5 rounded-full ' + (state === 'on' ? 'bg-acc' : state === 'off' ? 'bg-text2/50' : 'bg-hair')
        }
      />
      {showLabel ? <span>{t('stampWallet')}:</span> : null}{' '}
      {state === 'on' ? (
        <>
          {t('stampWalletOn')} <span className="num font-bold text-text">{short}</span>
        </>
      ) : state === 'off' ? (
        t('stampWalletOff')
      ) : (
        <span className="opacity-60">…</span>
      )}
    </span>
  );
}
