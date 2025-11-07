"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import AuthPage from "@/components/auth/AuthPage";

export default function AuthRoutePage() {
  return (
    <ErrorBoundary>
      <AuthPage />
    </ErrorBoundary>
  );
}
