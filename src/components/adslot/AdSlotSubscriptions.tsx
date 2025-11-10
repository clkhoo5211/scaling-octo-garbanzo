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
        
        // CRITICAL: Only clear pending state if email is ACTUALLY verified
        // Don't clear just because user is signed in - email verification is required
        if (hasVerifiedEmails || verifiedPendingEmail || primaryEmailVerified) {
          setVerificationPending(false);
          setPendingEmail(null);
          setResendCountdown(null);
          setTimeUntilExpiration(null);
          localStorage.removeItem(`clerk_verification_pending_${address}`);
          localStorage.removeItem(`clerk_verification_timestamp_${address}`);
          localStorage.removeItem(`clerk_verification_expire_at_${address}`);
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
        
        if (pending) {
          // Check expiration using Clerk's expire_at if available, otherwise use timestamp
          let isExpired = false;
          
          if (expireAt) {
            // Use Clerk's expiration time
            const expirationTime = parseInt(expireAt, 10);
            const now = Date.now();
            isExpired = now > expirationTime;
          } else if (timestamp) {
            // Fallback: check if 24 hours have passed
            const sentTime = parseInt(timestamp, 10);
            const now = Date.now();
            const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            isExpired = now - sentTime > expirationTime;
          } else {
            // No expiration info - assume expired
            isExpired = true;
          }
          
          if (isExpired) {
            // Verification link expired - clear pending state
            setVerificationPending(false);
            setPendingEmail(null);
            localStorage.removeItem(`clerk_verification_pending_${address}`);
            localStorage.removeItem(`clerk_verification_timestamp_${address}`);
            localStorage.removeItem(`clerk_verification_expire_at_${address}`);
          } else {
            setVerificationPending(true);
            setPendingEmail(pending);
          }
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
      
      // Reload user to get fresh data from Clerk API
      clerkUser.reload().then(() => {
        const emailAddresses = clerkUser.emailAddresses || [];
        const verifiedEmail = emailAddresses.find((e: any) => {
          const matchesPending = pendingEmail ? e.emailAddress === pendingEmail : true;
          const isVerified = e.verification?.status !== 'unverified';
          return matchesPending && isVerified;
        });
        
        const hasVerifiedEmails = emailAddresses.some((e: any) => e.verification?.status !== 'unverified');
        
        if (verifiedEmail || hasVerifiedEmails) {
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
      });
    }
  }, [clerkUser, isClerkSignedIn, verificationPending, pendingEmail, address, addToast]);
  
  // Separate effect to sync state with localStorage when verificationPending changes externally
  useEffect(() => {
    if (address && !clerkUser && !isClerkSignedIn) {
      const pending = localStorage.getItem(`clerk_verification_pending_${address}`);
      if (pending && !verificationPending) {
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
          // NO RELOAD - trigger state check instead
          // The polling will detect the verification
        }
      };
    } catch (e) {
      // BroadcastChannel not supported, ignore
    }

    // Method 2: localStorage event listener (fires when localStorage changes in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `clerk_verification_complete_${address}` && e.newValue === 'true') {
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
        
        // CRITICAL: Force Clerk to reload its session state immediately
        // This ensures we detect the new session from the other tab
        setTimeout(async () => {
          try {
            
            // Check localStorage directly for Clerk session
            const clerkKeys = Object.keys(localStorage).filter(key => 
              key.includes('__clerk') || key.includes('clerk')
            );
            
            // Force auth refresh by accessing properties that trigger reloads
            // Accessing auth properties forces Clerk to check localStorage
            const token = await auth.getToken({ template: 'default' }).catch(() => null);
            const userId = auth.userId;
            const isSignedIn = auth.isSignedIn;
            
            if (token || auth.isSignedIn || auth.userId) {
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
            // Error checking auth, ignore
          }
        }, 100); // Reduced delay for faster detection
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Method 3: Periodic check of Clerk user status via SDK API CALLS (every 2 seconds)
    // PRIMARY METHOD: Check clerkUser directly from useUser() hook (same as StatsSection)
    // Don't gate on auth.isSignedIn or verificationPending - check clerkUser directly
    const checkVerificationStatus = async () => {
      
      try {
        // CRITICAL: Check clerkUser directly from useUser() hook FIRST (same as StatsSection)
        // StatsSection works because it checks clerkUser directly, not auth.isSignedIn
        // IMPORTANT: useUser() returns null when not signed in, but once verification completes
        // in another tab, Clerk's SDK should detect the session and clerkUser will become available
        if (clerkUser && address) {
          
          // Reload to get fresh verification status from Clerk API
          // This makes an actual HTTP request to Clerk API - you should see it in Network tab
          await clerkUser.reload();
          
          // CRITICAL: Only check email verification status - don't rely on account setup completion
          // Account setup can be complete even if email isn't verified yet
          const emailAddresses = clerkUser.emailAddresses || [];
          const hasVerifiedEmails = emailAddresses.some((e: any) => 
            e.verification?.status !== 'unverified' && e.verification?.status !== null
          );
          
          // Only check account setup completion if email is verified
          const isAccountSetupComplete = hasVerifiedEmails ? verifyAccountSetupComplete(clerkUser, address) : false;
          
          // CRITICAL: Only clear pending state if email is ACTUALLY verified
          // Don't clear just because account setup is complete - email verification is required
          if (hasVerifiedEmails) {

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
              // Failed to broadcast verification completion, ignore
            }
            
            addToast({
              message: "Email verified successfully!",
              type: "success",
            });
            return;
          }
          // Email not verified yet - keep pending state
        } else {
          // clerkUser is null - this means useUser() hasn't detected the Clerk session yet
          // This happens when verification completes in another tab but Clerk SDK hasn't refreshed
          // We need to force Clerk SDK to check for session by calling auth.getToken() or similar

          // Try to force Clerk SDK to refresh session by calling auth.getToken()
          // This might trigger Clerk to detect the session from cookies
          if (address && !clerkLoaded) {
            // Clerk not loaded yet - waiting for SDK to initialize
          } else if (address && clerkLoaded && !clerkUser) {
            try {
              // Try to get token - this might trigger Clerk to check cookies and detect session
              await auth.getToken();
              // After getting token, check if clerkUser is now available
              // Note: useUser() hook should automatically update when session is detected
              // But we can't directly access it here - it will be available on next render
              // So we just log and let the next poll check
            } catch (e) {
              // Token retrieval failed, ignore
            }
          }
          
          // CRITICAL: Also check if StatsSection's user exists (from useClerkUser)
          // StatsSection shows isAccountSetupComplete: true, which means user exists
          // If StatsSection has user but clerkUser is null, we should use StatsSection's user
          // But we can't access StatsSection's user here - we need to check via useClerkUser
          // Actually, we already have `user` from useClerkUser() - let's check if it's a real Clerk user

          if (address && user) {
            // Check if this is a real Clerk user by checking publicMetadata for reown_address
            // If publicMetadata.reown_address exists and matches, it's a Clerk user
            const hasReownAddress = (user.publicMetadata as any)?.reown_address;
            const hasSmartAccountAddress = (user.publicMetadata as any)?.smart_account_address;
            const isRealClerkUser = hasReownAddress || hasSmartAccountAddress || (user.id && !user.id.startsWith('0x'));

            if (isRealClerkUser) {
              // This is a real Clerk user (not a Reown mock user)
              // Check verification using this user - same logic as StatsSection
              // BUT: Only clear pending if email is ACTUALLY verified, not just if account setup is complete

              const emailAddresses = (user as any).emailAddresses || [];
              const hasVerifiedEmails = emailAddresses.some((e: any) => 
                e.verification?.status !== 'unverified' && e.verification?.status !== null
              );
              
              // CRITICAL: Only check account setup completion if we have verified emails
              // Don't clear pending state just because account setup is complete - email must be verified
              const isAccountSetupComplete = hasVerifiedEmails ? verifyAccountSetupComplete(user as any, address) : false;
              
              
              // CRITICAL: Only clear pending if email is ACTUALLY verified
              // Don't rely on account setup completion alone - email verification is required
              if (hasVerifiedEmails) {
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
                  // Failed to broadcast verification completion, ignore
                }
                
                addToast({
                  message: "Email verified successfully!",
                  type: "success",
                });
                return;
              }
              // Email not verified yet - keep pending state
            }
            // User is not a real Clerk user yet
          }
          // User is null or address missing
        }
      } catch (error: any) {
        // Error checking verification status, ignore
      }

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

      setResendCountdown(null);
      setTimeUntilExpiration(null);
      return;
    }
    
    const expireAt = localStorage.getItem(`clerk_verification_expire_at_${address}`);
    if (!expireAt) {

      setResendCountdown(null);
      return;
    }
    
    const expirationTime = parseInt(expireAt, 10);
    const fiveMinutesMs = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Calculate countdown: time remaining until we're 5 minutes before expiration
    // This function re-reads from localStorage every time to get the latest expiration time
    const calculateCountdown = (logDetails = false) => {
      // Always re-read from localStorage to get latest expiration time (important for resend)
      const currentExpireAt = localStorage.getItem(`clerk_verification_expire_at_${address}`);
      if (!currentExpireAt) {
        if (logDetails) {
          // No expiration time found
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
        // Detailed logging disabled
      }
      
      // Check if expiration has completely passed
      if (timeUntilExpirationMs <= 0) {
        // Expiration has passed - clear pending state and show "Complete Account Setup"

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
          // Within 5 minutes of expiration - button enabled (no countdown)
        }
        return null;
      }
      
      // Countdown = time until expiration - 5 minutes
      // This shows how long until we reach the 5-minute mark before expiration
      const countdownSeconds = Math.floor((timeUntilExpirationMs - fiveMinutesMs) / 1000);
      
      if (logDetails) {
        const countdownMinutes = Math.floor(countdownSeconds / 60);
        const countdownSecondsRemainder = countdownSeconds % 60;
      }
      
      return Math.max(0, countdownSeconds);
    };
    
    // Set initial countdown (with detailed logging)
    const initialCountdown = calculateCountdown(true); // true = log details

    setResendCountdown(initialCountdown);
    
    // If no countdown needed or expired, don't set up interval
    if (initialCountdown === null || initialCountdown <= 0) {

      return;
    }
    
    
    // Set up interval to update countdown every second and check expiration
    const interval = setInterval(() => {
      // Re-check expiration time in case it changed (e.g., after resend)
      const currentExpireAt = localStorage.getItem(`clerk_verification_expire_at_${address}`);
      if (!currentExpireAt) {

        clearInterval(interval);
        return;
      }
      
      const currentExpirationTime = parseInt(currentExpireAt, 10);
      const now = Date.now();
      
      // Check if expiration has passed
      if (now > currentExpirationTime) {
        // Expiration has passed - clear pending state and show "Complete Account Setup"

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

        setResendCountdown(null);
        // Continue monitoring expiration time even after countdown ends
        // Don't clear interval - keep updating timeUntilExpiration for UI
      } else {
        // Update countdown (log every 10 seconds or when < 60 seconds to avoid spam)
        if (remaining % 10 === 0 || remaining < 60) {
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
        }
        setResendCountdown(remaining);
      }
    }, 1000);

    return () => {

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

    if (!address) {

      addToast({
        message: "No wallet address found. Please connect your wallet first.",
        type: "error",
      });
      return;
    }
    
    if (!auth.isLoaded || !clerk.loaded) {

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
        // Failed to access clerk.client.signUp, ignore
      }
    }
    
    if (!signUpInstance) {
      // SignUp instance not available
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
        result = await signUpInstance.update(userData);
      } else {
        result = await signUpInstance.create(userData);
      }

      // Handle different signup statuses
      if (result.status === "complete") {

        setShowEmailPrompt(false);
        
        if (result.createdUserId && address) {
          try {
            const { storeAccountLink } = await import("@/lib/services/accountLinkingService");
            storeAccountLink(address.toLowerCase(), result.createdUserId);
          } catch (linkError) {
            // Failed to store account link, ignore
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
                // Failed to store account link, ignore
              }
            }
            
            addToast({
              message: "Please check your email to verify your account. A verification link has been sent.",
              type: "info",
            });
            setIsLoading(false);
            return;
          } catch (verifyError: any) {
            // Verification preparation error, show warning
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

        addToast({
          message: `Signup status: ${result.status}. Please check console for details.`,
          type: "warning",
        });
        setIsLoading(false);
      }
    } catch (error: any) {

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

                      if (currentStatus === "complete") {

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
