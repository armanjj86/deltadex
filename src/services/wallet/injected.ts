/**
 * The ONLY file in the app allowed to touch `window.ethereum` (HARD RULE, ARCHITECTURE.md §4).
 * Nothing else — not a store, not a component — may reference an EIP-1193 object; they all go
 * through `src/services/wallet/binding.ts` and `src/services/transaction/binding.ts`.
 *
 * Zero dependencies by design (user decision Q6): a ~60 line wrapper around the standard provider
 * API is all a prototype needs, and it keeps the demo reproducible on a machine without any wallet
 * library installed.
 */

/** Minimal EIP-1193 shape — only what the prototype calls. */
export interface InjectedProvider {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, handler: (...args: never[]) => void) => void;
  removeListener?: (event: string, handler: (...args: never[]) => void) => void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isRabby?: boolean;
}

declare global {
  interface Window {
    ethereum?: InjectedProvider;
  }
}

/**
 * Delta Chain (fictional demo L2), locked as **decimal 97477** in ARCHITECTURE.md §4 and in the
 * EIP-1193 `chainId` field below. The hex form is computed from the decimal instead of typed by
 * hand — a hand-written `0x17c65` next to "97477" disagreed by 96 and the demo wallet would have
 * reported the wrong chain id to MetaMask.
 */
export const DELTA_CHAIN_ID_DECIMAL = 97_477;
export const DELTA_CHAIN_ID_HEX = '0x17cc5'; // === (97477).toString(16)
export const DELTA_CHAIN_PARAMS = {
  chainId: DELTA_CHAIN_ID_HEX,
  chainName: 'Delta Chain',
  // Never contacted: MetaMask will say it cannot verify the RPC — expected for a demo chain.
  nativeCurrency: { name: 'Delta Token', symbol: 'DELTA', decimals: 18 },
  rpcUrls: ['https://rpc.delta.exchange'],
  blockExplorerUrls: ['https://rpc.delta.exchange'],
} as const;

export type WalletFeature = 'eip6963' | 'personal_sign' | 'wallet_addEthereumChain' | 'wallet_watchAsset';

/** All numeric chainId we recognise, mapped to the prototype's NetworkId union. */
export const NETWORK_BY_CHAIN_ID: Record<number, 'delta-chain' | 'ethereum' | 'arbitrum'> = {
  [DELTA_CHAIN_ID_DECIMAL]: 'delta-chain',
  1: 'ethereum',
  421_61: 'arbitrum',
};

export function getInjected(): InjectedProvider | null {
  if (typeof window === 'undefined') return null;
  return window.ethereum ?? null;
}

export async function request<T = unknown>(method: string, params?: unknown[] | object): Promise<T> {
  const provider = getInjected();
  if (!provider) throw new WalletUnavailableError();
  return (await provider.request({ method, params })) as T;
}

/** Thrown when a browser action needs an extension that simply is not there. */
export class WalletUnavailableError extends Error {
  constructor() {
    super('No injected wallet provider in this browser');
    this.name = 'WalletUnavailableError';
  }
}

/** Best-effort call: never rejects, returns false when the method is unsupported or rejected. */
export async function tryRequest<T = unknown>(
  method: string,
  params?: unknown[] | object,
): Promise<{ ok: true; value: T } | { ok: false; reason: 'no-provider' | 'rejected' | 'failed' }> {
  const provider = getInjected();
  if (!provider) return { ok: false, reason: 'no-provider' };
  try {
    return { ok: true, value: ((await provider.request({ method, params })) as T) };
  } catch (error) {
    const code = (error as { code?: number })?.code;
    return { ok: false, reason: code === 4001 ? 'rejected' : 'failed' };
  }
}

export function subscribeToProvider(handler: (args: never[]) => void, events: string[]): () => void {
  const provider = getInjected();
  if (!provider?.on) return () => {};
  for (const event of events) provider.on(event, handler);
  return () => {
    for (const event of events) provider.removeListener?.(event, handler);
  };
}
