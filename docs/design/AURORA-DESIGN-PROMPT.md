# DELTA DEX — AURORA THEME · FULL CONTEXT PROMPT

> **How to use:** Paste this whole file at the start of a new session. It contains the complete
> project context, design-system tokens, component specs, page inventory and the render pipeline
> so work can continue with zero re-exploration.
>
> **Status:** Theme CHOSEN and FINAL by the user (Arman Jafari Naeimi, Computer Engineering student).
> 9 core frames already rendered. Remaining: cover page for the use-case document (PDF A4 + PNG).

---

## 1 · PROJECT CONTEXT

- **Project:** Delta DEX — a university project (شرح موارد کاربری / Use-Case document, 112 pages).
  A decentralized exchange with: Swap, Concentrated-Liquidity Pools, veDELTA staking (vote-escrow),
  Farms (LP staking + incentives), Bridge (Delta Chain ↔ Ethereum ↔ Arbitrum), Governance,
  Portfolio dashboard, Wallet-connect modal.
- **Deliverable format:** UI design frames as **PNG for Figma** — **1440×900 @2x** (2880×1800 actual),
  one frame per page, English UI, **LTR**.
- **User's language:** Persian (Farsi) — chat in Persian, UI text in English.
- **User's design taste (hard-won through feedback — respect these):**
  1. Inspiration from **Uniswap** (floating swap widget, big radii, clean hierarchy). User LOVES it.
  2. **Simple/flowing by default, professional under the hood** → the "simple + Pro tools" pattern:
     clean default view + a collapsed dashed "Pro tools" bar (Limit orders · Depth chart ·
     LP fee breakdown · Private RPC) with a toggle switch.
  3. **NO grid patterns in the background** (explicitly rejected). Depth comes from
     **soft blurred shapes only**: blurred color orbs + a diagonal light band + vignette.
  4. Not clichéd "AI gradient purple" designs; wants creative, real-product-level composition.
  5. Frames must never overflow 900px height — always verify `document.body.scrollHeight <= 900`.

---

## 2 · AURORA DESIGN SYSTEM (final tokens)

Dark glass with a green-tinted near-black base and a mint→cyan aurora glow.

### Color tokens
| Token | Value | Usage |
|---|---|---|
| `--bg` | `#060B09` | page background (green-tinted near-black) |
| `--surface` | `rgba(255,255,255,.04)` | glass cards |
| `--field` | `rgba(255,255,255,.06)` | inputs / inset rows |
| `--border` | `rgba(255,255,255,.09)` | hairline borders |
| `--text` | `#ECF5F0` | primary text |
| `--text2` | `#8CA09A` | secondary text |
| `--acc` | `#2CE0A3` | primary accent (mint) |
| `--acc2` | `#35C7E8` | secondary accent (cyan) |
| `--acc-dim` | `rgba(44,224,163,.10)` | accent tint fill |
| `--acc-bd` | `rgba(44,224,163,.30)` | accent-tint border |
| `--grad` | `linear-gradient(93deg,#2CE0A3 5%,#35C7E8 95%)` | gradient word / sliders / vote bars |
| `--up` | `#3FE08B` (+dim `rgba(63,224,139,.10)`) | positive |
| `--down` | `#FF6B7A` (+dim `rgba(255,107,122,.10)`) | negative |
| `--btn-fg` | `#04120C` | text on accent buttons (near-black green) |
| token chips | tk-a mint Δ · tk-b periwinkle `#8F9DFF` Ξ · tk-c teal `#3BDCC2` $ · tk-d amber `#F2B34C` ◆ | token circles |
| topnav bottom border | `rgba(255,255,255,.07)` | 1px |

### Typography
| Role | Font | Notes |
|---|---|---|
| Display / headings / body | **Space Grotesk** (400/500/600/700) | `--f-body`, `--f-disp` |
| Numerals / code / hashes | **IBM Plex Mono** (400/500/600/700) | `--f-num`, `--f-mono`, class `.num`/`.mono`, `tabular-nums`, `letter-spacing:-.01em` |
| H1 (landing) | 60px / 800 / -0.028em / 1.05 | gradient word via `.grad-word` (bg-clip:text + mint drop-shadow glow) |
| H2 (page titles) | 27px / 800 / -0.02em | |
| Body | 14px base / 1.5 | 12–13.5px for UI labels |
| Micro-labels | 10–11px / 600–700 / uppercase / +0.08em | table headers |

⚠️ Fonts must be installed as **TTF** (Chromium ignores system woff2). Google Fonts css2 API with a
legacy UA returns static slices; Space Grotesk slices ship with broken family names
("Space Grotesk Light Medium") — fix name tables with fontTools (see scripts/delta-final/fix_sg.py).

### Shape & elevation
- Radii: cards `22px` · buttons `12px` · large buttons `14px` · pills/chips `11px` (`999px` for filter chips) · brand mark `10px`
- Shadows: widget `0 24px 70px rgba(0,0,0,.55)` · soft card `0 10px 30px rgba(0,0,0,.35)`
- Accent glows: button `0 10px 30px rgba(44,224,163,.28)` · brand mark `0 0 26px rgba(44,224,163,.40)`

### Background deco layer (signature Aurora look — NO GRIDS)
```html
<div class="deco">
  <div class="orb orb-1"></div><div class="orb orb-2"></div>
  <div class="orb orb-3"></div><div class="orb orb-l"></div>
  <div class="band"></div>
  <div class="vignette"></div>
</div>
```
- `.orb` = 460–560px circles, `filter:blur(120px)`, opacity .95:
  1 `rgba(24,140,100,.38)` top-left · 2 `rgba(28,110,150,.30)` top-right ·
  3 `rgba(90,70,180,.20)` bottom-right · 4 `rgba(18,100,88,.28)` bottom-left
- `.band` = 1560×440px diagonal gradient strip, `blur(52px)`, `rotate(-7deg)`,
  colors `rgba(44,224,163,.15)` → `rgba(53,199,232,.12)`
- `.vignette` = radial darkening `rgba(2,6,5,.55)` at edges
- deco layer: `position:fixed; inset:0; z-index:0; pointer-events:none`

---

## 3 · COMPONENT LIBRARY (all in `base.css`)

- **Topnav** (72px, padding 0 56px): brand (▲ mint mark 34px + "Delta" 19px + "DEX" tag chip) ·
  nav links 13.5px (active = text + `rgba(44,224,163,.09)` pill bg) · right: gas pill (14 gwei,
  mono, lightning icon) · wallet chip (conic-gradient avatar + `0x7A3f…F9C2` mono) or Connect button.
- **Swap widget** (428px, the Uniswap-style hero): rounded 22px glass card →
  "You pay" field (27px amount + token chip pill) → divider row with circular swap button
  (border-4 surface, mint arrows) → "You receive" → big CTA 50px (`Review swap` / `Connect Wallet`) →
  meta row (route + slippage/MEV). USD sub-line `≈ $421.80` 12px text2. `MAX` mini-chip mint.
- **Floating chips** (landing): glass pills absolutely positioned on the widget
  (`fc-1` top:-24px right:14px price; `fc-2` top:148px left:-52px APR) — fc-2 position is fixed
  to avoid covering the route row.
- **Action pills** (dashboard): 44px height, 999px radius, icon mint; `.primary` = mint bg + dark text.
- **Data tables** (`pools`/dashboard rows): `grid-template-columns` with leading 46px token column,
  hairline `border-top` separators (not boxed rows), uppercase 11px micro headers.
- **Badges**: 22px height, radius 7px, 11.5px/700 — `.up` mint, `.down` rose, `.acc` mint tint.
- **Token circles** `.tok` 32px (sm 26px), overlap `.tok-pair` −9px with 2px surface ring.
- **Stat strip**: 4 inline stats separated by hairlines, 24–26px/800 numerals, small `+4.1%` in `--up`.
- **Pro tools bar**: dashed 1.5px border, radius 16px, lock icon in mint tint square,
  list of pro features + toggle switch on the right.
- **Switch**: 42×24, knob 18px; off-track `#22302B` (dark themes).
- **Slider (stake)**: 6px track `--field`, gradient fill, 20px white knob with 4px mint ring.
- **Filter chips**: 36px pill, `--surface` border `--border`; active = mint text + `--acc-dim` + `--acc-bd`.
- **Featured cards**: gradient wash `linear-gradient(140deg, rgba(44,224,163,.12), rgba(53,199,232,.06))`
  + `--acc-bd` border (stake benefits, featured farm, vote card, unclaimed-fees hero).
- **Wallet modal**: fixed overlay `rgba(3,8,6,.66)` + `backdrop-filter:blur(7px)`;
  modal 400px, `#0B1411`, radius 24px, triple shadow incl. faint mint halo; wallet rows 12px radius 16px
  (MetaMask 🦊 "Detected" badge · WalletConnect · Coinbase · Rabby) + ToS micro-copy + help footer link.

---

## 4 · PAGE INVENTORY (9 frames — DONE, in `download/delta-aurora-final/`)

| # | File | Content highlights |
|---|---|---|
| 00 | 00-overview.png | 3×3 contact sheet of all frames |
| 01 | 01-landing.png | hero "Trade like it's **yours.**" (gradient word) + swap widget + 2 floating chips + 4 stats + 3 features + footer |
| 02 | 02-dashboard.png | Overview: big balance $48,265.90 + sparkline + range tabs, 4 action pills, positions table (4 rows), Top movers, network strip, Pro tools bar |
| 03 | 03-swap.png | swap widget + Best-route card (2 hops + price impact/min received/gas) · DELTA/ETH area chart w/ price label + OHLC row + tabs · Recent swaps list |
| 04 | 04-pools.png | filter chips + search, 4 stats, 7-column pool table (5 pools, APR + fee source), pagination · Your LP positions, Unclaimed fees hero ($412.66), fee-tier cells |
| 05 | 05-stake.png | veDELTA lock widget (amount 5,000 + duration slider "2 years" + estimate 2,500 veDELTA ×0.50) · Your lock (4,120 veDELTA, decay bar 68%), Lock benefits (fee share $128.40, boost +12.4%, governance) |
| 06 | 06-farm.png | 4 stats, featured DELTA/ETH farm (APR 51.0% incl. boost, Harvest), 3 farm cards (ETH/USDC, DELTA/USDC boosted, WBTC/ETH) |
| 07 | 07-bridge.png | Transfer widget (Delta Chain → Ethereum, 2,500 DELTA, ≈3 min, fee 0.10%, min received) · Recent transfers (Completed/Pending chips), Supported chains (Δ Δelta Chain, Ξ Ethereum, ◈ Arbitrum) |
| 08 | 08-governance.png | 4 stats (2.41M veDELTA, 38.2% participation), 3 proposals (P-47 active 68.4% for, P-46 active, P-45 passed) with For/Against bars + quorum · NOW VOTING P-47 vote card (For/Against), recent outcomes, delegation |
| 09 | 09-wallet-connect.png | dimmed dashboard behind blur overlay + Connect-a-wallet modal |

Consistent data story across frames: DELTA $0.4218 (+12.4%) · TVL $128.4M · 24h vol $18.2M ·
gas 14 gwei · user wallet 0x7A3f…F9C2 · 18,290 DELTA in wallet · 4,120 veDELTA locked (21,700 DELTA, 2y).

---

## 5 · REMAINING WORK (next step)

1. **Cover page for the use-case document** (per user request): technical faculty (پردیس فنی مهندسی),
   Computer Engineering group, project title "Delta DEX — شرح موارد کاربری", student name
   **آرمان جعفری نعیمی**, placeholders for استاد / درس / سال تحصیلی. Deliver as **PDF A4 + PNG**,
   styled in the Aurora theme (dark, mint/cyan, Space Grotesk for Latin, proper Persian font for
   Farsi text — e.g. Noto Sans/ Serif SC is wrong; use a Persian-capable font or keep cover bilingual
   with English "Delta DEX" dominant). Page-break rule: cover is its own page.
2. If new pages are ever needed, follow the system above and re-render with gen.py.

---

## 6 · RENDER PIPELINE (exact, reproducible)

```
scripts/delta-final/
├── base.css        shared layout + components (all colors via var(--…))
├── themes.css      t-aurora tokens + shared page scaffolding (.tbl-head/.net-row)
├── landing.html · dashboard.html · swap.html · pools.html · stake.html ·
│   farm.html · bridge.html · governance.html · wallet.html      (templates, {{THEME}})
├── gen.py          expands templates → screenshots 1440×900 @2x (clip) → checks
│                   body.scrollHeight ≤ 900 → builds 00-overview.png (PIL, 3×3)
├── fetch_fonts.sh  downloads Space Grotesk / IBM Plex Mono / Inter TTFs
└── fix_sg.py       fixes Space Grotesk family names (fontTools)
Output: download/delta-aurora-final/*.png
```

Screenshot recipe (Playwright): viewport 1440×900, `device_scale_factor=2`,
`page.goto(file://…)`, wait 140ms + `document.fonts.ready` + 220ms, clip 0,0,1440,900.
**Overflow rule:** every frame must fit 900px — compress paddings, never let content clip.

### Environment notes (things that bit before)
- Fonts: install as TTF + `fc-cache -f`; verify with `fc-match "Space Grotesk"`.
- PIL contact sheet: use hex colors (PIL rejects `rgba()` in default mode).
- Emoji (🦊 MetaMask) renders fine in Chromium headless via system emoji font.
- Landing `fc-2` chip must stay at `top:148px; left:-52px` (it covered the route row otherwise).
- The `ticker`/`sticker`/`f-idx`/`wavy` features are globally hidden for Aurora (`body .ticker,… {display:none}` in themes.css).
