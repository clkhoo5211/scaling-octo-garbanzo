import { useEffect, useRef } from "react";
import { getBasePath } from "../lib/utils/basePath";

/**
 * Client-side component to inject manifest link with correct basePath
 * Vite's HTML template doesn't properly handle basePath for GitHub Pages deployment
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

        // Remove any existing manifest links (from HTML template or previous renders)
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
        // Ensure we don't create double slashes (basePath could be '/' or '/repo-name')
        const manifestPath = basePath === '/' || basePath === '' 
          ? '/manifest.webmanifest' 
          : `${basePath}/manifest.webmanifest`;
        
        const manifestLink = document.createElement("link");
        manifestLink.rel = "manifest";
        manifestLink.href = manifestPath;
        // Add data attribute to identify this as the injected link
        manifestLink.setAttribute('data-injected', 'true');
        document.head.appendChild(manifestLink);
        
        injectedRef.current = true;
        console.log(`[ManifestLink] Injected manifest link: ${manifestLink.href}`);
        
        // Verify the manifest is accessible
        fetch(manifestPath)
          .then(response => {
            if (response.ok) {
              console.log('[ManifestLink] Manifest verified:', manifestPath);
            } else {
              console.warn('[ManifestLink] Manifest not accessible:', response.status, manifestPath);
            }
          })
          .catch(error => {
            console.warn('[ManifestLink] Manifest verification failed:', error);
          });
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
