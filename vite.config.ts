import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// Get base path from environment variable (for GitHub Pages)
// Format: /repository-name (e.g., /scaling-octo-garbanzo)
const basePath = process.env.VITE_BASE_PATH || '/';

// Plugin to remove vite-plugin-pwa's manifest link injection (we use ManifestLink component instead)
// Must run AFTER vite-plugin-pwa to remove its injected manifest link
const removeManifestLinkPlugin = () => ({
  name: 'remove-manifest-link',
  enforce: 'post' as const, // Run after other plugins
  writeBundle(options: any, bundle: any) {
    // After build, modify index.html to remove vite-plugin-pwa's manifest link
    if (options.dir && bundle['index.html']) {
      const fs = require('fs');
      const path = require('path');
      const indexPath = path.join(options.dir, 'index.html');
      if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf-8');
        // Remove vite-plugin-pwa's injected manifest link
        html = html.replace(/<link[^>]*rel=["']manifest["'][^>]*>/gi, '');
        fs.writeFileSync(indexPath, html, 'utf-8');
      }
    }
  },
  transformIndexHtml: {
    enforce: 'post',
    transform(html: string) {
      // Remove vite-plugin-pwa's injected manifest link (we inject it dynamically via ManifestLink component)
      return html.replace(/<link[^>]*rel=["']manifest["'][^>]*>/gi, '');
    },
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [
    react(),
      VitePWA({
      registerType: 'autoUpdate',
      // CRITICAL: Disable auto-registration - we use custom ServiceWorkerRegistration component
      // This allows us to handle basePath correctly for GitHub Pages
      injectRegister: false,
      // Explicitly set service worker filename
      filename: 'sw.js',
      // Ensure service worker is generated even with injectRegister: false
      strategies: 'generateSW',
      // CRITICAL: Use manifestFilename to ensure manifest is generated but don't inject link
      // We'll inject the link manually via ManifestLink component with correct basePath
      manifestFilename: 'manifest.webmanifest',
      includeAssets: ['favicon.ico', 'apple-icon.png', 'icon-192x192.png', 'icon-512x512.png'],
      manifest: {
        name: 'Web3News - Decentralized News Aggregation',
        short_name: 'Web3News',
        description: 'Decentralized news aggregation with crypto-powered rewards',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        // CRITICAL: Use relative paths like Next.js project - works with any basePath
        start_url: '.',
        scope: '.',
        icons: [
          {
            src: './icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: './icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
    removeManifestLinkPlugin(), // Run AFTER vite-plugin-pwa to remove its injected manifest link
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/config': path.resolve(__dirname, './config'),
      '@/context': path.resolve(__dirname, './context'),
      buffer: 'buffer',
      // Fix dayjs locale imports
      'dayjs/locale': 'dayjs/esm/locale',
    },
    dedupe: ['@reown/appkit', '@reown/appkit-adapter-wagmi', 'dayjs'],
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'reown': ['@reown/appkit', '@reown/appkit-adapter-wagmi'],
          'web3': ['wagmi', 'viem'],
          'clerk': ['@clerk/clerk-react'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['buffer', 'dayjs', '@reown/appkit-adapter-wagmi'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        {
          name: 'dayjs-locale-fix',
          setup(build) {
            // Handle dayjs locale imports
            build.onResolve({ filter: /dayjs\/locale/ }, () => {
              return { external: false };
            });
          },
        },
      ],
    },
  },
});

