import createNextIntlPlugin from 'next-intl/plugin';
import { execSync } from 'node:child_process';

// next-intl reads src/i18n/request.ts by default. Middleware (locale detection /
// redirect for the bare "/" route) is intentionally NOT added until Phase 2.
const withNextIntl = createNextIntlPlugin();

/**
 * Build stamp (added in Phase 3 QA). The footer renders it, so it is possible to tell in ONE
 * glance whether the folder being viewed contains the newest code — a stale checkout or a stale
 * `.next` cache was mistaken for "the wallet changes were never made". If the stamp does not match
 * the phase you were told to review, `git pull` did not land in this folder.
 *
 * `git` is optional (a zip download has no .git): fall back to the marker in
 * `src/lib/build-stamp.ts`, which is bumped in the same commit as any visible change.
 */
const gitShort = (() => {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'unknown';
  }
})();

const gitDirty = (() => {
  try {
    return execSync('git status --porcelain', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
      ? 'modified'
      : 'clean';
  } catch {
    return 'unknown';
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep the prototype self-contained: no remote image hosts, no external APIs.
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BUILD_SHA: gitShort,
    NEXT_PUBLIC_BUILD_STATE: gitDirty,
  },
};

export default withNextIntl(nextConfig);
