"use client";

import { useState, useEffect } from "react";
import { useClerkUser } from "@/lib/hooks/useClerkUser";
import { useAppKit } from "@reown/appkit/react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LogIn, Key } from "lucide-react";

interface ShowMoreButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

// Admin key for development - set to false to disable
const ADMIN_KEY_ENABLED = process.env.NEXT_PUBLIC_ADMIN_KEY_ENABLED !== "false";
const ADMIN_KEY = "123456";

/**
 * Show More Button Component
 * Shows login prompt for guests, executes action for logged-in users
 * Includes admin key for development
 * PRIMARY: Reown AppKit for authentication
 */
export function ShowMoreButton({ onClick, disabled }: ShowMoreButtonProps) {
  const { isSignedIn, isLoaded, setMockUser } = useClerkUser();
  const { open } = useAppKit();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [adminKeyError, setAdminKeyError] = useState("");
  const [mounted, setMounted] = useState(false);

  // CRITICAL: Only render icons after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    if (!isLoaded) {
      return; // Still loading auth state
    }

    if (!isSignedIn) {
      // Show login prompt for guests
      setShowLoginPrompt(true);
      return;
    }

    // User is logged in - execute action
    onClick();
  };

  const handleLogin = () => {
    setShowLoginPrompt(false);
    // Open Reown AppKit modal with social logins (PRIMARY authentication)
    open({ view: "Connect" });
  };

  const handleAdminKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminKeyError("");

    if (!ADMIN_KEY_ENABLED) {
      setAdminKeyError("Admin key is disabled");
      return;
    }

    if (!setMockUser) {
      setAdminKeyError("Authentication error - please refresh the page");
      return;
    }

    if (adminKey === ADMIN_KEY) {
      // Mock login with admin key
      setMockUser({
        id: "admin-dev-user",
        emailAddresses: [{ emailAddress: "admin@dev.local" }],
      });
      setShowLoginPrompt(false);
      setAdminKey("");
      setShowAdminKey(false);
      // Execute the action after mock login
      onClick();
    } else {
      setAdminKeyError("Invalid admin key");
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled}
        className="w-full mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        Show More Articles
      </button>

      {/* Login Prompt Modal */}
      <Modal
        isOpen={showLoginPrompt}
        onClose={() => {
          setShowLoginPrompt(false);
          setAdminKey("");
          setAdminKeyError("");
          setShowAdminKey(false);
        }}
        title="Sign In Required"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              {mounted ? (
                <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              ) : (
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-400 rounded" />
              )}
            </div>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Please sign in to view more articles and access all features.
          </p>

          {/* Admin Key Section (Development Only) */}
          {ADMIN_KEY_ENABLED && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowAdminKey(!showAdminKey)}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-3"
              >
                {mounted ? (
                  <Key className="w-4 h-4" />
                ) : (
                  <span className="w-4 h-4 bg-gray-400 rounded" />
                )}
                {showAdminKey ? "Hide" : "Show"} Admin Key (Dev Only)
              </button>

              {showAdminKey && (
                <form 
                  onSubmit={handleAdminKeySubmit} 
                  className="space-y-3"
                  noValidate
                >
                  <div>
                    <Input
                      type="password"
                      placeholder="Enter admin key"
                      value={adminKey}
                      onChange={(e) => {
                        setAdminKey(e.target.value);
                        setAdminKeyError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAdminKeySubmit(e as any);
                        }
                      }}
                      className={adminKeyError ? "border-red-500" : ""}
                    />
                    {adminKeyError && (
                      <p className="text-sm text-red-500 mt-1">{adminKeyError}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gray-600 text-white hover:bg-gray-700"
                  >
                    Use Admin Key
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    Development feature - will be disabled in production
                  </p>
                </form>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowLoginPrompt(false);
                setAdminKey("");
                setAdminKeyError("");
                setShowAdminKey(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogin}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Sign In
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

