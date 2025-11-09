"use client";

import { useState } from "react";
import { X, Mail } from "lucide-react";

interface EmailPromptProps {
  address: string;
  onEmailProvided: (email: string) => void;
  onSkip: () => void;
}

/**
 * EmailPrompt Component
 * Prompts user to provide their email after Reown authentication
 * Stores email in localStorage for future Clerk user creation
 */
export function EmailPrompt({ address, onEmailProvided, onSkip }: EmailPromptProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Store email in localStorage for future use
      localStorage.setItem(`reown_email_${address}`, email.trim());
      
      // Call the callback to proceed with Clerk user creation
      onEmailProvided(email.trim());
    } catch (err) {
      console.error("Failed to store email:", err);
      setError("Failed to save email. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // User chose to skip - proceed with fake email
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Skip"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Provide Your Email
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Optional but recommended
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          We'll use your email to:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Send important account notifications</li>
            <li>Enable password recovery (if needed)</li>
            <li>Link your account across devices</li>
          </ul>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Skip for now
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !email.trim()}
            >
              {isSubmitting ? "Saving..." : "Continue"}
            </button>
          </div>
        </form>

        {/* Privacy note */}
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          Your email is stored securely and only used for account management.
        </p>
      </div>
    </div>
  );
}

