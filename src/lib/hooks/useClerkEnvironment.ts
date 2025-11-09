"use client";

import { useEffect, useState } from "react";

interface ClerkEnvironmentConfig {
  logo_image_url?: string;
  favicon_image_url?: string;
  logo_url?: string;
  favicon_url?: string;
  application_name?: string;
}

/**
 * Hook to fetch and use Clerk environment configuration
 * Includes logo, favicon, and app name from Clerk Dashboard
 * 
 * CRITICAL: Only fetches when ClerkProvider is initialized (user authenticated via Reown)
 * This hook checks if ClerkProvider exists before making API calls
 */
export function useClerkEnvironment() {
  const [config, setConfig] = useState<ClerkEnvironmentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clerkInitialized, setClerkInitialized] = useState(false);

  useEffect(() => {
    // Check if ClerkProvider is initialized by checking for Clerk context
    // ClerkProvider sets window.__clerk_frontend_api when initialized
    const checkClerkInitialized = () => {
      // Check if Clerk context exists (ClerkProvider has been rendered)
      const clerkContext = (window as any).__clerk_frontend_api;
      return !!clerkContext;
    };

    // Check periodically if Clerk has been initialized
    const interval = setInterval(() => {
      if (checkClerkInitialized()) {
        setClerkInitialized(true);
        clearInterval(interval);
      }
    }, 100);

    // Also check immediately
    if (checkClerkInitialized()) {
      setClerkInitialized(true);
      clearInterval(interval);
    }

    // Cleanup interval after 5 seconds (Clerk should initialize quickly if it's going to)
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!checkClerkInitialized()) {
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    
    // CRITICAL: Only fetch if ClerkProvider is initialized
    // This prevents API calls when user is not authenticated via Reown
    if (!publishableKey || !clerkInitialized) {
      setIsLoading(false);
      return;
    }

    // Extract instance ID from publishable key
    // Format: pk_test_{base64-encoded-instance-id}
    // Or use the domain directly: faithful-mouse-84.clerk.accounts.dev
    const fetchEnvironment = async () => {
      try {
        // Try to extract instance ID from publishable key
        // If that fails, use a known instance ID or fetch from Clerk API
        // For now, we'll use the domain we know: faithful-mouse-84
        const instanceId = 'faithful-mouse-84'; // Can be extracted from publishable key if needed
        const apiUrl = `https://${instanceId}.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-04-10&_clerk_js_version=5.105.1`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const displayConfig = data.display_config || {};
          
          setConfig({
            logo_image_url: displayConfig.logo_image_url || displayConfig.logo_url,
            favicon_image_url: displayConfig.favicon_image_url || displayConfig.favicon_url,
            logo_url: displayConfig.logo_url,
            favicon_url: displayConfig.favicon_url,
            application_name: displayConfig.application_name,
          });
        }
      } catch (error) {
        console.warn('[ClerkEnvironment] Failed to fetch environment config:', error);
        // Fallback to defaults
        setConfig(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnvironment();
  }, [clerkInitialized]);

  return { config, isLoading };
}

