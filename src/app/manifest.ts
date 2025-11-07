import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Web3News - Decentralized News Aggregation',
    short_name: 'Web3News',
    description: 'Decentralized news aggregation with crypto-powered rewards',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['news', 'social', 'crypto'],
    orientation: 'portrait',
    prefer_related_applications: false,
  };
}

