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
| i18n | next-intl | `4.14.4` | `src/i18n/request.ts`; middleware arrives in Phase 2 |
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
│   ├── page.tsx                   "/" → /en   (temporary until Phase 2 middleware)
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
├── lib/             hex.ts (mock hashes/addresses); format.ts (numbers/dates, Phase 2); csv.ts (Phase 11)
└── styles/          globals.css · tokens.css · fonts.css · vazirmatn.css · ray.css · deco.css
```

Rules:
- `components/ui/**` is presentational only: no store reads, no `tx` calls, no data imports.
- `features/**` may read stores and call `tx`; it must not know which implementation answers.
- `services/**` and `data/**` must not import from `components/**`.
- Aliases: everything imports via `@/…` (see `tsconfig.json`).
- Phases create their own `features/<area>/` folder; empty folders are not committed.
`src/app/[locale]/ui-gallery/` is a **temporary** Phase 1 acceptance surface (removed in Phase 12).

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
- **Demo fallback (approved):** if no extension is detected, the app generates a stable address
  (`src/lib/hex.ts`), persists it under `dd.v1.wallet`, and behaves exactly like a connected wallet.
  `connectedAt`/`isDemo` flags let the UI label it "Demo wallet".
- Optional demo moment: `addDeltaChainNetwork()` calls `wallet_addEthereumChain` with
  chainId `0x17C65` (97477), name "Delta Chain", currency `DELTA`, fake RPC `https://rpc.delta.exchange`
  (never contacted; MetaMask will warn it cannot verify — that is fine on testnet-less demo). Behind a
  button in the wallet modal, opt-in, one line in the UI.

---

## 5 · Data layer (mock)

Shape of the typed modules that Phase 3 will add under `src/data/` (field names are the contract;
values are illustrative and must be approved with Phase 3):

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
| `dd.v1.wallet` | `ConnectedWallet` (incl. demo address) | wallet modal |
| `dd.v1.balances` | token → amount (starts from the demo story) | any confirmed receipt |
| `dd.v1.swaps` | recent swaps (last 20) | Phase 5 |
| `dd.v1.positions` | LP / stake / farm positions | Phase 6–8 |
| `dd.v1.locks` | veDELTA locks (incl. seeded 4,120 veDELTA) | Phase 7 |
| `dd.v1.orders` | limit orders | Phase 5 |
| `dd.v1.proposals` | user-created proposals + votes | Phase 10 |
| `dd.v1.bridge` | bridge transfers + statuses | Phase 9 |
| `dd.v1.txs` | unified history for the table + CSV export | every receipt |
| `dd.v1.notifications` | notification center feed | every receipt |
| `dd.v1.prefs` | slippage, MEV toggle, locale, font choice | settings UI |

Rules: one store per feature; a `version` field (currently `1`) with a `migrate` that discards
unknown versions instead of crashing; every store exposes `resetDemoData()`, surfaced once in the
footer ("Reset demo") so the presenter can start clean. Hydration is guarded (`skipHydration`
pattern / mounted flag) — no flash, no mismatch, and **no loading screen may ever hang**: if a
store read fails, the UI falls back to the seed data silently.

---

## 7 · i18n & RTL rules

- Locales `['en','fa']`, default **`en`**; routes carry the locale (`/en/swap`, `/fa/swap`).
  `src/i18n/config.ts` is the source for both; Phase 2 adds `src/i18n/routing.ts` + middleware.
- **No hardcoded user-facing strings in components** — every string comes from
  `src/i18n/dictionaries/{en,fa}.json`. Keys are namespaced per page/feature (`swap.review.title`).
- Farsi wording must follow `docs/design/glossary.md` (locked translations). New terms: propose in
  chat, get approval, then add a row to the glossary in the same commit.
- RTL mechanics: `dir` is set on `<html>` by `src/app/[locale]/layout.tsx`; components use **logical
  properties only** (`ms-/me-/ps-/pe-/text-start/inset-inline-*`); never `left-4`/`ml-4`.
  Icons/arrows that express direction flip with `rtl:rotate-180` (Tailwind's `rtl:` variant is available).
- Numbers: Persian digits via `Intl.NumberFormat(locale)` **except** prices, which stay USD with
  Western digits, and addresses/hashes, which are always monospace + LTR.
- Numeral classes (from `src/styles/tokens.css`) — use the right one or RTL breaks the rhythm:
  | class | direction | use |
  |---|---|---|
  | `.num-line` | follows the page | a **row** of figures next to a Persian label (stat strip, table cell, amount): tabular mono, aligns to the inline start, mirrors naturally |
  | `.num` | forced LTR + isolate | an atomic token inside RTL prose (price `0.4218`, `128.4M`, ratio) that must never be re-ordered |
  | `.mono` | forced LTR + isolate | address, hash, `var(--x)` snippet |
  Never put `.num` on a whole row that also contains a percentage/label chip: `unicode-bidi: isolate`
  pins the row to the far end of its column (the exact bug found in the Phase 0 handover).
- Dates: Gregorian for `en`; Jalali (Shomalī, `fa-IR-u-ca-persian`) for `fa`, via
  `src/lib/format.ts` helpers (Phase 2). Deadlines show relative time + absolute date.
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
- **No strings inside components.** Topnav / Footer / Modal / DemoRows take `labels` objects built from
  next-intl by the caller; a presentational component never reads a dictionary itself.
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
  | TableGrid · TCell · SimplePagination | `ui/Table.tsx` | `template` (grid cols) · `head` · `numeric` · `align` |
  | StatStrip · StatDelta | `widgets/StatStrip.tsx` | `stats[{label,value,delta,deltaTone,hint}]` · `cols` |
  | ProToolsBar | `widgets/ProToolsBar.tsx` | `title` · `items[]` · `caption` · `checked` · `onChange` |
  | Deco | `layout/Deco.tsx` | fixed background layer |
  | Topnav · Footer | `layout/Topnav.tsx` · `layout/Footer.tsx` | presentational; `labels` in; `wallet` = chip or connect |
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
| 1 | Aurora component library + Topnav/Footer + SVG brand | ✅ built — in review (PR #2) |
| 2 | next-intl middleware, dictionaries, RTL/format helpers, locale switcher | next |
| 3 | Mock data + stores + wallet (MetaMask/demo) + MockTransactionService wiring | planned |
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
