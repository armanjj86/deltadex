/**
 * Every user-mutated state in the prototype is persisted under the `dd.v1.` prefix (see
 * ARCHITECTURE.md §6). The footer's "Reset demo" button uses these helpers so the presenter
 * can start a clean demo in one click without devtools.
 */
export const DEMO_STORAGE_PREFIX = 'dd.v1.';

function storage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export function listDemoKeys(): string[] {
  const s = storage();
  if (!s) return [];
  const keys: string[] = [];
  for (let i = 0; i < s.length; i += 1) {
    const key = s.key(i);
    if (key?.startsWith(DEMO_STORAGE_PREFIX)) keys.push(key);
  }
  return keys;
}

/** Removes every dd.v1.* key and reloads, so stores re-seed from the mock data. */
export function resetDemoData(): void {
  const s = storage();
  if (!s) return;
  for (const key of listDemoKeys()) s.removeItem(key);
  window.location.reload();
}
