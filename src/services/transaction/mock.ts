import { TxValidationError } from './types';
import type {
  FeeEstimate,
  TransactionService,
  TxHandle,
  TxKind,
  TxOptions,
  TxPayloadMap,
  TxResult,
  TxStatusEvent,
} from './types';
import { mockTxHash } from '@/lib/hex';

/**
 * MockTransactionService — the ONLY implementation active in the prototype.
 *
 * It reproduces the *timing and messages* of the use-case document, not blockchain
 * math: wallet-signature beat → pending for a short window → confirmed (or failed,
 * only where the document defines a failure branch). Persistence is the caller's job
 * (features/* write to the zustand stores); this class only pretends to be a chain.
 *
 * Swapping in OnChainTransactionService later must not touch a single component
 * (ARCHITECTURE.md §4).
 */

const PENDING_MIN_MS = 1100;
const PENDING_MAX_MS = 2900;

/** Gas cost table per operation (fictional but consistent across pages). */
const GAS_COST: Partial<Record<TxKind, number>> = {
  approve: 0.0006,
  swap: 0.0019,
  addLiquidity: 0.0026,
  createPool: 0.0031,
  stake: 0.0012,
  lock: 0.0021,
  vote: 0.0011,
  bridge: 0.0024,
};

/** Operations whose use-case chapter defines an on-chain failure branch (ch02 UC-08). */
const CAN_FAIL: TxKind[] = ['swap', 'bridge'];

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const round = (n: number, digits: number) => Number(n.toFixed(digits));

class MockTxHandle<K extends TxKind = TxKind> implements TxHandle {
  private listeners = new Set<(event: TxStatusEvent) => void>();
  private outcome: Promise<TxResult> = Promise.reject(new Error('not started'));

  constructor(
    readonly kind: K,
    readonly payload: TxPayloadMap[K],
    readonly hash: string,
  ) {}

  /** Set once by the service right after construction. */
  attach(outcome: Promise<TxResult>): void {
    this.outcome = outcome;
  }

  subscribe(listener: (event: TxStatusEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: TxStatusEvent): void {
    for (const listener of this.listeners) listener(event);
  }

  get done(): Promise<TxResult> {
    return this.outcome;
  }
}

async function simulate(
  kind: TxKind,
  options: TxOptions,
  handle: MockTxHandle,
): Promise<TxResult> {
  // Beat 1 — where the wallet popup would appear. `onPrepare` lets the review modal
  // show its fee line; a rejected signature is surfaced by the wallet wrapper (Phase 3),
  // never simulated randomly here, so the demo stays reliable.
  options.onPrepare?.(estimateFee(kind));
  handle.emit({ status: 'submitted' });

  // Beat 2 — pending ("در حال پردازش") with ticks so steppers can animate.
  const pendingMs = randomBetween(PENDING_MIN_MS, PENDING_MAX_MS);
  const startedAt = Date.now();
  const ticker = setInterval(() => {
    handle.emit({ status: 'pending', elapsedMs: Date.now() - startedAt });
  }, 250);
  await new Promise((resolve) => setTimeout(resolve, pendingMs));
  clearInterval(ticker);

  // Beat 3 — confirmed, or the documented failure branch when forced/allowed.
  const allowedToFail = CAN_FAIL.includes(kind);
  const failed =
    options.forceOutcome === 'failed' || (allowedToFail && options.forceOutcome !== 'confirmed' && Math.random() < 0.05);

  const result: TxResult = failed
    ? {
        status: 'failed',
        hash: handle.hash,
        blockNumber: 19_400_000 + Math.floor(randomBetween(1, 900)),
        gasUsed: Math.floor(randomBetween(62_000, 180_000)),
        failureReason: kind === 'bridge' ? 'bridge-liquidity' : 'slippage-exceeded',
      }
    : {
        status: 'confirmed',
        hash: handle.hash,
        blockNumber: 19_400_000 + Math.floor(randomBetween(1, 900)),
        gasUsed: Math.floor(randomBetween(48_000, 220_000)),
      };

  handle.emit({ status: result.status, result });
  return result;
}

function estimateFee(kind: TxKind): FeeEstimate {
  const gasGwei = round(randomBetween(11, 19), 1);
  const networkFeeEth = (GAS_COST[kind] ?? 0.0014) * (gasGwei / 14);
  return {
    networkFeeEth: round(networkFeeEth, 5),
    networkFeeUsd: round(networkFeeEth * 3120, 2),
    gasGwei,
    speed: gasGwei > 17 ? 'fast' : gasGwei < 13 ? 'slow' : 'normal',
  };
}

export class MockTransactionService implements TransactionService {
  readonly id = 'mock' as const;

  async estimate<K extends TxKind>(kind: K): Promise<FeeEstimate> {
    await new Promise((resolve) => setTimeout(resolve, 120)); // a touch of "network" latency
    return estimateFee(kind);
  }

  async submit<K extends TxKind>(
    kind: K,
    payload: TxPayloadMap[K],
    options: TxOptions = {},
  ): Promise<TxHandle> {
    this.validate(kind, payload);
    const handle = new MockTxHandle(kind, payload, mockTxHash());
    handle.attach(simulate(kind, options, handle));
    return handle;
  }

  /** Re-run a failed operation with the same payload (UC «تلاش مجدد»). */
  async retry(handle: TxHandle, options: TxOptions = {}): Promise<TxHandle> {
    const source = handle as MockTxHandle;
    return this.submit(source.kind, source.payload, { ...options, forceOutcome: 'confirmed' });
  }

  /** Only the sanity checks the prototype needs — balances live in the stores. */
  private validate(kind: TxKind, payload: TxPayloadMap[TxKind]): void {
    const record = payload as unknown as Record<string, unknown>;
    for (const key of ['amount', 'amountIn'] as const) {
      const value = record[key];
      if (typeof value === 'number' && !(value > 0)) {
        throw new TxValidationError('below-minimum', `${kind}.${key} must be greater than zero`);
      }
    }
  }

  /* ------- typed wrappers: this is what feature code calls ------- */
  swap = (p: TxPayloadMap['swap'], o?: TxOptions) => this.submit('swap', p, o);
  approve = (p: TxPayloadMap['approve'], o?: TxOptions) => this.submit('approve', p, o);
  stake = (p: TxPayloadMap['stake'], o?: TxOptions) => this.submit('stake', p, o);
  unstake = (p: TxPayloadMap['unstake'], o?: TxOptions) => this.submit('unstake', p, o);
  claimRewards = (p: TxPayloadMap['claim'], o?: TxOptions) => this.submit('claim', p, o);
  lockVotingPower = (p: TxPayloadMap['lock'], o?: TxOptions) => this.submit('lock', p, o);
  extendLock = (p: TxPayloadMap['extendLock'], o?: TxOptions) => this.submit('extendLock', p, o);
  claimFees = (p: TxPayloadMap['claimFees'], o?: TxOptions) => this.submit('claimFees', p, o);
  addLiquidity = (p: TxPayloadMap['addLiquidity'], o?: TxOptions) => this.submit('addLiquidity', p, o);
  removeLiquidity = (p: TxPayloadMap['removeLiquidity'], o?: TxOptions) => this.submit('removeLiquidity', p, o);
  createPool = (p: TxPayloadMap['createPool'], o?: TxOptions) => this.submit('createPool', p, o);
  depositFarm = (p: TxPayloadMap['farmDeposit'], o?: TxOptions) => this.submit('farmDeposit', p, o);
  withdrawFarm = (p: TxPayloadMap['farmWithdraw'], o?: TxOptions) => this.submit('farmWithdraw', p, o);
  setAutoCompound = (p: TxPayloadMap['setAutoCompound'], o?: TxOptions) => this.submit('setAutoCompound', p, o);
  bridge = (p: TxPayloadMap['bridge'], o?: TxOptions) => this.submit('bridge', p, o);
  castVote = (p: TxPayloadMap['vote'], o?: TxOptions) => this.submit('vote', p, o);
  delegate = (p: TxPayloadMap['delegate'], o?: TxOptions) => this.submit('delegate', p, o);
  createProposal = (p: TxPayloadMap['createProposal'], o?: TxOptions) => this.submit('createProposal', p, o);
}
