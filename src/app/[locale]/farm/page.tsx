import type { Locale } from '@/i18n/routing';
import { PhasePlaceholder } from '@/components/common/PhasePlaceholder';

/** Route /farm — real UI lands in a later phase (see ARCHITECTURE.md §7). */
export default function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  return <PhasePlaceholder section="Farm" params={params} />;
}
