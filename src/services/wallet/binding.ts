import { MockWalletService } from './mock';
import type { WalletService } from './types';

/**
 * THE SINGLE WALLET BINDING POINT (mirrors `src/services/transaction/binding.ts`).
 * UI code imports `wallet` from this file and nothing else. A future OnChainWalletService (real
 * multi-provider support) is a one-line change here.
 */
export const wallet: WalletService & {
  watchAsset?: (t: { address: string; symbol: string; decimals: number; image?: string }) => Promise<boolean>;
  signMessage?: (message: string) => Promise<'signed' | 'rejected' | 'unavailable'>;
} = new MockWalletService();
