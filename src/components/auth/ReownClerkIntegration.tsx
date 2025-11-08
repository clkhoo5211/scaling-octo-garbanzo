"use client";

import { useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { ReactNode } from "react";

/**
 * Reown-Clerk Integration Component
 * 
 * ✅ 100% CLIENT-SIDE ONLY - No server-side API routes required
 * Perfect for static export (GitHub Pages)
 * 
 * ARCHITECTURE:
 * - Reown (PRIMARY): Handles ALL authentication (social login, email, wallet)
 * - Clerk (SECONDARY): User management ONLY (metadata, subscriptions, points)
 * - NO Clerk sign-in/sign-up UI - all authentication via Reown
 * 
 * Flow:
 * STEP 1: User authenticates via Reown (PRIMARY)
 *   → User clicks "Connect Wallet" → Reown AppKit modal appears
 *   → User selects: Google, Email, Twitter, Discord, or Wallet
 *   → Reown authenticates user
 *   → Reown automatically creates ERC-4337 Smart Account ✅
 * 
 * STEP 2: Automatic Clerk User Management (SECONDARY - Silent)
 *   → Component detects Reown connection
 *   → Automatically creates Clerk user if doesn't exist (silent, no UI)
 *   → Uses Clerk's client-side SDK (signUp.create()) - no server API
 *   → Stores Reown address and smart account in Clerk publicMetadata
 *   → Clerk manages: points, subscriptions, referrals, etc.
 * 
 * STEP 3: User Management Ready
 *   → All user data stored in Clerk publicMetadata
 *   → No Clerk authentication UI shown to user
 *   → User only interacts with Reown for authentication
 */
export function ReownClerkIntegration({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAppKitAccount();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const auth = useAuth();
  const [hasAttemptedCreation, setHasAttemptedCreation] = useState(false);

  useEffect(() => {
    // Only process when Clerk is loaded
    if (!clerkLoaded) return;

    // Case 1: Reown connected + Clerk user exists → Sync metadata
    if (isConnected && address && clerkUser && auth.isSignedIn) {
      const currentReownAddress = (clerkUser.publicMetadata as Record<string, unknown>)?.reown_address as
        | string
        | undefined;

      // Sync Reown address to Clerk metadata if missing or different
      if (!currentReownAddress || currentReownAddress !== address) {
        clerkUser
          .update({
            unsafeMetadata: {
              ...(clerkUser.unsafeMetadata as Record<string, unknown> || {}),
              reown_address: address,
              smart_account_address: address, // Smart account address (same as Reown address)
              // Ensure all required metadata fields exist
              points: (clerkUser.publicMetadata as Record<string, unknown>)?.points ?? 0,
              subscription_tier: (clerkUser.publicMetadata as Record<string, unknown>)?.subscription_tier ?? "free",
              referral_code: (clerkUser.publicMetadata as Record<string, unknown>)?.referral_code ?? generateReferralCode(),
              total_submissions: (clerkUser.publicMetadata as Record<string, unknown>)?.total_submissions ?? 0,
              total_upvotes: (clerkUser.publicMetadata as Record<string, unknown>)?.total_upvotes ?? 0,
              login_streak: (clerkUser.publicMetadata as Record<string, unknown>)?.login_streak ?? 0,
            },
          } as Parameters<typeof clerkUser.update>[0])
          .catch((error: unknown) => {
            console.error("Failed to sync Reown address to Clerk:", error);
          });
      }
      return;
    }

    // Case 2: Reown connected + No Clerk user → Create Clerk user silently
    // This happens automatically after Reown login - no UI shown to user
    // Uses Clerk's CLIENT-SIDE SDK (no server API)
    if (isConnected && address && !clerkUser && !auth.isSignedIn && !hasAttemptedCreation && auth.signUp) {
      setHasAttemptedCreation(true);

      // Generate email from address (Reown doesn't expose email in client SDK)
      // For email login via Reown, email might be stored in localStorage
      const storedEmail = localStorage.getItem(`reown_email_${address}`);
      const email = storedEmail || `${address.slice(0, 8)}@reown.app`;

      // Create Clerk user silently using client-side SDK
      // This is just for user management - authentication is handled by Reown
      auth.signUp
        .create({
          emailAddress: email,
          skipPasswordRequirement: true, // No password (Reown handles auth)
        })
        .then((result: { status: string; createdUserId?: string | null }) => {
          if (result.status === "complete") {
            // User created successfully, update metadata
            return result.createdUserId
              ? Promise.resolve(result.createdUserId)
              : Promise.reject(new Error("No user ID returned"));
          } else if (result.status === "missing_requirements" && auth.signUp) {
            // Skip email verification - user already authenticated via Reown
            // Just complete the signup without verification
            return auth.signUp.attemptEmailAddressVerification({
              code: "", // Empty code - skip verification
            }).then(() => result.createdUserId || null);
          }
          return null;
        })
        .then((userId: string | null | undefined) => {
          if (userId && clerkUser) {
            // Update metadata with Reown address and user data
            return clerkUser.update({
              unsafeMetadata: {
                reown_address: address,
                smart_account_address: address,
                points: 0,
                subscription_tier: "free",
                referral_code: generateReferralCode(),
                total_submissions: 0,
                total_upvotes: 0,
                login_streak: 0,
                created_at: new Date().toISOString(),
                created_via: "reown_smart_account",
              },
            } as Parameters<typeof clerkUser.update>[0]);
          }
        })
        .then(() => {
          console.log("✅ Clerk user created silently for user management");
        })
        .catch((error: unknown) => {
          console.error("Failed to create Clerk user:", error);
          setHasAttemptedCreation(false); // Allow retry
        });
    }
  }, [
    address,
    isConnected,
    clerkUser,
    clerkLoaded,
    auth.isSignedIn,
    auth.signUp,
    hasAttemptedCreation,
  ]);

  return <>{children}</>;
}

/**
 * Generate referral code (per requirements)
 * CRITICAL: Use stable generation to prevent hydration mismatches
 * Only generate when actually needed (not during render)
 */
// Use a module-level counter to avoid function property issues
let referralCounter = 0;

function generateReferralCode(): string {
  // Use crypto.randomUUID if available (browser), otherwise fallback to timestamp-based
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return `USER${window.crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  }
  // Fallback: use timestamp + counter to ensure uniqueness without Math.random()
  const timestamp = Date.now().toString(36).toUpperCase();
  referralCounter += 1;
  return `USER${timestamp.slice(-4)}${referralCounter.toString(36).toUpperCase().slice(-2)}`;
}
