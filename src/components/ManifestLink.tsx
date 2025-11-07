"use client";

import { useEffect } from "react";
import Script from "next/script";
import { getBasePath } from "@/lib/utils/basePath";

/**
 * Client-side component to inject manifest link with correct basePath
 * Next.js metadata API doesn't properly handle basePath for static exports
 * This component ensures the manifest link is correct at runtime
 * Uses inline script to inject immediately before browser fetches manifest
 */
export function ManifestLink() {
  useEffect(() => {
    // Remove any existing manifest links (from metadata or previous renders)
    const existingLinks = document.querySelectorAll('link[rel="manifest"]');
    existingLinks.forEach((link) => link.remove());

    // Add manifest link with correct basePath
    const basePath = getBasePath();
    const manifestLink = document.createElement("link");
    manifestLink.rel = "manifest";
    manifestLink.href = `${basePath}/manifest.webmanifest`;
    document.head.appendChild(manifestLink);
    
    console.log(`[ManifestLink] Injected manifest link: ${manifestLink.href}`);
  }, []);

  return (
    <>
      {/* Inline script to inject manifest link immediately (before React hydration) */}
      <Script
        id="manifest-link-injector"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Remove any existing manifest links
              const existingLinks = document.querySelectorAll('link[rel="manifest"]');
              existingLinks.forEach(function(link) { link.remove(); });
              
              // Detect basePath from current pathname
              const pathname = window.location.pathname;
              let basePath = '';
              if (pathname.startsWith('/scaling-octo-garbanzo')) {
                basePath = '/scaling-octo-garbanzo';
              } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                basePath = '';
              }
              
              // Inject manifest link
              const manifestLink = document.createElement('link');
              manifestLink.rel = 'manifest';
              manifestLink.href = basePath + '/manifest.webmanifest';
              document.head.appendChild(manifestLink);
              console.log('[ManifestLink] Injected manifest link (inline script):', manifestLink.href);
            })();
          `,
        }}
      />
    </>
  );
}
