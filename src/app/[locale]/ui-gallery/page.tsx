import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, Lock, Zap } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Card, WidgetCard, CardHeader, PageHeader } from '@/components/ui/Card';
import { InputField } from '@/components/ui/Field';
import { TokenIcon, TokenIconPair } from '@/components/ui/TokenIcon';
import { Tooltip } from '@/components/ui/Tooltip';
import { BrandLockup, BrandMark, HeroTitle, TokenGlyphRow, GasPill } from '@/components/brand/Brand';
import { StatStrip } from '@/components/widgets/StatStrip';
import { ProToolsBar } from '@/components/widgets/ProToolsBar';
import { SwapDemo, LockModalDemo } from '@/components/common/PhaseOneDemos';
import { DemoRows } from '@/components/common/DemoRows';
import { DEMO_STORY, compactUsd } from '@/data/demo-story';

/**
 * /en/ui-gallery + /fa/ui-gallery — Phase 1 acceptance surface (temporary, removed in Phase 12 QA).
 * Server components render the static parts; <InteractiveDemo/> holds the stateful ones.
 */
export default async function UiGallery({ params }: { params: Promise<{ locale: Locale }> }): Promise<ReactNode> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'gallery' });
  const demo = await getTranslations({ locale, namespace: 'demo' });

  const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="mt-10">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );

  return (
    <main className="relative z-10 mx-auto w-full max-w-[1180px] flex-1 px-8 pb-20 pt-10">
      <PageHeader
        title={t('heading')}
        subtitle={t('subtitle')}
        end={
          <Link
            href={`/${locale}`}
            className="inline-flex h-9 items-center gap-2 rounded-pill border border-hair bg-surface px-3.5 text-[12.5px] text-text2 transition-colors hover:border-acc-bd hover:text-text"
          >
            {t('back')}
            <ArrowUpRight className="size-3.5 rtl:-scale-x-100" aria-hidden />
          </Link>
        }
      />
      <p className="mt-3 max-w-[70ch] text-[13px] text-text2">{t('intro')}</p>

      <Section title={t('chrome')}>
        <WidgetCard className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-hair px-6 py-4">
            <BrandLockup />
            <div className="flex items-center gap-3">
              <GasPill />
              <Button size="md">{t('openModal')}</Button>
            </div>
          </div>
          <HeroTitle className="px-6 pt-8" lead={t('heroLead')} gradWord={t('heroGrad')} trailing={t('heroTrailing')} />
          <div className="flex flex-wrap items-center gap-4 px-6 pb-7 pt-5">
            <TokenGlyphRow />
            <p className="text-[12.5px] text-text2">
              <span className="font-bold text-text">12,400+</span> {t('heroTraders')} ·{' '}
              <span className="num">0.05%</span>
            </p>
          </div>
        </WidgetCard>
      </Section>

      <Section title={t('typography')}>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader title="Space Grotesk" action={<Badge tone="neutral">{t('weights')}</Badge>} />
            <p className="mt-3 text-[27px] font-extrabold leading-tight tracking-[-0.02em]">
              Concentrated liquidity
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-text2">
              {t('fontBodyNote')}
            </p>
            <div className="mt-4 h-px bg-hair" />
            <p className="mt-3 text-[60px] font-extrabold leading-[1.05] tracking-[-0.028em]">
              <span className="grad-word">60px</span>
            </p>
            <p className="mt-1 text-[11px] text-text2">{t('h1Label')}</p>
          </Card>

          <Card>
            <CardHeader title="IBM Plex Mono" action={<Badge tone="neutral">{t('fontMonoNote')}</Badge>} />
            <p className="num mt-3 text-[26px] font-extrabold tracking-[-0.02em]">$128.4M</p>
            <p className="num num-wrap mt-1 text-[15px] font-bold" title="0x7A3f8C41bE9d2506aB1C7e5D0f83aA4129e5F9C2">
              0x7A3f8C41bE9d2506aB1C7e5D0f83aA4129e5F9C2
            </p>
            <p className="mt-4 space-y-1 text-[12px] text-text2">
              <span className="num block">+12.4% · −1.1%</span>
              <span className="num block">14 gwei · 0.0019 ETH</span>
              <span className="num block">21,700 DELTA</span>
            </p>
            <p className="mt-3 text-[11.5px] leading-relaxed text-text2">
              {t('tabularNote')}
            </p>
          </Card>

          <Card featured>
            <CardHeader title="Ray · --font-fa" action={<Badge tone="up">Vazirmatn fallback</Badge>} />
            <p className="mt-3 text-[20px] font-extrabold leading-loose tracking-[0]" style={{ fontFamily: 'var(--font-fa)' }}>
              معامله کنید؛ انگار مال خودتان است.
            </p>
            <p className="mt-1 text-[13.5px] leading-loose text-text2" style={{ fontFamily: 'var(--font-fa)' }}>
              استخر نقدینگی · تعهدسپاری · مزرعه‌های کشت سود · پل بین‌زنجیره‌ای · حاکمیت · پورتفولیو
            </p>
            <p className="mt-3 text-[12px] leading-loose" style={{ fontFamily: 'var(--font-fa)' }}>
              {t('fontWeightsLabel')} Light 300 · Medium 500 · Bold 700 · ExtraBold 800 · Black 900 ·
              ExtraBlack 950
            </p>
          </Card>
        </div>
      </Section>

      <Section title={t('components')}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title={t('buttonSection')} />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button>{t('connectWallet')}</Button>
              <Button variant="ghost">{t('readDocs')}</Button>
              <Button variant="outline">{t('addMetaMask')}</Button>
              <Button variant="danger">{t('unstakeAll')}</Button>
              <Button variant="link">{t('manage')}</Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button size="sm">{t('small')}</Button>
              <Button size="md" leadingIcon={<Zap className="size-3.5" aria-hidden />}>
                {t('withIcon')}
              </Button>
              <Button size="lg" loading>
                {t('pending')}
              </Button>
              <Button disabled>{t('disabled')}</Button>
              <Button trailingIcon={<ArrowUpRight className="size-3.5 rtl:-scale-x-100" aria-hidden />}>
                {t('exploreSwaps')}
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge tone="up">38.6% APR</Badge>
              <Badge tone="down">−1.1%</Badge>
              <Badge tone="acc">Detected</Badge>
              <Badge tone="neutral">{t('unlocked18')}</Badge>
              <Badge tone="outline">Audited</Badge>
              <Badge tone="outlineUp">12.4%</Badge>
              <Chip size="md">{t('all')}</Chip>
              <Chip size="md" active>
                {t('myPositions')}
              </Chip>
              <Chip size="sm" trailing={<BadgeCheck className="size-3" aria-hidden />}>
                {t('verified')}
              </Chip>
            </div>
          </Card>

          <Card>
            <CardHeader title={t('fieldsSection')} />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TokenIcon symbol="DELTA" chip="a" />
              <TokenIcon symbol="WETH" chip="b" />
              <TokenIcon symbol="USDC" chip="c" />
              <TokenIcon symbol="WBTC" chip="d" size="sm" />
              <TokenIconPair a={{ symbol: 'DELTA', chip: 'a' }} b={{ symbol: 'WETH', chip: 'b' }} />
              <TokenIcon symbol="?" chip="c" color="var(--text2)" />
            </div>
            <div className="mt-4">
              {/* AmountField is exercised live in <SwapDemo/>; here the bare field surface only. */}
              <div className="aurora-field flex items-center gap-3 px-4 py-3">
                <span className="num flex-1 text-[22px] font-bold">1,000</span>
                <span className="inline-flex items-center gap-1.5 rounded-pill border border-hair bg-surface px-2 py-1 text-[11px] font-bold">
                  Δ DELTA
                </span>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <InputField label={t('slippageLabel')} defaultValue="0.5" ltr hint={t('slippageHint')} />
              <InputField label={t('recipient')} placeholder="0x…" ltr error={t('recipientError')} />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              {/* Tabs/Switch interactive states live in <SwapDemo/>; static look shown here. */}
              <span className="inline-flex items-center gap-1 rounded-btn border border-hair bg-field p-1">
                <span className="inline-flex h-7 items-center rounded-[9px] border border-acc-bd bg-acc-dim px-2.5 text-[11.5px] font-semibold text-acc">
                  {t('flexible')}
                </span>
                <span className="inline-flex h-7 items-center rounded-[9px] border border-transparent px-2.5 text-[11.5px] font-semibold text-text2">
                  {t('fixedTerm')}
                </span>
                <span className="inline-flex h-7 items-center rounded-[9px] border border-transparent px-2.5 text-[11.5px] font-semibold text-text3">
                  {t('veDeltaTab')}
                </span>
              </span>
              <Tooltip content={t('tooltipSample')}>
                <Chip size="md" outline>
                  {t('hoverMe')}
                </Chip>
              </Tooltip>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          <SwapDemo
            copy={{
              swapTab: t('swapTab'),
              limitTab: t('limitTab'),
              pay: t('pay'),
              receive: t('receive'),
              max: t('max'),
              search: t('search'),
              searchHint: t('searchHint'),
              sliderAria: t('sliderAria'),
              mevLabel: t('mevLabel'),
              proLabel: t('proLabel'),
              proTitle: t('proTitle'),
              proItems: [...(t.raw('proItems') as string[])],
              proCaption: t('proCaption'),
              openModal: t('openModal'),
              modalTitle: t('modalTitle'),
              modalSubtitle: t('modalSubtitle'),
              modalBody: t('modalBody'),
              modalClose: t('modalClose'),
              review: t('review'),
              closeLabel: t('closeLabel'),
              searchToken: t('searchToken'),
              lockTitle: t('lockTitle'),
              yearsUnit: t('yearsUnit'),
            }}
          />
          <LockModalDemo
            copy={{
              swapTab: t('swapTab'),
              limitTab: t('limitTab'),
              pay: t('pay'),
              receive: t('receive'),
              max: t('max'),
              search: t('search'),
              searchHint: t('searchHint'),
              sliderAria: t('sliderAria'),
              mevLabel: t('mevLabel'),
              proLabel: t('proLabel'),
              proTitle: t('proTitle'),
              proItems: [...(t.raw('proItems') as string[])],
              proCaption: t('proCaption'),
              openModal: t('openModal'),
              modalTitle: t('modalTitle'),
              modalSubtitle: t('modalSubtitle'),
              modalBody: t('modalBody'),
              modalClose: t('modalClose'),
              review: t('review'),
              closeLabel: t('closeLabel'),
              searchToken: t('searchToken'),
              lockTitle: t('lockTitle'),
              yearsUnit: t('yearsUnit'),
            }}
          />
        </div>

        <Card className="mt-6">
          <DemoRows
            title={t('poolTableTitle')}
            colsLabel={{ pair: t('colPair'), tvl: t('colTvl'), volume: t('colVolume'), apr: t('colApr') }}
            rows={[
              {
                a: { symbol: 'DELTA', chip: 'a' },
                b: { symbol: 'ETH', chip: 'b' },
                name: 'DELTA / ETH',
                meta: t('swapMeta'),
                tvl: '$18,420',
                volume: '$6.1M',
                apr: '38.6%',
              },
              {
                a: { symbol: 'ETH', chip: 'b' },
                b: { symbol: 'USD', chip: 'c' },
                name: 'ETH / USDC',
                meta: t('swapMeta2'),
                tvl: '$12,980',
                volume: '$2.4M',
                apr: '12.4%',
              },
            ]}
          />
        </Card>
      </Section>

      <Section title={t('inventory')}>
        <Card>
          <StatStrip
            cols={4}
            stats={[
              { label: demo('delta'), value: `$${DEMO_STORY.token.priceUsd}`, delta: `+${DEMO_STORY.token.change24hPct}%` },
              { label: demo('tvl'), value: compactUsd(DEMO_STORY.tvlUsd) },
              { label: demo('volume'), value: compactUsd(DEMO_STORY.volume24hUsd) },
              { label: demo('locked'), value: DEMO_STORY.veDelta.locked.toLocaleString('en-US') },
            ]}
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ProToolsBar
              title={t('proTitle')}
              caption={t('proCaption')}
              switchLabel={t('proLabel')}
              items={[...(t.raw('proItems') as string[])]}
              icon={<Lock className="size-4" aria-hidden />}
            />
            <div className="flex flex-wrap items-center gap-3">
              <WidgetCard className="flex-1 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{t('widgetCard')}</p>
                <p className="num mt-2 text-[20px] font-extrabold">$48,265.90</p>
              </WidgetCard>
              <Card featured className="flex-1 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{t('featuredCard')}</p>
                <p className="mt-2 text-[13px] text-text2">{t('featuredNote')}</p>
              </Card>
            </div>
          </div>
          <div className="mt-6 grid gap-3 text-[12.5px] text-text2 sm:grid-cols-2">
            <p>
              <BrandMark size={18} className="me-2 align-[-4px]" /> Brand · Topnav · Footer · Modal · Button · Badge · Chip ·
              Card / WidgetCard / PageHeader / CardHeader
            </p>
            <p>
              AmountField · InputField · TokenIcon (+Pair) · TokenChip · Tabs · Switch · Slider · Tooltip · Table
              (TableGrid / TCell / SimplePagination) · StatStrip (+StatDelta) · ProToolsBar · Deco
            </p>
          </div>
        </Card>
      </Section>
    </main>
  );
}
