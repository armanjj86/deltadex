#!/usr/bin/env node
/**
 * sync-fonts.mjs — regenerate the self-hosted font assets used by the Aurora theme.
 *
 * The prototype must never load fonts from a CDN, so every woff2 file is committed
 * under public/fonts/. This script re-copies them from the (MIT/OFL licensed)
 * @fontsource packages listed in devDependencies. It is wired to `npm run prepare`
 * so a fresh `npm install` also refreshes the files, and to `npm run fonts:sync`
 * when a font subset needs to change.
 *
 * Ray (the user's own Persian brand font) is NOT handled here: it is added manually
 * to public/fonts/ray/ — see public/fonts/README.md.
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** family -> list of { src (file inside the fontsource package), out (public/fonts path) } */
const FAMILIES = [
  {
    pkg: '@fontsource/space-grotesk',
    dir: 'space-grotesk',
    weights: [400, 500, 600, 700],
    subsets: ['latin'],
  },
  {
    pkg: '@fontsource/ibm-plex-mono',
    dir: 'ibm-plex-mono',
    weights: [400, 500, 600, 700],
    subsets: ['latin'],
  },
  {
    // Persian UI font (default until Ray is installed, then it stays as fallback).
    pkg: '@fontsource/vazirmatn',
    dir: 'vazirmatn',
    weights: [100, 500, 700],
    subsets: ['arabic', 'latin'],
  },
];

let copied = 0;

for (const family of FAMILIES) {
  let pkgDir;
  try {
    pkgDir = dirname(require.resolve(`${family.pkg}/package.json`));
  } catch {
    console.warn(`[fonts] ${family.pkg} is not installed — skipping.`);
    continue;
  }

  const outDir = join(root, 'public', 'fonts', family.dir);
  mkdirSync(outDir, { recursive: true });

  for (const weight of family.weights) {
    for (const subset of family.subsets) {
      const file = `${family.dir}-${subset}-${weight}-normal.woff2`;
      const from = join(pkgDir, 'files', file);
      if (!existsSync(from)) {
        console.warn(`[fonts] missing ${file} in ${family.pkg}`);
        continue;
      }
      cpSync(from, join(outDir, file));
      copied += 1;
    }
  }
}

console.log(`[fonts] ${copied} woff2 files in public/fonts (Ray: manual, see public/fonts/README.md).`);
