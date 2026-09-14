# Fonts (self-hosted — never a CDN)

Every font file the prototype uses lives here and is committed, so the demo works
offline and on the university projector.

| Folder | Family | Weights | Source |
|---|---|---|---|
| `space-grotesk/` | Space Grotesk (`--font-en`) | 400/500/600/700 | `@fontsource/space-grotesk` (OFL) |
| `ibm-plex-mono/` | IBM Plex Mono (`--font-num`) | 400/500/600/700 | `@fontsource/ibm-plex-mono` (OFL) |
| `vazirmatn/` | Vazirmatn (Persian fallback) | 100/500/700 | `@fontsource/vazirmatn` (OFL) |
| `ray/` | **Ray** (Persian, brand) | Light 300 / Medium 500 / Bold 700 | user-supplied |

The three generated folders are refreshed with `npm run fonts:sync` (also run
automatically on `npm install`). `ray/` is never touched by that script.

## Adding Ray

1. Place three files here: `ray-light.ttf`, `ray-medium.ttf`, `ray-bold.ttf`
   (`.woff2` is smaller and equally fine — same base names).
2. Uncomment the `@import './ray.css';` line in `src/styles/globals.css`.
3. Done: `--font-fa` already resolves to `'Ray', 'Vazirmatn', …`, so every Persian
   string switches over at once and Vazirmatn stays as the fallback.
