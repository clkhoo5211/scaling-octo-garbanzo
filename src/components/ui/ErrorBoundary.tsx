"use client";

import React, { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
  lastErrorTime: number;
}

/**
 * ErrorBoundary Component
 * Catches React errors and displays fallback UI
 * CRITICAL: Prevents infinite error loops by throttling error logging
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private errorThrottleTimeout: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
      lastErrorTime: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const now = Date.now();
    const timeSinceLastError = now - this.state.lastErrorTime;
    
    // Throttle error logging: only log once per second
    // This prevents infinite loops from causing 20k+ error messages
    if (timeSinceLastError > 1000) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
      
      // Clear any existing throttle timeout
      if (this.errorThrottleTimeout) {
        clearTimeout(this.errorThrottleTimeout);
      }
      
      // Update state with throttled error count
      this.setState((prevState) => ({
        errorCount: prevState.errorCount + 1,
        lastErrorTime: now,
      }));
      
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
      
      // Set throttle timeout to prevent rapid re-logging
      this.errorThrottleTimeout = setTimeout(() => {
        if (this.state.errorCount > 1) {
          console.warn(`ErrorBoundary: Suppressed ${this.state.errorCount - 1} additional errors in the last second`);
        }
      }, 1000);
    }
  }

  componentWillUnmount() {
    if (this.errorThrottleTimeout) {
      clearTimeout(this.errorThrottleTimeout);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorCount: 0,
      lastErrorTime: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              {/* CRITICAL: Use CSS icon instead of lucide-react to prevent hydration mismatch */}
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Something went wrong
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            {this.state.errorCount > 1 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">
                This error occurred {this.state.errorCount} times. Consider refreshing the page.
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {/* CRITICAL: Use CSS spinner instead of lucide-react icon */}
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Try again</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
