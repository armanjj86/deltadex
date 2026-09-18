import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

/**
 * zustand + localStorage conventions (ARCHITECTURE.md §6): every key is prefixed `dd.v1.`, every
 * store carries `version: 1`, and an unreadable/legacy payload falls back to the seed instead of
 * crashing — a broken demo screen is the one outcome we never accept.
 */
export const DD_PREFIX = 'dd.v1.';

const memory = new Map<string, string>();

const safeStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return memory.get(name) ?? null;
    try {
      return window.localStorage.getItem(name);
    } catch {
      return memory.get(name) ?? null; // private mode / blocked storage
    }
  },
  setItem: (name, value) => {
    memory.set(name, value);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* quota or blocked storage: in-memory copy keeps the session alive */
    }
  },
  removeItem: (name) => {
    memory.delete(name);
    try {
      window.localStorage?.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const ddStorage = createJSONStorage(() => safeStorage);

/** `persist(..., ddPersist('balances'))` → key `dd.v1.balances`. */
export function ddPersist(name: string) {
  return { name: DD_PREFIX + name, version: 1, storage: ddStorage };
}
