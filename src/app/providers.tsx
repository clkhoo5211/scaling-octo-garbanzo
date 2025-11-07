"use client";

import { ReactNode } from "react";
import ContextProvider from "@/context";
import { ToastProvider } from "@/components/ui/Toast";

/**
 * Providers Component
 * Wraps app with Reown AppKit + Wagmi + React Query
 * For static export, cookies will be null (SSR not available)
 */
export function Providers({ children }: { children: ReactNode }) {
  // For static export, we don't have access to cookies
  // This is fine - Wagmi will use localStorage instead
  return (
    <ContextProvider cookies={null}>
      <ToastProvider>{children}</ToastProvider>
    </ContextProvider>
  );
}
