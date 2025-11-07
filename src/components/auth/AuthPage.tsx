"use client";

import dynamic from "next/dynamic";
import { WalletConnect } from "@/components/web3/WalletConnect";
import { useState } from "react";
import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";

// Dynamically import Clerk components with SSR disabled to avoid server actions
const SignIn = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.SignIn),
  { ssr: false }
);

const SignUp = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.SignUp),
  { ssr: false }
);

/**
 * AuthPage Component
 * Handles both Clerk authentication and Reown wallet connection
 */
export function AuthPage() {
  const { user, isLoaded } = useUser();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
            <p className="text-gray-600 dark:text-gray-400">
              You&apos;re signed in as {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Connect Wallet</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Connect your wallet to participate in auctions, earn points, and
              vote on governance.
            </p>
            <WalletConnect />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full">
        <div className="mb-4 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setMode("sign-in")}
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              mode === "sign-in"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("sign-up")}
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              mode === "sign-up"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Sign Up
          </button>
        </div>

        {mode === "sign-in" ? (
          <SignIn
            routing="path"
            path="/auth/sign-in"
            signUpUrl="/auth/sign-up"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
              },
            }}
          />
        ) : (
          <SignUp
            routing="path"
            path="/auth/sign-up"
            signInUrl="/auth/sign-in"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
              },
            }}
          />
        )}
      </div>
    </div>
  );
}

export default AuthPage;
