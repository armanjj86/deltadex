/**
 * `npm run i18n:check` — dictionary drift guard (added after a Phase 2 QA bug).
 *
 * 1. Structural parity: `en.json` and `fa.json` must contain exactly the same key paths. A key that
 *    exists in one language only renders as the literal key name in the other one (next-intl does not
 *    throw), which is how `gallery.faSample` briefly shipped as text on the Farsi gallery.
 * 2. Orphan scan: every leaf string that looks like a code identifier (`foo.barBaz`) inside a
 *    sentence is flagged — that pattern is what a leaked key looks like once rendered.
 * 3. Namespace misuse: `t('a.b')` on a translator bound to namespace `x` resolves `x.a.b`, NOT the
 *    top-level `a.b` — a real Phase 2 bug (`t('fonts:faSample')` on a gallery-namespace `t`).
 * 4. ICU guard: literal `{`/`}` must be escaped, otherwise the message throws INVALID_ARGUMENT_TYPE.
 *
 * Exits 1 on any drift so it can gate a demo build.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const load = (loc) => JSON.parse(readFileSync(join(ROOT, 'src/i18n/dictionaries', `${loc}.json`), 'utf8'));
const en = load('en');
const fa = load('fa');

const paths = (node, prefix = '', out = []) => {
  for (const [k, v] of Object.entries(node)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') paths(v, p, out);
    else out.push(p);
  }
  return out;
};
const enPaths = new Set(paths(en));
const faPaths = new Set(paths(fa));

const problems = [];
for (const p of enPaths) if (!faPaths.has(p)) problems.push(`only in en.json: ${p}`);
for (const p of faPaths) if (!enPaths.has(p)) problems.push(`only in fa.json: ${p}`);

const IDISH = /\b[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]+\b/; // `foo.bar` — smells like a leaked key
const checkStrings = (dict, loc) => {
  const walk = (node, prefix) => {
    for (const [k, v] of Object.entries(node)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object') walk(v, p);
      else if (typeof v === 'string') {
        if (/([^']|^)(\\{|\\\\})|(?<!')\{/.test(v) && !/'\{/.test(v)) {
          problems.push(`${loc}: ${p} has an unescaped "{" (ICU) — write '{'}' or remove it`);
        }
        if (IDISH.test(v) && !/^(0x|[a-f0-9]{4})/.test(v) && !/\.(js|ts|json|com|dev|io|md)\b/.test(v) && !/next-intl|tailwindcss|lucide-react|zustand|\.mjs|\.css/.test(v)) {
          problems.push(`${loc}: ${p} looks like a leaked key: "${v.slice(0, 60)}"`);
        }
      }
    }
  };
  walk(dict, '');
};
checkStrings(en, 'en');
checkStrings(fa, 'fa');

// --- namespace misuse: `t('a.b')` where t is bound to a namespace that has no `a` ---
import { readdirSync, statSync } from 'node:fs';
const files = [];
(() => {
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if(/\.tsx?$/.test(full)) files.push(full);
    }
  };
  walk(join(ROOT, 'src'));
})();
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  if (!/Translations\(/.test(src)) continue;
  const rel = file.slice(ROOT.length + 1);
  const nsByAlias = new Map();
  for (const m of src.matchAll(/(?:const|let)\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:await\s+)?useTranslations\(\s*'([a-zA-Z0-9_]+)'\s*\)/g)) {
    nsByAlias.set(m[1], m[2]);
  }
  for (const m of src.matchAll(/(?:const|let)\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:await\s+)?getTranslations\(\s*\{[^}]*namespace:\s*'([a-zA-Z0-9_]+)'/g)) {
    nsByAlias.set(m[1], m[2]);
  }
  for (const [alias, ns] of nsByAlias) {
    for (const m of src.matchAll(new RegExp(`\\b${alias}\\(\\s*'([a-zA-Z0-9_]+)\\.([a-zA-Z0-9_.]+)'`, 'g'))) {
      const dotted = `${m[1]}.${m[2]}`;
      let node = dicts.en[ns];
      for (const part of dotted.split('.')) node = node?.[part];
      if (node === undefined) {
        // only warn when the key DOES exist at top level — that is the classic wrong-namespace slip
        let root = dicts.en;
        for (const part of dotted.split('.')) root = root?.[part];
        if (root !== undefined) {
          problems.push(`${rel}: ${alias}('${dotted}') is bound to namespace '${ns}' → resolves as '${ns}.${dotted}'. Use \`${alias}('${dotted.split('.').join(':')}')\` only for cross-namespace lookups on the ROOT translator, or add a dedicated translator.`);
        } else {
          problems.push(`${rel}: '${ns}.${dotted}' does not exist in en.json`);
        }
      }
    }
  }
}

if (problems.length) {
  console.error(`\n✖ i18n drift (${problems.length}):\n  ` + [...new Set(problems)].join('\n  '));
  process.exit(1);
}
console.log(`✔ dictionaries in sync — ${enPaths.size} keys in both en.json and fa.json`);
