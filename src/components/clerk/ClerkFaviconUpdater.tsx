"use client";

import { useEffect } from "react";
import { useClerkEnvironment } from "@/lib/hooks/useClerkEnvironment";

/**
 * Component to dynamically update favicon and app icons from Clerk API
 * Updates <link rel="icon">, <link rel="apple-touch-icon">, and manifest icons
 */
export function ClerkFaviconUpdater() {
  const { config, isLoading } = useClerkEnvironment();

  useEffect(() => {
    if (isLoading || !config) return;

    // Update favicon
    if (config.favicon_image_url || config.favicon_url) {
      const faviconUrl = config.favicon_image_url || config.favicon_url;
      
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
      existingFavicons.forEach(link => link.remove());

      // Add new favicon
      const faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.type = 'image/png';
      faviconLink.href = faviconUrl;
      document.head.appendChild(faviconLink);
    }

    // Update apple-touch-icon
    if (config.logo_image_url || config.logo_url) {
      const logoUrl = config.logo_image_url || config.logo_url;
      
      // Remove existing apple-touch-icon
      const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]');
      if (existingAppleIcon) {
        existingAppleIcon.remove();
      }

      // Add new apple-touch-icon
      const appleIconLink = document.createElement('link');
      appleIconLink.rel = 'apple-touch-icon';
      appleIconLink.href = logoUrl;
      document.head.appendChild(appleIconLink);
    }

    // Update document title if application_name is available
    if (config.application_name) {
      document.title = `${config.application_name} - Decentralized News Aggregation`;
    }
  }, [config, isLoading]);

  return null;
}

