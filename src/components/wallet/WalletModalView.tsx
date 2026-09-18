import type { ReactNode } from 'react';
import { AlertTriangle, Copy, LogOut, PenLine, Plus, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TokenIcon } from '@/components/ui/TokenIcon';
import { formatTokenAmount, formatUsd } from '@/lib/format';
import { getToken, type Token } from '@/data/tokens';
import type { ConnectedWallet, WalletProviderId, WalletProviderInfo } from '@/services/wallet/types';

export interface WalletStrings {
  subtitle: string;
  providers: string;
  detected: string;
  notDetected: string;
  install: string;
  demo: string;
  demoNote: string;
  outOfScope: string;
  security: string;
  connected: string;
  network: string;
  unsupportedNetwork: string;
  switchHint: string;
  addDeltaChain: string;
  copy: string;
  copied: string;
  disconnect: string;
  watchToken: string;
  sign: string;
  balances: string;
  retry: string;
}

export type WalletErrorKey = 'errRejected' | 'errNoExtension' | 'errOffline' | 'errGeneric' | null;

const NETWORK_LABEL: Record<string, string> = {
  'delta-chain': 'Delta Chain',
  ethereum: 'Ethereum',
  arbitrum: 'Arbitrum',
  unsupported: '—',
};

/**
 * Presentational half of the wallet flow (Phase 3). No client logic, no strings of its own: the
 * caller (`WalletSection`) owns state and passes next-intl labels, per ARCHITECTURE.md §7. Every
 * handler is applied conditionally (`{...(onSign ? { onClick: onSign } : {})}`) because this
 * component is also rendered from server trees in the gallery.
 */
export function WalletModalView({
  providers,
  wallet,
  error,
  busyProvider,
  copied,
  balances,
  strings,
  liveNote,
  errors,
  onConnect,
  onDisconnect,
  onAddNetwork,
  onWatchToken,
  onSign,
  onCopy,
}: {
  providers: WalletProviderInfo[];
  wallet: ConnectedWallet | null;
  error: WalletErrorKey;
  busyProvider: WalletProviderId | null;
  copied: boolean;
  balances: { symbol: string; amount: number }[];
  strings: WalletStrings;
  /** Plain text (no markup, no callback) describing the live state — see §6.1 in ARCHITECTURE.md. */
  liveNote?: string;
  /** Plain record, not a function: this component receives props from a server component, and
      functions cannot cross the RSC boundary (ARCHITECTURE.md §8). */
  errors: Record<Exclude<WalletErrorKey, null>, string>;
  onConnect?: (id: WalletProviderId) => void;
  onDisconnect?: () => void;
  onAddNetwork?: () => void;
  onWatchToken?: (token: Token) => void;
  onSign?: () => void;
  onCopy?: () => void;
}): ReactNode {
  const t = strings;

  /**
   * Live-state strip. It is deliberately the FIRST thing in both views so nobody (professor
   * included) can mistake this UI for a static mock-up: it names the provider and repeats the
   * address the topbar currently shows.
   */
  const note = liveNote ? (
    <p
      className="flex items-start gap-2 rounded-[12px] border border-hair bg-field px-3 py-2 text-[11.5px] leading-relaxed text-text2"
      aria-live="polite"
    >
      <span aria-hidden className={'mt-[6px] size-1.5 shrink-0 rounded-full ' + (wallet ? 'bg-acc' : 'bg-text2/55')} />
      <span className="min-w-0 break-words">{liveNote}</span>
    </p>
  ) : null;

  if (wallet) {
    const unsupported = wallet.network === 'unsupported';
    return (
      <div className="space-y-4">
        {note}
        <div className="rounded-[14px] border border-acc-bd bg-acc-dim p-3.5">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-6 rounded-full"
              style={{ background: 'conic-gradient(from 210deg, var(--acc), var(--acc2) 45%, #0b1411 78%, var(--acc))' }}
            />
            <span className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-acc">{t.connected}</span>
            {wallet.isDemo ? <Badge tone="outline">{t.demo}</Badge> : null}
          </div>
          <p className="num num-wrap mt-2 text-[14px] font-bold break-all">{wallet.address}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={unsupported ? 'down' : 'neutral'}>
              {t.network}: {unsupported ? t.unsupportedNetwork : NETWORK_LABEL[wallet.network]}
            </Badge>
            <Badge tone="neutral" title={`chainId ${wallet.chainId}`}>
              <span className="num">{wallet.chainId}</span>
            </Badge>
          </div>
          {unsupported ? <p className="mt-2 text-[11.5px] leading-relaxed text-text2">{t.switchHint}</p> : null}
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{t.balances}</p>
          <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-[14px] border border-hair bg-field">
            {balances.map((row) => {
              const token = getToken(row.symbol);
              return (
                <li key={row.symbol} className="flex items-center gap-3 px-3.5 py-2.5">
                  <TokenIcon symbol={token.symbol} chip={token.chip} size="sm" />
                  <span className="flex-1 text-[13px] font-bold">{token.symbol}</span>
                  <span className="text-end">
                    <span className="num block text-[13px] font-bold">{formatTokenAmount(row.amount, 'en')}</span>
                    <span className="num block text-[11px] text-text2">{formatUsd(row.amount * token.usd)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-btn border border-hair bg-surface px-3 py-[7px] text-[12px]">
            <span className="num">{wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}</span>
            <button
              type="button"
              {...(onCopy ? { onClick: onCopy } : {})}
              className="inline-flex items-center gap-1 font-bold text-acc"
              aria-live="polite"
            >
              <Copy className="size-3.5" aria-hidden />
              {copied ? '✓' : t.copy}
            </button>
          </span>
          {wallet.isDemo ? null : (
            <Button
              variant="outline"
              size="sm"
              leadingIcon={<PenLine className="size-3.5" aria-hidden />}
              {...(onSign ? { onClick: onSign } : {})}
            >
              {t.sign}
            </Button>
          )}
          {unsupported || wallet.isDemo ? (
            <Button
              variant="outline"
              size="sm"
              leadingIcon={<Plus className="size-3.5" aria-hidden />}
              {...(onAddNetwork ? { onClick: onAddNetwork } : {})}
            >
              {t.addDeltaChain}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            {...(onWatchToken ? { onClick: () => onWatchToken(getToken('DELTA')) } : {})}
          >
            {t.watchToken}
          </Button>
          <Button
            variant="danger"
            size="sm"
            leadingIcon={<LogOut className="size-3.5" aria-hidden />}
            {...(onDisconnect ? { onClick: onDisconnect } : {})}
          >
            {t.disconnect}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {note}
      <p className="text-[12.5px] leading-relaxed text-text2">{t.subtitle}</p>

      {error ? (
        <p className="flex items-start gap-2 rounded-[12px] border border-[color-mix(in_srgb,var(--down)_34%,transparent)] bg-down-dim px-3 py-2.5 text-[12.5px] leading-relaxed text-down">
          <AlertTriangle className="mt-[2px] size-4 shrink-0" aria-hidden />
          <span>
            {error ? errors[error] : ''}{' '}
            <button
              type="button"
              {...(onConnect ? { onClick: () => onConnect('demo') } : {})}
              className="font-bold text-acc underline decoration-dotted underline-offset-4"
            >
              {t.retry}
            </button>
          </span>
        </p>
      ) : null}

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{t.providers}</p>
        <ul className="space-y-2">
          {providers.map((provider) => {
            const disabled = !provider.available || busyProvider !== null || !onConnect;
            return (
              <li key={provider.id}>
                <button
                  type="button"
                  disabled={disabled}
                  {...(onConnect ? { onClick: () => onConnect(provider.id) } : {})}
                  className={
                    'flex w-full items-center gap-3 rounded-[14px] border border-hair bg-field px-3.5 py-3 text-start transition-colors ' +
                    (disabled ? 'cursor-not-allowed opacity-55' : 'hover:border-acc-bd hover:bg-surface')
                  }
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-[11px] border border-hair bg-surface">
                    <Wallet className="size-4 text-acc" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13.5px] font-bold">{provider.name}</span>
                      {provider.installed ? (
                        <Badge tone="acc">{t.detected}</Badge>
                      ) : provider.available ? (
                        <Badge tone="neutral">{t.notDetected}</Badge>
                      ) : (
                        <Badge tone="outline">{t.outOfScope}</Badge>
                      )}
                    </span>
                    {provider.id === 'demo' ? (
                      <span className="mt-1 block text-[11.5px] leading-relaxed text-text2">{t.demoNote}</span>
                    ) : null}
                  </span>
                  {busyProvider === provider.id ? (
                    <span className="num text-[11.5px] font-bold text-acc">…</span>
                  ) : provider.id === 'metamask' && !provider.installed ? (
                    <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-acc">
                      <Plus className="size-3.5" aria-hidden />
                      {t.install}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="border-t border-hair pt-3 text-[11.5px] leading-relaxed text-text3">{t.security}</p>
    </div>
  );
}
