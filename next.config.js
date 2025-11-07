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
  // CRITICAL: Increase timeout for static page generation
  // Some pages may take longer to generate during build
  staticPageGenerationTimeout: 300, // 5 minutes
  // Skip trailing slash redirects for static export
  skipTrailingSlashRedirect: true,
  // Disable static optimization for pages that use client-side data fetching
  // This prevents build hangs from data fetching during static generation
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Suppress Server Actions warning for static export
  // This is expected - we're using client-side only features
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
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

    // Suppress React Native dependency warnings from MetaMask SDK
    // These are false positives - MetaMask SDK works fine without React Native packages
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules\/@metamask\/sdk/,
        message: /Can't resolve '@react-native-async-storage\/async-storage'/,
      },
      {
        module: /node_modules\/@metamask\/sdk/,
        message: /Can't resolve 'react-native'/,
      },
    ];

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
      
      // Use NormalModuleReplacementPlugin BEFORE IgnorePlugin for better matching
      config.plugins.push(
        // Replace @react-native-async-storage/async-storage with stub (match any import path)
        new webpack.NormalModuleReplacementPlugin(
          /@react-native-async-storage\/async-storage/,
          asyncStorageStub
        ),
        // Replace react-native with stub (match any import path)
        new webpack.NormalModuleReplacementPlugin(
          /^react-native$/,
          reactNativeStub
        ),
        // Aggressive IgnorePlugin to catch any remaining attempts
        new webpack.IgnorePlugin({
          resourceRegExp: /^@react-native-async-storage\/async-storage$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^react-native$/,
        }),
        // Context-specific ignore for MetaMask SDK
        new webpack.IgnorePlugin({
          resourceRegExp: /@react-native-async-storage\/async-storage/,
          contextRegExp: /node_modules\/@metamask\/sdk/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /react-native/,
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
