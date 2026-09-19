'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
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
type Notifier = (wallet: ConnectedWallet | null) => void;
type NotifierService = Partial<StoreBackedWallet> & { onChange?: (l: Notifier) => () => void };

/**
 * One read path for "who is connected". `useSyncExternalStore` gives React the correct value on
 * every render; the extra `onChange` bump is belt-and-braces so a change made *inside an awaited
 * promise* (the modal's connect handler awaits the service, then closes itself) is guaranteed to
 * re-render the topbar as well — the jsdom harness caught the topbar lagging one interaction behind
 * with the store subscription alone. Both paths read the same `getSnapshot()`, so they can never
 * disagree, and the bump is a no-op when the value did not change.
 */
export function useWallet(): ConnectedWallet | null {
  const walletState = useSyncExternalStore(
    store.subscribe ?? (() => () => {}),
    store.getSnapshot ?? (() => null),
    () => null,
  );
  const [, bump] = useState(0);

  useEffect(() => {
    const service = wallet as unknown as NotifierService;
    if (typeof service.onChange !== 'function') return undefined;
    return service.onChange(() => bump((n) => n + 1));
  }, []);

  return walletState;
}

/** Imperative actions stay on the service (HARD RULE: components never touch window.ethereum). */
export const connectWallet = (provider: 'metamask' | 'demo') => wallet.connect(provider);
export const disconnectWallet = () => wallet.disconnect();
export const addDeltaChain = () => wallet.addDeltaChainNetwork();
