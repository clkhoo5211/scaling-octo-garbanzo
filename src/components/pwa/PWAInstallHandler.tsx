"use client";

import { useEffect } from "react";

/**
 * PWA Install Prompt Handler
 * Listens for beforeinstallprompt and stores it globally
 * Can be triggered programmatically via window.triggerPWAInstall()
 * 
 * This component doesn't render anything - it just sets up the install prompt handler
 */
export function PWAInstallHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Store the deferred prompt globally
    let deferredPrompt: any = null;

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default mini-infobar
      e.preventDefault();
      // Store the event for later use
      deferredPrompt = e;
      console.log("✅ PWA install prompt available!");
      console.log("Run: window.triggerPWAInstall() to trigger install");
      
      // Make it available globally
      (window as any).deferredPrompt = deferredPrompt;
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("✅ PWA installed successfully!");
      deferredPrompt = null;
      (window as any).deferredPrompt = null;
    };

    // Expose global function to trigger install
    (window as any).triggerPWAInstall = async () => {
      const prompt = deferredPrompt || (window as any).deferredPrompt;
      
      if (!prompt) {
        console.log("❌ Install prompt not available.");
        console.log("Try:");
        console.log("1. Wait a few seconds and interact with the page");
        console.log("2. Check Chrome menu → Install Web3News");
        console.log("3. Ensure you're on HTTPS (not localhost)");
        return false;
      }

      try {
        // Show the install prompt
        await prompt.prompt();

        // Wait for user response
        const { outcome } = await prompt.userChoice;

        if (outcome === "accepted") {
          console.log("✅ User accepted the install prompt");
        } else {
          console.log("❌ User dismissed the install prompt");
        }

        // Clear the deferred prompt
        deferredPrompt = null;
        (window as any).deferredPrompt = null;
        
        return outcome === "accepted";
      } catch (error) {
        console.error("Error showing install prompt:", error);
        return false;
      }
    };

    // Add event listeners
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    console.log("✅ PWA Install Handler initialized");
    console.log("Run: window.triggerPWAInstall() to trigger install");

    // Cleanup
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null; // This component doesn't render anything
}

