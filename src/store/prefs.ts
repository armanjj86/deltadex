import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ddPersist } from './persist';

/**
 * `dd.v1.prefs` — the small amount of UI state that must survive a refresh during a demo:
 * slippage tolerance, MEV-protection toggle (ch02), and the price-ticker speed (ARCHITECTURE.md §5).
 */
interface PrefsState {
  slippagePct: number;
  mevProtection: boolean;
  priceTickMs: number;
  setSlippage: (pct: number) => void;
  setMevProtection: (on: boolean) => void;
  resetDemoData: () => void;
}

const DEFAULTS = { slippagePct: 0.5, mevProtection: true, priceTickMs: 4000 };

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setSlippage: (slippagePct) => set({ slippagePct }),
      setMevProtection: (mevProtection) => set({ mevProtection }),
      resetDemoData: () => set(DEFAULTS),
    }),
    { ...ddPersist('prefs'), partialize: (s) => ({ ...DEFAULTS, slippagePct: s.slippagePct, mevProtection: s.mevProtection }) },
  ),
);
