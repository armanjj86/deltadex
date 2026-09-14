/**
 * Wallet contract — Phase 3 implementation. The prototype talks to MetaMask through
 * a thin `window.ethereum` wrapper (no wagmi/viem) and nothing else in the app.
 */
import type { NetworkId } from '@/services/transaction/types';

export type WalletProviderId = 'metamask' | 'walletconnect' | 'coinbase' | 'rabby' | 'demo';

export interface WalletProviderInfo {
  id: WalletProviderId;
  name: string;
  /** Only MetaMask (and the demo fallback) can actually connect in the prototype. */
  available: boolean;
  /** True when the extension was detected in this browser. */
  installed: boolean;
  /** Copy shown for unavailable options — per ch01, "coming soon" state. */
  note?: string;
}

export interface ConnectedWallet {
  provider: WalletProviderId;
  address: string;
  chainId: number;
  network: NetworkId | 'unsupported';
  /** Demo mode persists a locally generated address so a refresh never breaks the flow. */
  isDemo: boolean;
  connectedAt: number;
}

export interface WalletService {
  detect(): Promise<WalletProviderInfo[]>;
  connect(provider: WalletProviderId): Promise<ConnectedWallet>;
  disconnect(): Promise<void>;
  /** Resolves with the current account or null when nothing is connected. */
  account(): Promise<ConnectedWallet | null>;
  /** wallet_addEthereumChain for the fictional Delta Chain (Phase 3, opt-in). */
  addDeltaChainNetwork(): Promise<void>;
  /** Emitted when the user switches account/network inside the extension. */
  onChange(listener: (wallet: ConnectedWallet | null) => void): () => void;
}
