import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ddPersist } from './persist';
import { TOKENS } from '@/data/tokens';
import { DEMO_STORY } from '@/data/demo-story';

/**
 * `dd.v1.balances` (Phase 3). Seeded from the canonical demo story, mutated by confirmed receipts.
 * Amounts are plain numbers in TOKEN units — never wei strings, because nothing real is involved.
 */
export type Balances = Record<string, number>;

const seed = (): Balances =>
  Object.fromEntries(TOKENS.map((t) => [t.symbol, t.seedBalance])) as Balances & { DELTA: number };

interface BalancesState {
  amounts: Balances;
  /** Apply a confirmed receipt: `delta` may be negative. Unknown symbols are added on demand. */
  applyDelta: (symbol: string, delta: number) => void;
  setAmount: (symbol: string, amount: number) => void;
  /** Called by the footer's Reset demo — drops the persisted balances and re-seeds. */
  resetDemoData: () => void;
}

export const useBalances = create<BalancesState>()(
  persist(
    (set) => ({
      amounts: seed(),
      applyDelta: (symbol, delta) =>
        set((state) => ({
          amounts: { ...state.amounts, [symbol]: Math.max(0, (state.amounts[symbol] ?? 0) + delta) },
        })),
      setAmount: (symbol, amount) =>
        set((state) => ({ amounts: { ...state.amounts, [symbol]: Math.max(0, amount) } })),
      resetDemoData: () => set({ amounts: seed() }),
    }),
    { ...ddPersist('balances'), partialize: (state) => ({ amounts: state.amounts }) },
  ),
);

/** The demo story override: DELTA always starts at the headline number (18,290). */
export const demoDeltaBalance = () => DEMO_STORY.wallet.deltaBalance;

/** Read-only helper for server components (no store access on the server → seed values). */
export const seedBalances = seed;
