import type { FeeEstimate, TransactionService, TxHandle, TxKind, TxOptions, TxPayloadMap } from './types';

/**
 * OnChainTransactionService — reserved for the future upgrade (the "13th phase").
 * It exists only so the binding in ./binding.ts is the single place a real chain
 * would ever be plugged in. Every method intentionally throws.
 */
const NOT_READY =
  'OnChainTransactionService is not implemented: the prototype is mock-only by design. See ARCHITECTURE.md §4.';

export class OnChainTransactionService implements TransactionService {
  readonly id = 'onchain' as const;

  async estimate(): Promise<FeeEstimate> {
    throw new Error(NOT_READY);
  }

  async submit(): Promise<TxHandle> {
    throw new Error(NOT_READY);
  }

  async retry(): Promise<TxHandle> {
    throw new Error(NOT_READY);
  }

  private notReady(): never {
    throw new Error(NOT_READY);
  }

  swap = (): never => this.notReady();
  approve = (): never => this.notReady();
  stake = (): never => this.notReady();
  unstake = (): never => this.notReady();
  claimRewards = (): never => this.notReady();
  lockVotingPower = (): never => this.notReady();
  extendLock = (): never => this.notReady();
  claimFees = (): never => this.notReady();
  addLiquidity = (): never => this.notReady();
  removeLiquidity = (): never => this.notReady();
  createPool = (): never => this.notReady();
  depositFarm = (): never => this.notReady();
  withdrawFarm = (): never => this.notReady();
  setAutoCompound = (): never => this.notReady();
  bridge = (): never => this.notReady();
  castVote = (): never => this.notReady();
  delegate = (): never => this.notReady();
  createProposal = (): never => this.notReady();
}

