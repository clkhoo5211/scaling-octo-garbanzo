/**
 * Hook to fetch and cache Reown account name
 * Optimizes reconnection by caching account name in localStorage
 * 
 * Based on Reown docs: https://docs.reown.com/appkit/react/core/smart-accounts
 * Account names are ENS-resolved names like "johnsmith.reown.id"
 */

import { useState, useEffect, useCallback } from "react";
import { useAppKitAccount } from "@reown/appkit/react";

const ACCOUNT_NAME_CACHE_KEY = "reown_account_name_cache";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface AccountNameCache {
  address: string;
  accountName: string | null;
  timestamp: number;
}

/**
 * Get cached account name for an address
 */
function getCachedAccountName(address: string): string | null {
  if (typeof window === "undefined" || !address) return null;
  
  try {
    const cached = localStorage.getItem(ACCOUNT_NAME_CACHE_KEY);
    if (!cached) return null;
    
    const cache: AccountNameCache = JSON.parse(cached);
    
    // Check if cache is for this address and not expired
    if (
      cache.address.toLowerCase() === address.toLowerCase() &&
      Date.now() - cache.timestamp < CACHE_EXPIRY_MS
    ) {
      return cache.accountName;
    }
    
    // Cache expired or different address - clear it
    localStorage.removeItem(ACCOUNT_NAME_CACHE_KEY);
    return null;
  } catch (error) {
    console.error("Failed to read account name cache:", error);
    return null;
  }
}

/**
 * Cache account name for an address
 */
function setCachedAccountName(address: string, accountName: string | null): void {
  if (typeof window === "undefined" || !address) return;
  
  try {
    const cache: AccountNameCache = {
      address: address.toLowerCase(),
      accountName,
      timestamp: Date.now(),
    };
    localStorage.setItem(ACCOUNT_NAME_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Failed to cache account name:", error);
  }
}

/**
 * Hook to get Reown account name with caching for faster reconnection
 * 
 * According to Reown docs: https://docs.reown.com/appkit/react/core/smart-accounts
 * Account names are ENS-resolved names like "johnsmith.reown.id"
 * 
 * @returns { accountName: string | null, isLoading: boolean }
 */
export function useReownAccountName() {
  const { address, isConnected } = useAppKitAccount();
  const [accountName, setAccountName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log("🔍 useReownAccountName hook:", {
    address,
    isConnected,
    currentAccountName: accountName,
    isLoading,
  });

  // Try to get account name from cache or Reown API
  // This function fetches fresh data in the background (non-blocking)
  const fetchAccountName = useCallback(async () => {
    console.log("📥 fetchAccountName called:", { address, isConnected });
    
    if (!address || !isConnected) {
      console.log("⏸️ Skipping fetch - no address or not connected");
      setAccountName(null);
      setIsLoading(false);
      return;
    }

    // Don't set loading state if we already have cached data (optimizes reconnection)
    const cached = getCachedAccountName(address);
    const hasCachedData = cached !== null;
    
    console.log("💾 Cache check:", {
      cached,
      hasCachedData,
      address,
    });
    
    if (!hasCachedData) {
      setIsLoading(true);
      console.log("⏳ Setting loading state - no cached data");
    } else {
      console.log("✅ Using cached data, skipping loading state");
    }

    try {
      console.log("🔍 Starting account name fetch process...");
      
      // Method 1: Check Reown's localStorage for account name
      // Reown stores account info in localStorage with keys like "wc@2:core:..." or "reown:..."
      // Also check for account name in auth state
      if (typeof window !== "undefined") {
        console.log("📦 Checking Reown localStorage for account name...");
        try {
          // Helper function to recursively search for account name in objects
          const findAccountName = (obj: unknown, depth = 0): string | null => {
            if (depth > 5) return null; // Limit recursion depth
            if (typeof obj !== "object" || obj === null) return null;
            const objAny = obj as Record<string, unknown>;
            
            // Check common property names for .reown.id names
            const possibleNames = [
              objAny.accountName,
              objAny.name,
              objAny.ensName,
              objAny.label,
              objAny.account_name,
              objAny.displayName,
            ];
            
            for (const name of possibleNames) {
              if (typeof name === "string" && (name.includes(".reown.id") || name.includes("@reown.app"))) {
                console.log("✅ Found account name in object:", name);
                return name;
              }
            }
            
            // Recursively search nested objects
            for (const val of Object.values(objAny)) {
              const found = findAccountName(val, depth + 1);
              if (found) return found;
            }
            return null;
          };
          
          let checkedKeys = 0;
          let matchingKeys = 0;
          
          // Check all localStorage keys for Reown/Web3Modal data
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes("wc@") || key.includes("reown") || key.includes("web3modal") || key.includes("appkit"))) {
              checkedKeys++;
              try {
                const value = localStorage.getItem(key);
                if (value) {
                  const parsed = JSON.parse(value);
                  const foundName = findAccountName(parsed);
                  if (foundName) {
                    matchingKeys++;
                    console.log(`✅ Found account name in localStorage key "${key}":`, foundName);
                    console.log("📋 Full localStorage value:", parsed);
                    setAccountName(foundName);
                    setCachedAccountName(address, foundName);
                    setIsLoading(false);
                    return;
                  }
                }
              } catch {
                // Skip invalid JSON
                continue;
              }
            }
          }
          
          console.log("📊 localStorage search complete:", {
            checkedKeys,
            matchingKeys,
            totalLocalStorageKeys: localStorage.length,
          });
          
          if (checkedKeys === 0) {
            console.log("⚠️ No Reown-related keys found in localStorage");
            console.log("📋 Available localStorage keys:", Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)));
          } else {
            // Log some sample localStorage values for debugging
            console.log("🔍 Sample localStorage inspection (first 3 Reown keys):");
            let sampleCount = 0;
            for (let i = 0; i < localStorage.length && sampleCount < 3; i++) {
              const key = localStorage.key(i);
              if (key && (key.includes("wc@") || key.includes("reown") || key.includes("web3modal") || key.includes("appkit"))) {
                try {
                  const value = localStorage.getItem(key);
                  if (value) {
                    const parsed = JSON.parse(value);
                    console.log(`  Key: ${key}`);
                    console.log(`  Value structure:`, Object.keys(parsed).slice(0, 10)); // First 10 keys
                    sampleCount++;
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error("❌ Failed to check Reown localStorage:", error);
        }
      }

      // Method 2: Try to get account name from Reown API (if available)
      // Based on the API endpoint pattern: https://api.web3modal.org/auth/v1/authenticate
      const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
      
      console.log("🌐 Checking Reown API:", {
        projectId: projectId ? `${projectId.substring(0, 10)}...` : "not set",
        hasCachedData,
        willTryAPI: projectId && !hasCachedData,
      });
      
      if (projectId && !hasCachedData) {
        try {
          // Try alternative API endpoints
          const endpoints = [
            `https://api.web3modal.org/auth/v1/account?address=${address}&projectId=${projectId}`,
            `https://api.reown.com/v1/account?address=${address}&projectId=${projectId}`,
          ];
          
          console.log("🔗 Trying Reown API endpoints:", endpoints);
          
          for (const endpoint of endpoints) {
            try {
              console.log(`📡 Fetching: ${endpoint}`);
              // Don't send Content-Type header for GET requests to avoid CORS issues
              const response = await fetch(endpoint, {
                method: 'GET',
                // Removed Content-Type header - GET requests don't need it and it causes CORS errors
              });

              console.log(`📥 Response from ${endpoint}:`, {
                status: response.status,
                ok: response.ok,
              });

              if (response.ok) {
                const data = await response.json();
                console.log("📋 API response data:", data);
                const name = data?.accountName || data?.name || data?.ensName;
                if (name) {
                  console.log(`✅ Found account name from API: ${name}`);
                  setAccountName(name);
                  setCachedAccountName(address, name);
                  setIsLoading(false);
                  return;
                } else {
                  console.log("⚠️ API response doesn't contain account name");
                }
              } else {
                console.log(`⚠️ API endpoint returned ${response.status}: ${response.statusText}`);
              }
            } catch (error) {
              // Endpoint doesn't exist or failed - try next one
              console.log(`❌ API endpoint failed: ${endpoint}`, error);
              continue;
            }
          }
        } catch (apiError) {
          console.error("❌ Reown API account name fetch error:", apiError);
        }
      } else {
        if (!projectId) {
          console.log("⚠️ VITE_REOWN_PROJECT_ID not set, skipping API calls");
        }
        if (hasCachedData) {
          console.log("✅ Using cached data, skipping API calls");
        }
      }

      // If no account name found and no cache, set null to prevent repeated lookups
      // The account name might be set by the user later via Reown dashboard
      if (!hasCachedData) {
        console.log("⚠️ No account name found from any source, setting to null");
        setAccountName(null);
        setCachedAccountName(address, null);
      } else {
        console.log("✅ Keeping cached account name:", cached);
      }
    } catch (error) {
      console.error("❌ Failed to fetch account name:", error);
      // Keep cached value if available, otherwise set to null
      if (!hasCachedData) {
        setAccountName(null);
      } else {
        console.log("✅ Error occurred but keeping cached value:", cached);
      }
    } finally {
      setIsLoading(false);
      console.log("🏁 fetchAccountName complete");
    }
  }, [address, isConnected]);

  // Load cached account name immediately on mount/address change (optimizes reconnection speed)
  useEffect(() => {
    console.log("🔄 useReownAccountName useEffect triggered:", {
      address,
      isConnected,
    });
    
    if (address && isConnected) {
      const cached = getCachedAccountName(address);
      console.log("💾 Initial cache check:", {
        cached,
        address,
      });
      
      if (cached !== null) {
        // Set cached value immediately for instant display
        setAccountName(cached);
        setIsLoading(false);
        console.log("✅ Loaded cached account name immediately:", cached);
      } else {
        setIsLoading(true);
        console.log("⏳ No cache found, setting loading state");
      }
      // Fetch fresh data in background
      console.log("🚀 Starting background fetch...");
      fetchAccountName();
    } else {
      console.log("⏸️ Skipping - no address or not connected");
      setAccountName(null);
      setIsLoading(false);
    }
  }, [address, isConnected, fetchAccountName]);

  return {
    accountName,
    isLoading,
    refetch: fetchAccountName,
  };
}

