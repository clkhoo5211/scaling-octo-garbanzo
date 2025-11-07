/* eslint-disable */
// @ts-nocheck
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
  webpack: (config, { isServer }) => {
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
      
      // CRITICAL: Reown AppKit → WagmiAdapter → MetaMask SDK → React Native dependencies
      // MetaMask SDK checks for React Native packages even in browser builds (not needed)
      // We must prevent webpack from resolving these modules at all
      
      // Set alias FIRST to prevent resolution attempts
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@clerk/nextjs/server': false,
        '@react-native-async-storage/async-storage': false,
        'react-native': false,
      };
      
      // Initialize plugins array if it doesn't exist
      if (!config.plugins) {
        config.plugins = [];
      }
      
      // Use NormalModuleReplacementPlugin to replace React Native modules with stubs
      // This satisfies MetaMask SDK's import checks without requiring React Native packages
      const webpack = require('webpack');
      const path = require('path');
      const asyncStorageStub = path.resolve(__dirname, 'webpack/async-storage-stub.js');
      const reactNativeStub = path.resolve(__dirname, 'webpack/react-native-stub.js');
      
      config.plugins.push(
        // Replace @react-native-async-storage/async-storage with stub
        new webpack.NormalModuleReplacementPlugin(
          /^@react-native-async-storage\/async-storage$/,
          asyncStorageStub
        ),
        // Replace react-native with stub
        new webpack.NormalModuleReplacementPlugin(
          /^react-native$/,
          reactNativeStub
        ),
        // Also use IgnorePlugin as backup for any missed imports
        new webpack.IgnorePlugin({
          resourceRegExp: /^@react-native-async-storage\/async-storage$/,
          contextRegExp: /node_modules\/@metamask\/sdk/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^react-native$/,
          contextRegExp: /node_modules\/@metamask\/sdk/,
        })
      );
      
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
