"use client";

import { useState } from "react";
import {
  Type,
  Sun,
  Moon,
  Share2,
  Bookmark,
  BookmarkCheck,
  Copy,
  ExternalLink,
  Minus,
  Plus,
} from "lucide-react";

interface ReaderControlsProps {
  articleUrl: string;
  articleId: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  onShare?: () => void;
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
  lineHeight?: number;
  onLineHeightChange?: (height: number) => void;
  theme?: "light" | "dark" | "sepia";
  onThemeToggle?: () => void;
}

/**
 * ReaderControls Component
 * Provides controls for reading experience (font size, line height, theme, bookmark, share)
 */
export function ReaderControls({
  articleUrl,
  isBookmarked = false,
  onBookmarkToggle,
  onShare,
  fontSize = 16,
  onFontSizeChange,
  lineHeight = 1.6,
  onLineHeightChange,
  theme = "light",
  onThemeToggle,
}: ReaderControlsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: articleUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        if (onShare) onShare();
      }
    } else {
      // Fallback to custom share
      if (onShare) onShare();
    }
  };

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(24, fontSize + delta));
    if (onFontSizeChange) {
      onFontSizeChange(newSize);
    }
  };

  const handleLineHeightChange = (delta: number) => {
    const newHeight = Math.max(1.2, Math.min(2.0, lineHeight + delta));
    if (onLineHeightChange) {
      onLineHeightChange(newHeight);
    }
  };

  const cycleTheme = () => {
    if (onThemeToggle) {
      onThemeToggle();
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-2 z-40 flex items-center gap-2">
      {/* Font Size Controls */}
      <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
        <button
          onClick={() => handleFontSizeChange(-2)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          aria-label="Decrease font size"
          disabled={fontSize <= 12}
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[2.5rem] text-center">
          {fontSize}px
        </span>
        <button
          onClick={() => handleFontSizeChange(2)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          aria-label="Increase font size"
          disabled={fontSize >= 24}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Line Height Controls */}
      {onLineHeightChange && (
        <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
          <button
            onClick={() => handleLineHeightChange(-0.1)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Decrease line height"
            disabled={lineHeight <= 1.2}
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[2.5rem] text-center">
            {lineHeight.toFixed(1)}
          </span>
          <button
            onClick={() => handleLineHeightChange(0.1)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Increase line height"
            disabled={lineHeight >= 2.0}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Theme Toggle */}
      {onThemeToggle && (
        <button
          onClick={cycleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          aria-label={`Switch theme (current: ${theme})`}
          title={`Current theme: ${theme}`}
        >
          {theme === "light" ? (
            <Sun className="w-4 h-4" />
          ) : theme === "dark" ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4 text-amber-600" />
          )}
        </button>
      )}

      {/* Bookmark */}
      {onBookmarkToggle && (
        <button
          onClick={onBookmarkToggle}
          className={`p-2 rounded transition-colors ${
            isBookmarked
              ? "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`p-2 rounded transition-colors ${
          copied
            ? "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
            : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        aria-label={copied ? "Link copied" : "Copy link"}
      >
        <Copy className="w-4 h-4" />
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        aria-label="Share article"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {/* External Link */}
      <a
        href={articleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        aria-label="Open in new tab"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
