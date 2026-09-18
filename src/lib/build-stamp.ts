/**
 * The build stamp shown in the footer (added during Phase 3 QA, see ARCHITECTURE.md §9).
 *
 * Purpose is purely practical: this prototype is reviewed by looking at a browser, and "the wallet
 * changes are not there" can mean either *not pushed*, *not pulled*, or *stale .next cache*. One
 * visible marker makes those distinguishable in a second: the marker changes with every phase/QA
 * commit, and the short SHA comes from the checkout that built the page.
 */
export const BUILD_MARKER = 'فاز ۳ — کیف پول زنده | phase 3 wallet';

/** Written in the same commit that shipped this stamp, so a glance at the footer names the checkout. */
export const BUILD_EXPECTED_SHA = '17edfa9';

/** In production the SHA is inlined by `next build`; in dev `next dev` provides it too. */
export const BUILD_SHA: string = process.env.NEXT_PUBLIC_BUILD_SHA || 'dev';

export const BUILD_STATE: string = process.env.NEXT_PUBLIC_BUILD_STATE || '';
