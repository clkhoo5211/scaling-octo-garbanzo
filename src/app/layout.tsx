import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Web3News - Decentralized News Aggregation',
  description: 'Decentralized news aggregation with crypto-powered rewards',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Web3News',
  },
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen pb-16 md:pb-0">
            {children}
          </main>
          <BottomNav />
          <ServiceWorkerRegistration />
        </Providers>
      </body>
    </html>
  );
}

