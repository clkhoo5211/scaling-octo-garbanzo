"use client";

import Link from "next/link";
import { AuthStatus } from "@/components/auth/AuthStatus";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-300 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-lg">
                W3
              </span>
            </div>
                  <span className="text-xl font-bold text-gray-900">
              Web3News
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Link href="/search" className="w-full">
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                readOnly
              />
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <AuthStatus />
          </div>
        </div>
      </div>
    </header>
  );
}
