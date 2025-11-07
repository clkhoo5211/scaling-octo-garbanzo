import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pages basePath: repository name (e.g., /scaling-octo-garbanzo)
  // Set via environment variable GITHUB_REPOSITORY_NAME or default to empty for root domain
  basePath: process.env.GITHUB_REPOSITORY_NAME ? `/${process.env.GITHUB_REPOSITORY_NAME}` : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['@reown/appkit', '@clerk/nextjs'],
  },
};

export default nextConfig;

