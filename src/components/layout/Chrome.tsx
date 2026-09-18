'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { isLocale, type Locale } from '@/i18n/routing';
import { WalletSection } from '@/components/wallet/WalletSection';
import { Topnav, type NavId } from './Topnav';
import { Footer } from './Footer';

/**
 * Shared chrome (topnav + footer). It is a client component for one reason only: the active nav
 * item must come from the current pathname, and doing it here keeps Topnav/Footer pure and
 * previewable in isolation (they take labels + active as props).
 *
 * The landing route (exactly `/{locale}`) is the exception from the frames: it renders the
 * "Connect Wallet" button instead of the account chip and no nav item is active.
 */
const NAV_BY_SEGMENT: Record<string, NavId> = {
  swap: 'trade',
  pools: 'pools',
  stake: 'stake',
  farm: 'farm',
  bridge: 'bridge',
  governance: 'governance',
  portfolio: 'portfolio',
};

export function Chrome({ children }: { children: ReactNode }): ReactNode {
  const pathname = usePathname();
  const nav = useTranslations('nav');
  const footer = useTranslations('footer');

  const segments = pathname.split('/').filter(Boolean);
  const locale: Locale = isLocale(segments[0] ?? '') ? (segments[0] as Locale) : 'en';
  const firstSegment = segments[1] ?? '';
  const isLanding = segments.length <= 1;
  const active = NAV_BY_SEGMENT[firstSegment] ?? 'none';

  const navLabels = {
    trade: nav('trade'),
    pools: nav('pools'),
    stake: nav('stake'),
    farm: nav('farm'),
    bridge: nav('bridge'),
    governance: nav('governance'),
    portfolio: nav('portfolio'),
    docs: nav('docs'),
    connect: nav('connect'),
    comingSoon: nav('comingSoon'),
    switchTo: nav('switchTo'),
    switchHint: nav('switchHint'),
  };

  return (
    <>
      <Topnav
        locale={locale}
        active={active}
        wallet={isLanding ? 'connect' : 'chip'}
        labels={navLabels}
        walletNode={<WalletSection mode={isLanding ? 'connect' : 'chip'} />}
      />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      <Footer
        labels={{
          docs: footer('docs'),
          github: footer('github'),
          audit: footer('audit'),
          bounty: footer('bounty'),
          copy: footer('copy'),
          prototypeBadge: footer('prototypeBadge'),
          reset: footer('reset'),
          resetConfirm: footer('resetConfirm'),
          linkHint: footer('linkHint'),
        }}
      />
    </>
  );
}
