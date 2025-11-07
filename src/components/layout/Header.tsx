'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { WalletConnect } from '@/components/web3/WalletConnect';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-lg">W3</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Web3News</span>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Link href="/search" className="w-full">
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full h-10 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                readOnly
              />
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <WalletConnect />
            </div>
            <AuthStatus />
          </div>
        </div>
      </div>
    </header>
  );
}

