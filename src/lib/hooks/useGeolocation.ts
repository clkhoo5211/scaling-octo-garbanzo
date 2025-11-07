/**
 * Hook to detect user's country from IP geolocation
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

    // Fetch geolocation
    fetch('/api/geolocation')
      .then(res => res.json())
      .then((data: GeolocationData) => {
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

