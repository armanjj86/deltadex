import type { Locale } from '@/i18n/config';
import { PhasePlaceholder } from '@/components/common/PhasePlaceholder';

/** Route /governance — real UI lands in a later phase (see ARCHITECTURE.md §7). */
export default function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  return <PhasePlaceholder section="Governance" params={params} />;
}
