"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerkUser } from "@/lib/hooks/useClerkUser";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { LogIn } from "lucide-react";

interface ShowMoreButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Show More Button Component
 * Shows login prompt for guests, executes action for logged-in users
 */
export function ShowMoreButton({ onClick, disabled }: ShowMoreButtonProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useClerkUser();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

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
    router.push("/auth");
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
        onClose={() => setShowLoginPrompt(false)}
        title="Sign In Required"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Please sign in to view more articles and access all features.
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowLoginPrompt(false)}
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

