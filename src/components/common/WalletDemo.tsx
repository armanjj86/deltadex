'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WalletModalView, type WalletErrorKey } from '@/components/wallet/WalletModalView';
import { wallet } from '@/services/wallet/binding';
import { useWallet } from '@/store/wallet';
import { TOKENS } from '@/data/tokens';
import type { WalletProviderId, WalletProviderInfo } from '@/services/wallet/types';

/**
 * Gallery half of Phase 3 (temporary, removed in Phase 12): the wallet modal rendered *inline* so
 * every state can be eyeballed at once — provider detection, demo connect, the real MetaMask path,
 * and each error copy. Buttons drive the real service, so «Connect» here actually opens MetaMask.
 * Strings arrive from the page (server) — a client file never reads a dictionary directly here.
 */
export function WalletDemo({
  strings,
  errors,
  labels,
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
  };
}): React.ReactNode {
  const [providers, setProviders] = useState<WalletProviderInfo[]>([]);
  const [busy, setBusy] = useState<WalletProviderId | null>(null);
  const [error, setError] = useState<WalletErrorKey>(null);
  const [copied, setCopied] = useState(false);
  const connected = useWallet();

  useEffect(() => {
    let alive = true;
    wallet.detect().then((list) => alive && setProviders(list));
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

  return (
    <Card>
      <CardHeader title={labels.title} />
      <p className="mt-3 text-[12.5px] leading-relaxed text-text2">{labels.note}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          {...(connected ? { onClick: () => void wallet.disconnect() } : {})}
          disabled={!connected}
        >
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

      <div className="mt-5 rounded-card border border-hair bg-field p-4">
        <WalletModalView
          providers={providers}
          wallet={connected}
          error={error}
          busyProvider={busy}
          copied={copied}
          balances={balances}
          strings={strings}
          errors={errors}
          onConnect={connect}
          onDisconnect={() => void wallet.disconnect()}
        />
      </div>
    </Card>
  );
}
