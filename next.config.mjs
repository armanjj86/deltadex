import createNextIntlPlugin from 'next-intl/plugin';

// next-intl reads src/i18n/request.ts by default. Middleware (locale detection /
// redirect for the bare "/" route) is intentionally NOT added until Phase 2.
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep the prototype self-contained: no remote image hosts, no external APIs.
  images: { unoptimized: true },
};

export default withNextIntl(nextConfig);
