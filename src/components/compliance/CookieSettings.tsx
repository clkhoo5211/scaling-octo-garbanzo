"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { CookiePreferences } from "./CookieConsentBanner";
import { getBasePath } from "@/lib/utils/basePath";

interface CookieSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: CookiePreferences;
  onSave: (preferences: CookiePreferences) => void;
}

interface CookieCategory {
  id: keyof CookiePreferences;
  name: string;
  description: string;
  required: boolean;
}

const cookieCategories: CookieCategory[] = [
  {
    id: "necessary",
    name: "Necessary Cookies",
    description:
      "Essential cookies required for the website to function properly. These cannot be disabled.",
    required: true,
  },
  {
    id: "analytics",
    name: "Analytics Cookies",
    description:
      "Help us understand how visitors interact with our website by collecting and reporting information anonymously.",
    required: false,
  },
  {
    id: "functional",
    name: "Functional Cookies",
    description:
      "Enable enhanced functionality and personalization, such as remembering your preferences.",
    required: false,
  },
  {
    id: "marketing",
    name: "Marketing Cookies",
    description:
      "Used to track visitors across websites to display relevant advertisements.",
    required: false,
  },
];

export function CookieSettings({
  isOpen,
  onClose,
  preferences,
  onSave,
}: CookieSettingsProps) {
  const [localPreferences, setLocalPreferences] =
    useState<CookiePreferences>(preferences);
  const basePath = getBasePath();

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleToggle = (category: keyof CookiePreferences) => {
    if (category === "necessary") return; // Cannot disable necessary cookies

    setLocalPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = () => {
    onSave(localPreferences);
  };

  const handleAcceptAll = () => {
    onSave({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  };

  const handleAcceptNecessary = () => {
    onSave({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  };

  const handleRejectAll = () => {
    onSave({
      necessary: true, // Cannot reject necessary
      analytics: false,
      marketing: false,
      functional: false,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cookie Settings"
      size="lg"
    >
      <div className="space-y-6">
        <div>
          <p className="mb-4 text-sm text-text-secondary">
            Manage your cookie preferences. You can enable or disable different types of cookies
            below. Note that necessary cookies cannot be disabled as they are required for the
            website to function.
          </p>
          <p className="text-xs text-text-tertiary">
            Learn more in our{" "}
            <a
              href={`${basePath}/cookie-policy`}
              className="text-primary underline transition-smooth hover:text-primary-dark"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cookie Policy
            </a>
            .
          </p>
        </div>

        {/* Cookie Categories */}
        <div className="space-y-4">
          {cookieCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-start justify-between gap-4 rounded-card border border-border-subtle bg-background-elevated px-4 py-4 shadow-card"
            >
              <div className="mr-4 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-text-primary">
                    {category.name}
                  </h4>
                  {category.required && (
                    <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-xs text-text-tertiary">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary">{category.description}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={localPreferences[category.id]}
                  onChange={() => handleToggle(category.id)}
                  disabled={category.required}
                  className="sr-only peer"
                />
                <div className="peer h-6 w-11 rounded-full bg-border-subtle transition-smooth peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/40 peer-checked:bg-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-40 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border-subtle after:bg-white after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 border-t border-border-subtle pt-4 sm:flex-row">
          <Button variant="outline" onClick={handleRejectAll} className="flex-1">
            Reject All
          </Button>
          <Button variant="outline" onClick={handleAcceptNecessary} className="flex-1">
            Accept Necessary Only
          </Button>
          <Button variant="secondary" onClick={handleSave} className="flex-1">
            Save Preferences
          </Button>
          <Button variant="primary" onClick={handleAcceptAll} className="flex-1">
            Accept All
          </Button>
        </div>
      </div>
    </Modal>
  );
}

