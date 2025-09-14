/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    transpilePackages: [],
  },
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;