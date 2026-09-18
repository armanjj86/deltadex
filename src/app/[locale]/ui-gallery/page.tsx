import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, Lock, Zap } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Card, WidgetCard, CardHeader, PageHeader } from '@/components/ui/Card';
import { InputField } from '@/components/ui/Field';
import { TokenIcon, TokenIconPair } from '@/components/ui/TokenIcon';
import { Tooltip } from '@/components/ui/Tooltip';
import { NowLine } from '@/components/ui/NowLine';
import { TableGrid, TCell } from '@/components/ui/Table';
import { BrandLockup, BrandMark, HeroTitle, TokenGlyphRow, GasPill } from '@/components/brand/Brand';
import { StatStrip } from '@/components/widgets/StatStrip';
import { ProToolsBar } from '@/components/widgets/ProToolsBar';
import { SwapDemo, LockModalDemo } from '@/components/common/PhaseOneDemos';
import { DemoRows } from '@/components/common/DemoRows';
import { DEMO_STORY, compactUsd, shortAddress } from '@/data/demo-story';
import * as fmt from '@/lib/format';

/**
 * /en/ui-gallery + /fa/ui-gallery — Phase 1 acceptance surface (temporary, removed in Phase 12 QA).
 * Server components render the static parts; <InteractiveDemo/> holds the stateful ones.
 */
type DurationUnits = { year: string; months: string; days: string; and?: string };

export default async function UiGallery({ params }: { params: Promise<{ locale: Locale }> }): Promise<ReactNode> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'gallery' });
  const demo = await getTranslations({ locale, namespace: 'demo' });
  const f = await getTranslations({ locale, namespace: 'format' });

  const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="mt-10">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );


  /* One value rendered through both locales so the formatter contract is visible on one screen.
     `now` is never read on the server for user-facing values: prerendered HTML would carry the
     build machine's clock, so "today"/"now" rows render through <NowLine/> (browser clock). */
  const DEMO_TIMESTAMP = new Date('2026-09-18T14:05:00');
  const formatRows: { kind: string; en: ReactNode; fa: ReactNode }[] = [
    { kind: f('kind_counts'), en: fmt.formatNum(41209, 'en'), fa: fmt.formatNum(41209, 'fa') },
    { kind: f('kind_token'), en: fmt.formatTokenAmount(21700, 'en'), fa: fmt.formatTokenAmount(21700, 'fa') },
    {
      kind: f('kind_usd'),
      en: fmt.formatUsd(DEMO_STORY.token.priceUsd, 4),
      fa: fmt.formatUsd(DEMO_STORY.token.priceUsd, 4),
    },
    {
      kind: f('kind_compact'),
      en: fmt.formatCompactUsd(DEMO_STORY.tvlUsd),
      fa: fmt.formatCompactUsd(DEMO_STORY.tvlUsd),
    },
    { kind: f('kind_pct'), en: fmt.formatPct(12.4), fa: fmt.formatPct(12.4) },
    {
      kind: f('kind_date'),
      en: <NowLine locale="en" kind="dateNow" />,
      fa: <NowLine locale="fa" kind="dateNow" />,
    },
    {
      kind: f('kind_datetime'),
      en: fmt.formatDateTime(DEMO_TIMESTAMP, 'en'),
      fa: fmt.formatDateTime(DEMO_TIMESTAMP, 'fa'),
    },
    {
      kind: f('kind_duration'),
      // units come from the dictionary (the only place strings live), digits stay Latin
      en: fmt.formatDuration(548, f.raw('kind_duration_units') as DurationUnits),
      fa: fmt.formatDuration(548, { year: 'y', months: 'mo', days: 'd', and: ' ' }),
    },
    {
      kind: f('kind_address'),
      en: shortAddress(DEMO_STORY.wallet.address),
      fa: shortAddress(DEMO_STORY.wallet.address),
    },
  ];

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
            <p className="num num-wrap mt-1 text-[13px] font-bold" title="0x7A3f8C41bE9d2506aB1C7e5D0f83aA4129e5F9C2">
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
              {t('fonts:faSample')}
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

      <Section title={f('heading')}>
        <Card>
          <p className="text-[13px] leading-relaxed text-text2">{f('intro')}</p>
          <div className="dd-tbl-shell mt-5">
            <TableGrid template="minmax(120px,1fr) 2fr 2fr" head>
              <TCell muted>{f('colValue')}</TCell>
              <TCell>{f('colEn')}</TCell>
              <TCell>{f('colFa')}</TCell>
            </TableGrid>
            {formatRows.map((row) => (
              <TableGrid key={row.kind} template="minmax(120px,1fr) 2fr 2fr">
                <TCell muted className="text-[12.5px]">
                  {row.kind}
                </TCell>
                <TCell numeric wrap strong>
                  {row.en}
                </TCell>
                <TCell numeric wrap strong>
                  {row.fa}
                </TCell>
              </TableGrid>
            ))}
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-text3">{f('note')}</p>
        </Card>
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
