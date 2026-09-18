import type { ReactNode } from 'react';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { compactUsd, DEMO_STORY, shortAddress } from '@/data/demo-story';
import * as fmt from '@/lib/format';
import { LocaleText } from '@/components/ui/LocaleText';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { NowLine } from '@/components/ui/NowLine';

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
  const g = await getTranslations({ locale, namespace: 'gallery' });

  // Phase 2: every figure goes through src/lib/format — Latin digits in both languages (user
  // decision), only dates/calendars are locale-dependent.
  const stats = [
    { label: t('demo.delta'), value: `$${DEMO_STORY.token.priceUsd}`, delta: fmt.formatPct(DEMO_STORY.token.change24hPct) },
    { label: t('demo.tvl'), value: compactUsd(DEMO_STORY.tvlUsd) },
    { label: t('demo.volume'), value: compactUsd(DEMO_STORY.volume24hUsd) },
    { label: t('demo.gas'), value: `${DEMO_STORY.gasGwei} gwei` },
    { label: t('demo.wallet'), value: shortAddress(DEMO_STORY.wallet.address) },
    { label: t('demo.locked'), value: fmt.formatNum(DEMO_STORY.veDelta.locked, locale) },
  ];

  /* num-line (not num): the row must keep mirroring in RTL, only the value itself
      is isolated as an LTR token (see ARCHITECTURE.md §7). */
  const swatches = [
    { label: t('tokens.primary'), varName: '--acc', className: 'bg-acc' },
    { label: t('tokens.secondary'), varName: '--acc2', className: 'bg-acc2' },
    { label: t('tokens.positive'), varName: '--up', className: 'bg-up' },
    { label: t('tokens.negative'), varName: '--down', className: 'bg-down' },
    { label: t('tokens.surface'), varName: '--surface', className: 'bg-surface' },
    { label: t('tokens.field'), varName: '--field', className: 'bg-field' },
  ];

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-[1040px] flex-1 flex-col justify-center px-8 py-12">
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
            {g('prototypeLabel')}
          </span>
        </div>
        <LocaleSwitcher
            locale={locale}
            className="bg-transparent"
            labels={{
              en: 'English',
              fa: t('nav.switchTo'),
              hint: t('nav.switchHint'),
            }}
          />
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
            <div key={s.label} className="border-hair pe-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text2">{s.label}</p>
              <p className="num-line mt-1 text-[24px] font-extrabold tracking-[-0.02em]">
                <span className="num">{s.value}</span>
                {s.delta ? (
                  <span className="num ms-2 inline-flex rounded-[6px] bg-up-dim px-1.5 py-[2px] text-[12px] font-bold tracking-[0] text-up">
                    {s.delta}
                  </span>
                ) : null}
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
              <p className="num-line text-[15px] font-bold">22px</p>
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
            <p className="mono mt-2 text-[16px] font-medium">{t('fonts.monoSample')}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{t('fonts.faLabel')}</p>
            <p className="mt-2 text-[16px] font-medium leading-loose" style={{ fontFamily: 'var(--font-fa)' }}>
              {t('fonts.faSample')}
            </p>
          </div>
        </div>
      </section>

      {/* Phase 2 proof: the same value formatted for both locales, plus the localized clock. */}
      <section className="mt-6 rounded-card border border-hair bg-surface p-6 backdrop-blur-xl shadow-soft">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{t('format.pageHeading')}</p>
        <div className="mt-4 grid grid-cols-4 gap-6">
          <div>
            <p className="text-[11px] text-text2">{t('format.today')}</p>
            <p className="num-line mt-1 text-[15px] font-bold">
              <NowLine locale={locale} kind="dateNow" />
            </p>
          </div>
          <div>
            <p className="text-[11px] text-text2">{t('format.clock')}</p>
            <p className="num-line mt-1 text-[15px] font-bold">
              <NowLine locale={locale} kind="time" />
            </p>
          </div>
          <div>
            <p className="text-[11px] text-text2">{t('format.swaps')}</p>
            <p className="num-line mt-1 text-[15px] font-bold">{fmt.formatNum(41209, locale)}</p>
          </div>
          <div>
            <p className="text-[11px] text-text2">{t('format.price')}</p>
            <p className="num-line mt-1 text-[15px] font-bold">
              <LocaleText locale={locale} latin value={fmt.formatUsd(DEMO_STORY.token.priceUsd, 4)} />
            </p>
          </div>
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-text3">{t('format.note')}</p>
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
