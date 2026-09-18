import {
  DELTA_CHAIN_PARAMS,
  NETWORK_BY_CHAIN_ID,
  getInjected,
  request,
  subscribeToProvider,
  tryRequest,
} from './injected';
import { mockAddress } from '@/lib/hex';
import type { ConnectedWallet, WalletProviderId, WalletProviderInfo, WalletService } from './types';

/**
 * MockWalletService (Phase 3) — a `window.ethereum` wrapper plus a deterministic demo fallback.
 *
 * Behaviour is exactly what the demo needs and nothing more:
 *  - MetaMask (or any injected provider) is used for real: `eth_requestAccounts`, `eth_chainId`,
 *    `accountsChanged`/`chainChanged` subscriptions, optional `wallet_addEthereumChain` and
 *    `wallet_watchAsset`. Every rejection is surfaced as a message, never as a broken screen.
 *  - "Demo wallet" is a locally generated address (seeded from localStorage) so the whole product
 *    story still plays on a machine with no extension installed.
 * No wagmi, no viem, no network calls (ARCHITECTURE.md §2).
 */
const DEMO_ADDRESS_KEY = 'dd.v1.demo-address';
const SESSION_KEY = 'dd.v1.wallet';

function demoAddress(): string {
  if (typeof window === 'undefined') return '0x7A3f8C41bE9d2506aB1C7e5D0f83aA4129e5F9C2';
  const stored = window.localStorage.getItem(DEMO_ADDRESS_KEY);
  if (stored) return stored;
  const generated = mockAddress(20260918);
  window.localStorage.setItem(DEMO_ADDRESS_KEY, generated);
  return generated;
}

async function networkOf(chainIdHex: string): Promise<ConnectedWallet['network']> {
  return NETWORK_BY_CHAIN_ID[Number.parseInt(chainIdHex, 16)] ?? 'unsupported';
}

export class MockWalletService implements WalletService {
  private current: ConnectedWallet | null | 'unread' = 'unread';
  private listeners = new Set<(wallet: ConnectedWallet | null) => void>();

  /* ---- store binding: the service owns the connection, React only mirrors it ---- */

  /** `useSyncExternalStore` glue — synchronous so a refresh never renders "disconnected" first. */
  subscribe = (listener: () => void): (() => void) => {
    const unsubscribe = this.onChange(() => listener());
    this.listeners.add(() => {}); // keeps onChange's provider subscription alive
    return unsubscribe;
  };

  getSnapshot = (): ConnectedWallet | null => {
    if (this.current === 'unread') this.current = readSession();
    return this.current as ConnectedWallet | null;
  };

  async detect(): Promise<WalletProviderInfo[]> {
    const injected = getInjected();
    const metamaskInstalled = Boolean(injected?.isMetaMask) || Boolean(injected);
    return [
      {
        id: 'metamask',
        name: 'MetaMask',
        available: true,
        installed: metamaskInstalled,
        note: metamaskInstalled ? undefined : 'install-to-connect',
      },
      { id: 'demo', name: 'Demo wallet', available: true, installed: true, note: 'no-extension-needed' },
      { id: 'walletconnect', name: 'WalletConnect', available: false, installed: false, note: 'out-of-scope' },
      { id: 'coinbase', name: 'Coinbase Wallet', available: false, installed: false, note: 'out-of-scope' },
      { id: 'rabby', name: 'Rabby', available: false, installed: false, note: 'out-of-scope' },
    ];
  }

  async connect(provider: WalletProviderId): Promise<ConnectedWallet> {
    if (provider === 'demo') {
      const wallet: ConnectedWallet = {
        provider: 'demo',
        address: demoAddress(),
        chainId: 97_477,
        network: 'delta-chain',
        isDemo: true,
        connectedAt: Date.now(),
      };
      this.set(wallet);
      return wallet;
    }

    // Any real provider goes through the standard EIP-1193 handshake. `eth_requestAccounts`
    // rejects with code 4001 when the user cancels in the extension — we rethrow a readable error
    // so the modal can show the «connection cancelled» copy from ch01.
    const accounts = await request<string[]>('eth_requestAccounts');
    if (!accounts?.length) throw new Error('no-account');
    const chainIdHex = await tryRequest<string>('eth_chainId');
    const hex = chainIdHex.ok ? chainIdHex.value : '0x1';
    const network = await networkOf(hex);
    const wallet: ConnectedWallet = {
      provider: 'metamask',
      address: accounts[0],
      chainId: Number.parseInt(hex, 16),
      network,
      isDemo: false,
      connectedAt: Date.now(),
    };
    this.set(wallet);
    return wallet;
  }

  async disconnect(): Promise<void> {
    // MetaMask has no "disconnect" API; forgetting the account locally is the honest prototype
    // behaviour (the extension keeps its own permission until the user revokes it).
    this.set(null);
  }

  async account(): Promise<ConnectedWallet | null> {
    if (this.current && this.current !== 'unread') return this.current as ConnectedWallet;
    this.current = readSession();
    if (this.current) return this.current as ConnectedWallet;
    const accounts = await tryRequest<string[]>('eth_accounts');
    if (!accounts.ok || !accounts.value?.length) return null;
    const chainIdHex = await tryRequest<string>('eth_chainId');
    const hex = chainIdHex.ok ? chainIdHex.value : '0x1';
    this.current = {
      provider: 'metamask',
      address: accounts.value[0],
      chainId: Number.parseInt(hex, 16),
      network: await networkOf(hex),
      isDemo: false,
      connectedAt: Date.now(),
    };
    return this.current;
  }

  async addDeltaChainNetwork(): Promise<void> {
    const result = await tryRequest('wallet_addEthereumChain', [DELTA_CHAIN_PARAMS]);
    if (!result.ok && result.reason !== 'rejected') throw new Error('network-add-failed');
  }

  /** Adds the demo token to the connected wallet (ch01: watch-asset step, optional in the demo). */
  async watchAsset(token: { address: string; symbol: string; decimals: number; image?: string }): Promise<boolean> {
    const result = await tryRequest('wallet_watchAsset', {
      type: 'ERC20',
      options: { address: token.address, symbol: token.symbol, decimals: token.decimals, image: token.image },
    });
    return result.ok && result.value === true;
  }

  /** Signs a plain message so the demo can show a real «signature requested» step. */
  async signMessage(message: string): Promise<'signed' | 'rejected' | 'unavailable'> {
    const current = this.current === 'unread' ? readSession() : (this.current as ConnectedWallet | null);
    if (!current || current.isDemo) return 'unavailable';
    const result = await tryRequest<string>('personal_sign', [message, current.address]);
    if (result.ok) return 'signed';
    return result.reason === 'rejected' ? 'rejected' : 'unavailable';
  }

  onChange(listener: (wallet: ConnectedWallet | null) => void): () => void {
    this.listeners.add(listener);
    const unsubscribe = subscribeToProvider(async () => {
      const next = await this.account();
      this.set(next, /* silent */ true);
    }, ['accountsChanged', 'chainChanged']);
    return () => {
      this.listeners.delete(listener);
      unsubscribe();
    };
  }

  private set(wallet: ConnectedWallet | null, silent = false): void {
    this.current = wallet;
    writeSession(wallet);
    if (!silent) for (const listener of this.listeners) listener(wallet);
    else for (const listener of this.listeners) listener(wallet);
  }
}

/**
 * The connection survives a refresh (demo reliability rule): a real provider can be re-attached
 * with `eth_accounts`, and the demo wallet simply reads back what we stored. Only non-secret
 * display data is persisted — never a key, never a seed phrase (there are none).
 */
function readSession(): ConnectedWallet | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConnectedWallet & { state?: ConnectedWallet };
    const wallet = (parsed as { state?: ConnectedWallet }).state ?? parsed;
    if (!wallet?.address) return null;
    return wallet;
  } catch {
    return null;
  }
}

function writeSession(wallet: ConnectedWallet | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (wallet) window.localStorage.setItem(SESSION_KEY, JSON.stringify({ state: wallet }));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* blocked storage: the session simply is not remembered */
  }
}
