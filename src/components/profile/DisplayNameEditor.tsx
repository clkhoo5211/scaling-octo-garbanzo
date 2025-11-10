"use client";

import { useState } from "react";
import { Edit2, Check, X, Loader2 } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/Toast";

interface DisplayNameEditorProps {
  currentDisplayName: string | null;
  onUpdate?: (newName: string | null) => void;
}

/**
 * Component that allows users to set/edit their custom display name
 * Stores the name in Clerk's publicMetadata.display_name
 * 
 * IMPORTANT LIMITATIONS:
 * - Reown account names (e.g., "johnsmith.reown.id") CANNOT be set programmatically
 *   - Reown does NOT provide an API/SDK method for setting account names
 *   - Account names are managed by Reown's infrastructure and ENS resolvers
 *   - Users cannot access Reown Dashboard (it's for developers/project owners only)
 * 
 * - ENS CCIP-Read (EIP-3668) is READ-ONLY
 *   - CCIP-Read is designed for resolving names off-chain/L2, not for setting them
 *   - Setting ENS records requires onchain transactions, but ".reown.id" domain is managed by Reown
 * 
 * SOLUTION:
 * - This component provides a custom display name stored in Clerk metadata
 * - Priority: Reown account name → Custom display name → Truncated address
 * - Custom display names are user-controlled and work immediately
 */
export function DisplayNameEditor({ currentDisplayName, onUpdate }: DisplayNameEditorProps) {
  const { user } = useUser();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentDisplayName || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      addToast({
        message: "Please sign in to update your display name",
        type: "error",
      });
      return;
    }

    const trimmedName = displayName.trim();
    
    // Validate: 3-30 characters, alphanumeric + spaces + hyphens/underscores
    if (trimmedName && (trimmedName.length < 3 || trimmedName.length > 30)) {
      addToast({
        message: "Display name must be between 3 and 30 characters",
        type: "error",
      });
      return;
    }

    if (trimmedName && !/^[a-zA-Z0-9\s\-_]+$/.test(trimmedName)) {
      addToast({
        message: "Display name can only contain letters, numbers, spaces, hyphens, and underscores",
        type: "error",
      });
      return;
    }

    setIsSaving(true);
    try {
      await user.update({
        publicMetadata: {
          ...(user.publicMetadata as Record<string, unknown>),
          display_name: trimmedName || null,
        },
      } as Parameters<typeof user.update>[0]);

      addToast({
        message: trimmedName ? "Display name updated successfully!" : "Display name removed",
        type: "success",
      });

      setIsEditing(false);
      onUpdate?.(trimmedName || null);
      
      // Reload user to get updated metadata
      await user.reload();
    } catch (error) {
      console.error("Failed to update display name:", error);
      addToast({
        message: "Failed to update display name. Please try again.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(currentDisplayName || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter display name (3-30 chars)"
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={30}
          disabled={isSaving}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSave();
            } else if (e.key === "Escape") {
              handleCancel();
            }
          }}
          autoFocus
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors disabled:opacity-50"
          title="Save"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
        {currentDisplayName || "No display name set"}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title="Edit display name"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
}

