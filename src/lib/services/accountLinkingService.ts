/**
 * Account Linking Service
 * Manages the mapping between Reown addresses and Clerk user IDs
 * 
 * Strategy: localStorage-based mapping (client-side only, suitable for static sites)
 * 
 * Storage Format:
 * - Key: `clerk_user_id_${reownAddress.toLowerCase()}`
 * - Value: Clerk user ID string
 * 
 * Reverse Mapping (for cleanup):
 * - Key: `account_link_${clerkUserId}`
 * - Value: JSON string with link metadata
 */

interface AccountLink {
  reownAddress: string;
  clerkUserId: string;
  createdAt: number;
}

const STORAGE_KEY_PREFIX = 'clerk_user_id_';
const REVERSE_KEY_PREFIX = 'account_link_';

/**
 * Store the mapping between a Reown address and Clerk user ID
 */
export function storeAccountLink(reownAddress: string, clerkUserId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const normalizedAddress = reownAddress.toLowerCase();
    const key = `${STORAGE_KEY_PREFIX}${normalizedAddress}`;
    
    // Store forward mapping: reownAddress → clerkUserId
    localStorage.setItem(key, clerkUserId);
    
    // Store reverse mapping: clerkUserId → link metadata (for cleanup)
    const linkData: AccountLink = {
      reownAddress: normalizedAddress,
      clerkUserId,
      createdAt: Date.now(),
    };
    localStorage.setItem(`${REVERSE_KEY_PREFIX}${clerkUserId}`, JSON.stringify(linkData));
    
    console.log(`✅ Account link stored: ${normalizedAddress} → Clerk ${clerkUserId}`);
  } catch (error) {
    console.error('Failed to store account link:', error);
  }
}

/**
 * Retrieve Clerk user ID for a given Reown address
 * @returns Clerk user ID if found, null otherwise
 */
export function getClerkUserIdByReownAddress(reownAddress: string): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const normalizedAddress = reownAddress.toLowerCase();
    const key = `${STORAGE_KEY_PREFIX}${normalizedAddress}`;
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Failed to retrieve account link:', error);
    return null;
  }
}

/**
 * Clear the account link for a Reown address
 */
export function clearAccountLink(reownAddress: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const normalizedAddress = reownAddress.toLowerCase();
    const key = `${STORAGE_KEY_PREFIX}${normalizedAddress}`;
    const clerkUserId = localStorage.getItem(key);
    
    // Remove forward mapping
    localStorage.removeItem(key);
    
    // Remove reverse mapping if exists
    if (clerkUserId) {
      localStorage.removeItem(`${REVERSE_KEY_PREFIX}${clerkUserId}`);
    }
    
    console.log(`🗑️ Account link cleared: ${normalizedAddress}`);
  } catch (error) {
    console.error('Failed to clear account link:', error);
  }
}

/**
 * Clear account link by Clerk user ID (reverse lookup)
 */
export function clearAccountLinkByClerkUserId(clerkUserId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const reverseKey = `${REVERSE_KEY_PREFIX}${clerkUserId}`;
    const linkDataStr = localStorage.getItem(reverseKey);
    
    if (linkDataStr) {
      const linkData: AccountLink = JSON.parse(linkDataStr);
      clearAccountLink(linkData.reownAddress);
    }
  } catch (error) {
    console.error('Failed to clear account link by Clerk user ID:', error);
  }
}

/**
 * Check if an account link exists for a Reown address
 */
export function hasAccountLink(reownAddress: string): boolean {
  return getClerkUserIdByReownAddress(reownAddress) !== null;
}

/**
 * Get all stored account links (for debugging/admin purposes)
 */
export function getAllAccountLinks(): AccountLink[] {
  if (typeof window === 'undefined') return [];
  
  const links: AccountLink[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(REVERSE_KEY_PREFIX)) {
        const linkDataStr = localStorage.getItem(key);
        if (linkDataStr) {
          links.push(JSON.parse(linkDataStr));
        }
      }
    }
  } catch (error) {
    console.error('Failed to get all account links:', error);
  }
  
  return links;
}

/**
 * Verify account link integrity (check if Clerk user ID still exists)
 * Note: This requires checking with Clerk API, so it's async
 */
export async function verifyAccountLink(
  reownAddress: string,
  verifyClerkUser: (clerkUserId: string) => Promise<boolean>
): Promise<boolean> {
  const clerkUserId = getClerkUserIdByReownAddress(reownAddress);
  
  if (!clerkUserId) {
    return false;
  }
  
  // Verify that the Clerk user still exists
  const exists = await verifyClerkUser(clerkUserId);
  
  if (!exists) {
    // Clerk user doesn't exist - clear stale link
    clearAccountLink(reownAddress);
    return false;
  }
  
  return true;
}

