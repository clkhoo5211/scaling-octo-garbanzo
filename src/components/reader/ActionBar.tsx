"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  Flag,
  MoreVertical,
} from "lucide-react";

interface ActionBarProps {
  articleId: string;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onReport?: () => void;
}

/**
 * ActionBar Component
 * Provides action buttons for article interactions (like, comment, share, bookmark, report)
 */
export function ActionBar({
  likes = 0,
  comments = 0,
  isLiked = false,
  isBookmarked = false,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onReport,
}: ActionBarProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Left Actions */}
      <div className="flex items-center gap-4">
        {/* Like */}
        {onLike && (
          <button
            onClick={onLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isLiked
                ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            aria-label={`${isLiked ? "Unlike" : "Like"} article`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">{likes}</span>
          </button>
        )}

        {/* Comment */}
        {onComment && (
          <button
            onClick={onComment}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="View comments"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{comments}</span>
          </button>
        )}

        {/* Share */}
        {onShare && (
          <button
            onClick={onShare}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Share article"
          >
            <Share2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Bookmark */}
        {onBookmark && (
          <button
            onClick={onBookmark}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked
                ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        )}

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="More options"
            aria-expanded={showMenu}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                {onReport && (
                  <button
                    onClick={() => {
                      onReport();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
