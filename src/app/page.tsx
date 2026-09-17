import { redirect } from 'next/navigation';

/**
 * Bare "/" while Phase 0 has no landing page. Phase 2 replaces this with the
 * next-intl middleware (locale detection) and Phase 4 with the real landing page.
 */
export default function RootPage() {
  redirect('/en');
}
