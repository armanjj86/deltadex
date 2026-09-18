/**
 * Token registry (Phase 3). Values are the canonical demo story — `demo-story.ts` stays the single
 * place where the headline numbers are written; everything here is derived from or consistent with it.
 *
 * `demoAddress` is a fixed fictional contract per token: the wallet uses it for `wallet_watchAsset`
 * and the tx history shows it, so no real address is ever rendered as "ours".
 */
import type { NetworkId } from '@/services/transaction/types';

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  chip: 'a' | 'b' | 'c' | 'd';
  verified: boolean;
  /** Deterministic mock contract address (same generator as the tx hashes) — never a real token. */
  demoAddress: string;
  /** Anchor price in USD; the ticker random-walks around it (never an API). */
  usd: number;
  network: NetworkId;
  /** Balance the demo wallet starts with (persisted per ARCHITECTURE.md §6 `dd.v1.balances`). */
  seedBalance: number;
  /** True for the network's gas asset — swap UI shows the network fee in this token. */
  isGas?: boolean;
}

export const TOKENS: Token[] = [
  {
    symbol: 'DELTA',
    demoAddress: '0x0B89023f4e0388aeBa0Dfc519f510e95DB5c42D2',
    name: 'Delta Token',
    decimals: 18,
    chip: 'a',
    verified: true,
    usd: 0.4218,
    network: 'delta-chain',
    
    seedBalance: 18_290,
  },
  {
    symbol: 'veDELTA',
    demoAddress: '0x0Bc246fBDfc186879a6B84Df16e5a8D50f5c0B45',
    name: 'Voting-escrow DELTA',
    decimals: 18,
    chip: 'a',
    verified: true,
    usd: 0.4218,
    network: 'delta-chain',
    
    seedBalance: 0, // derived from locks (Phase 7), never a transferable balance
  },
  {
    symbol: 'ETH',
    demoAddress: '0x0Bafe1262eB0e494653De70ac08efcc18ecc1D84',
    name: 'Ether',
    decimals: 18,
    chip: 'b',
    verified: true,
    usd: 3142.6,
    network: 'ethereum',
    
    seedBalance: 1.402,
    isGas: true,
  },
  {
    symbol: 'USDC',
    demoAddress: '0x0aB86c1aa440955262DBD9898D34ce149B5cf99B',
    name: 'USD Coin',
    decimals: 6,
    chip: 'c',
    verified: true,
    usd: 1,
    network: 'delta-chain',
    
    seedBalance: 5_240.12,
  },
  {
    symbol: 'USDT',
    demoAddress: '0x0aD5cBc75531f7419D8DBa5c5B5f9a001accef5a',
    name: 'Tether USD',
    decimals: 6,
    chip: 'c',
    verified: true,
    usd: 0.9998,
    network: 'ethereum',
    
    seedBalance: 1_802.4,
  },
  {
    symbol: 'ARB',
    demoAddress: '0x0a9e8f03c4f3f968BDeBc2D2D2eB3c40cecca6cD',
    name: 'Arbitrum',
    decimals: 18,
    chip: 'd',
    verified: true,
    usd: 0.7412,
    network: 'arbitrum',
    
    seedBalance: 640.5,
  },
  {
    symbol: 'wstETH',
    demoAddress: '0x0af328De35829B7B42BDa107048068544f5cB00c',
    name: 'Wrapped stETH',
    decimals: 18,
    chip: 'b',
    verified: true,
    usd: 3694.1,
    network: 'ethereum',
    
    seedBalance: 0.42,
  },
  {
    symbol: 'GM',
    demoAddress: '0x0D82386a83e80315761Bc8a71170B88f5c89fD47',
    name: 'GM Token (community)',
    decimals: 18,
    chip: 'd',
    verified: false,
    usd: 0.0031,
    network: 'delta-chain',
    
    seedBalance: 125_000,
  },
];

export const TOKEN_BY_SYMBOL: Record<string, Token> = Object.fromEntries(
  TOKENS.map((t) => [t.symbol, t]),
);

export const getToken = (symbol: string): Token => TOKEN_BY_SYMBOL[symbol] ?? TOKENS[0];

/** Fiat value of a token balance — USD formatting stays in `src/lib/format` (never localized). */
export const usdValue = (symbol: string, amount: number): number => getToken(symbol).usd * amount;
