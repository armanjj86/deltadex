# Delta DEX — ARCHITECTURE

> Living contract for the prototype. **Every phase must re-read this file before starting,
> and update it in the same commit whenever a shared contract changes.**
> Product behaviour is NOT defined here — it is defined by `docs/use-cases/*` (the single
> source of truth). This file defines *how the code is organized* so that the future
> on-chain upgrade stays cheap.

Author: Arman Jafari Naeimi (Bachelor's project, Computer Engineering, Yazd University).
Status: Phase 0 complete. All blockchain behaviour is mocked — by design.

---

## 1 · Goal & non-goals

**Goal.** A browser-only prototype of a multi-chain DEX (swap, pools, veDELTA staking,
farms, bridge, governance, portfolio) that demonstrates every use-case flow with
realistic data, in English (LTR) and Persian (RTL), for an academic defense.

**Non-goals (locked).** No backend, no database, no live price APIs, no real contracts,
no deployments, no mobile layout (desktop, 1440px target). Wallet *connection* is real
(MetaMask), everything *after* the signature is simulated.

---

## 2 · Stack & pinned versions

| Layer | Choice | Version | Why / note |
|---|---|---|---|
| Framework | Next.js App Router | `15.5.25` | Pinned. Next 16 was rejected for demo-risk; `next lint` is deprecated upstream → migrate later, not now. |
| UI | React | `19.2.8` | exact pin, avoids peer drift |
| Language | TypeScript | `5.9.3` | `strict: true` |
| Styling | Tailwind CSS | `3.4.19` | CSS-first v4 rejected: config-file mapping of the Aurora tokens is clearer and better documented |
| i18n | next-intl | `4.14.4` | `src/i18n/routing.ts` (locales + middleware), `src/i18n/request.ts` (dictionaries + error policy) |
| State | zustand | `^5.0.15` | per-feature stores + `persist` middleware |
| Fonts | `next/font/local` + static `@font-face` | — | files committed in `public/fonts/` (never a CDN) |

Planned additions (approved, added in the phase that needs them): `framer-motion`
(micro-animations, Phase 4), `recharts` (area chart + sparkline, Phase 6/11),
`lucide-react` (icons, Phase 1), `clsx` (conditional classes, Phase 1).
Any other dependency needs a new entry here and the user's approval.

Commands: `npm run dev` (port 3000), `npm run build`, `npm start`, `npm run lint`,
`npm run typecheck`, `npm run fonts:sync`. Both `dev` and `build` write to `.next/`:
run `npm run build` only while the dev server is **stopped**, and never delete `.next`
under a live server (it returns 500s until restarted). Before the defense, `npm run build`
must be green.

---

## 3 · Directory contract

```
src/
├── app/
│   ├── layout.tsx                 pass-through (imports globals.css)
│   ├── page.tsx                   "/" — middleware resolves the locale first (Phase 2)
│   ├── icon.svg
│   └── [locale]/
│       ├── layout.tsx             <html lang dir> + font vars + <Deco/> + NextIntlClientProvider
│       ├── page.tsx               Phase 0 verification surface → replaced by landing (Phase 4)
│       └── {swap,pools,stake,farm,bridge,governance,portfolio}/page.tsx
├── components/
│   ├── ui/          Button, Card, Field, Badge, Modal, Tabs, Switch, Slider, Tooltip, Table…
│   ├── layout/      Deco (done), Topnav, Footer
│   ├── widgets/     SwapWidget, StatStrip, TokenChip, ProToolsBar, ProposalCard…
│   └── common/      PhasePlaceholder (temporary)
├── features/<area>/  feature-specific components, hooks, view-models (only used by that route)
├── services/
│   ├── transaction/ types.ts · mock.ts · onchain.ts · binding.ts · index.ts   ← §4
│   └── wallet/      types.ts (Phase 3: metamask.ts, demo.ts, binding.ts)
├── data/            typed mock data (tokens, pools, farms, proposals, charts) — §5
├── store/           zustand stores, localStorage-persisted — §6
├── i18n/            config.ts · request.ts · dictionaries/{en,fa}.json — §7
├── lib/             hex.ts (mock hashes/addresses); format.ts (THE number/date layer, Phase 2); csv.ts (Phase 11)
└── styles/          globals.css · tokens.css · fonts.css · vazirmatn.css · ray.css · deco.css
```

Rules:
- `components/ui/**` is presentational only: no store reads, no `tx` calls, no data imports.
- `features/**` may read stores and call `tx`; it must not know which implementation answers.
- `services/**` and `data/**` must not import from `components/**`.
- Aliases: everything imports via `@/…` (see `tsconfig.json`).
- Phases create their own `features/<area>/` folder; empty folders are not committed.
`src/app/[locale]/ui-gallery/` is a **temporary** Phase 1 acceptance surface (removed in Phase 12).
Since Phase 3 it also hosts a **live** wallet block (connect/disconnect really run), so the wallet flow
can be reviewed without opening a product page.

---

## 4 · Service layer — HARD RULE

**The UI never talks to a wallet, a "contract", or an RPC.** Every mutation goes through one
object: `tx` exported by `src/services/transaction/binding.ts`.

```
UI (features/*) ──▶ tx.someOp(payload) ──▶ TransactionService (interface)
                                              ├── MockTransactionService   (active)
                                              └── OnChainTransactionService(stub, throws)
```

Switching to a real chain = editing `binding.ts` only. Zero component changes.

**Contract** (`src/services/transaction/types.ts`, already implemented in Phase 0):

- `estimate(kind, payload) → FeeEstimate` — fee/gas line of the review modal.
- `submit(kind, payload, options?) → Promise<TxHandle>` — returns as soon as the "signature"
  is granted, then streams status through `handle.subscribe()` and resolves via `handle.done`.
- `retry(handle, options?) → Promise<TxHandle>` — the document's «تلاش مجدد» path.
- 18 typed wrappers, one per mutation in the use-case document:
  `swap, approve, stake, unstake, claimRewards, lockVotingPower, extendLock, claimFees,
  addLiquidity, removeLiquidity, createPool, depositFarm, withdrawFarm, setAutoCompound,
  bridge, castVote, delegate, createProposal`.
- `TxKind` ↔ `TxPayloadMap` is the single registry of operations: **a new mutation means a new
  payload type + one wrapper here**, never a new ad-hoc call in a component.

**Status vocabulary** (must match the document's wording, `src/i18n/dictionaries`):

| internal | English | Farsi |
|---|---|---|
| `submitted` | Request in wallet | در انتظار تایید کیف پول |
| `pending` | Pending | در حال پردازش |
| `confirmed` | Confirmed / Success | تایید شده / موفق |
| `failed` | Failed | ناموفق |
| `TxRejectedError` | Cancelled (user rejected) | لغو شد (رد در کیف پول) |

**Mock timing (deliberate, for demo reliability):** signature beat is instant; pending lasts
1100–2900 ms with `pending` events every 250 ms (drive steppers); then `confirmed`.
Random failure is only enabled for `swap` (ch02 UC-08, 5%) and `bridge` (ch06). Tests/QA can force
an outcome with `options.forceOutcome`. User rejection is raised by the *wallet wrapper* (Phase 3)
when MetaMask rejects — never faked.

**Persistence is NOT the service's job.** A confirmed result is written to the zustand store by
the calling feature (`await handle.done` → `store.applyReceipt(kind, result)`), so refresh keeps state.

### WalletService (Phase 3, contract defined now)

`src/services/wallet/types.ts`: `detect() · connect(provider) · disconnect() · account() ·
addDeltaChainNetwork() · onChange()`.

- Real MetaMask via a **direct `window.ethereum` wrapper** (no wagmi/viem: zero config, zero cost,
  full control over the demo path). Only `eth_requestAccounts`, `eth_accounts`, `chainChanged`,
  `accountsChanged`, `wallet_addEthereumChain`, `wallet_switchEthereumChain`, `personal_sign` are used.
- The modal lists MetaMask / WalletConnect / Coinbase / Rabby (frame 09); **only MetaMask connects**,
  the others render a "coming soon" state. WalletConnect is out of scope: it needs a registered
  WalletConnect Project ID + a relay service (paid/registered) — forbidden for this prototype.
- Phase 3 implementation lives in `src/services/wallet/{injected,mock,binding}.ts`; the React side is
  one store (`src/store/wallet.ts`) plus one client component (`WalletSection`). See §6.1.
- **Demo fallback (approved):** if no extension is detected, the app generates a stable address
  (`src/lib/hex.ts`), persists it under `dd.v1.wallet`, and behaves exactly like a connected wallet.
  `connectedAt`/`isDemo` flags let the UI label it "Demo wallet".
- Optional demo moment: `addDeltaChainNetwork()` calls `wallet_addEthereumChain` with
  chainId `97477` (hex `0x17cc5` — **computed** by `(97477).toString(16)`, never typed by hand: a
  hand-written `0x17c65` in an earlier draft was 96 off, and `NETWORK_BY_CHAIN_ID` now shares the
  same constant so the store, the params and the mapping cannot disagree), name "Delta Chain",
  currency `DELTA`, fake RPC `https://rpc.delta.exchange`
  (never contacted; MetaMask will warn it cannot verify — that is fine on testnet-less demo). Behind a
  button in the wallet modal, opt-in, one line in the UI.

---

## 5 · Data layer (mock)

Phase 3 added `src/data/tokens.ts` — the token registry. `demoAddress` is generated by the same
deterministic helper as tx hashes (`src/lib/hex.ts`) and must always be 42 hex characters: hand-written
"readable" addresses (`0x…USDC`) are invalid hex and were rejected by the type check, so never invent
one by hand. The modules below are the contract for later phases (field names are locked; values are
illustrative):

```ts
Token      { symbol, name, decimals, address, chip: 'a'|'b'|'c'|'d', verified: boolean, usd: number }
Pool       { id, tokenA, tokenB, feeTierPct: 0.01|0.05|0.3, tvlUsd, volume24hUsd,
             aprPct, volumePerTvl, verified, network, createdAt }
PoolPoint  { t: number; price: number; volume: number }          // chart series (7d/30d/1y)
Farm       { id, poolId, allocationPoints, baseAprPct, boostedAprPct, rewards: {symbol, aprPct}[], featured }
StakePlan  { id, kind:'flexible'|'fixed', durationDays?, aprPct, lockUpMaxYears? }
VeLock     { id, amountDelta, veDelta, multiplier, unlockAt, feeShareUsd, boostPct }
Position   { id, kind:'pool'|'stake'|'farm', refId, network, amounts, usd, openedAt, status:'open'|'closed' }
Proposal   { id:'P-47', title, summary, status:'active'|'passed'|'defeated'|'pending',
             forPct, againstPct, abstainPct, quorumPct, participationPct, endsAt, author, target }
TxRecord   { hash, kind: TxKind, network, status, at, from, to, amountLabel, usdLabel, gasUsed, failureReason? }
BridgeTx   { id, token, amount, fromChain, toChain, status:'queued'|'in-flight'|'ready'|'completed'|'failed',
             steps: {label, at?, done}[], feePct, minReceived, etaMin, hashIn, hashOut? }
```

**Canonical demo story — `src/data/demo-story.ts` is the only place these are written.**
`DELTA $0.4218 (+12.4%)` · `TVL $128.4M` · `24h vol $18.2M` · `gas 14 gwei` ·
wallet `0x7A3f…F9C2` · `18,290 DELTA` · `4,120 veDELTA` (21,700 DELTA, 2y) ·
dashboard balance `$48,265.90` · unclaimed fees `$412.66` · governance `2.41M veDELTA`, `38.2%` participation.

**Price ticker (Phase 3+, after user picks the speed).** `src/store/price-ticker.ts` runs an
in-code random walk (`±0.45%` per tick, `setInterval`, clamped to ±18% of the anchor value,
paused on `document.hidden`, `prefers-reduced-motion` respected → static). Proposed default:
one tick every 4000 ms. No external API, ever.

---

## 6 · Persistence (demo reliability first)

`src/store/` holds user-created state through zustand + `persist` (localStorage, JSON).

| key | content | written by |
|---|---|---|
| `dd.v1.wallet` | `ConnectedWallet` (incl. demo address) — **live since Phase 3** | wallet modal |
| `dd.v1.balances` | token → amount, seeded from the demo story — **live since Phase 3** | confirmed receipts |
| `dd.v1.prefs` | slippage, MEV toggle, tick speed — **live since Phase 3** | settings UI (Phase 5) |
| `dd.v1.demo-address` | the generated demo address, so it survives a reset of everything else | `MockWalletService` |
| `dd.v1.swaps` | recent swaps (last 20) | Phase 5 |
| `dd.v1.positions` | LP / stake / farm positions | Phase 6–8 |
| `dd.v1.locks` | veDELTA locks (incl. seeded 4,120 veDELTA) | Phase 7 |
| `dd.v1.orders` | limit orders | Phase 5 |
| `dd.v1.proposals` | user-created proposals + votes | Phase 10 |
| `dd.v1.bridge` | bridge transfers + statuses | Phase 9 |
| `dd.v1.txs` | unified history for the table + CSV export | every receipt |
| `dd.v1.notifications` | notification center feed | every receipt |

Rules: one store per feature; a `version` field (currently `1`) with a `migrate` that discards
unknown versions instead of crashing; every store exposes `resetDemoData()`, surfaced once in the
footer ("Reset demo") so the presenter can start clean. Hydration is guarded (`skipHydration`
pattern / mounted flag) — no flash, no mismatch, and **no loading screen may ever hang**: if a
store read fails, the UI falls back to the seed data silently.

### 6.1 · Wallet plumbing (Phase 3, live)

```
window.ethereum  ←  touched ONLY by src/services/wallet/injected.ts
                    request() throws · tryRequest() never throws: {ok:false, reason:'no-provider'|'rejected'|'failed'}
                    ↑
              src/services/wallet/mock.ts   MockWalletService — owns the connection, the dd.v1.wallet
                    ↑                       session, and React glue (subscribe/getSnapshot)
              src/services/wallet/binding.ts   `wallet`   (mirror of transaction/binding.ts)
                    ↑
              src/store/wallet.ts   useWallet() = useSyncExternalStore · null on the server
              src/components/wallet/WalletSection.tsx     the only client file (topnav slot + modal)
              src/components/wallet/WalletModalView.tsx   presentational, server-capable
```

- Providers are detected **after mount**, so prerendered HTML can never claim «Detected».
- Every wallet failure is copy, not a crash: `errRejected · errNoExtension · errOffline · errGeneric`
  (the alternative flows of ch01). The demo wallet is always available, so no screen depends on an
  extension being installed.
- Delta Chain params are exactly as locked in §4: `97477` / `0x17cc5` (single source:
  `DELTA_CHAIN_ID_DECIMAL`), native `DELTA`, RPC
  `https://rpc.delta.exchange` (never contacted — MetaMask's "cannot verify" warning is expected).
- `WalletModalView` takes a **plain `errors` record**, never a callback: functions cannot cross the RSC
  boundary (§8) — hit again in Phase 3 by `errorCopy={(key) => …}`.

---

## 7 · i18n & RTL rules

- Locales `['en','fa']`, default **`en`**; routes carry the locale (`/en/swap`, `/fa/swap`).
  `src/i18n/routing.ts` is the source for both (it also exports `routing` for the middleware and
  `swapLocalePath()` used by the locale switcher). `src/i18n/config.ts` was removed in Phase 2.
- **No hardcoded user-facing strings in components** — every string comes from
  `src/i18n/dictionaries/{en,fa}.json`. Keys are namespaced per page/feature (`swap.review.title`).
- Farsi wording must follow `docs/design/glossary.md` (locked translations). New terms: propose in
  chat, get approval, then add a row to the glossary in the same commit.
- RTL mechanics: `dir` is set on `<html>` by `src/app/[locale]/layout.tsx`; components use **logical
  properties only** (`ms-/me-/ps-/pe-/text-start/inset-inline-*`); never `left-4`/`ml-4`.
  Icons/arrows that express direction flip with `rtl:rotate-180` (Tailwind's `rtl:` variant is available).
- Numbers: **Latin (Western) digits everywhere, in Farsi too** — user decision at the end of
  Phase 2 (Persian digits rendered in a different face than the Latin UI numerals and broke tabular
  alignment). Prices stay USD-formatted, and addresses/hashes are always monospace + LTR.
- Numeral classes (from `src/styles/tokens.css`) — use the right one or RTL breaks the rhythm:
  | class | direction | use |
  |---|---|---|
  | `.num-line` | follows the page | a **row** of figures next to a Persian label (stat strip, table cell, amount): tabular mono, aligns to the inline start, mirrors naturally |
  | `.num` | forced LTR + isolate | an atomic token inside RTL prose (price `0.4218`, `128.4M`, ratio) that must never be re-ordered |
  | `.mono` | forced LTR + isolate | address, hash, `var(--x)` snippet |
  | `.num-wrap` | (modifier) | long atomic tokens — full `0x…` address, tx hash — **inside a card**: allows a line break so they never overflow the frame; keep the shortened form (`0x7A3f…F9C2`) for one-line slots like the topnav chip |
  Never put `.num` on a whole row that also contains a percentage/label chip: `unicode-bidi: isolate`
  pins the row to the far end of its column (the exact bug found in the Phase 0 handover).
  **Overflow rule:** `.num` never wraps, so any full address/hash rendered inside a padded card must
  carry `.num-wrap` as well (Phase 1 QA: the gallery address specimen stuck out of the card).
- Dates: Gregorian for `en`; Jalali (Shomalī, `fa-IR-u-ca-persian-nu-latn` — Latin digits) for `fa`, via
  `src/lib/format.ts` helpers (Phase 2). Deadlines show relative time + absolute date.
- **Formatting is only done through `src/lib/format.ts`** — feature pages must not call `Intl.*` or
  `toLocaleString` themselves, or the two locales drift apart per screen. The contract:
  | helper | `en` | `fa` | rule |
  |---|---|---|---|
  | `formatNum` / `formatTokenAmount` | `41,209` | `41,209` | Latin digits in both (Phase 2 QA) |
  | `formatUsd` / `formatCompactUsd` | `$0.4218` / `$128.4M` | identical | **never localized** (`.num`) |
  | `formatPct` | `+12.4%` / `−1.1%` | identical | real minus sign `−`, Latin digits |
  | `formatDate` / `formatShortDate` | `Fri, 18 Sep 2026` | `جمعه 1405/06/27` | numeric slash form in `fa` |
  | `formatDateLong` | `18 September 2026` | `27 شهریور 1405` | month names, for proposal deadlines |
  | `formatTime` / `formatDateTime` | `14:05` / `18 Sep 2026, 14:05` | `14:05` / `1405/06/27، 14:05` | browser clock |
  | `formatDuration` | `1y 6mo` | `1 سال و 6 ماه` | digits Latin, **unit words from the dictionary** (never hard-coded in TS) |
  `<LocaleText locale value latin>` marks a formatted value (client-safe; `latin` applies `.num`), `<NowLine>`
  renders today/clock from the **browser** clock so prerendered builds never show the CI date.
- `lang`/`dir` correctness beats cleverness: a page that renders LTR inside `dir="rtl"` is a bug.

---

## 8 · Design rules (Aurora)

- All tokens live in `src/styles/tokens.css`, mapped in `tailwind.config.ts`. Never re-declare a
  hex/px value in a component; if a token is missing, add it to `tokens.css` (+ this file's changelog).
  Alpha variants: `color-mix(in srgb, var(--acc) 12%, transparent)`.
- Typography: `--font-en` Space Grotesk (display/body) · `--font-num` IBM Plex Mono (`.num`/`.mono`) ·
  `--font-fa` **Ray (installed: 6 weights in `public/fonts/ray/`)** with Vazirmatn as fallback;
  `--f-body` = Space Grotesk → Ray so Latin stays Latin and Persian gets Persian inside one string.
  Switching the Persian face is one line (see `public/fonts/README.md`). Ray has no italic;
  `font-synthesis-weight: none` prevents fake bolding.
- Shapes/elevation: card `22px`, button `12px`/`14px`, pill `11px`, brand `10px`; shadows
  `--sh-widget`, `--sh-soft`; accent glows `--glow-btn`, `--glow-mark`.
- Background: `<Deco />` only (blurred orbs + diagonal band + vignette). **No grid patterns.**
- Stat deltas (`+12.4%` next to a big number): never glued to the value — `.num` chip with
  `ms-2 px-1.5 py-[2px] rounded-[6px] text-[12px] tracking-[0]` on `--up-dim` / `--down-dim`
  (this becomes the `StatDelta` bit of the Phase 1 StatStrip).
- **RSC-boundary rule (learned the hard way, Phase 1):** UI primitives stay **server-capable**
  (no `'use client'`). React refuses to send a *freshly created* function from a server render into a
  client component (`Event handlers cannot be passed to Client Component props`), so any primitive that
  wraps a client control attaches handlers conditionally:
  `{...(onChange ? { onClick: () => onChange(!checked) } : {})}`. Handlers passed as plain props from
  another client component are fine. Interactive *state* lives in `features/*` (or in the small client
  leaves of the Phase 1 gallery).
- **Dictionary strings are ICU-parsed**: a literal `{` or `}` (file paths like
  `src/components/{ui,widgets}`, or JSX-ish snippets) must be written as `'{'` / `'}`` or the render
  throws `INVALID_ARGUMENT_TYPE`. Curly braces never appear in user-facing Persian copy, so this only
  bites developer-facing notes — keep them out of the dictionaries if you can. (Hit twice: once in
  Phase 1 for `src/components/{ui,widgets}`, once in Phase 2 for `resolves /{locale}`.)
- **No strings inside components.** Topnav / Footer / Modal / DemoRows take `labels` objects built from
  next-intl by the caller; a presentational component never reads a dictionary itself.
- **Hero title = `lead` + gradient `gradWord` + `trailing`.** The tail (`.` in English, ` است.` in Farsi) is
  rendered **outside** the gradient span, and the space before it is written as a non-breaking space in the
  dictionary — JSX collapses a newline between `{...}` children, so a plain leading space in a message
  silently disappears. Farsi gradient segment: «برای خودتان».
- **Card text must fit the content box, not the card box.** The gallery/landing grids give a card ~365px
  with `p-6` (≈317px content). A `.num` string is ~10.4px/char at 16px, so a specimen row is capped at
  ~30 chars there — long samples (`0x… · 128.4M · $0.4218`) wrapped and left a `·` dangling at the line end
  (Phase 2 QA). Rule: specimen/demo strings ≤ 30 chars at 16px mono, or 13px for a full 42-char address.
- **Numbers are Latin.** In Farsi mode every digit — dates, counts, the year in the footer, the
  field placeholder — is a Western digit. Persian digits are not used anywhere in the UI; the only
  Farsi-specific formatting left is the Jalali calendar and the text direction.
- **Every phase report ends with an explicit checklist table.** Each acceptance item is listed with
  where to look (`route` + section) and its state, so nothing can be dropped between the master
  prompt, `ARCHITECTURE.md` and the review message.
- **Dictionary parity is checked by `npm run i18n:check`** (structural: same key paths in both JSONs,
  no leaked-key-looking strings, no unescaped ICU braces). next-intl renders a missing key as the key
  itself instead of throwing, so a typo like `t('faSample')` in the `gallery` namespace silently printed
  `gallery.faSample` on the page. The other classic: `t('fonts.faSample')` on a **namespaced** `t`
  resolves `gallery.fonts.faSample`, not the top-level key — give the file a second translator
  (`const ft = await getTranslations({ locale, namespace: 'fonts' })`). Both cases are now caught by the
  script; run it after touching dictionaries or translation keys.
- **Farsi mode must read as Farsi.** Anything a user can see goes through the dictionary; the only
  Latin that stays in a Persian page is intentional (brand DELTA DEX, token symbols, veDELTA, CSS
  variable names, font names in specimens). QA rule: paste the rendered text into a Latin-word count
  and expect only that whitelist.
- **Modal / overlay rules:** open+close are animated by CSS keyframes (`.dd-overlay`, `.dd-panel`,
  ~210ms in / 150ms out, reduced-motion honoured). Scroll locking = `html.dd-lock-scroll` +
  `scrollbar-gutter: stable` on `html`; **never** `body { overflow: hidden }` — that removed the
  scrollbar and jumped the whole layout (most visible under the sticky topnav).
- **Switch/Slider motion** is a `transform` on `.dd-switch-knob` (240ms, cubic-bezier(0.34,1.3,0.64,1))
  — compositor-driven, mirrors itself in RTL; never animate `inset-inline-start`.
- **Hairline table:** the row owns `padding-inline` (12px) and every cell 4px, so head and body edges
  match by construction; numbers use an inner `.num` span instead of `.num` on the cell (a block-level
  `direction: ltr` cell hugs the opposite column edge in RTL).
- **Component inventory (Phase 1)** — all under `src/components/`:
  | component | file | key props |
  |---|---|---|
  | BrandMark · BrandLockup · HeroTitle · TokenGlyphRow · GasPill | `brand/Brand.tsx` | `size`, `lead`, `gradWord` |
  | Button | `ui/Button.tsx` | `variant` primary·ghost·outline·danger·link · `size` sm·md·lg · `loading` · `leadingIcon` · `trailingIcon` · `fullWidth` |
  | Badge | `ui/Badge.tsx` | `tone` up·down·acc·neutral·outline·outlineUp·outlineDown |
  | Chip | `ui/Chip.tsx` | `size` sm·md · `active` · `outline` · `onClick` |
  | Card · WidgetCard · CardHeader · PageHeader | `ui/Card.tsx` | `featured` (gradient wash) · `padded` |
  | AmountField · InputField | `ui/Field.tsx` | `label` · `usdSub` · `maxAction` · `error` · `hint` · `ltr` |
  | TokenIcon · TokenIconPair | `ui/TokenIcon.tsx` | `chip` a·b·c·d · `color` · `size` · `glyph` |
  | TokenChip | `ui/TokenChip.tsx` | `symbol` · `chip` · `onClick` · `disabled` |
  | TabList | `ui/Tabs.tsx` | `items[{id,label,icon?,disabled?}]` · `value` · `onChange` |
  | SwitchBase | `ui/Switch.tsx` | `checked` · `onChange` · `label` (aria) · `size` |
  | SliderBase | `ui/Slider.tsx` | native range + `--fill` · `marks[{value,label}]` |
  | Tooltip | `ui/Tooltip.tsx` | CSS-only (hover + focus-visible) |
  | Modal | `ui/Modal.tsx` (client) | `open` · `onClose` · `title` · `subtitle` · `footer` · `width=400` |
  | TableGrid · TCell · SimplePagination | `ui/Table.tsx` | `template` (grid cols) · `head` · `numeric` · `wrap` (long atomic value may break onto line 2) · `align` |
  | LocaleText | `ui/LocaleText.tsx` | `locale` · `value` · `latin` (wraps in `.num` + `lang="en"`) |
  | NowLine | `ui/NowLine.tsx` (client) | `kind` date·dateNow·time·dateTime · browser clock, fixed sample on the server |
  | StatStrip · StatDelta | `widgets/StatStrip.tsx` | `stats[{label,value,delta,deltaTone,hint}]` · `cols` |
  | ProToolsBar | `widgets/ProToolsBar.tsx` | `title` · `items[]` · `caption` · `checked` · `onChange` |
  | Deco | `layout/Deco.tsx` | fixed background layer |
  | Topnav · Footer | `layout/Topnav.tsx` · `layout/Footer.tsx` | presentational; `labels` in; `wallet` = chip or connect; `walletNode` (Phase 3) replaces the slot with the live component |
  | LocaleSwitcher | `layout/LocaleSwitcher.tsx` (client) | `locale` · `labels` — swaps the `/{locale}` prefix |
  | WalletSection | `wallet/WalletSection.tsx` (client) | `mode` chip·connect — owns modal state, providers, errors, copy |
  | WalletModalView | `wallet/WalletModalView.tsx` | `providers` · `wallet` · `error` · `errors` (record!) · `balances` · `strings` |
  | WalletDemo | `common/WalletDemo.tsx` (client) | gallery-only: every wallet state inline, real buttons |
  | Chrome | `layout/Chrome.tsx` (client) | pathname → active nav, then Topnav + Footer |
  | ResetDemoButton | `layout/ResetDemoButton.tsx` | two-step confirm, clears `dd.v1.*` |
  | DemoRows · PhasePlaceholder · PhaseOneDemos | `common/*` | gallery / temporary scaffolding |
- Shared chrome is rendered once by `src/app/[locale]/layout.tsx`; page content must keep
  `relative z-10` so it sits above `<Deco/>`. The landing page (Phase 4) keeps the chrome but must not
  stack extra vertical padding — frame 01 is the one screen that has to fit 1440×900 exactly.
- Frames in `design-frames/` are the visual target; when a detail is ambiguous, ask with the frame
  number instead of guessing. Every page must fit 1440×900 without awkward scrolling
  (the landing must fit strictly within 900px, like frame 01).

---

## 9 · Phase map (current progress)

| Phase | Scope | Status |
|---|---|---|
| 0 | Scaffold, tokens/fonts, `ARCHITECTURE.md`, locale routes | ✅ merged to `main` (PR #1) |
| 1 | Aurora component library + Topnav/Footer + SVG brand | ✅ merged to `main` (PR #2, + QA rounds) |
| 2 | next-intl middleware, dictionaries, RTL/format helpers, locale switcher | ✅ merged to `main` (PR #4, + QA: Latin digits, duration units, slogan gradient, mono specimen width) |
| 3 | Mock data + stores + wallet (MetaMask/demo) + MockTransactionService wiring | ✅ on `main` — in review (no PR: it landed with the Phase-2 approval push; full checklist in `docs/phases/phase-3-wallet.md`) |
| 4 | Landing `/` (frame 01) | planned |
| 5 | Swap (ch02, UC-05…10) | planned |
| 6 | Pools + liquidity + IL calculator (ch03) | planned |
| 7 | Staking + veDELTA (ch04) | planned |
| 8 | Farms (ch05) | planned |
| 9 | Bridge (ch06) | planned |
| 10 | Governance (ch07) | planned |
| 11 | Portfolio + history + notifications (ch08 + ch01) | planned |
| 12 | QA sweep (RTL, persistence, broken states, speed) + security badge (ch09) | planned |
| 13 | (future, out of scope) OnChainTransactionService | — |

Per-phase loop: plan in Persian → user approval → build → Persian test checklist → bug fixes →
user "OK" → next phase.

Document names in this repo (the master prompt used two idealised paths): the intro is
`docs/use-cases/00-intro.md`, the design system is `docs/design/AURORA-DESIGN-PROMPT.md`
(there is no `aurora-theme.md`), brand marks are `docs/assets/delta-mark-{dark,light}.png`
(the folder typo was fixed and copies live in `public/brand/`).

---

## 10 · Changelog of shared contracts

- **Phase 0 (a)** — initial contracts: `TransactionService` (18 kinds + payloads), `WalletService`
  (types only), Aurora CSS variables, font variable contract (`--font-en/--font-num/--font-fa`),
  demo story module, store key table, `PhasePlaceholder` (temporary), `src/app/page.tsx` redirect
  (temporary until Phase 2 middleware). No UI components exist yet.
- **Phase 0 (b) — post-handover fixes:**
  `docs/assests/` → `docs/assets/` and `docs/use-cases/ch00-intro.md` → `00-intro.md` (approved renames;
  content untouched). New numeral class `.num-line` added and `.num` narrowed to atomic tokens, to fix
  the RTL stat-strip alignment. **Ray enabled** (`src/styles/ray.css` with all 6 weights, single family
  name, `font-synthesis-weight: none`); `--f-body` now falls back to `--font-fa`. Glossary-neutral label
  Label `Network gas` → `Network cost` / «هزینه شبکه» (new row in
  `docs/design/glossary.md` §1; the document's wording «کارمزد شبکه» stays for messages).
  Stat-strip delta values got their own spacing/chip treatment (see §8) instead of sitting flush
  against the number.
- **Phase 1** — Aurora component library (§8 inventory), shared chrome (Topnav/Footer via `Chrome`),
  SVG brand mark in `src/components/brand/`, `.aurora-*` CSS parts in `src/styles/ui.css`, temporary
  `/[locale]/ui-gallery` acceptance page, `src/lib/cn.ts` + `src/lib/format.ts` (date helpers pulled
  forward) + `src/lib/demo-persistence.ts` (dd.v1.* reset helper, used by the footer button).
  New deps: `lucide-react@0.545.0`, `clsx@2.1.1` (both exact pins).
  **Phase 1 QA round (user report):** gallery/landing fully re-localized (~25 new keys, incl. the
  `prototype` chip → «پروتوتایپ»); modal enter/exit animation; scroll-lock rework (no more topnav
  jump); smoother switch; `TCell` numeric + table padding fix for RTL column alignment; new token
  `--text3` (disabled/decorative text) replaces `text-text2/50`. `nav` + `footer` + `gallery`
  sections added to both dictionaries; `footer.docs` = «راهنما» (new glossary-neutral label, review).
