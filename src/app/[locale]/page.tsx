import type { ReactNode } from 'react';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { compactUsd, DEMO_STORY, shortAddress } from '@/data/demo-story';

/**
 * Phase 0 verification surface.
 * NOT a design deliverable: no component library exists yet. This page exists so the
 * reviewer can confirm fonts, Aurora tokens, the deco layer, the i18n pipeline and
 * LTR/RTL routing before Phase 1 starts. It is replaced by the real landing page in Phase 4.
 */
export default async function ScaffoldPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const stats = [
    { label: t('demo.delta'), value: `$${DEMO_STORY.token.priceUsd}`, delta: `+${DEMO_STORY.token.change24hPct}%` },
    { label: t('demo.tvl'), value: compactUsd(DEMO_STORY.tvlUsd) },
    { label: t('demo.volume'), value: compactUsd(DEMO_STORY.volume24hUsd) },
    { label: t('demo.gas'), value: `${DEMO_STORY.gasGwei} gwei` },
    { label: t('demo.wallet'), value: shortAddress(DEMO_STORY.wallet.address) },
    { label: t('demo.locked'), value: DEMO_STORY.veDelta.locked.toLocaleString('en-US') },
  ];

  const swatches = [
    { label: t('tokens.primary'), varName: '--acc', className: 'bg-acc' },
    { label: t('tokens.secondary'), varName: '--acc2', className: 'bg-acc2' },
    { label: t('tokens.positive'), varName: '--up', className: 'bg-up' },
    { label: t('tokens.negative'), varName: '--down', className: 'bg-down' },
    { label: t('tokens.surface'), varName: '--surface', className: 'bg-surface' },
    { label: t('tokens.field'), varName: '--field', className: 'bg-field' },
  ];

  return (
    <main className="relative z-10 mx-auto w-full max-w-[1040px] px-8 py-14">
      {/* Brand line — the real logo mark is integrated in Phase 1. */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="grid h-9 w-9 place-items-center rounded-brand text-[15px] font-bold text-btn-fg"
            style={{ background: 'var(--acc)', boxShadow: 'var(--glow-mark)' }}
          >
            Δ
          </span>
          <span className="text-[19px] font-bold tracking-[-0.02em]">{t('brand.name')}</span>
          <span className="rounded-pill border border-acc-bd bg-acc-dim px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] text-acc">
            prototype
          </span>
        </div>
        <nav className="flex items-center gap-2 text-[13px]">
          <Link
            href="/en"
            className={`rounded-pill border px-3 py-[6px] ${locale === 'en' ? 'border-acc-bd bg-acc-dim text-acc' : 'border-hair bg-surface text-text2'}`}
          >
            EN
          </Link>
          <Link
            href="/fa"
            className={`rounded-pill border px-3 py-[6px] ${locale === 'fa' ? 'border-acc-bd bg-acc-dim text-acc' : 'border-hair bg-surface text-text2'}`}
          >
            فارسی
          </Link>
        </nav>
      </header>

      <section className="mt-12">
        <h1 className="text-[27px] font-extrabold tracking-[-0.02em]">{t('phase.title')}</h1>
        <p className="mt-3 max-w-[70ch] text-[14px] text-text2">{t('phase.intro')}</p>
      </section>

      {/* Stat strip — hairline separated, mono numerals (Phase 1 component preview). */}
      <section className="mt-10 rounded-card border border-hair bg-surface p-6 backdrop-blur-xl shadow-soft">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{t('demo.heading')}</p>
        <div className="mt-4 grid grid-cols-3 gap-y-5">
          {stats.map((s) => (
            <div key={s.label} className="border-hair pe-6 ps-0 first:ps-0 [&:nth-child(n+4)]:pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text2">{s.label}</p>
              <p className="num mt-1 text-[24px] font-extrabold tracking-[-0.02em]">
                {s.value}
                {s.delta ? <span className="ms-2 text-[13px] font-bold text-up">{s.delta}</span> : null}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-6">
        {/* Token swatches */}
        <div className="rounded-card border border-hair bg-surface p-6 backdrop-blur-xl shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{t('tokens.heading')}</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {swatches.map((sw) => (
              <div key={sw.varName} className="rounded-pill border border-hair bg-field p-3">
                <span className={`block h-8 w-8 rounded-[8px] border border-hair ${sw.className}`} />
                <p className="mt-2 text-[12px] font-semibold">{sw.label}</p>
                <p className="mono text-[10.5px] text-text2">var({sw.varName})</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div>
              <p className="text-[11px] text-text2">{t('tokens.radiusCard')}</p>
              <p className="num text-[15px] font-bold">22px</p>
            </div>
            <div>
              <p className="text-[11px] text-text2">{t('tokens.elevation')}</p>
              <p className="mono text-[11px] text-text2">0 24px 70px rgba(0,0,0,.55)</p>
            </div>
          </div>
        </div>

        {/* Base UI primitives, hand-styled — real components arrive in Phase 1 */}
        <div className="rounded-card border border-hair bg-surface p-6 backdrop-blur-xl shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{t('ui.fieldLabel')}</p>
          <div className="mt-3 flex items-center gap-3 rounded-[16px] border border-hair bg-field px-4 py-3">
            <input
              className="num w-full bg-transparent text-[22px] font-bold outline-none placeholder:text-text2"
              placeholder={t('ui.fieldPlaceholder')}
              defaultValue="1,000.00"
            />
            <span className="rounded-pill border border-acc-bd bg-acc-dim px-3 py-[6px] text-[12px] font-bold text-acc">
              DELTA
            </span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              className="rounded-btn bg-acc px-5 py-[10px] text-[13px] font-bold text-btn-fg"
              style={{ boxShadow: 'var(--glow-btn)' }}
              type="button"
            >
              {t('ui.primaryButton')}
            </button>
            <button
              className="rounded-btn border border-hair bg-surface px-5 py-[10px] text-[13px] font-semibold text-text"
              type="button"
            >
              {t('ui.ghostButton')}
            </button>
            <span className="rounded-pill border border-hair bg-surface px-2 py-1 text-[11px] font-bold text-text2">
              {t('ui.tabTwo')}
            </span>
            <span className="rounded-pill border border-acc-bd bg-acc-dim px-2 py-1 text-[11px] font-bold text-acc">
              {t('ui.badgeVerified')}
            </span>
          </div>
        </div>
      </section>

      {/* Typography proof: three families side by side, plus an RTL-aware line */}
      <section className="mt-6 rounded-card border border-hair bg-surface p-6 backdrop-blur-xl shadow-soft">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{t('fonts.latinLabel')}</p>
            <p className="mt-2 text-[16px] font-semibold leading-snug">{t('fonts.latinSample')}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{t('fonts.monoLabel')}</p>
            <p className="num mt-2 text-[16px] font-medium">{t('fonts.monoSample')}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{t('fonts.faLabel')}</p>
            <p className="mt-2 text-[16px] font-medium leading-loose" style={{ fontFamily: 'var(--font-fa)' }}>
              {t('fonts.faSample')}
            </p>
          </div>
        </div>
      </section>

      <footer className="mt-8 flex items-center justify-between border-t border-hair pt-5 text-[12px] text-text2">
        <p>{t('phase.nextUp')}</p>
        <Link href="/en/portfolio" className="underline decoration-dotted underline-offset-4 hover:text-acc">
          {t('ui.linkDocs')}
        </Link>
      </footer>
    </main>
  );
}
