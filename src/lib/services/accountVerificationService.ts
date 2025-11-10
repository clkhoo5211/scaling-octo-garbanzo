/**
 * Account Verification Service
 * Verifies if a user has completed Clerk account setup by cross-referencing
 * Reown smart account address with Clerk metadata
 * 
 * CRITICAL: This verification is based on IMMUTABLE identifiers:
 * - Reown address (wallet address - never changes)
 * - Clerk user ID (never changes, even if username/email changes)
 * 
 * Profile changes (username, email) do NOT affect account linking integrity.
 */

import { useUser } from "@clerk/clerk-react";
import { getClerkUserIdByReownAddress, storeAccountLink } from "./accountLinkingService";

// UserResource type from Clerk - using the user type from useUser hook
type UserResource = NonNullable<ReturnType<typeof useUser>["user"]>;

/**
 * Verify if account setup is complete by checking if Reown address matches Clerk metadata
 * 
 * This function checks THREE sources of truth for maximum reliability:
 * 1. Clerk metadata (reown_address, smart_account_address)
 * 2. localStorage account link (clerk_user_id_${address})
 * 3. Current Clerk user ID matches stored link
 * 
 * @param clerkUser - Clerk user object
 * @param reownAddress - Current Reown smart account address
 * @returns true if addresses match and account setup is complete
 */
export function verifyAccountSetupComplete(
  clerkUser: UserResource | null,
  reownAddress: string | null | undefined
): boolean {
  if (!clerkUser || !reownAddress) {
    return false;
  }

  const normalizedReown = reownAddress.toLowerCase();
  
  // Source 1: Check Clerk metadata
  const storedReownAddress = (clerkUser.publicMetadata as Record<string, unknown>)
    ?.reown_address as string | undefined;
  const storedSmartAccountAddress = (clerkUser.publicMetadata as Record<string, unknown>)
    ?.smart_account_address as string | undefined;

  const normalizedStoredReown = storedReownAddress?.toLowerCase();
  const normalizedStoredSmart = storedSmartAccountAddress?.toLowerCase();

  // Source 2: Check localStorage account link
  const storedClerkUserId = getClerkUserIdByReownAddress(normalizedReown);
  const clerkUserIdMatches = storedClerkUserId === clerkUser.id;

  // Account setup is complete if:
  // 1. Reown address matches stored reown_address in Clerk metadata, OR
  // 2. Reown address matches stored smart_account_address in Clerk metadata, OR
  // 3. localStorage link exists and matches current Clerk user ID
  const metadataMatches =
    (normalizedStoredReown && normalizedStoredReown === normalizedReown) ||
    (normalizedStoredSmart && normalizedStoredSmart === normalizedReown);

  const isComplete = metadataMatches || clerkUserIdMatches;

  // If metadata doesn't match but localStorage link exists, sync metadata
  if (!metadataMatches && clerkUserIdMatches) {
    console.log("⚠️ Metadata out of sync, but localStorage link exists. Syncing metadata...");
    // This will be handled by ReownClerkIntegration component's sync logic
  }

  return Boolean(isComplete);
}

/**
 * Enhanced verification that also ensures account link is stored
 * Use this when you want to guarantee the link exists in localStorage
 */
export function verifyAndSyncAccountLink(
  clerkUser: UserResource | null,
  reownAddress: string | null | undefined
): boolean {
  if (!clerkUser || !reownAddress) {
    return false;
  }

  const normalizedReown = reownAddress.toLowerCase();
  
  // Verify account setup
  const isComplete = verifyAccountSetupComplete(clerkUser, reownAddress);
  
  // Ensure account link is stored in localStorage (even if already verified)
  // This handles cases where localStorage was cleared but Clerk session persists
  if (isComplete) {
    const storedClerkUserId = getClerkUserIdByReownAddress(normalizedReown);
    if (!storedClerkUserId || storedClerkUserId !== clerkUser.id) {
      console.log("🔄 Restoring account link in localStorage...");
      storeAccountLink(normalizedReown, clerkUser.id);
    }
  }
  
  return isComplete;
}

/**
 * Get verification status details
 */
export function getAccountVerificationStatus(
  clerkUser: UserResource | null,
  reownAddress: string | null | undefined
): {
  isComplete: boolean;
  storedReownAddress: string | null;
  storedSmartAccountAddress: string | null;
  currentReownAddress: string | null;
  addressesMatch: boolean;
  localStorageLinkExists: boolean;
  clerkUserIdMatches: boolean;
} {
  const storedReownAddress =
    (clerkUser?.publicMetadata as Record<string, unknown>)?.reown_address as
      | string
      | undefined || null;

  const storedSmartAccountAddress =
    (clerkUser?.publicMetadata as Record<string, unknown>)?.smart_account_address as
      | string
      | undefined || null;

  const currentReownAddress = reownAddress || null;
  const normalizedReown = reownAddress?.toLowerCase() || null;

  const addressesMatch =
    storedReownAddress &&
    currentReownAddress &&
    storedReownAddress.toLowerCase() === currentReownAddress.toLowerCase();

  // Check localStorage link
  const storedClerkUserId = normalizedReown
    ? getClerkUserIdByReownAddress(normalizedReown)
    : null;
  const clerkUserIdMatches = Boolean(
    storedClerkUserId && clerkUser && storedClerkUserId === clerkUser.id
  );

  return {
    isComplete: verifyAccountSetupComplete(clerkUser, reownAddress),
    storedReownAddress,
    storedSmartAccountAddress,
    currentReownAddress,
    addressesMatch: Boolean(addressesMatch),
    localStorageLinkExists: Boolean(storedClerkUserId),
    clerkUserIdMatches,
  };
}

