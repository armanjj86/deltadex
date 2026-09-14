# DELTA DEX 🌌

A decentralized exchange (DEX) prototype — a university bachelor's project in Computer Engineering.
Multi-chain trading, liquidity pools, veDELTA staking, yield farms, cross-chain bridge,
governance, and portfolio — simulated end-to-end with realistic mock data.

**This is a PROTOTYPE.** All blockchain interactions are simulated (mock transaction service).
No real funds, no live contracts. Built to demonstrate complete UX flows for an academic defense.

---

## 📁 Repository structure

```
├── docs/
│   ├── use-cases/          ← The use-case specification (32 use cases, 9 chapters, in Persian)
│   ├── design/
│   │   ├── aurora-theme.md ← Complete design system (colors, typography, components)
│   │   └── glossary.md     ← Persian ↔ English terminology glossary (locked translations)
│   └── assets/logo/        ← Delta brand marks (dark + light)
├── design-frames/          ← 9 rendered UI frames (PNG) — visual reference
└── app/                    ← The prototype source code (Next.js + TypeScript + Tailwind)
```

## 📚 Documentation

- **Use-Case Specification** — the single source of truth for all product behavior (`docs/use-cases/`)
- **Aurora Design System** — all visual tokens and component specs (`docs/design/aurora-theme.md`)
- **Glossary** — locked EN↔FA terminology; all Farsi UI text must follow it (`docs/design/glossary.md`)

## 🛠 Tech stack (app)

Next.js (App Router) · TypeScript · Tailwind CSS · zustand · next-intl (EN/FA, RTL)

## ▶️ Running the prototype (after implementation)

```bash
cd app
npm install
npm run dev
```

---

**Author:** Arman Jafari Naeimi — Computer Engineering, Yazd University
**Project:** Bachelor's degree use-case specification + interactive prototype
