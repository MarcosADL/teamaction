// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    typedRoutes: true,
  },
  // Garante build sem travar por warnings
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

module.exports = nextConfig;
