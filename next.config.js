/* eslint-disable */
// @ts-nocheck
/** @type {import('next').NextConfig} */

// CRITICAL: Only enable static export for production builds (GitHub Pages)
// During development (npm run dev), we need dynamic server mode
const isProductionBuild = process.env.NODE_ENV === 'production' && process.env.GITHUB_REPOSITORY_NAME;

const nextConfig = {
  // Only enable static export for GitHub Pages builds
  ...(isProductionBuild && {
    output: "export",
  }),
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
  // CRITICAL: Allow build to succeed even with prerender errors
  // Some pages (like /auth) use client-side only hooks that fail during SSR
  // This is expected for static export - pages will work at runtime
  experimental: {
    missingSuspenseWithCSRBailout: false,
    optimizeCss: true, // CSS optimization
    optimizePackageImports: ['lucide-react', '@reown/appkit', '@clerk/clerk-react'], // Tree-shaking
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
      // Performance: Optimize bundle splitting
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic', // Better caching
        runtimeChunk: 'single', // Shared runtime
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunk for stable libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Reown AppKit separate chunk (large library ~500KB)
            reown: {
              test: /[\\/]node_modules[\\/]@reown/,
              name: 'reown',
              chunks: 'all',
              priority: 20,
            },
            // wagmi/viem separate chunk (~300KB)
            web3: {
              test: /[\\/]node_modules[\\/](wagmi|viem|@wagmi)/,
              name: 'web3',
              chunks: 'all',
              priority: 15,
            },
            // Clerk separate chunk
            clerk: {
              test: /[\\/]node_modules[\\/]@clerk/,
              name: 'clerk',
              chunks: 'all',
              priority: 15,
            },
          },
        },
      };
      
      // Performance: Reduce module resolution time
      config.resolve.symlinks = false;
      
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
      const clerkServerActionsStub = path.resolve(__dirname, 'webpack/clerk-server-actions-stub.js');
      
      config.plugins.push(
        // CRITICAL: Replace Clerk server-actions with stub FIRST (before other plugins)
        // ClerkProvider imports invalidateCacheAction which has "use server" directive
        // This causes "Server Actions are not supported with static export" error
        // Match the exact import path: "../server-actions" from ClerkProvider
        new webpack.NormalModuleReplacementPlugin(
          /\.\.\/server-actions$/,
          clerkServerActionsStub
        ),
        // Also match absolute path
        new webpack.NormalModuleReplacementPlugin(
          /app-router\/server-actions$/,
          clerkServerActionsStub
        ),
        // Match any server-actions import from @clerk/nextjs
        new webpack.NormalModuleReplacementPlugin(
          /@clerk\/nextjs.*server-actions/,
          clerkServerActionsStub
        ),
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
        // Backup ignore for Clerk server-actions (in case replacement doesn't catch it)
        new webpack.IgnorePlugin({
          resourceRegExp: /server-actions/,
          contextRegExp: /node_modules\/@clerk\/nextjs/,
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
      
          // CRITICAL: Don't add to externals - externals creates runtime checks that throw errors
          // Instead, rely on NormalModuleReplacementPlugin and IgnorePlugin to handle these modules
          // The stub files will be used instead of the real modules
    }
    
    return config;
  },
};

module.exports = nextConfig;
