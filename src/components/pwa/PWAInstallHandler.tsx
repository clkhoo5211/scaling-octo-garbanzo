"use client";

import { useEffect } from "react";

/**
 * PWA Install Handler
 * Minimal handler - just logs install prompt availability
 * Browser will show native install prompt automatically when PWA is installable
 * No custom buttons or auto-triggering - let browser handle it natively
 */
export function PWAInstallHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Just listen and log - browser handles the rest
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log("✅ PWA install prompt available - browser will show native prompt");
      // Store globally in case needed later
      (window as any).deferredPrompt = e;
    };

    const handleAppInstalled = () => {
      console.log("✅ PWA installed successfully!");
      (window as any).deferredPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null; // No UI - browser handles install prompt natively
}

