import { useAppKit, useAppKitAccount, useAppKitBalance } from "@reown/appkit/react";

/**
 * Safe wrapper hooks for AppKit
 * 
 * CRITICAL: These hooks will throw errors if AppKitProvider isn't ready.
 * Components using these hooks should be wrapped in ErrorBoundary.
 * The hooks will work once AppKitProvider is rendered with a valid instance.
 * 
 * The root cause of errors is usually:
 * 1. WagmiAdapter failing to load (dayjs import issue)
 * 2. AppKit instance not being created
 * 3. AppKitProvider not being rendered
 * 
 * Fix: Ensure WagmiAdapter loads properly and AppKit initializes before components render.
 */

/**
 * Safe wrapper for useAppKit hook
 * Will throw error if AppKitProvider isn't ready - wrap component in ErrorBoundary
 */
export function useSafeAppKit() {
  return useAppKit();
}

/**
 * Safe wrapper for useAppKitAccount hook  
 * Will throw error if AppKitProvider isn't ready - wrap component in ErrorBoundary
 */
export function useSafeAppKitAccount() {
  return useAppKitAccount();
}

/**
 * Safe wrapper for useAppKitBalance hook
 * Will throw error if AppKitProvider isn't ready - wrap component in ErrorBoundary
 */
export function useSafeAppKitBalance() {
  return useAppKitBalance();
}



