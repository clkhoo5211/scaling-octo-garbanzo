"use client";

import { ReactNode, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  children?: ReactNode;
  message?: string;
  fullScreen?: boolean;
}

/**
 * LoadingState Component
 * Displays loading indicator
 * CRITICAL: Client-only to prevent hydration mismatches with lucide-react icons
 */
export function LoadingState({
  children,
  message = "Loading...",
  fullScreen = false,
}: LoadingStateProps) {
  const [mounted, setMounted] = useState(false);

  // CRITICAL: Only render icons after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      {/* CRITICAL: Always render same structure, just change content inside */}
      <div className="w-8 h-8" suppressHydrationWarning>
        {mounted ? (
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        ) : (
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        )}
      </div>
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
      {children}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
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
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && mounted && <div className="mb-4">{icon}</div>}
      {icon && !mounted && (
        <div className="mb-4 w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md">
          {message}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
