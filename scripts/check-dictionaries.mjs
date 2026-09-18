/**
 * `npm run i18n:check` — dictionary drift guard (added after a Phase 2 QA bug).
 *
 * 1. Structural parity: `en.json` and `fa.json` must contain exactly the same key paths. A key that
 *    exists in one language only renders as the literal key name in the other one (next-intl does not
 *    throw), which is how `gallery.faSample` briefly shipped as text on the Farsi gallery.
 * 2. Orphan scan: every leaf string that looks like a code identifier (`foo.barBaz`) inside a
 *    sentence is flagged — that pattern is what a leaked key looks like once rendered.
 * 3. ICU guard: literal `{`/`}` must be escaped, otherwise the message throws INVALID_ARGUMENT_TYPE.
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

if (problems.length) {
  console.error(`\n✖ i18n drift (${problems.length}):\n  ` + [...new Set(problems)].join('\n  '));
  process.exit(1);
}
console.log(`✔ dictionaries in sync — ${enPaths.size} keys in both en.json and fa.json`);
