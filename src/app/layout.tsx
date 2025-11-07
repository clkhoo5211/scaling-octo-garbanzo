import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

const inter = Inter({ subsets: ["latin"] });

// Calculate basePath for manifest (same logic as next.config.js)
const basePath = process.env.GITHUB_REPOSITORY_NAME
  ? `/${process.env.GITHUB_REPOSITORY_NAME}`
  : "";

export const metadata: Metadata = {
  title: "Web3News - Decentralized News Aggregation",
  description: "Decentralized news aggregation with crypto-powered rewards",
  // Next.js will generate manifest.webmanifest from manifest.ts
  // The path will be automatically adjusted based on basePath
  manifest: `${basePath}/manifest.webmanifest`,
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
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen pb-16 md:pb-0">{children}</main>
          <BottomNav />
          <ServiceWorkerRegistration />
        </Providers>
      </body>
    </html>
  );
}
