import type { ReactNode } from 'react';
import Link from 'next/link';
import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Locale } from '@/i18n/routing';
import { BrandLockup, GasPill } from '@/components/brand/Brand';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';

export type NavId = 'trade' | 'pools' | 'stake' | 'farm' | 'bridge' | 'governance' | 'portfolio';

/**
 * Topnav (72px, padding 0 56px) — frames 01/02.
 *
 * Since Phase 3 the wallet slot is **live**: `<Chrome/>` passes `walletNode={<WalletSection/>}`,
 * which reads the connection from `dd.v1.wallet`. The static Phase-1 account chip (a hard-coded
 * `0x7A3f…F9C2` that pretended to be connected) was **deleted** so no screen can ever show a fake
 * connection — when nothing is connected the slot is a real «Connect wallet» button.
 * The gas pill and the settings entry stay presentational (settings popover = Phase 5, notification
 * bell = Phase 11). RTL mirrors for free because every gap uses logical props.
 */
export interface TopnavLabels {
  trade: string;
  pools: string;
  stake: string;
  farm: string;
  bridge: string;
  governance: string;
  portfolio: string;
  docs: string;
  connect: string;
  comingSoon: string;
  /** Label of the EN|فارسی toggle (it names the language you switch *to*). */
  switchTo: string;
  switchHint: string;
}

export function Topnav({
  locale,
  active = 'none',
  wallet = 'chip',
  labels,
  walletNode,
}: {
  locale: Locale;
  /** Which nav entry is highlighted (resolved by <Chrome/> from the pathname). */
  active?: NavId | 'none';
  /** Which shape the live slot should take: landing = connect button (frame 01), app pages =
      account chip that becomes a button when nothing is connected (frame 02). */
  wallet?: 'chip' | 'connect';
  /**
   * Live wallet slot (Phase 3, injected by `<Chrome/>` as `<WalletSection/>`). It owns its own
   * state and reads the connection from `dd.v1.wallet`. Kept as a node so Topnav stays
   * presentational and server-capable; if it is absent (gallery / isolated preview) the slot
   * degrades to a non-live button — never to a fake "connected" chip.
   */
  walletNode?: ReactNode;
  labels: TopnavLabels;
}): ReactNode {
  const t = labels;

  const items: { id: NavId; href: string; label: string }[] = [
    { id: 'trade', href: `/${locale}/swap`, label: t.trade },
    { id: 'pools', href: `/${locale}/pools`, label: t.pools },
    { id: 'stake', href: `/${locale}/stake`, label: t.stake },
    { id: 'farm', href: `/${locale}/farm`, label: t.farm },
    { id: 'bridge', href: `/${locale}/bridge`, label: t.bridge },
    { id: 'governance', href: `/${locale}/governance`, label: t.governance },
    { id: 'portfolio', href: `/${locale}/portfolio`, label: t.portfolio },
  ];

  return (
    <header
      className="sticky top-0 z-50 flex h-[72px] items-center gap-6 border-b px-14"
      style={{ borderColor: 'var(--topnav-bd)', background: 'color-mix(in srgb, var(--bg) 78%, transparent)', backdropFilter: 'blur(14px)' }}
    >
      <Link href={`/${locale}`} className="shrink-0" aria-label="Delta DEX — home">
        <BrandLockup />
      </Link>

      <nav className="flex items-center gap-1" aria-label="Primary">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'h-9 rounded-pill px-3.5 text-[13.5px] font-medium whitespace-nowrap transition-colors',
                'inline-flex items-center',
                isActive ? 'bg-acc-dim text-text' : 'text-text2 hover:text-text',
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <span className="ms-1 text-[13.5px] font-medium text-text2/60 select-none">{t.docs}</span>
      </nav>

      <div className="ms-auto flex items-center gap-3">
        {/* Phase 3 makes these real (network switch, settings popover, connected account / modal). */}
        <LocaleSwitcher
          locale={locale}
          labels={{ en: 'English', fa: labels.switchTo, hint: labels.switchHint }}
        />
        {/* Gas + settings are always present; only the wallet slot is live (it used to be hidden
            behind the static chip, which made the whole cluster look like a mock-up). */}
        <GasPill />
        <Tooltip content={t.comingSoon}>
          <span
            className="grid size-9 place-items-center rounded-pill border border-hair bg-surface text-text2"
            aria-disabled="true"
          >
            <Settings2 className="size-4" aria-hidden />
          </span>
        </Tooltip>
        {walletNode ?? <Button size="md">{t.connect}</Button>}
      </div>
    </header>
  );
}
