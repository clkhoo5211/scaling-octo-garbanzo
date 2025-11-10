"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { UserProfile } from "@clerk/clerk-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

/**
 * AccountSettingsPage Component
 * Full-page account settings using Clerk's UserProfile component
 * This provides a dedicated, isolated page for account management
 */
export default function AccountSettingsPage() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const navigate = useNavigate();

  // Redirect to profile if not signed in
  useEffect(() => {
    if (authLoaded && !isSignedIn) {
      navigate("/profile");
    }
  }, [authLoaded, isSignedIn, navigate]);

  if (!authLoaded || !userLoaded) {
    return <LoadingState message="Loading account settings..." fullScreen />;
  }

  if (!isSignedIn || !user) {
    return null; // Will redirect via useEffect
  }

  return (
    <ErrorBoundary>
      {/* Full-page container - takes entire viewport */}
      <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 overflow-auto z-50">
        {/* Back button header */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 shadow-sm">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Profile</span>
          </button>
        </div>

        {/* Clerk UserProfile - Full page, no container constraints */}
        <div className="w-full min-h-[calc(100vh-4rem)]">
          <UserProfile 
            appearance={{
              elements: {
                rootBox: "w-full h-full",
                card: "shadow-none border-0 bg-transparent rounded-none w-full max-w-none",
                cardBox: "shadow-none border-0 bg-transparent rounded-none w-full max-w-none",
                navbar: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
                navbarButton: "text-gray-700 dark:text-gray-300",
                page: "bg-white dark:bg-gray-800 w-full max-w-none px-4 sm:px-6 lg:px-8",
                pageContent: "w-full max-w-none",
                profileSection: "w-full",
                profileSectionContent: "w-full",
                profileSectionPrimaryButton: "w-full sm:w-auto",
              },
              layout: {
                socialButtonsPlacement: "top",
                socialButtonsVariant: "blockButton",
              },
            }}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

