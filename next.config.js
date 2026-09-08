/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep this minimal on purpose: single-page prototype, no image domains,
  // no rewrites/redirects needed since there is only one public route (/review).
};

module.exports = nextConfig;
