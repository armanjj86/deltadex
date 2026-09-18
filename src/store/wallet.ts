'use client';

import { useSyncExternalStore } from 'react';
import { wallet } from '@/services/wallet/binding';
import type { ConnectedWallet } from '@/services/wallet/types';

/**
 * `dd.v1.wallet` — the single read path for "who is connected". The wallet service owns the state
 * (so a store and a service can never disagree), this hook only mirrors it into React.
 * `getServerSnapshot` returns null: the prerendered HTML always shows the Connect button and the
 * client swaps in the persisted session on the first commit — no flash, no loader.
 */
interface StoreBackedWallet {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => ConnectedWallet | null;
}

const store = wallet as unknown as Partial<StoreBackedWallet>;

export function useWallet(): ConnectedWallet | null {
  return useSyncExternalStore(
    store.subscribe ?? (() => () => {}),
    store.getSnapshot ?? (() => null),
    () => null,
  );
}

/** Imperative actions stay on the service (HARD RULE: components never touch window.ethereum). */
export const connectWallet = (provider: 'metamask' | 'demo') => wallet.connect(provider);
export const disconnectWallet = () => wallet.disconnect();
export const addDeltaChain = () => wallet.addDeltaChainNetwork();
