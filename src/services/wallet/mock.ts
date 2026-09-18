import {
  DELTA_CHAIN_ID_DECIMAL,
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

/** localStorage can throw outright (private mode / blocked cookies) — never let that bubble. */
function readKey(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeKey(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* blocked storage: the value simply is not remembered (the session still works in-tab) */
  }
}

function demoAddress(): string {
  if (typeof window === 'undefined') return '0x7A3f8C41bE9d2506aB1C7e5D0f83aA4129e5F9C2';
  const stored = readKey(DEMO_ADDRESS_KEY);
  if (stored && /^0x[0-9a-fA-F]{40}$/.test(stored)) return stored;
  const generated = mockAddress(20260918);
  writeKey(DEMO_ADDRESS_KEY, generated);
  return generated;
}

async function networkOf(chainIdHex: string): Promise<ConnectedWallet['network']> {
  return NETWORK_BY_CHAIN_ID[Number.parseInt(chainIdHex, 16)] ?? 'unsupported';
}

export class MockWalletService implements WalletService {
  private current: ConnectedWallet | null | 'unread' = 'unread';
  private listeners = new Set<(wallet: ConnectedWallet | null) => void>();

  /* ---- store binding: the service owns the connection, React only mirrors it ---- */

  /**
   * `useSyncExternalStore` glue — synchronous so a refresh never renders "disconnected" first.
   * Provider events are attached ONCE (first subscriber) and detached with the last one, so
   * remounting the topbar slot cannot stack duplicate `chainChanged` listeners.
   */
  private providerOff: (() => void) | null = null;

  /** The React listener is registered in `listeners` so provider events reach it; React then
      re-reads `getSnapshot()` (arguments are ignored by `useSyncExternalStore`). */
  subscribe = (listener: () => void): (() => void) => {
    const noop = listener;
    this.listeners.add(noop);
    this.providerOff ??= subscribeToProvider(async () => {
      // Refresh the account/chain from the extension, then notify: getSnapshot() must never be stale.
      await this.account(/* recheck */ true);
      this.emit();
    }, ['accountsChanged', 'chainChanged']);
    return () => {
      this.listeners.delete(noop);
      if (this.listeners.size === 0) {
        this.providerOff?.();
        this.providerOff = null;
      }
    };
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
        chainId: DELTA_CHAIN_ID_DECIMAL,
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

  /**
   * `recheck` is what an extension event (`accountsChanged` / `chainChanged`) asks for: read the
   * provider again, do NOT trust the cached session — otherwise a network switch inside MetaMask
   * would be swallowed and the topbar would keep showing the old chain.
   */
  async account(recheck = false): Promise<ConnectedWallet | null> {
    if (!recheck) {
      if (this.current && this.current !== 'unread') return this.current as ConnectedWallet;
      const stored = readSession();
      this.current = stored;
      if (stored) return stored;
    }
    const current = this.current === 'unread' ? null : (this.current as ConnectedWallet | null);
    const accounts = await tryRequest<string[]>('eth_accounts');
    if (!accounts.ok || !accounts.value?.length) {
      // No account (or no extension): keep a demo session alive, otherwise mark ourselves offline.
      if (current?.isDemo) return current;
      this.set(null);
      return null;
    }
    const chainIdHex = await tryRequest<string>('eth_chainId');
    const hex = chainIdHex.ok ? chainIdHex.value : '0x1';
    const next: ConnectedWallet = {
      provider: 'metamask',
      address: accounts.value[0],
      chainId: Number.parseInt(hex, 16),
      network: await networkOf(hex),
      isDemo: false,
      connectedAt: current?.connectedAt ?? Date.now(),
    };
    if (current && sameWallet(current, next)) return current; // no-op event: keep the reference stable
    this.set(next);
    return next;
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
    return () => {
      this.listeners.delete(listener);
    };
  }

  private set(wallet: ConnectedWallet | null): void {
    this.current = wallet;
    writeSession(wallet);
    this.emit();
  }

  private emit(): void {
    const snapshot = this.current === 'unread' ? null : (this.current as ConnectedWallet | null);
    for (const listener of this.listeners) listener(snapshot);
  }
}

function sameWallet(a: ConnectedWallet, b: ConnectedWallet): boolean {
  return a.address === b.address && a.chainId === b.chainId && a.network === b.network && a.provider === b.provider;
}

/**
 * The connection survives a refresh (demo reliability rule): a real provider can be re-attached
 * with `eth_accounts`, and the demo wallet simply reads back what we stored. Only non-secret
 * display data is persisted — never a key, never a seed phrase (there are none).
 */
function readSession(): ConnectedWallet | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = readKey(SESSION_KEY);
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
  writeKey(SESSION_KEY, wallet ? JSON.stringify({ state: wallet }) : null);
}
