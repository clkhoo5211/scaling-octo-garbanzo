import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { ManifestLink } from "@/components/ManifestLink";
import { CookieConsentBanner } from "@/components/compliance";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import dynamic from "next/dynamic";

// Lazy load heavy components for better performance
const BottomNavLazy = dynamic(() => import("@/components/layout/BottomNav").then(mod => ({ default: mod.BottomNav })), {
  ssr: false,
  loading: () => null,
});

// Calculate basePath for manifest (same logic as next.config.js)
const basePath = process.env.GITHUB_REPOSITORY_NAME
  ? `/${process.env.GITHUB_REPOSITORY_NAME}`
  : "";

export const metadata: Metadata = {
  title: "Web3News - Decentralized News Aggregation",
  description: "Decentralized news aggregation with crypto-powered rewards",
  // CRITICAL: Don't set manifest in metadata - it doesn't handle basePath correctly for static export
  // ManifestLink component will inject it client-side with correct basePath
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Web3News",
  },
  icons: {
    icon: `${basePath}/favicon.ico`,
    apple: `${basePath}/apple-icon.png`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ManifestLink />
        <Providers>
          <Header />
          <main className="min-h-screen pb-16 md:pb-0 bg-gray-100">{children}</main>
          <BottomNavLazy />
          <ServiceWorkerRegistration />
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  );
}
