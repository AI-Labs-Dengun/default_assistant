/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  webpack: (config, { isServer }) => {
    // Otimizações do webpack
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
};

module.exports = nextConfig; 