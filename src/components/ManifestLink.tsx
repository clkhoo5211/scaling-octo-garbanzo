"use client";

import { useEffect } from "react";
import { getBasePath } from "@/lib/utils/basePath";

/**
 * Client-side component to inject manifest link with correct basePath
 * Next.js metadata API doesn't properly handle basePath for static exports
 * This component ensures the manifest link is correct at runtime
 */
export function ManifestLink() {
  useEffect(() => {
    // Use requestIdleCallback for non-blocking execution, fallback to setTimeout
    const injectManifest = () => {
      try {
        // Remove any existing manifest links (from metadata or previous renders)
        const existingLinks = document.querySelectorAll('link[rel="manifest"]');
        existingLinks.forEach((link) => {
          try {
            link.remove();
          } catch (e) {
            // Ignore errors if link was already removed
          }
        });

        // Add manifest link with correct basePath
        const basePath = getBasePath();
        const manifestLink = document.createElement("link");
        manifestLink.rel = "manifest";
        manifestLink.href = `${basePath}/manifest.webmanifest`;
        document.head.appendChild(manifestLink);
        
        console.log(`[ManifestLink] Injected manifest link: ${manifestLink.href}`);
      } catch (error) {
        console.warn('[ManifestLink] Error injecting manifest link:', error);
      }
    };

    // Try to inject immediately
    if (typeof window !== 'undefined' && document.head) {
      injectManifest();
    } else {
      // Fallback: wait for DOM to be ready
      if (typeof window !== 'undefined') {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', injectManifest);
        } else {
          injectManifest();
        }
      }
    }
  }, []);

  return null;
}
