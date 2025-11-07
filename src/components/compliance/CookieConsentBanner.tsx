"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { CookieSettings } from "./CookieSettings";

export interface CookiePreferences {
  necessary: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const COOKIE_CONSENT_KEY = "web3news_cookie_consent";
const COOKIE_CONSENT_VERSION = "1.0";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    if (typeof window === "undefined") return;

    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      // Show banner if no consent has been given
      setShowBanner(true);
    } else {
      try {
        const consent = JSON.parse(savedConsent);
        if (consent.version === COOKIE_CONSENT_VERSION) {
          setPreferences(consent.preferences);
        } else {
          // Version mismatch, show banner again
          setShowBanner(true);
        }
      } catch {
        // Invalid consent, show banner
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (newPreferences: CookiePreferences) => {
    const consent = {
      version: COOKIE_CONSENT_VERSION,
      preferences: newPreferences,
      timestamp: Date.now(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setPreferences(newPreferences);
    setShowBanner(false);
    setShowSettings(false);

    // Apply cookie preferences (e.g., enable/disable analytics)
    applyCookiePreferences(newPreferences);
  };

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Enable/disable analytics based on preferences
    if (prefs.analytics) {
      // Initialize analytics (e.g., Google Analytics, etc.)
      console.log("Analytics cookies enabled");
    } else {
      // Disable analytics
      console.log("Analytics cookies disabled");
    }

    // Enable/disable marketing cookies
    if (prefs.marketing) {
      console.log("Marketing cookies enabled");
    } else {
      console.log("Marketing cookies disabled");
    }

    // Enable/disable functional cookies
    if (prefs.functional) {
      console.log("Functional cookies enabled");
    } else {
      console.log("Functional cookies disabled");
    }
  };

  const handleAcceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  };

  const handleAcceptNecessary = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  };

  const handleRejectAll = () => {
    savePreferences({
      necessary: true, // Cannot reject necessary cookies
      analytics: false,
      marketing: false,
      functional: false,
    });
  };

  const handleCustomize = () => {
    setShowSettings(true);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Cookie Consent Banner */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-300 shadow-lg p-4 md:p-6"
        role="dialog"
        aria-label="Cookie consent"
        aria-modal="true"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    We use cookies
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    We use cookies to enhance your browsing experience, analyze site traffic, and
                    personalize content. By clicking &quot;Accept All&quot;, you consent to our use of
                    cookies. You can customize your preferences or reject non-essential cookies.
                  </p>
                  <p className="text-xs text-gray-500">
                    Learn more in our{" "}
                    <a
                      href="/cookie-policy"
                      className="text-indigo-600 hover:text-indigo-700 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cookie Policy
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy-policy"
                      className="text-indigo-600 hover:text-indigo-700 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 md:items-start">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
                className="whitespace-nowrap"
              >
                Reject All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptNecessary}
                className="whitespace-nowrap"
              >
                Accept Necessary
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCustomize}
                className="whitespace-nowrap"
              >
                Cookie Settings
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptAll}
                className="whitespace-nowrap"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      <CookieSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        preferences={preferences}
        onSave={savePreferences}
      />
    </>
  );
}

