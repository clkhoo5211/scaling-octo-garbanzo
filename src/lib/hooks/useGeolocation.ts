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
 * Tries multiple APIs for better reliability
 */
async function detectCountryClientSide(): Promise<GeolocationData> {
  console.log('[useGeolocation] Starting geolocation detection...');

  // Try ipapi.co first (free tier: 1000 requests/day, no API key needed)
  try {
    console.log('[useGeolocation] Trying ipapi.co...');
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'User-Agent': 'Web3News/1.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[useGeolocation] ipapi.co response:', data);
      
      if (data.country_code && !data.error) {
        const result = {
          countryCode: data.country_code,
          countryName: data.country_name || data.country_code,
          ip: data.ip || '',
          detected: true,
        };
        console.log('[useGeolocation] Successfully detected from ipapi.co:', result);
        return result;
      }
    } else {
      console.warn('[useGeolocation] ipapi.co returned non-OK status:', response.status);
    }
  } catch (ipapiError) {
    console.warn('[useGeolocation] ipapi.co failed:', ipapiError);
  }

  // Fallback to ip-api.com (free tier: 45 requests/minute, no API key needed)
  try {
    console.log('[useGeolocation] Trying ip-api.com...');
    const response = await fetch('http://ip-api.com/json/', {
      headers: {
        'User-Agent': 'Web3News/1.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[useGeolocation] ip-api.com response:', data);
      
      if (data.countryCode && data.status === 'success') {
        const result = {
          countryCode: data.countryCode,
          countryName: data.country || data.countryCode,
          ip: data.query || '',
          detected: true,
        };
        console.log('[useGeolocation] Successfully detected from ip-api.com:', result);
        return result;
      }
    } else {
      console.warn('[useGeolocation] ip-api.com returned non-OK status:', response.status);
    }
  } catch (ipApiError) {
    console.warn('[useGeolocation] ip-api.com failed:', ipApiError);
  }

  // Try ipgeolocation.io as third fallback
  try {
    console.log('[useGeolocation] Trying ipgeolocation.io...');
    const response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=free', {
      headers: {
        'User-Agent': 'Web3News/1.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[useGeolocation] ipgeolocation.io response:', data);
      
      if (data.country_code2) {
        const result = {
          countryCode: data.country_code2,
          countryName: data.country_name || data.country_code2,
          ip: data.ip || '',
          detected: true,
        };
        console.log('[useGeolocation] Successfully detected from ipgeolocation.io:', result);
        return result;
      }
    }
  } catch (ipgeoError) {
    console.warn('[useGeolocation] ipgeolocation.io failed:', ipgeoError);
  }

  // Try geojs.io as fourth fallback
  try {
    console.log('[useGeolocation] Trying geojs.io...');
    const response = await fetch('https://get.geojs.io/v1/ip/geo.json', {
      headers: {
        'User-Agent': 'Web3News/1.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[useGeolocation] geojs.io response:', data);
      
      if (data.country_code) {
        const result = {
          countryCode: data.country_code,
          countryName: data.country || data.country_code,
          ip: data.ip || '',
          detected: true,
        };
        console.log('[useGeolocation] Successfully detected from geojs.io:', result);
        return result;
      }
    }
  } catch (geojsError) {
    console.warn('[useGeolocation] geojs.io failed:', geojsError);
  }

  // Default fallback
  console.warn('[useGeolocation] All geolocation APIs failed, defaulting to US');
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
        
        console.log('[useGeolocation] Found cached geolocation:', data, `Age: ${Math.round(age / 1000 / 60)} minutes`);
        
        if (age < CACHE_DURATION) {
          setGeolocation(data);
          setIsLoading(false);
          console.log('[useGeolocation] Using cached geolocation data');
          return; // Use cached data
        } else {
          console.log('[useGeolocation] Cache expired, fetching fresh data');
        }
      } catch (e) {
        console.warn('[useGeolocation] Invalid cache, fetching fresh data:', e);
      }
    } else {
      console.log('[useGeolocation] No cache found, fetching fresh data');
    }

    // Fetch geolocation using client-side API
    detectCountryClientSide()
      .then((data) => {
        console.log('[useGeolocation] Geolocation detection completed:', data);
        setGeolocation(data);
        setIsLoading(false);
        
        // Cache the result
        localStorage.setItem(GEOLOCATION_CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now(),
        }));
        console.log('[useGeolocation] Cached geolocation data');
      })
      .catch((error) => {
        console.error('[useGeolocation] Failed to detect geolocation:', error);
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

/**
 * Clear geolocation cache (useful for testing)
 */
export function clearGeolocationCache() {
  localStorage.removeItem(GEOLOCATION_CACHE_KEY);
  console.log('[useGeolocation] Cache cleared');
}


