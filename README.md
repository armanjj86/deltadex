# DELTA DEX 🌌

A decentralized exchange (DEX) prototype — a university project (Bachelor's, Computer Engineering).
Multi-chain trading, liquidity pools, veDELTA staking, yield farms, cross-chain bridge,
governance, and portfolio — simulated end-to-end with realistic mock data, in English and Persian (RTL).

**This is a PROTOTYPE.** All blockchain interactions are simulated (mock transaction service).
No real funds, no live contracts, no external APIs. Built to demonstrate complete UX flows for an
academic defense.

---

## ▶️ Running it (local, Chrome/Firefox with MetaMask optional)

```bash
npm install     # Node 20+ ; fonts are copied into public/fonts automatically
npm run dev     # http://localhost:3000  →  /en  (default) and /fa
```

Other scripts: `npm run build` (must pass before the demo), `npm start` (production-mode preview),
`npm run lint`, `npm run typecheck`, `npm run fonts:sync`.

State lives in `localStorage` (keys `dd.v1.*`), so a refresh mid-demo never wipes a swap,
stake, lock or vote. "Reset demo" (added in a later phase) clears it.

---

## 📁 Repository structure

```
├── docs/
│   ├── use-cases/            ← the specification: 32 use cases, 9 chapters + intro (Persian)
│   │   ├── ch00-intro.md         introduction & 8 product features
│   │   └── ch01-wallet.md … ch09-security.md
│   ├── design/
│   │   ├── AURORA-DESIGN-PROMPT.md  ← complete design system (colors, type, components)
│   │   └── glossary.md              locked Persian ↔ English terminology
│   └── assests/              ← Delta brand marks (dark + light) [also copied to public/brand/]
├── design-frames/            ← 9 rendered UI frames (PNG, 1440×900@2x) — visual reference
├── src/                      ← the prototype source (Next.js + TypeScript + Tailwind)
├── public/fonts/             ← self-hosted fonts (Space Grotesk, IBM Plex Mono, Vazirmatn, Ray)
├── scripts/                  ← sync-fonts.mjs
└── ARCHITECTURE.md           ← ⭐ shared contracts: service layer, data shapes, i18n/RTL, phases
```

## 📚 Which document decides what

| Question | Authority |
|---|---|
| What must the product *do* (flows, states, messages)? | `docs/use-cases/*` — the source of truth |
| How must the code be *organized* (contracts, folders, layers)? | `ARCHITECTURE.md` |
| How must it *look* (tokens, components, layout)? | `docs/design/AURORA-DESIGN-PROMPT.md` + `design-frames/*.png` |
| How must it *read* in Farsi? | `docs/design/glossary.md` |

## 🛠 Tech stack (app)

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS 3 · zustand · next-intl (EN/FA, RTL).
Service-layer abstraction: the UI only calls `tx` (`src/services/transaction/binding.ts`); the
mock implementation can later be replaced by an on-chain one without touching a component.

---

**Author:** Arman Jafari Naeimi — Computer Engineering, Yazd University
**Project:** Use-case specification + interactive prototype (bilingual, RTL)
