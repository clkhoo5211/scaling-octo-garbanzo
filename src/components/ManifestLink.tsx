"use client";

import { useEffect, useRef } from "react";
import { getBasePath } from "@/lib/utils/basePath";

/**
 * Client-side component to inject manifest link with correct basePath
 * Next.js metadata API doesn't properly handle basePath for static exports
 * This component ensures the manifest link is correct at runtime
 */
export function ManifestLink() {
  const injectedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple injections
    if (injectedRef.current) return;
    
    const injectManifest = () => {
      try {
        // Only inject if we're in the browser
        if (typeof window === 'undefined' || !document.head) return;

        // Remove any existing manifest links (from metadata or previous renders)
        const existingLinks = document.querySelectorAll('link[rel="manifest"]');
        existingLinks.forEach((link) => {
          try {
            // Check if link is still in the DOM before removing
            if (link.parentNode) {
              link.remove();
            }
          } catch (e) {
            // Ignore errors if link was already removed
            console.warn('[ManifestLink] Error removing link:', e);
          }
        });

        // Add manifest link with correct basePath
        const basePath = getBasePath();
        const manifestLink = document.createElement("link");
        manifestLink.rel = "manifest";
        manifestLink.href = `${basePath}/manifest.webmanifest`;
        document.head.appendChild(manifestLink);
        
        injectedRef.current = true;
        console.log(`[ManifestLink] Injected manifest link: ${manifestLink.href}`);
      } catch (error) {
        console.warn('[ManifestLink] Error injecting manifest link:', error);
      }
    };

    // Try to inject immediately if DOM is ready
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectManifest, { once: true });
      } else {
        // Use setTimeout to ensure React has finished rendering
        setTimeout(injectManifest, 0);
      }
    }
  }, []);

  return null;
}
