import type { ReactNode } from 'react';

/**
 * Aurora background decoration (blurred orbs + diagonal band + vignette).
 * Spec: docs/design/AURORA-DESIGN-PROMPT.md §2 "Background deco layer".
 * Styles: src/styles/deco.css. Positioning uses logical properties so the
 * composition mirrors correctly in RTL.
 */
export function Deco(): ReactNode {
  return (
    <div className="deco" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="band" />
      <div className="vignette" />
    </div>
  );
}
