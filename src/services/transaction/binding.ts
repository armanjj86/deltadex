import { MockTransactionService } from './mock';
import type { TransactionService } from './types';
// import { OnChainTransactionService } from './onchain';   // <- the only change needed for a real chain

/**
 * THE SINGLE BINDING POINT (HARD RULE, ARCHITECTURE.md §4).
 * UI code imports `tx` from this file and nothing else. Changing implementation =
 * changing the two lines below. No component, hook or store may call window.ethereum.
 */
export const tx: TransactionService = new MockTransactionService();
// export const tx: TransactionService = new OnChainTransactionService();
