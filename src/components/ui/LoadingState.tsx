"use client";

import { ReactNode, useEffect, useState } from "react";

interface LoadingStateProps {
  children?: ReactNode;
  message?: string;
  fullScreen?: boolean;
}

/**
 * LoadingState Component
 * Displays loading indicator
 * CRITICAL: Use CSS spinner only - same structure on server and client
 * No lucide-react icons to prevent hydration mismatches
 */
export function LoadingState({
  children,
  message = "Loading...",
  fullScreen = false,
}: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 rounded-card bg-surface-primary/40 p-8 text-center">
      {/* CRITICAL: CSS spinner only - same on server and client */}
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-border-subtle border-t-primary" />
      {message && (
        <p className="text-sm text-text-secondary">{message}</p>
      )}
      {children}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-base/90 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="min-h-[200px]">{content}</div>;
}

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

/**
 * EmptyState Component
 * Displays empty state message
 * CRITICAL: Client-only to prevent hydration mismatches with lucide-react icons
 */
export function EmptyState({
  title = "No data available",
  message,
  icon,
  action,
}: EmptyStateProps) {
  const [mounted, setMounted] = useState(false);

  // CRITICAL: Only render icons after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-border-subtle bg-background-elevated px-8 py-10 text-center shadow-card">
      {icon && mounted && <div className="mb-4 text-primary">{icon}</div>}
      {icon && !mounted && (
        <div className="mb-4 h-12 w-12 animate-pulse rounded-full bg-surface-subtle" />
      )}
      <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
      {message && (
        <p className="mb-4 max-w-md text-sm leading-relaxed text-text-secondary">
          {message}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
