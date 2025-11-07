/**
 * Hook to detect user's country from IP geolocation
 * Uses client-side third-party APIs (works with static export)
 * Caches result in localStorage to avoid repeated API calls
 */

import { useState, useEffect } from 'react';

interface GeolocationData {
  countryCode: string;
  countryName: string;
  ip: string;
  detected: boolean;
}

const GEOLOCATION_CACHE_KEY = 'web3news_geolocation';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Client-side geolocation using free third-party APIs
 * Works with static export (no server-side API needed)
 */
async function detectCountryClientSide(): Promise<GeolocationData> {
  // Try ipapi.co first (free tier: 1000 requests/day, no API key needed)
  try {
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'User-Agent': 'Web3News/1.0',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      if (data.country_code && !data.error) {
        return {
          countryCode: data.country_code,
          countryName: data.country_name || data.country_code,
          ip: data.ip || '',
          detected: true,
        };
      }
    }
  } catch (ipapiError) {
    console.warn('ipapi.co failed, trying ip-api.com:', ipapiError);
  }

  // Fallback to ip-api.com (free tier: 45 requests/minute, no API key needed)
  try {
    const response = await fetch('http://ip-api.com/json/', {
      headers: {
        'User-Agent': 'Web3News/1.0',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.countryCode && data.status === 'success') {
        return {
          countryCode: data.countryCode,
          countryName: data.country || data.countryCode,
          ip: data.query || '',
          detected: true,
        };
      }
    }
  } catch (ipApiError) {
    console.warn('ip-api.com also failed, using default:', ipApiError);
  }

  // Default fallback
  return {
    countryCode: 'US',
    countryName: 'United States',
    ip: '',
    detected: false,
  };
}

export function useGeolocation() {
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check cache first
    const cached = localStorage.getItem(GEOLOCATION_CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        if (age < CACHE_DURATION) {
          setGeolocation(data);
          setIsLoading(false);
          return; // Use cached data
        }
      } catch (e) {
        // Invalid cache, continue to fetch
      }
    }

    // Fetch geolocation using client-side API
    detectCountryClientSide()
      .then((data) => {
        setGeolocation(data);
        setIsLoading(false);
        
        // Cache the result
        localStorage.setItem(GEOLOCATION_CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now(),
        }));
      })
      .catch((error) => {
        console.warn('Failed to detect geolocation:', error);
        // Use default values
        setGeolocation({
          countryCode: 'US',
          countryName: 'United States',
          ip: '',
          detected: false,
        });
        setIsLoading(false);
      });
  }, []);

  return { geolocation, isLoading };
}

