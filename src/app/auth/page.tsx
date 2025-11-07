"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import dynamic from "next/dynamic";

// CRITICAL: Disable SSR for AuthPage to prevent build errors
// AppKit hooks require client-side initialization
const AuthPage = dynamic(() => import("@/components/auth/AuthPage"), {
  ssr: false, // Prevent server-side rendering
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  ),
});

export default function AuthRoutePage() {
  return (
    <ErrorBoundary>
      <AuthPage />
    </ErrorBoundary>
  );
}
