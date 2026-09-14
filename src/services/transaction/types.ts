/**
 * Transaction service contract — HARD ARCHITECTURE RULE (ARCHITECTURE.md §4).
 *
 * The UI layer never touches window.ethereum, ethers, or any "contract" object.
 * Every user mutation (swap, approve, stake, lock, addLiquidity, bridge, vote …)
 * goes through exactly one object: `tx` from ./binding. Swapping the mock
 * implementation for a real on-chain one is a ONE LINE change in binding.ts.
 *
 * Status vocabulary mirrors the use-case document:
 *   pending  = «در حال پردازش»   confirmed = «تایید شده»
 *   failed   = «ناموفق»           rejected  = user cancelled in the wallet (flow ends, no retry card)
 */

/** Network identifiers supported by the prototype (Delta Chain is the fictional L2). */
export type NetworkId = 'delta-chain' | 'ethereum' | 'arbitrum';

/** Fee estimate shown in the review modal before submission. */
export interface FeeEstimate {
  networkFeeEth: number;
  networkFeeUsd: number;
  gasGwei: number;
  /** Human label from the docs, e.g. "Fast". */
  speed: 'slow' | 'normal' | 'fast';
}

/**
 * Result of a submitted operation. `status: 'failed'` is resolved (not thrown) so
 * the UI can render the "Failed · Retry" state the use-case document requires;
 * only `TxRejectedError` is thrown, because that is a cancelled flow, not a failure.
 */
export interface TxResult {
  status: 'confirmed' | 'failed';
  hash: string;
  blockNumber: number;
  gasUsed: number;
  /** Free-text reason for 'failed' (already i18n-friendly key + params live in the UI layer). */
  failureReason?:
    | 'out-of-gas'
    | 'slippage-exceeded'
    | 'pool-drained'
    | 'bridge-liquidity'
    | 'quorum-closed'
    | 'unknown';
  /** Operation-specific receipt, e.g. { amountIn, amountOut, priceImpact } for a swap. */
  receipt?: Record<string, string | number>;
}

export type TxStatusEvent =
  | { status: 'submitted' }
  | { status: 'pending'; elapsedMs: number }
  | { status: 'confirmed' | 'failed'; result: TxResult };

/** Handle returned immediately by every operation so the UI can drive a progress stepper. */
export interface TxHandle {
  readonly kind: TxKind;
  readonly hash: string;
  subscribe(listener: (event: TxStatusEvent) => void): () => void;
  /** Resolves on confirmed OR failed; rejects only on user rejection. */
  done: Promise<TxResult>;
}

export interface TxOptions {
  /** Called by the mock service right before the wallet signature step. */
  onPrepare?: (fee: FeeEstimate) => void;
  /** Force the failure path (used by QA sweeps only, never by UI). */
  forceOutcome?: 'confirmed' | 'failed';
  network?: NetworkId;
}

/* ------------------------------------------------------------------ * payloads * */

export interface SwapPayload {
  fromToken: string;
  toToken: string;
  amountIn: number;
  minReceived: number;
  routeHops: string[];
  priceImpactPct: number;
  slippagePct: number;
  mevProtection: boolean;
}

export interface ApprovePayload {
  token: string;
  spender: 'router' | 'staking' | 'governance' | 'bridge' | 'farm';
  amount: number;
}

export interface StakePayload {
  poolId: string;
  amount: number;
  /** 'flexible' | number of days for fixed-term plans. */
  plan: 'flexible' | 'fixed';
  durationDays?: number;
  autoCompound: boolean;
}

export interface UnstakePayload {
  positionId: string;
  amount: number | 'all';
}

export interface ClaimPayload {
  source: 'staking' | 'farm' | 'pool-fees';
  sourceId: string;
}

export interface LockPayload {
  amount: number;
  /** veLOCK: 1 day … 4 years (1460 days). */
  durationDays: number;
}

export interface ExtendLockPayload {
  lockId: string;
  newDurationDays: number;
}

export interface ClaimFeesPayload {
  lockId: string;
}

export interface AddLiquidityPayload {
  poolId: string;
  amountA: number;
  amountB: number;
  feeTierPct: number;
  /** Concentrated range; omitted = full range. */
  tickLower?: number;
  tickUpper?: number;
}

export interface RemoveLiquidityPayload {
  positionId: string;
  percent: number;
}

export interface CreatePoolPayload {
  tokenA: string;
  tokenB: string;
  feeTierPct: 0.01 | 0.05 | 0.3;
  amountA: number;
  amountB: number;
}

export interface FarmDepositPayload {
  farmId: string;
  amount: number;
  autoCompound: boolean;
}

export interface FarmWithdrawPayload {
  farmId: string;
  amount: number | 'all';
}

export interface SetAutoCompoundPayload {
  farmId: string;
  enabled: boolean;
}

export interface BridgePayload {
  token: string;
  amount: number;
  fromChain: NetworkId;
  toChain: NetworkId;
  feePct: number;
  minReceived: number;
  recipient?: string;
}

export interface VotePayload {
  proposalId: string;
  choice: 'for' | 'against' | 'abstain';
  reason?: string;
}

export interface DelegatePayload {
  delegatee: string;
  amount: number | 'all';
}

export interface CreateProposalPayload {
  title: string;
  summary: string;
  /** Short identifier of the parameter being changed (mock only). */
  target: string;
  voteDays: number;
}

/** Discriminated map of every operation the prototype can perform. */
export interface TxPayloadMap {
  swap: SwapPayload;
  approve: ApprovePayload;
  stake: StakePayload;
  unstake: UnstakePayload;
  claim: ClaimPayload;
  lock: LockPayload;
  extendLock: ExtendLockPayload;
  claimFees: ClaimFeesPayload;
  addLiquidity: AddLiquidityPayload;
  removeLiquidity: RemoveLiquidityPayload;
  createPool: CreatePoolPayload;
  farmDeposit: FarmDepositPayload;
  farmWithdraw: FarmWithdrawPayload;
  setAutoCompound: SetAutoCompoundPayload;
  bridge: BridgePayload;
  vote: VotePayload;
  delegate: DelegatePayload;
  createProposal: CreateProposalPayload;
}

export type TxKind = keyof TxPayloadMap;

/** Thrown when the user rejects the request inside the wallet (UC flow «رد شده»). */
export class TxRejectedError extends Error {
  constructor(message = 'User rejected the request in the wallet') {
    super(message);
    this.name = 'TxRejectedError';
  }
}

/** Pre-flight validation error (insufficient balance, below minimum, …). */
export class TxValidationError extends Error {
  constructor(
    readonly code:
      | 'insufficient-balance'
      | 'insufficient-allowance'
      | 'below-minimum'
      | 'slippage-too-high'
      | 'lock-expired'
      | 'voting-power-required'
      | 'bridge-liquidity'
      | 'unsupported-network',
    message: string,
  ) {
    super(message);
    this.name = 'TxValidationError';
  }
}

/** What any TransactionService implementation must expose. */
export interface TransactionService {
  readonly id: 'mock' | 'onchain';

  /** Estimate fee + gas before the review modal opens. */
  estimate<K extends TxKind>(kind: K, payload: TxPayloadMap[K]): Promise<FeeEstimate>;
  /** Generic entry point used by the typed helpers below. */
  submit<K extends TxKind>(kind: K, payload: TxPayloadMap[K], options?: TxOptions): Promise<TxHandle>;
  /** Replay a failed operation with the same payload (UC "retry"). */
  retry(handle: TxHandle, options?: TxOptions): Promise<TxHandle>;

  swap(payload: SwapPayload, options?: TxOptions): Promise<TxHandle>;
  approve(payload: ApprovePayload, options?: TxOptions): Promise<TxHandle>;
  stake(payload: StakePayload, options?: TxOptions): Promise<TxHandle>;
  unstake(payload: UnstakePayload, options?: TxOptions): Promise<TxHandle>;
  claimRewards(payload: ClaimPayload, options?: TxOptions): Promise<TxHandle>;
  lockVotingPower(payload: LockPayload, options?: TxOptions): Promise<TxHandle>;
  extendLock(payload: ExtendLockPayload, options?: TxOptions): Promise<TxHandle>;
  claimFees(payload: ClaimFeesPayload, options?: TxOptions): Promise<TxHandle>;
  addLiquidity(payload: AddLiquidityPayload, options?: TxOptions): Promise<TxHandle>;
  removeLiquidity(payload: RemoveLiquidityPayload, options?: TxOptions): Promise<TxHandle>;
  createPool(payload: CreatePoolPayload, options?: TxOptions): Promise<TxHandle>;
  depositFarm(payload: FarmDepositPayload, options?: TxOptions): Promise<TxHandle>;
  withdrawFarm(payload: FarmWithdrawPayload, options?: TxOptions): Promise<TxHandle>;
  setAutoCompound(payload: SetAutoCompoundPayload, options?: TxOptions): Promise<TxHandle>;
  bridge(payload: BridgePayload, options?: TxOptions): Promise<TxHandle>;
  castVote(payload: VotePayload, options?: TxOptions): Promise<TxHandle>;
  delegate(payload: DelegatePayload, options?: TxOptions): Promise<TxHandle>;
  createProposal(payload: CreateProposalPayload, options?: TxOptions): Promise<TxHandle>;
}
