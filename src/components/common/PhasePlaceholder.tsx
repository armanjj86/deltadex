import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { ReactNode } from 'react';

/**
 * Placeholder surface used by every unwired route until its phase arrives.
 * Deliberately plain: it proves locale routing + the i18n pipeline, nothing else.
 */
export async function PhasePlaceholder({
  section,
  params,
}: {
  section: string;
  params: Promise<{ locale: Locale }>;
}): Promise<ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[900px] flex-col justify-center px-8 py-16">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{section}</p>
      <h1 className="mt-3 text-[27px] font-extrabold tracking-[-0.02em]">{t('phase.title')}</h1>
      <p className="mt-4 max-w-[60ch] text-[14px] text-text2">{t('phase.intro')}</p>
      <Link
        href={`/${locale}`}
        className="mt-8 inline-flex w-fit rounded-btn border border-hair bg-surface px-4 py-2 text-[13px] text-text hover:border-acc-bd"
      >
        ← {locale === 'fa' ? 'بازگشت' : 'Back'}
      </Link>
    </main>
  );
}
