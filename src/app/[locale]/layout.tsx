import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { dirOf, isLocale, type Locale, locales } from '@/i18n/config';
import { Deco } from '@/components/layout/Deco';
import { Chrome } from '@/components/layout/Chrome';
import { fontVars } from '@/lib/fonts';

/** Static prerendering for both locales (no middleware yet — Phase 2 adds it). */
export function generateStaticParams(): { locale: Locale }[] {
  return (locales as readonly Locale[]).map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={dirOf(locale as Locale)}
      className={fontVars}
      style={{ background: 'var(--bg)' }}
      suppressHydrationWarning
    >
      <NextIntlClientProvider messages={messages}>
        {/* Persian prose switches by ONE variable (--font-fa); Latin stays Space Grotesk. */}
        <body className={locale === 'fa' ? 'font-fa flex min-h-screen flex-col' : 'flex min-h-screen flex-col'}>
          {/* Aurora background layer — fixed, behind everything, never interactive. */}
          <Deco />
          {/*
            Shared chrome. Topnav/Footer live in <Chrome/> (client) so the active nav item can be
            derived from the pathname while the components themselves stay prop-driven.
            Phase 4: the landing page will opt out of the extra top spacing to fit 1440×900 (frame 01).
          */}
          <Chrome>{children}</Chrome>
        </body>
      </NextIntlClientProvider>
    </html>
  );
}
