import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// Get base path from environment variable (for GitHub Pages)
// Format: /repository-name (e.g., /scaling-octo-garbanzo)
const basePath = process.env.VITE_BASE_PATH || '/';

// https://vitejs.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [
    react(),
      VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-icon.png', 'icon-192x192.png', 'icon-512x512.png'],
      manifest: {
        name: 'Web3News - Decentralized News Aggregation',
        short_name: 'Web3News',
        description: 'Decentralized news aggregation with crypto-powered rewards',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        // CRITICAL: start_url must match scope (both should have trailing slash for non-root paths)
        start_url: basePath && basePath !== '/' && !basePath.endsWith('/') ? `${basePath}/` : basePath,
        // CRITICAL: Service worker scope must end with trailing slash
        scope: basePath && !basePath.endsWith('/') ? `${basePath}/` : (basePath || '/'),
        icons: [
          {
            src: `${basePath && !basePath.endsWith('/') ? `${basePath}/` : basePath}icon-192x192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: `${basePath && !basePath.endsWith('/') ? `${basePath}/` : basePath}icon-512x512.png`,
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

