import type { ReactNode } from 'react';
import Link from 'next/link';
import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { DEMO_STORY, shortAddress } from '@/data/demo-story';
import type { Locale } from '@/i18n/routing';
import { BrandLockup, GasPill } from '@/components/brand/Brand';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';

export type NavId = 'trade' | 'pools' | 'stake' | 'farm' | 'bridge' | 'governance' | 'portfolio';

/**
 * Topnav (72px, padding 0 56px) — frames 01/02.
 * Phase 1 = visuals + working links only: the gas pill, network chip and wallet chip render the
 * canonical demo story and are NOT interactive yet (Phase 3 connects MetaMask and the wallet modal;
 * Phase 11 adds the notification bell). RTL mirrors for free because every gap uses logical props.
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
  /** Landing shows a Connect button (frame 01); app pages show the account chip (frame 02). */
  wallet?: 'chip' | 'connect';
  /**
   * Live wallet slot (Phase 3). When present it replaces the static connect button / account chip
   * and owns its own state; the `wallet` prop then only picks its shape. Kept as a node so Topnav
   * stays presentational and server-capable.
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
        {walletNode ??
        (wallet === 'connect' ? (
          <Button size="md">{t.connect}</Button>
        ) : (
          <>
            <GasPill />
            <Tooltip content={t.comingSoon}>
              <span
                className="grid size-9 place-items-center rounded-pill border border-hair bg-surface text-text2"
                aria-disabled="true"
              >
                <Settings2 className="size-4" aria-hidden />
              </span>
            </Tooltip>
            <span
              className="inline-flex h-9 items-center gap-2.5 rounded-pill border border-hair bg-surface ps-1.5 pe-3 text-[12.5px]"
              title={DEMO_STORY.wallet.address}
            >
              <span
                aria-hidden
                className="size-6 rounded-full"
                style={{ background: 'conic-gradient(from 210deg, var(--acc), var(--acc2) 45%, #0b1411 78%, var(--acc))' }}
              />
              <span className="num text-[12.5px] font-medium">{shortAddress(DEMO_STORY.wallet.address)}</span>
              <svg viewBox="0 0 10 6" width="9" height="6" aria-hidden className="text-text2">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </>
        ))}
      </div>
    </header>
  );
}
