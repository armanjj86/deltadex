'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Modal } from '@/components/ui/Modal';
import { WalletModalView, type WalletErrorKey } from './WalletModalView';
import { useBalances } from '@/store/balances';
import { useWallet } from '@/store/wallet';
import { wallet } from '@/services/wallet/binding';
import { onWalletModalRequest } from '@/services/wallet/ui-events';
import { TOKENS, type Token } from '@/data/tokens';
import type { WalletProviderId, WalletProviderInfo } from '@/services/wallet/types';

/**
 * The interactive half of the wallet chrome (Phase 3): topnav slot + connect modal.
 *
 * Kept as ONE client component so Topnav stays a presentational, server-capable file (it receives
 * this as `walletNode`). Nothing here imports `window.ethereum` — the wallet service does, and this
 * component only mirrors its state via `useWallet()`.
 *
 * Demo-safety rules applied: a missing extension is a message, never a broken screen; a rejected
 * request closes nothing but the flow; the state survives a refresh (`dd.v1.wallet`).
 */
export function WalletSection({ mode = 'chip' }: { mode?: 'chip' | 'connect' } = {}): React.ReactNode {
  const t = useTranslations('wallet');
  const nav = useTranslations('nav');
  const connected = useWallet();
  const amounts = useBalances((s) => s.amounts);

  const [providers, setProviders] = useState<WalletProviderInfo[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<WalletProviderId | null>(null);
  const [error, setError] = useState<WalletErrorKey>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Providers are detected after mount — a prerendered page must never claim «Detected».
  // Providers are detected after mount — a prerendered page must never claim «Detected».
  // If detection itself fails we still offer the demo wallet, so the modal is never a dead end.
  useEffect(() => {
    let alive = true;
    wallet
      .detect()
      .then((list) => {
        if (alive) setProviders(list);
      })
      .catch(() => {
        if (alive) {
          setProviders([
            { id: 'demo', name: 'Demo wallet', available: true, installed: true, note: 'no-extension-needed' },
          ]);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  // The gallery block asks for this very modal through a window event (one wallet, two entry points).
  useEffect(() => onWalletModalRequest(() => setOpen(true)), []);

  const connect = useCallback(
    async (id: WalletProviderId) => {
      if (id === 'metamask' && !providers.find((p) => p.id === 'metamask')?.installed) {
        setError('errNoExtension');
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setError('errOffline');
        return;
      }
      setBusy(id);
      setError(null);
      try {
        await wallet.connect(id);
        setOpen(false);
      } catch {
        // ch01 alternative flow: the user cancelled in the wallet itself.
        setError('errRejected');
      } finally {
        setBusy(null);
      }
    },
    [providers],
  );

  const disconnect = useCallback(() => {
    void wallet.disconnect();
    setOpen(false);
  }, []);

  const addNetwork = useCallback(async () => {
    try {
      await wallet.addDeltaChainNetwork();
      setNotice(t('addedChain'));
    } catch {
      setError('errGeneric');
    }
  }, [t]);

  const watchToken = useCallback(
    async (token: Token) => {
      const service = wallet as typeof wallet & {
        watchAsset?: (t: { address: string; symbol: string; decimals: number }) => Promise<boolean>;
      };
      const ok = await service.watchAsset?.({
        address: token.demoAddress,
        symbol: token.symbol,
        decimals: token.decimals,
      });
      setNotice(ok ? t('watched') : t('errGeneric'));
    },
    [t],
  );

  const sign = useCallback(async () => {
    const service = wallet as typeof wallet & { signMessage?: (m: string) => Promise<'signed' | 'rejected' | 'unavailable'> };
    const result = await service.signMessage?.('Delta DEX demo — signature check');
    setNotice(result === 'signed' ? t('signed') : t('signRejected'));
  }, [t]);

  const copy = useCallback(async () => {
    if (!connected) return;
    try {
      await navigator.clipboard.writeText(connected.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked (http/insecure context): the address stays readable on screen */
    }
  }, [connected]);

  const balances = TOKENS.filter((token) => token.symbol !== 'veDELTA' && (amounts[token.symbol] ?? 0) > 0).map(
    (token) => ({ symbol: token.symbol, amount: amounts[token.symbol] ?? token.seedBalance }),
  );

  /*
   * `mode` only chooses the shape of the **disconnected** slot: the landing (frame 01) shows a
   * prominent Connect button, app pages (frame 02) a compact one. Once a wallet *is* connected the
   * chip renders on every route, landing included — QA caught the landing keeping the button after a
   * successful connect, which is exactly what made the wallet look "display only".
   */
  const trigger =
    !connected ? (
      <Button size="md" {...{ onClick: () => setOpen(true) }}>
        {nav('connect')}
      </Button>
    ) : (
      <Chip
        leading={
          <span
            aria-hidden
            className="size-6 rounded-full"
            style={{ background: 'conic-gradient(from 210deg, var(--acc), var(--acc2) 45%, #0b1411 78%, var(--acc))' }}
          />
        }
        trailing={
          <svg viewBox="0 0 10 6" width="9" height="6" aria-hidden className="text-text2">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </svg>
        }
        title={connected.address}
        {...{ onClick: () => setOpen(true) }}
      >
        <span className="num font-medium">
          {connected.address.slice(0, 6)}…{connected.address.slice(-4)}
        </span>
        {connected.network === 'unsupported' ? <Badge tone="down">{t('unsupportedNetwork')}</Badge> : null}
      </Chip>
    );

  return (
    <>
      {trigger}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={connected ? t('connected') : t('title')}
        subtitle={connected ? undefined : t('subtitle')}
        closeLabel={t('close')}
        width={430}
        footer={notice ? <p className="text-[12px] text-acc" aria-live="polite">{notice}</p> : undefined}
      >
        <div className="pt-1" onAnimationEnd={() => setNotice(null)}>
          <WalletModalView
            liveNote={
              connected
                ? connected.isDemo
                  ? `${t('statusConnectedDemo')} · ${connected.address.slice(0, 6)}…${connected.address.slice(-4)}`
                : `${t('statusConnectedReal')} · ${connected.address.slice(0, 6)}…${connected.address.slice(-4)}`
                : t('statusNone')
            }
            providers={providers}
            wallet={connected}
            error={error}
            busyProvider={busy}
            copied={copied}
            balances={balances}
            strings={{
              subtitle: t('subtitle'),
              providers: t('providers'),
              detected: t('detected'),
              notDetected: t('notDetected'),
              install: t('install'),
              demo: t('demo'),
              demoNote: t('demoNote'),
              outOfScope: t('outOfScope'),
              security: t('security'),
              connected: t('connected'),
              network: t('network'),
              unsupportedNetwork: t('unsupportedNetwork'),
              switchHint: t('switchHint'),
              addDeltaChain: t('addDeltaChain'),
              copy: t('copy'),
              copied: t('copied'),
              disconnect: t('disconnect'),
              watchToken: t('watchToken'),
              sign: t('sign'),
              balances: t('balances'),
              retry: t('retry'),
            }}
            errors={{
              errRejected: t('errRejected'),
              errNoExtension: t('errNoExtension'),
              errOffline: t('errOffline'),
              errGeneric: t('errGeneric'),
            }}
            onConnect={connect}
            onDisconnect={disconnect}
            onAddNetwork={addNetwork}
            onWatchToken={watchToken}
            onSign={sign}
            onCopy={copy}
          />
        </div>
      </Modal>
    </>
  );
}
