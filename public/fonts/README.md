# Fonts (self-hosted — never a CDN)

Every font file the prototype uses lives here and is committed, so the demo works
offline and on the university projector.

| Folder | Family | Weights | Source |
|---|---|---|---|
| `space-grotesk/` | Space Grotesk (`--font-en`) | 400/500/600/700 | `@fontsource/space-grotesk` (OFL) |
| `ibm-plex-mono/` | IBM Plex Mono (`--font-num`) | 400/500/600/700 | `@fontsource/ibm-plex-mono` (OFL) |
| **`ray/`** | **Ray** — Persian brand face (`--font-fa`, first choice) | Light 300 · Medium 500 · Bold 700 · ExtraBold 800 · Black 900 · ExtraBlack 950 | supplied by the author (TTF) |
| `vazirmatn/` | Vazirmatn — Persian fallback | 100/500/700 | `@fontsource/vazirmatn` (OFL) |

## How it is wired

- Latin faces are loaded by `next/font/local` (`src/lib/fonts.ts`) → CSS variables
  `--font-space-grotesk`, `--font-ibm-plex-mono`.
- Ray + Vazirmatn are static `@font-face` rules (`src/styles/ray.css`,
  `src/styles/vazirmatn.css`) imported from `src/styles/globals.css`.
- `src/styles/fonts.css` defines the contract: `--font-en`, `--font-num`, `--font-fa`
  (`'Ray', 'Vazirmatn', …`).
- **To switch Persian text back to Vazirmatn** (or to Ray), edit ONE line: `--font-fa`
  in `src/styles/fonts.css`. No component changes.
- Ray's TTF files each carry their own family name ("Ray Light", "Ray Bold", …);
  `ray.css` re-declares them all under the single family `Ray`, so `font-weight: 800`
  on a heading uses the real ExtraBold file instead of a synthesized bold.
- Ray ships no italic; `font-synthesis-weight: none` keeps weights honest.

The three generated folders (`space-grotesk/`, `ibm-plex-mono/`, `vazirmatn/`) are
refreshed with `npm run fonts:sync` (also run automatically on `npm install`).
`ray/` is manual and is never touched by that script.
