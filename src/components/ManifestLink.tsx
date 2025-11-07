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
    // Remove any existing manifest links
    const existingLinks = document.querySelectorAll('link[rel="manifest"]');
    existingLinks.forEach((link) => link.remove());

    // Add manifest link with correct basePath
    const basePath = getBasePath();
    const manifestLink = document.createElement("link");
    manifestLink.rel = "manifest";
    manifestLink.href = `${basePath}/manifest.webmanifest`;
    document.head.appendChild(manifestLink);
  }, []);

  return null;
}

