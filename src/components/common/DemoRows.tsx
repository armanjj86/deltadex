import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { TableGrid, TCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { TokenIconPair, type TokenChip } from '@/components/ui/TokenIcon';

/**
 * Pool-row example for the gallery (the exact hairline table the Pools page will reuse in Phase 6).
 * Template: token pair 46px, name, TVL, 24h vol, APR badge, chevron.
 */
export interface DemoPoolRow {
  a: { symbol: string; chip: TokenChip };
  b: { symbol: string; chip: TokenChip };
  name: string;
  meta: string;
  tvl: string;
  volume: string;
  apr: string;
}

const TEMPLATE = '46px minmax(0,1fr) 120px 120px 104px 24px';

export function DemoRows({ rows, title, colsLabel }: { rows: DemoPoolRow[]; title?: ReactNode; colsLabel?: { pair: string; tvl: string; volume: string; apr: string } }): ReactNode {
  const head = colsLabel ?? { pair: 'Pair', tvl: 'TVL', volume: 'Volume 24h', apr: 'APR' };
  return (
    <div>
      {title ? <p className="mb-3 text-[13.5px] font-semibold">{title}</p> : null}
      <TableGrid template={TEMPLATE} head>
        <span />
        <TCell>{head.pair}</TCell>
        <TCell align="end">{head.tvl}</TCell>
        <TCell align="end">{head.volume}</TCell>
        <TCell align="end">{head.apr}</TCell>
        <span />
      </TableGrid>
      {rows.map((row) => (
        <TableGrid key={row.name} template={TEMPLATE} className="py-3">
          <TokenIconPair a={row.a} b={row.b} />
          <TCell>
            <span className="block truncate text-[13px] font-semibold">{row.name}</span>
            <span className="block truncate text-[11.5px] text-text2">{row.meta}</span>
          </TCell>
          <TCell align="end" numeric>
            {row.tvl}
          </TCell>
          <TCell align="end" numeric muted>
            {row.volume}
          </TCell>
          <TCell align="end">
            <Badge tone="up">{row.apr}</Badge>
          </TCell>
          <TCell align="end">
            <ChevronRight className="inline size-3.5 text-text2 rtl:-scale-x-100" aria-hidden />
          </TCell>
        </TableGrid>
      ))}
    </div>
  );
}
