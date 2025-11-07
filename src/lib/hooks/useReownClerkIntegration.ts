"use client";

import { useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useAuth, useUser } from "@clerk/clerk-react";

/**
 * Hook to handle Reown → Clerk integration
 * Listens for Reown social login and creates Clerk user with magic link verification
 * 
 * Flow:
 * 1. User logs in via Reown social login (PRIMARY)
 * 2. Hook detects Reown connection
 * 3. Creates Clerk user programmatically (if first time)
 * 4. Clerk sends magic link for email verification
 * 5. User clicks link → Email verified → Full access
 */
export function useReownClerkIntegration() {
  const { address, isConnected } = useAppKitAccount();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signUp, signIn, isSignedIn } = useAuth();

  useEffect(() => {
    // Only process when everything is loaded
    if (!clerkLoaded) return;

    // Case 1: Reown connected + Clerk user exists → Sync metadata
    if (isConnected && address && clerkUser && isSignedIn) {
      const currentReownAddress = clerkUser.publicMetadata?.reown_address as
        | string
        | undefined;

      if (!currentReownAddress || currentReownAddress !== address) {
        clerkUser
          .update({
            publicMetadata: {
              ...clerkUser.publicMetadata,
              reown_address: address,
              smart_account_address: address,
            },
          })
          .catch((error) => {
            console.error("Failed to sync Reown address to Clerk:", error);
          });
      }
      return;
    }

    // Case 2: Reown connected + No Clerk user → Create Clerk user and send magic link
    if (isConnected && address && !clerkUser && !isSignedIn) {
      // Generate email from address (Reown doesn't expose email directly)
      // In production, you'd get this from Reown's user profile API
      const email = `${address.slice(0, 8)}@reown.app`;

      // Create Clerk user via sign-up (triggers email verification magic link)
      signUp
        .create({
          emailAddress: email,
          skipPasswordRequirement: true, // No password (Reown handles auth)
        })
        .then((result) => {
          if (result.status === "missing_requirements") {
            // Prepare email verification magic link
            return signUp.prepareEmailAddressVerification({
              strategy: "email_link",
            });
          }
          return result;
        })
        .then((result) => {
          if (result?.status === "complete") {
            // User created successfully, update metadata
            return clerkUser?.update({
              publicMetadata: {
                reown_address: address,
                smart_account_address: address,
                points: 0,
                subscription_tier: "free",
                created_via: "reown_social_login",
              },
            });
          } else if (result?.status === "missing_requirements") {
            // Magic link sent - show notification
            console.log(
              `✅ Clerk user created. Magic link sent to: ${email}`
            );
            // You can show a toast notification here
          }
        })
        .catch((error) => {
          console.error("Failed to create Clerk user:", error);
          
          // If user already exists, try to sign in
          if (error.errors?.[0]?.code === "form_identifier_exists") {
            signIn
              .create({
                identifier: email,
                strategy: "email_link",
              })
              .then((signInResult) => {
                if (signInResult.status === "needs_first_factor") {
                  signIn.prepareFirstFactor({
                    strategy: "email_link",
                  });
                }
              })
              .catch((signInError) => {
                console.error("Failed to sign in:", signInError);
              });
          }
        });
    }
  }, [
    address,
    isConnected,
    clerkUser,
    clerkLoaded,
    isSignedIn,
    signUp,
    signIn,
  ]);

  return {
    isReownConnected: isConnected,
    reownAddress: address,
    isClerkSignedIn: isSignedIn,
    clerkUser,
    isSyncing: !clerkLoaded,
  };
}

