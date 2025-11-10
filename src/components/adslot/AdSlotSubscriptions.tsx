"use client";

/**
 * Ad Slot Subscriptions Component
 * Displays and manages user's ad slot subscriptions
 * Per requirements: Show subscribed slots, allow subscribe/unsubscribe
 */

import { useState, useEffect } from "react";
import { useClerkUser } from "@/lib/hooks/useClerkUser";
import { useAuth, useUser, useSignUp, useClerk, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useAppKitAccount } from "@reown/appkit/react";
import {
  subscribeToSlot,
  unsubscribeFromSlot,
  getSubscribedSlots,
  updateSubscriptionPreferences,
} from "@/lib/services/adSlotSubscriptionService";
import { Bell, BellOff, Settings, Loader2, Mail } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { EmailPrompt } from "@/components/auth/EmailPrompt";
import { verifyAccountSetupComplete } from "@/lib/services/accountVerificationService";
import { getClerkUserIdByReownAddress } from "@/lib/services/accountLinkingService";

export function AdSlotSubscriptions() {
  const { user, isLoaded, isSignedIn } = useClerkUser();
  const auth = useAuth();
  // Use useUser() directly from Clerk - this is the source of truth for Clerk user
  // IMPORTANT: This hook works even inside <SignedOut> - it just returns null when not signed in
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { isSignedIn: isClerkSignedIn } = auth;
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const clerk = useClerk();
  const { address, isConnected } = useAppKitAccount();
  const { addToast } = useToast();
  const [subscribedSlots, setSubscribedSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingSlot, setUpdatingSlot] = useState<string | null>(null);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [signUpRetryCount, setSignUpRetryCount] = useState(0);
  const [verificationPending, setVerificationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState<number | null>(null);
  const [timeUntilExpiration, setTimeUntilExpiration] = useState<number | null>(null); // Time until actual expiration (in seconds)

  useEffect(() => {
    if (clerkUser && isClerkSignedIn && isLoaded) {
      loadSubscriptions();
      
      // Clear verification pending state if user is now signed in AND email is verified
      if (verificationPending) {
        // Check if the pending email is now verified - multiple detection methods
        const emailAddresses = clerkUser.emailAddresses || [];
        const primaryEmail = clerkUser.primaryEmailAddress;
        
        // CRITICAL: Only check if email is ACTUALLY verified
        // Clerk verification statuses: 'unverified', 'verified', 'transferable', 'failed', 'expired', null
        // Only 'verified' and 'transferable' mean the email is verified
        const hasVerifiedEmails = emailAddresses.some((e: any) => 
          e.verification?.status === 'verified' || e.verification?.status === 'transferable'
        );
        
        // Check if pending email specifically is verified
        const verifiedPendingEmail = pendingEmail ? emailAddresses.find(
          (email: any) => email.emailAddress === pendingEmail && 
          (email.verification?.status === 'verified' || email.verification?.status === 'transferable')
        ) : null;
        
        // Check primary email verification
        const primaryEmailVerified = primaryEmail && 
          (primaryEmail.verification?.status === 'verified' || primaryEmail.verification?.status === 'transferable');
        
        console.log("🔍 Initial check - User signed in, checking email verification:", {
          hasVerifiedEmails,
          verifiedPendingEmail: !!verifiedPendingEmail,
          primaryEmailVerified,
          emailAddresses: emailAddresses.map((e: any) => ({
            email: e.emailAddress,
            verificationStatus: e.verification?.status
          })),
          primaryEmail: primaryEmail?.emailAddress,
          pendingEmail,
          isClerkSignedIn
        });
        
        // CRITICAL: Only clear pending state if email is ACTUALLY verified
        // Don't clear just because user is signed in - email verification is required
        if (hasVerifiedEmails || verifiedPendingEmail || primaryEmailVerified) {
          console.log("✅ User signed in and email verified - clearing pending state immediately");
          setVerificationPending(false);
          setPendingEmail(null);
          setResendCountdown(null);
          setTimeUntilExpiration(null);
          localStorage.removeItem(`clerk_verification_pending_${address}`);
          localStorage.removeItem(`clerk_verification_timestamp_${address}`);
          localStorage.removeItem(`clerk_verification_expire_at_${address}`);
        } else {
          console.log("⚠️ User signed in but email NOT verified yet - keeping pending state");
        }
      } else {
        // User is signed in and no pending verification - ensure localStorage is clean
        localStorage.removeItem(`clerk_verification_pending_${address}`);
        localStorage.removeItem(`clerk_verification_timestamp_${address}`);
        localStorage.removeItem(`clerk_verification_expire_at_${address}`);
      }
    } else {
      setIsLoading(false);
      // Check if there's a pending verification
      if (address) {
        const pending = localStorage.getItem(`clerk_verification_pending_${address}`);
        const expireAt = localStorage.getItem(`clerk_verification_expire_at_${address}`);
        const timestamp = localStorage.getItem(`clerk_verification_timestamp_${address}`);
        
        // IMPORTANT: Check if account was deleted after verification
        // If there's a stored Clerk user ID but user is not signed in, account was deleted
        const storedClerkUserId = localStorage.getItem(`clerk_user_id_${address.toLowerCase()}`);
        if (storedClerkUserId && !isClerkSignedIn && !clerkUser) {
          console.log("⚠️ Account was deleted after verification - clearing pending state");
          console.log("Stored Clerk user ID:", storedClerkUserId);
          console.log("User signed in:", isClerkSignedIn);
          console.log("Clerk user exists:", !!clerkUser);
          setVerificationPending(false);
          setPendingEmail(null);
          setResendCountdown(null);
          setTimeUntilExpiration(null);
          localStorage.removeItem(`clerk_verification_pending_${address}`);
          localStorage.removeItem(`clerk_verification_timestamp_${address}`);
          localStorage.removeItem(`clerk_verification_expire_at_${address}`);
          // Also clear the account link since account no longer exists
          localStorage.removeItem(`clerk_user_id_${address.toLowerCase()}`);
          localStorage.removeItem(`account_link_${storedClerkUserId}`);
          return; // Don't set pending state - account was deleted
        }
        
        console.log("useEffect - Checking localStorage:", { pending, expireAt, timestamp, address });
        
        if (pending) {
          // Check expiration using Clerk's expire_at if available, otherwise use timestamp
          let isExpired = false;
          
          if (expireAt) {
            // Use Clerk's expiration time
            const expirationTime = parseInt(expireAt, 10);
            const now = Date.now();
            isExpired = now > expirationTime;
            console.log("Checking Clerk expiration:", { expirationTime, now, isExpired });
          } else if (timestamp) {
            // Fallback: check if 24 hours have passed
            const sentTime = parseInt(timestamp, 10);
            const now = Date.now();
            const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            isExpired = now - sentTime > expirationTime;
            console.log("Checking fallback expiration:", { sentTime, now, expirationTime, isExpired });
          } else {
            // No expiration info - assume expired
            isExpired = true;
            console.log("No expiration info found, assuming expired");
          }
          
          if (isExpired) {
            // Verification link expired - clear pending state
            console.log("⚠️ Email verification link expired, clearing pending state");
            setVerificationPending(false);
            setPendingEmail(null);
            localStorage.removeItem(`clerk_verification_pending_${address}`);
            localStorage.removeItem(`clerk_verification_timestamp_${address}`);
            localStorage.removeItem(`clerk_verification_expire_at_${address}`);
          } else {
            console.log("✅ Found pending verification, setting state");
            setVerificationPending(true);
            setPendingEmail(pending);
          }
        } else {
          console.log("No pending verification found in localStorage");
        }
      }
    }
  }, [clerkUser, isClerkSignedIn, isLoaded, address]);
  
  // CRITICAL: Watch Clerk hooks for changes - per Clerk React docs, hooks update when session changes
  // This detects when a session is created in another tab and hooks update
  useEffect(() => {
    if (!verificationPending || !address) return;
    
    // When clerkUser or isClerkSignedIn changes, it means Clerk detected a session change
    // This happens when user verifies email in another tab
    if (clerkUser && isClerkSignedIn) {
      console.log("🔄 Clerk hooks changed - user signed in detected!");
      console.log("🔄 Reloading user to get fresh verification status from API...");
      
      // Reload user to get fresh data from Clerk API
      clerkUser.reload().then(() => {
        console.log("✅ User reloaded from API");
        const emailAddresses = clerkUser.emailAddresses || [];
        const verifiedEmail = emailAddresses.find((e: any) => {
          const matchesPending = pendingEmail ? e.emailAddress === pendingEmail : true;
          const isVerified = e.verification?.status !== 'unverified';
          return matchesPending && isVerified;
        });
        
        const hasVerifiedEmails = emailAddresses.some((e: any) => e.verification?.status !== 'unverified');
        
        console.log("🔍 Hook change verification check:", {
          verifiedEmail: !!verifiedEmail,
          hasVerifiedEmails,
          emailAddresses: emailAddresses.map((e: any) => ({
            email: e.emailAddress,
            status: e.verification?.status
          }))
        });
        
        if (verifiedEmail || hasVerifiedEmails) {
          console.log("✅ ✅ ✅ VERIFICATION DETECTED VIA CLERK HOOKS CHANGE!");
          setVerificationPending(false);
          setPendingEmail(null);
          setResendCountdown(null);
          setTimeUntilExpiration(null);
          localStorage.removeItem(`clerk_verification_pending_${address}`);
          localStorage.removeItem(`clerk_verification_timestamp_${address}`);
          localStorage.removeItem(`clerk_verification_expire_at_${address}`);
          
          addToast({
            message: "Email verified successfully!",
            type: "success",
          });
          
          // NO RELOAD - state update will trigger re-render
        }
      }).catch((error) => {
        console.error("Error reloading user in hook watcher:", error);
      });
    }
  }, [clerkUser, isClerkSignedIn, verificationPending, pendingEmail, address, addToast]);
  
  // Separate effect to sync state with localStorage when verificationPending changes externally
  useEffect(() => {
    if (address && !clerkUser && !isClerkSignedIn) {
      const pending = localStorage.getItem(`clerk_verification_pending_${address}`);
      if (pending && !verificationPending) {
        console.log("Syncing verificationPending from localStorage");
        setVerificationPending(true);
        setPendingEmail(pending);
      }
    }
  }, [address, clerkUser, isClerkSignedIn]);

  // Cross-tab communication: Listen for verification completion from other tabs
  useEffect(() => {
    if (!verificationPending || !address) return;

    // Method 1: BroadcastChannel API for cross-tab communication
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel(`clerk_verification_${address}`);
      broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'verification_complete') {
          console.log("📨 Received verification complete message from another tab");
          // NO RELOAD - trigger state check instead
          // The polling will detect the verification
        }
      };
    } catch (e) {
      console.warn("BroadcastChannel not supported:", e);
    }

    // Method 2: localStorage event listener (fires when localStorage changes in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `clerk_verification_complete_${address}` && e.newValue === 'true') {
        console.log("📨 Detected verification completion via localStorage change from another tab");
        // Clear the flag
        localStorage.removeItem(`clerk_verification_complete_${address}`);
        // Clear state immediately
        setVerificationPending(false);
        setPendingEmail(null);
        setResendCountdown(null);
        setTimeUntilExpiration(null);
        localStorage.removeItem(`clerk_verification_pending_${address}`);
        localStorage.removeItem(`clerk_verification_timestamp_${address}`);
        localStorage.removeItem(`clerk_verification_expire_at_${address}`);
        // NO RELOAD - trigger state check instead
        // The polling will detect the verification
      }
      
      // Also listen for Clerk session changes (Clerk stores session in localStorage)
      // Check if Clerk session was created in another tab
      if (e.key && (e.key.includes('__clerk') || e.key.includes('clerk'))) {
        console.log("📨 Clerk session change detected in localStorage:", e.key);
        console.log("📨 Old value:", e.oldValue ? "exists" : "null");
        console.log("📨 New value:", e.newValue ? "exists" : "null");
        
        // CRITICAL: Force Clerk to reload its session state immediately
        // This ensures we detect the new session from the other tab
        setTimeout(async () => {
          try {
            console.log("🔄 Checking localStorage for Clerk session after change...");
            
            // Check localStorage directly for Clerk session
            const clerkKeys = Object.keys(localStorage).filter(key => 
              key.includes('__clerk') || key.includes('clerk')
            );
            console.log("📡 Clerk keys in localStorage:", clerkKeys);
            
            // Force auth refresh by accessing properties that trigger reloads
            // Accessing auth properties forces Clerk to check localStorage
            const token = await auth.getToken({ template: 'default' }).catch(() => null);
            const userId = auth.userId;
            const isSignedIn = auth.isSignedIn;
            
            console.log("🔍 Auth state after localStorage change:", {
              hasToken: !!token,
              userId,
              isSignedIn,
              authIsSignedIn: auth.isSignedIn,
              clerkKeysFound: clerkKeys.length
            });
            
            if (token || auth.isSignedIn || auth.userId) {
              console.log("✅ ✅ ✅ Clerk session detected after localStorage change!");
              setVerificationPending(false);
              setPendingEmail(null);
              setResendCountdown(null);
              setTimeUntilExpiration(null);
              localStorage.removeItem(`clerk_verification_pending_${address}`);
              localStorage.removeItem(`clerk_verification_timestamp_${address}`);
              localStorage.removeItem(`clerk_verification_expire_at_${address}`);
              // NO RELOAD - state update will trigger re-render
            }
          } catch (err) {
            console.error("❌ Error checking auth after localStorage change:", err);
          }
        }, 100); // Reduced delay for faster detection
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Method 3: Periodic check of Clerk user status via SDK API CALLS (every 2 seconds)
    // PRIMARY METHOD: Check clerkUser directly from useUser() hook (same as StatsSection)
    // Don't gate on auth.isSignedIn or verificationPending - check clerkUser directly
    const checkVerificationStatus = async () => {
      console.log("🔄 =========================================");
      console.log("🔄 POLLING CLERK API VIA SDK (FRESH API CALLS)");
      console.log("🔄 =========================================");
      console.log("🔄 Current state:", {
        verificationPending,
        pendingEmail,
        address,
        clerkUserExists: !!clerkUser,
        clerkUserId: clerkUser?.id
      });
      
      try {
        // CRITICAL: Check clerkUser directly from useUser() hook FIRST (same as StatsSection)
        // StatsSection works because it checks clerkUser directly, not auth.isSignedIn
        // IMPORTANT: useUser() returns null when not signed in, but once verification completes
        // in another tab, Clerk's SDK should detect the session and clerkUser will become available
        if (clerkUser && address) {
          console.log("✅ clerkUser exists from useUser() hook - checking verification!");
          console.log("📡 clerkUser.id:", clerkUser.id);
          
          // Reload to get fresh verification status from Clerk API
          // This makes an actual HTTP request to Clerk API - you should see it in Network tab
          console.log("📡 🔄 MAKING API CALL: clerkUser.reload()");
          console.log("📡 API endpoint: https://[clerk-frontend-api].clerk.accounts.dev/v1/client/users/me");
          await clerkUser.reload();
          console.log("📡 ✅ API RESPONSE RECEIVED");
          
          // CRITICAL: Only check email verification status - don't rely on account setup completion
          // Account setup can be complete even if email isn't verified yet
          const emailAddresses = clerkUser.emailAddresses || [];
          const hasVerifiedEmails = emailAddresses.some((e: any) => 
            e.verification?.status !== 'unverified' && e.verification?.status !== null
          );
          
          // Only check account setup completion if email is verified
          const isAccountSetupComplete = hasVerifiedEmails ? verifyAccountSetupComplete(clerkUser, address) : false;
          
          console.log("📡 Verification check (same as StatsSection):", {
            isAccountSetupComplete,
            hasVerifiedEmails,
            emailAddresses: emailAddresses.map((e: any) => ({
              email: e.emailAddress,
              status: e.verification?.status
            })),
            primaryEmail: clerkUser.primaryEmailAddress?.emailAddress,
            primaryEmailVerified: clerkUser.primaryEmailAddress?.verification?.status,
            pendingEmail
          });
          
          // CRITICAL: Only clear pending state if email is ACTUALLY verified
          // Don't clear just because account setup is complete - email verification is required
          if (hasVerifiedEmails) {
            console.log("✅ ✅ ✅ EMAIL VERIFICATION COMPLETE DETECTED!");
            console.log("📡 Clearing verificationPending state...");
            
            setVerificationPending(false);
            setPendingEmail(null);
            setResendCountdown(null);
            setTimeUntilExpiration(null);
            localStorage.removeItem(`clerk_verification_pending_${address}`);
            localStorage.removeItem(`clerk_verification_timestamp_${address}`);
            localStorage.removeItem(`clerk_verification_expire_at_${address}`);
            
            // Broadcast to other tabs
            try {
              if (broadcastChannel) {
                broadcastChannel.postMessage({ type: 'verification_complete' });
              }
              localStorage.setItem(`clerk_verification_complete_${address}`, 'true');
            } catch (e) {
              console.warn("Failed to broadcast verification completion:", e);
            }
            
            addToast({
              message: "Email verified successfully!",
              type: "success",
            });
            return;
          } else {
            console.log("⏳ Email NOT verified yet - keeping pending state");
          }
        } else {
          // clerkUser is null - this means useUser() hasn't detected the Clerk session yet
          // This happens when verification completes in another tab but Clerk SDK hasn't refreshed
          // We need to force Clerk SDK to check for session by calling auth.getToken() or similar
          console.log("⏳ clerkUser is null - Clerk SDK hasn't detected session yet");
          console.log("⏳ clerkUser:", !!clerkUser, "address:", address);
          console.log("⏳ clerkLoaded:", clerkLoaded, "isClerkSignedIn:", isClerkSignedIn);
          
          // Try to force Clerk SDK to refresh session by calling auth.getToken()
          // This might trigger Clerk to detect the session from cookies
          if (address && !clerkLoaded) {
            console.log("📡 Clerk not loaded yet - waiting for SDK to initialize...");
          } else if (address && clerkLoaded && !clerkUser) {
            console.log("📡 Clerk loaded but no user - session might not be detected yet");
            console.log("📡 Attempting to force session refresh...");
            try {
              // Try to get token - this might trigger Clerk to check cookies and detect session
              await auth.getToken();
              console.log("📡 Token retrieved - checking if clerkUser is now available...");
              
              // After getting token, check if clerkUser is now available
              // Note: useUser() hook should automatically update when session is detected
              // But we can't directly access it here - it will be available on next render
              // So we just log and let the next poll check
              console.log("📡 If session exists, clerkUser should be available on next poll");
            } catch (e) {
              console.log("📡 Token retrieval failed (expected if not signed in):", e);
            }
          }
          
          // CRITICAL: Also check if StatsSection's user exists (from useClerkUser)
          // StatsSection shows isAccountSetupComplete: true, which means user exists
          // If StatsSection has user but clerkUser is null, we should use StatsSection's user
          // But we can't access StatsSection's user here - we need to check via useClerkUser
          // Actually, we already have `user` from useClerkUser() - let's check if it's a real Clerk user
          console.log("📡 Checking user from useClerkUser() as fallback...");
          console.log("📡 user exists:", !!user);
          console.log("📡 user.id:", user?.id);
          console.log("📡 user.publicMetadata:", user?.publicMetadata);
          
          if (address && user) {
            // Check if this is a real Clerk user by checking publicMetadata for reown_address
            // If publicMetadata.reown_address exists and matches, it's a Clerk user
            const hasReownAddress = (user.publicMetadata as any)?.reown_address;
            const hasSmartAccountAddress = (user.publicMetadata as any)?.smart_account_address;
            const isRealClerkUser = hasReownAddress || hasSmartAccountAddress || (user.id && !user.id.startsWith('0x'));
            
            console.log("📡 User check:", {
              hasReownAddress,
              hasSmartAccountAddress,
              userId: user.id,
              isRealClerkUser,
              publicMetadata: user.publicMetadata
            });
            
            if (isRealClerkUser) {
              // This is a real Clerk user (not a Reown mock user)
              // Check verification using this user - same logic as StatsSection
              // BUT: Only clear pending if email is ACTUALLY verified, not just if account setup is complete
              console.log("📡 Found Clerk user via useClerkUser() - checking verification...");
              console.log("📡 User ID:", user.id);
              
              const emailAddresses = (user as any).emailAddresses || [];
              const hasVerifiedEmails = emailAddresses.some((e: any) => 
                e.verification?.status !== 'unverified' && e.verification?.status !== null
              );
              
              // CRITICAL: Only check account setup completion if we have verified emails
              // Don't clear pending state just because account setup is complete - email must be verified
              const isAccountSetupComplete = hasVerifiedEmails ? verifyAccountSetupComplete(user as any, address) : false;
              
              console.log("📡 Verification check via useClerkUser():", {
                isAccountSetupComplete,
                hasVerifiedEmails,
                emailAddresses: emailAddresses.map((e: any) => ({
                  email: e.emailAddress,
                  status: e.verification?.status
                })),
                pendingEmail
              });
              
              // CRITICAL: Only clear pending if email is ACTUALLY verified
              // Don't rely on account setup completion alone - email verification is required
              if (hasVerifiedEmails) {
                console.log("✅ ✅ ✅ EMAIL VERIFICATION COMPLETE DETECTED via useClerkUser()!");
                setVerificationPending(false);
                setPendingEmail(null);
                setResendCountdown(null);
                setTimeUntilExpiration(null);
                localStorage.removeItem(`clerk_verification_pending_${address}`);
                localStorage.removeItem(`clerk_verification_timestamp_${address}`);
                localStorage.removeItem(`clerk_verification_expire_at_${address}`);
                
                try {
                  if (broadcastChannel) {
                    broadcastChannel.postMessage({ type: 'verification_complete' });
                  }
                  localStorage.setItem(`clerk_verification_complete_${address}`, 'true');
                } catch (e) {
                  console.warn("Failed to broadcast verification completion:", e);
                }
                
                addToast({
                  message: "Email verified successfully!",
                  type: "success",
                });
                return;
              } else {
                console.log("⏳ User exists but email NOT verified yet - keeping pending state");
              }
            } else {
              console.log("⏳ user is a Reown mock user (not Clerk user yet)");
            }
          } else {
            console.log("⏳ user is null or address missing");
          }
        }
      } catch (error: any) {
        console.error("❌ Error checking verification status:", error);
      }
      
      console.log("🔄 =========================================");
      console.log("🔄 POLLING COMPLETE - Waiting for next check (2 seconds)");
      console.log("🔄 =========================================");
    };

    // Check immediately, then every 2 seconds (polling Clerk API more frequently)
    // Reduced from 3 seconds to 2 seconds for faster detection
    checkVerificationStatus();
    const intervalId = setInterval(checkVerificationStatus, 2000);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [verificationPending, address, clerkUser, clerkLoaded, user, isClerkSignedIn, pendingEmail, addToast, signUp, signUpLoaded, auth]);
  
  // Countdown timer for resend email button (5 minutes before expiration time)
  // Continuously monitors Clerk API expiration time and clears pending state when expired
  useEffect(() => {
    if (!verificationPending || !address) {
      console.log("⏸️ Expiration monitoring paused:", { verificationPending, address });
      setResendCountdown(null);
      setTimeUntilExpiration(null);
      return;
    }
    
    const expireAt = localStorage.getItem(`clerk_verification_expire_at_${address}`);
    if (!expireAt) {
      console.log("⚠️ No expiration time found in localStorage for address:", address);
      setResendCountdown(null);
      return;
    }
    
    const expirationTime = parseInt(expireAt, 10);
    const fiveMinutesMs = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    console.log("🔍 Starting expiration monitoring:", {
      address,
      expirationTime,
      expirationDate: new Date(expirationTime).toISOString(),
      currentTime: Date.now(),
      currentDate: new Date().toISOString(),
    });
    
    // Calculate countdown: time remaining until we're 5 minutes before expiration
    // This function re-reads from localStorage every time to get the latest expiration time
    const calculateCountdown = (logDetails = false) => {
      // Always re-read from localStorage to get latest expiration time (important for resend)
      const currentExpireAt = localStorage.getItem(`clerk_verification_expire_at_${address}`);
      if (!currentExpireAt) {
        if (logDetails) {
          console.log("⚠️ Expiration time removed from localStorage during countdown");
        }
        return null;
      }
      
      const currentExpirationTime = parseInt(currentExpireAt, 10);
      const now = Date.now();
      const timeUntilExpirationMs = currentExpirationTime - now;
      const timeUntilExpirationSeconds = Math.floor(timeUntilExpirationMs / 1000);
      
      // Update timeUntilExpiration state for UI display
      setTimeUntilExpiration(timeUntilExpirationMs > 0 ? timeUntilExpirationSeconds : null);
      
      // Log detailed calculation only when requested (initial call or important events)
      if (logDetails) {
        console.log("⏱️ Countdown calculation:", {
          expirationTime: currentExpirationTime,
          expirationDate: new Date(currentExpirationTime).toISOString(),
          currentTime: now,
          currentDate: new Date(now).toISOString(),
          timeUntilExpirationMs: timeUntilExpirationMs,
          timeUntilExpirationMinutes: (timeUntilExpirationMs / 1000 / 60).toFixed(2),
          fiveMinutesMs,
        });
      }
      
      // Check if expiration has completely passed
      if (timeUntilExpirationMs <= 0) {
        // Expiration has passed - clear pending state and show "Complete Account Setup"
        console.log("⚠️ ⚠️ ⚠️ =========================================");
        console.log("⚠️ ⚠️ ⚠️ Verification link EXPIRED (in calculateCountdown)!");
        console.log("⚠️ ⚠️ ⚠️ =========================================");
        console.log("⚠️ ⚠️ ⚠️ Clearing pending state and resetting to 'Complete Account Setup'", {
          expirationTime: currentExpirationTime,
          expirationDate: new Date(currentExpirationTime).toISOString(),
          currentTime: now,
          currentDate: new Date(now).toISOString(),
          timePastExpiration: Math.abs(timeUntilExpirationMs),
          timePastExpirationMs: Math.abs(timeUntilExpirationMs),
          timePastExpirationSeconds: Math.floor(Math.abs(timeUntilExpirationMs) / 1000),
          timePastExpirationMinutes: (Math.abs(timeUntilExpirationMs) / 1000 / 60).toFixed(2),
        });
        console.log("⚠️ ⚠️ ⚠️ UI should now show 'Complete Account Setup' button");
        console.log("⚠️ ⚠️ ⚠️ =========================================");
        
        setVerificationPending(false);
        setPendingEmail(null);
        setResendCountdown(null);
        setTimeUntilExpiration(null);
        localStorage.removeItem(`clerk_verification_pending_${address}`);
        localStorage.removeItem(`clerk_verification_timestamp_${address}`);
        localStorage.removeItem(`clerk_verification_expire_at_${address}`);
        return null;
      }
      
      // If less than 5 minutes until expiration, no countdown (button enabled)
      if (timeUntilExpirationMs <= fiveMinutesMs) {
        if (logDetails) {
          console.log("✅ Within 5 minutes of expiration - button enabled (no countdown)", {
            timeUntilExpirationMs: timeUntilExpirationMs,
            timeUntilExpirationMinutes: (timeUntilExpirationMs / 1000 / 60).toFixed(2),
          });
        }
        return null;
      }
      
      // Countdown = time until expiration - 5 minutes
      // This shows how long until we reach the 5-minute mark before expiration
      const countdownSeconds = Math.floor((timeUntilExpirationMs - fiveMinutesMs) / 1000);
      
      if (logDetails) {
        const countdownMinutes = Math.floor(countdownSeconds / 60);
        const countdownSecondsRemainder = countdownSeconds % 60;
        console.log("⏳ Countdown active:", {
          countdownSeconds,
          display: `${countdownMinutes}:${String(countdownSecondsRemainder).padStart(2, '0')}`,
          timeUntilExpirationMs: timeUntilExpirationMs,
          timeUntilExpirationMinutes: (timeUntilExpirationMs / 1000 / 60).toFixed(2),
        });
      }
      
      return Math.max(0, countdownSeconds);
    };
    
    // Set initial countdown (with detailed logging)
    const initialCountdown = calculateCountdown(true); // true = log details
    console.log("🎬 Initial countdown set:", {
      countdown: initialCountdown,
      countdownMinutes: initialCountdown !== null ? Math.floor(initialCountdown / 60) : null,
      countdownSeconds: initialCountdown !== null ? initialCountdown % 60 : null,
    });
    setResendCountdown(initialCountdown);
    
    // If no countdown needed or expired, don't set up interval
    if (initialCountdown === null || initialCountdown <= 0) {
      console.log("⏸️ No interval needed - countdown is null or expired");
      return;
    }
    
    console.log("🔄 Setting up expiration monitoring interval (checking every 1 second)");
    
    // Set up interval to update countdown every second and check expiration
    const interval = setInterval(() => {
      // Re-check expiration time in case it changed (e.g., after resend)
      const currentExpireAt = localStorage.getItem(`clerk_verification_expire_at_${address}`);
      if (!currentExpireAt) {
        console.log("⚠️ Expiration time removed from localStorage - stopping interval");
        clearInterval(interval);
        return;
      }
      
      const currentExpirationTime = parseInt(currentExpireAt, 10);
      const now = Date.now();
      
      // Check if expiration has passed
      if (now > currentExpirationTime) {
        // Expiration has passed - clear pending state and show "Complete Account Setup"
        console.log("⚠️ ⚠️ ⚠️ =========================================");
        console.log("⚠️ ⚠️ ⚠️ EXPIRATION DETECTED - LINK EXPIRED!");
        console.log("⚠️ ⚠️ ⚠️ =========================================");
        console.log("⚠️ ⚠️ ⚠️ Clearing pending state and resetting to 'Complete Account Setup'", {
          expirationTime: currentExpirationTime,
          expirationDate: new Date(currentExpirationTime).toISOString(),
          currentTime: now,
          currentDate: new Date(now).toISOString(),
          timePastExpiration: now - currentExpirationTime,
          timePastExpirationMs: now - currentExpirationTime,
          timePastExpirationSeconds: Math.floor((now - currentExpirationTime) / 1000),
          timePastExpirationMinutes: ((now - currentExpirationTime) / 1000 / 60).toFixed(2),
        });
        console.log("⚠️ ⚠️ ⚠️ UI should now show 'Complete Account Setup' button");
        console.log("⚠️ ⚠️ ⚠️ =========================================");
        
        setVerificationPending(false);
        setPendingEmail(null);
        setResendCountdown(null);
        setTimeUntilExpiration(null);
        localStorage.removeItem(`clerk_verification_pending_${address}`);
        localStorage.removeItem(`clerk_verification_timestamp_${address}`);
        localStorage.removeItem(`clerk_verification_expire_at_${address}`);
        clearInterval(interval);
        
        // Show toast notification
        addToast({
          message: "Verification link has expired. Please complete account setup again.",
          type: "warning",
        });
        
        return;
      }
      
      // Calculate countdown (without detailed logging to avoid spam)
      const remaining = calculateCountdown(false);
      
      // Update timeUntilExpiration state for UI display
      const timeUntilExpirationMs = currentExpirationTime - now;
      const timeUntilExpirationSeconds = Math.floor(timeUntilExpirationMs / 1000);
      setTimeUntilExpiration(timeUntilExpirationMs > 0 ? timeUntilExpirationSeconds : null);
      
      if (remaining === null || remaining <= 0) {
        // Countdown finished (we're now within 5 minutes of expiration)
        console.log("✅ Countdown finished - button now enabled", {
          remaining,
          timeUntilExpiration: timeUntilExpirationMs,
          timeUntilExpirationSeconds,
          timeUntilExpirationMinutes: (timeUntilExpirationMs / 1000 / 60).toFixed(2),
        });
        setResendCountdown(null);
        // Continue monitoring expiration time even after countdown ends
        // Don't clear interval - keep updating timeUntilExpiration for UI
      } else {
        // Update countdown (log every 10 seconds or when < 60 seconds to avoid spam)
        if (remaining % 10 === 0 || remaining < 60) {
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          console.log("⏳ Countdown update:", {
            remaining,
            display: `${minutes}:${String(seconds).padStart(2, '0')}`,
            timeUntilExpiration: timeUntilExpirationMs,
            timeUntilExpirationSeconds,
            timeUntilExpirationMinutes: (timeUntilExpirationMs / 1000 / 60).toFixed(2),
            expirationDate: new Date(currentExpirationTime).toISOString(),
            currentDate: new Date(now).toISOString(),
          });
        }
        setResendCountdown(remaining);
      }
    }, 1000);
    
    console.log("✅ Expiration monitoring interval started");
    
    return () => {
      console.log("🛑 Cleaning up expiration monitoring interval");
      clearInterval(interval);
    };
  }, [verificationPending, address]);

  const loadSubscriptions = async () => {
    // Need a real Clerk user object (from useUser hook) to access metadata
    // useClerkUser might return a mock/Reown-based user which doesn't have update()
    if (!clerkUser || !isClerkSignedIn) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await getSubscribedSlots(clerkUser.id, clerkUser);
      if (result.error) {
        throw result.error;
      }
      setSubscribedSlots(result.data);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
      addToast({
        message: "Failed to load ad slot subscriptions",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (slotId: string) => {
    if (!clerkUser || !isClerkSignedIn) return;

    setUpdatingSlot(slotId);
    try {
      const result = await subscribeToSlot({
        userId: clerkUser.id,
        user: clerkUser,
        slotId,
      });

      if (result.success) {
        addToast({
          message: "Subscribed to ad slot! You'll receive notifications when auctions open.",
          type: "success",
        });
        await loadSubscriptions();
        // Refresh user to update points
        await clerkUser.reload();
      } else {
        addToast({
          message: result.error || "Failed to subscribe",
          type: "error",
        });
      }
    } catch (error) {
      addToast({
        message: error instanceof Error ? error.message : "Failed to subscribe",
        type: "error",
      });
    } finally {
      setUpdatingSlot(null);
    }
  };

  const handleUnsubscribe = async (slotId: string) => {
    if (!clerkUser || !isClerkSignedIn) return;

    setUpdatingSlot(slotId);
    try {
      const result = await unsubscribeFromSlot(clerkUser.id, slotId, clerkUser);

      if (result.success) {
        addToast({
          message: "Unsubscribed from ad slot",
          type: "success",
        });
        // Reload user to refresh metadata
        await clerkUser.reload();
        await loadSubscriptions();
      } else {
        addToast({
          message: result.error || "Failed to unsubscribe",
          type: "error",
        });
      }
    } catch (error) {
      addToast({
        message: error instanceof Error ? error.message : "Failed to unsubscribe",
        type: "error",
      });
    } finally {
      setUpdatingSlot(null);
    }
  };

  if (!isLoaded) {
    return null;
  }

  // Handlers for account setup (moved outside JSX)
  const handlePromptEmail = () => {
    if (isConnected && address) {
      setShowEmailPrompt(true);
    }
  };

  const handleEmailSkipped = () => {
    setShowEmailPrompt(false);
  };

  const handleEmailProvided = async (email: string, password: string) => {
    console.log("handleEmailProvided called with email:", email);
    console.log("address:", address);
    console.log("signUp from hook:", signUp);
    console.log("signUpLoaded:", signUpLoaded);
    console.log("auth.isLoaded:", auth.isLoaded);
    
    if (!address) {
      console.error("No wallet address available");
      addToast({
        message: "No wallet address found. Please connect your wallet first.",
        type: "error",
      });
      return;
    }
    
    if (!auth.isLoaded || !clerk.loaded) {
      console.error("Clerk is not fully loaded yet");
      addToast({
        message: "Authentication service is loading. Please wait a moment and try again.",
        type: "warning",
      });
      return;
    }
    
    // Try multiple ways to get signUp instance
    // 1. From useSignUp hook (primary source)
    // 2. From clerk.client.signUp (fallback)
    let signUpInstance = signUp;
    
    // If still not available, try to get it from clerk.client
    if (!signUpInstance && clerk.client) {
      try {
        signUpInstance = clerk.client.signUp as any;
      } catch (e) {
        console.error("Failed to access clerk.client.signUp:", e);
      }
    }
    
    if (!signUpInstance) {
      console.error("Clerk signUp is not available from any source");
      console.error("signUp from hook:", signUp);
      console.error("clerk.client:", clerk.client);
      console.error("clerk.loaded:", clerk.loaded);
      
      // Last resort: retry once if we haven't retried too many times
      if (signUpRetryCount < 2) {
        setSignUpRetryCount(prev => prev + 1);
        addToast({
          message: "Initializing account creation...",
          type: "info",
        });
        
        // Wait a bit and retry
        setTimeout(() => {
          const storedPassword = localStorage.getItem(`reown_password_${address}`);
          if (storedPassword) {
            handleEmailProvided(email, storedPassword);
          } else {
            addToast({
              message: "Please try again with your password.",
              type: "warning",
            });
            setShowEmailPrompt(true);
          }
        }, 1000);
        return;
      } else {
        addToast({
          message: "Account creation service is not available. Please refresh the page and try again.",
          type: "error",
        });
        setSignUpRetryCount(0);
        return;
      }
    }
    
    // Reset retry count on success
    setSignUpRetryCount(0);
    
    // Store email and password
    localStorage.setItem(`reown_email_${address}`, email);
    localStorage.setItem(`reown_password_${address}`, password);
    
    setIsLoading(true);
    addToast({
      message: "Creating your account...",
      type: "info",
    });
    
    try {
      console.log("Attempting to create Clerk user with email:", email);
      console.log("Using signUp instance:", signUpInstance);
      
      // Generate username from email (before @ symbol)
      const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 20);
      
      // Prepare user data
      const userData = {
        emailAddress: email,
        username: username,
        firstName: address?.slice(0, 8) || "User",
        lastName: address?.slice(-4) || "Account",
        password: password,
      };
      
      // If signUp instance already has an ID, use update() instead of create()
      let result;
      if (signUpInstance.id) {
        console.log("SignUp instance already exists (ID:", signUpInstance.id, "), using update()...");
        result = await signUpInstance.update(userData);
      } else {
        console.log("Creating new SignUp instance with create()...");
        result = await signUpInstance.create(userData);
      }
      
      console.log("✅ SignUp result:", result);
      
      // Handle different signup statuses
      if (result.status === "complete") {
        console.log("✅ Clerk user created successfully");
        setShowEmailPrompt(false);
        
        if (result.createdUserId && address) {
          try {
            const { storeAccountLink } = await import("@/lib/services/accountLinkingService");
            storeAccountLink(address.toLowerCase(), result.createdUserId);
            console.log("✅ Account link stored:", address.toLowerCase(), "→", result.createdUserId);
          } catch (linkError) {
            console.error("Failed to store account link:", linkError);
          }
        }
        
        addToast({
          message: "Account created successfully!",
          type: "success",
        });
        setIsLoading(false);
      } else if (result.status === "missing_requirements") {
        // If email verification is required
        if (result.unverifiedFields && result.unverifiedFields.includes('email_address')) {
          console.log("📧 Email verification required, preparing verification...");
          try {
            await signUpInstance.prepareEmailAddressVerification({
              strategy: "email_link",
              redirectUrl: window.location.origin,
            });
            
            const emailVerification = signUpInstance.verifications?.emailAddress;
            const expireAt = emailVerification?.expireAt;
            
            setShowEmailPrompt(false);
            setVerificationPending(true);
            setPendingEmail(email);
            
            localStorage.setItem(`clerk_verification_pending_${address}`, email);
            if (expireAt) {
              const expireAtTimestamp = typeof expireAt === 'number' 
                ? expireAt 
                : new Date(expireAt).getTime();
              localStorage.setItem(`clerk_verification_expire_at_${address}`, expireAtTimestamp.toString());
            } else {
              localStorage.setItem(`clerk_verification_expire_at_${address}`, (Date.now() + 10 * 60 * 1000).toString());
            }
            localStorage.setItem(`clerk_verification_timestamp_${address}`, Date.now().toString());
            
            if (result.createdUserId && address) {
              try {
                const { storeAccountLink } = await import("@/lib/services/accountLinkingService");
                storeAccountLink(address.toLowerCase(), result.createdUserId);
                localStorage.setItem(`pending_reown_address_${result.createdUserId}`, address.toLowerCase());
              } catch (linkError) {
                console.error("Failed to store account link:", linkError);
              }
            }
            
            addToast({
              message: "Please check your email to verify your account. A verification link has been sent.",
              type: "info",
            });
            setIsLoading(false);
            return;
          } catch (verifyError: any) {
            console.error("❌ Verification preparation error:", verifyError);
            addToast({
              message: "Account created but email verification is required. Please check your email.",
              type: "warning",
            });
            setIsLoading(false);
            return;
          }
        }
        
        addToast({
          message: "Account creation in progress. Please check your email for verification.",
          type: "info",
        });
        setIsLoading(false);
      } else {
        console.log("⚠️ Unexpected SignUp status:", result.status);
        addToast({
          message: `Signup status: ${result.status}. Please check console for details.`,
          type: "warning",
        });
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Failed to create Clerk user:", error);
      setIsLoading(false);
      
      const passwordError = error?.errors?.find((e: any) => {
        const fieldName = e.meta?.fieldName;
        const code = e.code || '';
        const message = (e.message || e.longMessage || '').toLowerCase();
        return fieldName === 'password' || 
               code.includes('password') ||
               code.includes('form_password') ||
               message.includes('password') ||
               message.includes('compromised');
      });
      
      if (passwordError) {
        const errorMessage = passwordError.longMessage || 
                            passwordError.message || 
                            "Password does not meet requirements. Please choose a different password.";
        throw new Error(errorMessage);
      }
      
      if (error?.errors?.[0]?.code === "form_identifier_exists" || 
          error?.message?.includes("already exists")) {
        addToast({
          message: "Account already exists.",
          type: "info",
        });
      } else {
        const errorMessage = error?.errors?.[0]?.message || 
                            error?.errors?.[0]?.longMessage ||
                            error?.message || 
                            "Failed to create account. Please try again or contact support.";
        addToast({
          message: errorMessage,
          type: "error",
        });
      }
    }
  };

  // Debug log
  console.log("Render - verificationPending:", verificationPending, "pendingEmail:", pendingEmail);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Ad Slot Subscriptions
        </h2>
      </div>

      {/* Show subscriptions when signed in to Clerk */}
      <SignedIn>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Subscribe to ad slots to receive notifications when auctions open. You&apos;ll earn 10 points for each subscription.
        </p>

        {subscribedSlots.length === 0 ? (
          <div className="text-center py-8">
            <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              You&apos;re not subscribed to any ad slots yet.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Visit the{" "}
              <a href="/auctions" className="text-blue-500 hover:text-blue-600">
                Auctions page
              </a>{" "}
              to subscribe to slots.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscribedSlots.map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {subscription.slot_id}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      {subscription.notification_email ? (
                        <Bell className="w-4 h-4 text-green-500" />
                      ) : (
                        <BellOff className="w-4 h-4 text-gray-400" />
                      )}
                      Email
                    </span>
                    <span className="flex items-center gap-1">
                      {subscription.notification_push ? (
                        <Bell className="w-4 h-4 text-green-500" />
                      ) : (
                        <BellOff className="w-4 h-4 text-gray-400" />
                      )}
                      Push
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleUnsubscribe(subscription.slot_id)}
                  disabled={updatingSlot === subscription.slot_id}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updatingSlot === subscription.slot_id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Unsubscribe"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </SignedIn>

      {/* Show "Complete Account Setup" when NOT signed in to Clerk */}
      <SignedOut>
        {verificationPending ? (
          <>
            <div className="flex items-start gap-4 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Mail className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Email Verification Pending
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  We&apos;ve sent a verification link to <strong className="text-gray-900 dark:text-gray-100">{pendingEmail}</strong>. 
                  Please check your email and click the verification link to complete your account setup.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Waiting for email verification...</span>
                </div>
                {timeUntilExpiration !== null && timeUntilExpiration > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {timeUntilExpiration >= 60 ? (
                      <span>Link expires in {Math.floor(timeUntilExpiration / 60)} minute{Math.floor(timeUntilExpiration / 60) !== 1 ? 's' : ''} {timeUntilExpiration % 60 > 0 ? `and ${timeUntilExpiration % 60} second${timeUntilExpiration % 60 !== 1 ? 's' : ''}` : ''}</span>
                    ) : (
                      <span>Link expires in {timeUntilExpiration} second{timeUntilExpiration !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                )}
                {timeUntilExpiration !== null && timeUntilExpiration <= 0 && (
                  <div className="text-xs text-red-500 dark:text-red-400">
                    Verification link has expired
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    if (signUp && signUpLoaded) {
                      const currentStatus = signUp.status;
                      console.log("Current signUp status:", currentStatus);
                      
                      if (currentStatus === "complete") {
                        console.log("✅ Verification completed!");
                        addToast({
                          message: "Email verified successfully!",
                          type: "success",
                        });
                      } else {
                        addToast({
                          message: "Please check your email and click the verification link.",
                          type: "info",
                        });
                      }
                    }
                  } catch (error) {
                    console.error("Error checking verification status:", error);
                    addToast({
                      message: "Failed to check verification status. Please try again.",
                      type: "error",
                    });
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Check Verification Status
              </button>
              <button
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    let signUpInstance = signUp;
                    if (!signUpInstance && clerk.client) {
                      signUpInstance = clerk.client.signUp as any;
                    }
                    
                    if (!signUpInstance) {
                      setVerificationPending(false);
                      setPendingEmail(null);
                      localStorage.removeItem(`clerk_verification_pending_${address}`);
                      localStorage.removeItem(`clerk_verification_timestamp_${address}`);
                      localStorage.removeItem(`clerk_verification_expire_at_${address}`);
                      addToast({
                        message: "Please click 'Complete Account Setup' to start over.",
                        type: "info",
                      });
                      setIsLoading(false);
                      return;
                    }
                    
                    await signUpInstance.prepareEmailAddressVerification({
                      strategy: "email_link",
                      redirectUrl: window.location.origin,
                    });
                    
                    const emailVerification = signUpInstance.verifications?.emailAddress;
                    const expireAt = emailVerification?.expireAt;
                    
                    if (expireAt) {
                      const expireAtTimestamp = typeof expireAt === 'number' 
                        ? expireAt 
                        : new Date(expireAt).getTime();
                      localStorage.setItem(`clerk_verification_expire_at_${address}`, expireAtTimestamp.toString());
                      
                      const now = Date.now();
                      const timeUntilExpiration = expireAtTimestamp - now;
                      const fiveMinutesMs = 5 * 60 * 1000;
                      
                      if (timeUntilExpiration > fiveMinutesMs) {
                        const countdownSeconds = Math.floor((timeUntilExpiration - fiveMinutesMs) / 1000);
                        setResendCountdown(Math.max(0, countdownSeconds));
                      } else {
                        setResendCountdown(null);
                      }
                    } else {
                      const fallbackExpiration = Date.now() + 10 * 60 * 1000;
                      localStorage.setItem(`clerk_verification_expire_at_${address}`, fallbackExpiration.toString());
                      setResendCountdown(5 * 60);
                    }
                    
                    localStorage.setItem(`clerk_verification_timestamp_${address}`, Date.now().toString());
                    
                    addToast({
                      message: "Verification email resent! Please check your email.",
                      type: "success",
                    });
                    
                    setIsLoading(false);
                  } catch (error: any) {
                    console.error("Failed to resend verification email:", error);
                    addToast({
                      message: error?.message || "Failed to resend email. Please try 'Complete Account Setup' again.",
                      type: "error",
                    });
                    setIsLoading(false);
                  }
                }}
                disabled={resendCountdown !== null && resendCountdown > 0}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
              >
                {resendCountdown !== null && resendCountdown > 0 ? (
                  `Resend Email (${Math.floor(resendCountdown / 60)}:${String(resendCountdown % 60).padStart(2, '0')})`
                ) : (
                  "Resend Email"
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please complete your account setup to manage ad slot subscriptions. Your Reown wallet is connected, but we need to create your Clerk account for subscription management.
            </p>
            {isConnected && address && (
              <button
                onClick={handlePromptEmail}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Complete Account Setup
              </button>
            )}
          </>
        )}
        {showEmailPrompt && address && !verificationPending && (
          <EmailPrompt
            address={address}
            onEmailProvided={handleEmailProvided}
            onSkip={handleEmailSkipped}
          />
        )}
      </SignedOut>
    </div>
  );
}
