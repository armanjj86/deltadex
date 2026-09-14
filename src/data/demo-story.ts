/**
 * Canonical demo data story — the numbers that must stay identical on EVERY page
 * (landing, dashboard, swap, stake, frames 01–09). Nothing here is computed or
 * fetched: it is the fixed fiction of the prototype.
 *
 * Rule: if a component needs one of these values, it imports it. Never re-type it.
 * Real mock datasets (tokens, pools, farms, proposals, charts) arrive in Phase 3
 * as typed TS modules in this folder — see ARCHITECTURE.md §5.
 */

export const DEMO_STORY = {
  token: { symbol: 'DELTA', priceUsd: 0.4218, change24hPct: 12.4 },
  tvlUsd: 128_400_000,
  volume24hUsd: 18_200_000,
  gasGwei: 14,
  wallet: { address: '0x7A3f8C41bE9d2506aB1C7e5D0f83aA4129e5F9C2', deltaBalance: 18_290 },
  veDelta: { locked: 4_120, amount: 21_700, years: 2 },
} as const;

/** 0x7A3f…F9C2 — display form used in the topnav / chips. */
export function shortAddress(address: string, head = 6, tail = 4): string {
  if (address.length <= head + tail + 1) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

/** Compact USD used by stat strips: 128_400_000 -> "$128.4M". Always Western digits. */
export function compactUsd(value: number): string {
  const units = [
    { limit: 1e9, suffix: 'B' },
    { limit: 1e6, suffix: 'M' },
    { limit: 1e3, suffix: 'K' },
  ];
  for (const unit of units) {
    if (Math.abs(value) >= unit.limit) {
      const n = value / unit.limit;
      return `$${n.toFixed(1).replace(/\.0$/, '')}${unit.suffix}`;
    }
  }
  return `$${value.toFixed(2)}`;
}
