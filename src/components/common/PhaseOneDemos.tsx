'use client';

/**
 * Phase 1 gallery only (removed in the Phase 12 QA sweep).
 * These are client components because they hold demo state; every one of them is
 * presentational — real state will come from feature stores in later phases.
 * Keeping them in ONE 'use client' file avoids crossing the RSC boundary with functions.
 */
import { useState, type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { AmountField, InputField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { SwitchBase } from '@/components/ui/Switch';
import { SliderBase } from '@/components/ui/Slider';
import { TabList } from '@/components/ui/Tabs';
import { TokenChip } from '@/components/ui/TokenChip';
import { Button } from '@/components/ui/Button';
import { ProToolsBar } from '@/components/widgets/ProToolsBar';
import { Card } from '@/components/ui/Card';

export interface DemoCopy {
  swapTab: string;
  limitTab: string;
  pay: string;
  receive: string;
  max: string;
  search: string;
  searchHint: string;
  sliderAria: string;
  mevLabel: string;
  proLabel: string;
  proTitle: string;
  proItems: string[];
  proCaption: string;
  openModal: string;
  modalTitle: string;
  modalSubtitle: string;
  modalBody: string;
  modalClose: string;
  review: string;
  closeLabel: string;
  searchToken: string;
  lockTitle: string;
  yearsUnit: string;
}

export function SwapDemo({ copy }: { copy: DemoCopy }): ReactNode {
  const [tab, setTab] = useState('swap');
  const [pay, setPay] = useState('1,000');
  const [mev, setMev] = useState(true);
  const [pending, setPending] = useState(false);

  return (
    <Card>
      <TabList
        ariaLabel="swap / limit"
        value={tab}
        onChange={setTab}
        items={[{ id: 'swap', label: copy.swapTab }, { id: 'limit', label: copy.limitTab }]}
      />
      <div className="mt-4 space-y-2">
        <AmountField
          label={copy.pay}
          value={pay}
          onValueChange={setPay}
          usdSub="≈ $421.80"
          size="lg"
          maxAction={{ label: copy.max, onClick: () => setPay('18,290') }}
          token={<TokenChip symbol="DELTA" chip="a" disabled />}
        />
        <AmountField
          label={copy.receive}
          value="0.1769"
          usdSub="≈ $420.95"
          size="lg"
          disabled
          token={<TokenChip symbol="ETH" chip="b" disabled />}
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <span className="text-[12.5px] text-text2">{copy.mevLabel}</span>
        <SwitchBase label={copy.mevLabel} checked={mev} onChange={setMev} />
      </div>
      <div className="mt-4 flex gap-3">
        <Button fullWidth size="lg" loading={pending} onClick={() => setPending(true)}>
          {pending ? '…' : copy.review}
        </Button>
        {pending ? (
          <Button size="lg" variant="ghost" onClick={() => setPending(false)}>
            ✕
          </Button>
        ) : null}
      </div>
      <InputField className="mt-4" label={copy.searchToken} placeholder="DELTA / WETH / 0x…" hint={copy.searchHint} />
    </Card>
  );
}

export function LockModalDemo({ copy }: { copy: DemoCopy }): ReactNode {
  const [years, setYears] = useState(2);
  const [pro, setPro] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text2">{copy.lockTitle}</p>
          <p className="num text-[15px] font-bold">
            {years.toFixed(2)} <span className="text-[11px] font-semibold text-text2">{copy.yearsUnit}</span>
          </p>
        </div>
        <SliderBase
          className="mt-4"
          ariaLabel={copy.sliderAria}
          value={years}
          min={0.02}
          max={4}
          step={0.02}
          onChange={setYears}
          marks={[
            { value: 0.02, label: '1w' },
            { value: 1, label: '1y' },
            { value: 2, label: '2y' },
            { value: 4, label: '4y' },
          ]}
        />
        <div className="mt-5 flex gap-3">
          <Button onClick={() => setOpen(true)}>{copy.openModal}</Button>
        </div>
      </Card>

      <ProToolsBar
        title={copy.proTitle}
        caption={copy.proCaption}
        switchLabel={copy.proLabel}
        checked={pro}
        onChange={setPro}
        items={copy.proItems.map((label, index) => (
          <span key={label + index}>{label}</span>
        ))}
        icon={<Lock className="size-4" aria-hidden />}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={copy.modalTitle}
        subtitle={copy.modalSubtitle}
        footer={
          <div className="flex items-center justify-between gap-3">
            <span className="num text-[11.5px] text-text2">14 gwei · ≈ 0.0019 ETH</span>
            <Button size="sm" onClick={() => setOpen(false)}>
              {copy.modalClose}
            </Button>
          </div>
        }
      >
        <p className="text-[13px] leading-relaxed text-text2">{copy.modalBody}</p>
      </Modal>
    </div>
  );
}
