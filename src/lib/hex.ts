/** Deterministic-enough hex helpers for the prototype (mock hashes, demo addresses). */

const HEX = '0123456789aBcDef'.split('');

/** Simple xorshift PRNG so a given seed always yields the same "hash" (stable screenshots). */
function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0xffffffff;
  };
}

export function hexString(length: number, seed = Date.now()): string {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < length; i += 1) out += HEX[Math.floor(rand() * HEX.length)];
  return out;
}

export const mockTxHash = (seed = Date.now()): string => `0x${hexString(64, seed)}`;
export const mockAddress = (seed = Date.now()): string => `0x${hexString(40, seed)}`;

/** Mixed-case "checksum-style" rendering used for display only (never for input parsing). */
export function prettyAddress(address: string, seed = 7): string {
  const rand = rng(seed);
  const body = address
    .replace(/^0x/, '')
    .split('')
    .map((c) => (rand() > 0.5 ? c.toUpperCase() : c.toLowerCase()));
  return `0x${body.slice(0, 4).join('').toUpperCase()}${body.slice(4).join('')}`;
}
