import { useEffect, useState } from 'react';

/**
 * Hydration guard for persisted stores. `useSyncExternalStore`-based zustand + localStorage can
 * briefly render the seed value on the server pass and the stored value on the client pass; every
 * persisted widget mounts its real content only after this flips, which removes the flash without
 * ever showing a loading screen.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
