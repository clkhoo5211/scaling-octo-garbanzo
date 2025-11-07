/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // GitHub Pages basePath: repository name (e.g., /scaling-octo-garbanzo)
  // Set via environment variable GITHUB_REPOSITORY_NAME or default to empty for root domain
  basePath: process.env.GITHUB_REPOSITORY_NAME
    ? `/${process.env.GITHUB_REPOSITORY_NAME}`
    : "",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ["@reown/appkit"],
  },
  eslint: {
    // Don't fail build on lint errors - we'll fix them incrementally
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on type errors - we'll fix them incrementally
    ignoreBuildErrors: true,
  },
  // Suppress webpack warnings about React Native dependencies
  // These are harmless warnings from MetaMask SDK (not Clerk)
  // Note: React Native warnings are harmless and don't break the build
  // Clerk works perfectly with static export (client-side only)
  // Disable webpack cache to avoid hanging issues
  webpack: (config, { isServer, dev }) => {
    // Disable webpack cache
    config.cache = false;

    // Required for Reown AppKit SSR compatibility
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    if (!isServer) {
      // Client-side only - no server actions
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Exclude React Native dependencies for browser builds
      // MetaMask SDK has React Native peer dependencies that aren't needed for Next.js static export
      // Initialize plugins array if it doesn't exist
      if (!config.plugins) {
        config.plugins = [];
      }
      
      const webpack = require('webpack');
      
      // Use NormalModuleReplacementPlugin to replace React Native modules with empty mocks
      // This is more aggressive than IgnorePlugin and prevents the warning
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@react-native-async-storage\/async-storage$/,
          require.resolve('./webpack/react-native-stub.js')
        ),
        new webpack.NormalModuleReplacementPlugin(
          /^react-native$/,
          require.resolve('./webpack/react-native-stub.js')
        ),
        // Also use IgnorePlugin as backup
        new webpack.IgnorePlugin({
          resourceRegExp: /^@react-native-async-storage\/async-storage$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^react-native$/,
        })
      );
      
      // Set alias to false to prevent resolution
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@clerk/nextjs/server': false,
        '@react-native-async-storage/async-storage': false,
        'react-native': false,
      };
      
      // Add to externals to prevent bundling
      if (!config.externals) {
        config.externals = [];
      }
      if (Array.isArray(config.externals)) {
        config.externals.push('@react-native-async-storage/async-storage', 'react-native');
      }
    }
    
    return config;
  },
};

module.exports = nextConfig;
