"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { CookiePreferences } from "./CookieConsentBanner";

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
          <p className="text-sm text-gray-600 mb-4">
            Manage your cookie preferences. You can enable or disable different types of cookies
            below. Note that necessary cookies cannot be disabled as they are required for the
            website to function.
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
            </a>
            .
          </p>
        </div>

        {/* Cookie Categories */}
        <div className="space-y-4">
          {cookieCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">
                    {category.name}
                  </h4>
                  {category.required && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences[category.id]}
                  onChange={() => handleToggle(category.id)}
                  disabled={category.required}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleRejectAll}
            className="flex-1"
          >
            Reject All
          </Button>
          <Button
            variant="outline"
            onClick={handleAcceptNecessary}
            className="flex-1"
          >
            Accept Necessary Only
          </Button>
          <Button variant="primary" onClick={handleSave} className="flex-1">
            Save Preferences
          </Button>
          <Button
            variant="primary"
            onClick={handleAcceptAll}
            className="flex-1"
          >
            Accept All
          </Button>
        </div>
      </div>
    </Modal>
  );
}

