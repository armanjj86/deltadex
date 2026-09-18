/**
 * Tiny UI event bus for the wallet (Phase 3).
 *
 * Why it exists: the gallery block and the topbar slot must not be two different wallets. They
 * already share ONE service instance (`binding.ts`), so state is identical — but the *modal* lives
 * inside the topbar slot, and the gallery needs to open it. A DOM event is the cheapest way to do
 * that without prop-drilling through the layout or importing a client store into a server page.
 *
 * Both sides are client modules, so no RSC boundary is crossed (ARCHITECTURE.md §7/§8).
 */
export const WALLET_OPEN_EVENT = 'deltadex:open-wallet-modal';

export function requestWalletModal(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(WALLET_OPEN_EVENT));
}

export function onWalletModalRequest(handler: () => void): () => void {
  window.addEventListener(WALLET_OPEN_EVENT, handler);
  return () => window.removeEventListener(WALLET_OPEN_EVENT, handler);
}
