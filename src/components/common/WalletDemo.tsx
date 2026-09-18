'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { WalletModalView, type WalletErrorKey } from '@/components/wallet/WalletModalView';
import { wallet } from '@/services/wallet/binding';
import { requestWalletModal } from '@/services/wallet/ui-events';
import { useWallet } from '@/store/wallet';
import { TOKENS } from '@/data/tokens';
import type { WalletProviderId, WalletProviderInfo } from '@/services/wallet/types';

/**
 * Gallery half of Phase 3 (temporary, removed in Phase 12): the *real* wallet view rendered inline so
 * every state can be eyeballed at once — provider detection, demo connect, the real MetaMask path,
 * and each error copy.
 *
 * It is not a second, pretend wallet: it drives the same `MockWalletService` singleton the topbar
 * uses, so connecting here also changes the topbar chip (and the header badge below proves it by
 * reading `useWallet()` — the same store the topnav reads). «open the real modal» raises the modal
 * from the topbar instead of a copy of it.
 *
 * Strings arrive from the page (server); a client file never reads a dictionary directly here.
 */
export function WalletDemo({
  strings,
  errors,
  labels,
  status,
}: {
  strings: React.ComponentProps<typeof WalletModalView>['strings'];
  errors: Record<Exclude<WalletErrorKey, null>, string>;
  labels: {
    title: string;
    note: string;
    connectMetaMask: string;
    connectDemo: string;
    disconnect: string;
    errorA: string;
    errorB: string;
    copyState: string;
    /** Live-state line, read from the store (not hard-coded). */
    statusOff: string;
    statusOn: string;
    addressLabel: string;
    openModal: string;
  };
  /** Live-state sentences, from the `wallet` namespace. */
  status: { none: string; demo: string; real: string };
}): React.ReactNode {
  const [providers, setProviders] = useState<WalletProviderInfo[]>([]);
  const [busy, setBusy] = useState<WalletProviderId | null>(null);
  const [error, setError] = useState<WalletErrorKey>(null);
  const [copied, setCopied] = useState(false);
  const connected = useWallet();

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

  const balances = TOKENS.filter((t) => t.symbol !== 'veDELTA' && t.seedBalance > 0).map((t) => ({
    symbol: t.symbol,
    amount: t.seedBalance,
  }));

  const connect = async (id: WalletProviderId) => {
    setBusy(id);
    setError(null);
    try {
      await wallet.connect(id);
    } catch {
      setError('errRejected');
    } finally {
      setBusy(null);
    }
  };

  const short = connected ? `${connected.address.slice(0, 6)}…${connected.address.slice(-4)}` : null;

  return (
    <Card>
      <CardHeader
        title={labels.title}
        action={
          <Badge tone={connected ? 'up' : 'neutral'} aria-live="polite">
            {connected ? labels.statusOn : labels.statusOff}
            {short ? <span className="num"> · {short}</span> : null}
          </Badge>
        }
      />
      <p className="mt-3 text-[12.5px] leading-relaxed text-text2">{labels.note}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" {...(connected ? { onClick: () => void wallet.disconnect() } : {})} disabled={!connected}>
          {labels.disconnect}
        </Button>
        <Button size="sm" variant="outline" {...{ onClick: () => connect('metamask') }}>
          {labels.connectMetaMask}
        </Button>
        <Button size="sm" variant="ghost" {...{ onClick: () => connect('demo') }}>
          {labels.connectDemo}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          {...{
            onClick: () => {
              setError('errNoExtension');
            },
          }}
        >
          {labels.errorA}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          {...{
            onClick: () => {
              setError('errRejected');
            },
          }}
        >
          {labels.errorB}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          {...{
            onClick: () => {
              setCopied((v) => !v);
            },
          }}
        >
          {labels.copyState}
        </Button>
      </div>

      {/* Proof that the topbar and this block are the same wallet, not a screenshot of one. */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-hair bg-surface px-3 py-2">
        <p className="min-w-0 text-[11.5px] leading-relaxed text-text2">
          {connected ? (
            <>
              {labels.addressLabel}: <span className="num font-bold text-text">{short}</span>
            </>
          ) : (
            labels.statusOff
          )}
        </p>
        <Button size="sm" variant="link" {...{ onClick: () => requestWalletModal() }}>
          {labels.openModal}
        </Button>
      </div>

      <div className="mt-4 rounded-card border border-hair bg-field p-4">
        <WalletModalView
          providers={providers}
          wallet={connected}
          error={error}
          busyProvider={busy}
          copied={copied}
          balances={balances}
          strings={strings}
          liveNote={
            connected ? `${connected.isDemo ? status.demo : status.real} · ${short}` : status.none
          }
          errors={errors}
          onConnect={connect}
          onDisconnect={() => void wallet.disconnect()}
        />
      </div>
    </Card>
  );
}
