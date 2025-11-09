"use client";

import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Article } from "@/lib/services/indexedDBCache";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { useAppStore } from "@/lib/stores/appStore";
import {
  useLikeArticle,
  useUnlikeArticle,
  useArticleLikes,
} from "@/lib/hooks/useArticles";
import { useClerkUser } from "@/lib/hooks/useClerkUser";
import { useSafeAppKit } from "@/lib/hooks/useSafeAppKit";
import { useAwardSharePoints } from "@/lib/hooks/usePointsEarning";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArticlePreviewModal } from "@/components/article/ArticlePreviewModal";
import { Modal } from "@/components/ui/Modal";
import { Play, Image as ImageIcon, Video, Gif } from "lucide-react";

export interface ArticleCardProps {
  article: Article;
  variant?: "compact" | "expanded" | "featured";
  onUpvote?: (articleId: string) => void;
  onBookmark?: (articleId: string) => void;
  onShare?: (articleId: string) => void;
  onSelect?: (article: Article) => void;
  previewMode?: "modal" | "fullpage" | "both"; // New prop for preview mode
}

export const ArticleCard = memo(function ArticleCard({
  article,
  variant = "compact",
  onUpvote,
  onBookmark,
  onShare,
  onSelect,
  previewMode = "both", // Default to both modal and fullpage
}: ArticleCardProps) {
  const navigate = useNavigate();
  const { user, isLoaded: authLoaded, isSignedIn } = useClerkUser();
  const { open } = useSafeAppKit();
  const { isLiked, isBookmarked, addBookmark, removeBookmark } = useAppStore();
  const likeMutation = useLikeArticle();
  const unlikeMutation = useUnlikeArticle();
  const { data: likes } = useArticleLikes(article.id);
  const likesCount = likes?.length || 0;
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const awardSharePoints = useAwardSharePoints();

  const liked = isLiked(article.id);
  const bookmarked = isBookmarked(article.id);

  const handleLike = () => {
    // Require login for liking
    if (!authLoaded) return;
    if (!isSignedIn) {
      setShowLoginPrompt(true);
      return;
    }
    
    if (liked) {
      unlikeMutation.mutate(article.id);
    } else {
      likeMutation.mutate(article.id);
    }
    onUpvote?.(article.id);
  };

  const handleBookmark = () => {
    // Require login for bookmarking
    if (!authLoaded) return;
    if (!isSignedIn) {
      setShowLoginPrompt(true);
      return;
    }
    
    if (bookmarked) {
      removeBookmark(article.id);
    } else {
      addBookmark(article.id);
    }
    onBookmark?.(article.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.excerpt,
        url: article.url,
      });
    }
    
    // Award points for sharing (if user is signed in)
    if (isSignedIn && user) {
      try {
        await awardSharePoints(article.id, article.title);
      } catch (error) {
        console.error("Failed to award share points:", error);
      }
    }
    
    onShare?.(article.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Allow guests to browse articles freely - no login required for viewing
    // Handle preview mode first - modal takes precedence
    if (previewMode === "modal" || previewMode === "both") {
      setShowPreviewModal(true);
      // Call onSelect if provided (for tracking/analytics) but don't navigate
      onSelect?.(article);
      return;
    }

    // If previewMode is "fullpage", navigate to full page
    if (previewMode === "fullpage") {
      if (onSelect) {
        onSelect(article);
      } else {
        navigate(`/article?url=${encodeURIComponent(article.url)}`);
      }
      return;
    }
  };

  const handleLogin = () => {
    setShowLoginPrompt(false);
    // Open Reown AppKit modal with social logins (PRIMARY authentication)
    open({ view: "Connect" });
  };

  // Determine media display
  const mediaType = article.mediaType || 'text';
  const displayImage = article.imageUrl || article.mediaUrl || article.thumbnail;
  const displayVideo = article.videoUrl || article.videoEmbedUrl;
  const displayGif = article.gifUrl;
  const hasMedia = mediaType !== 'text' && (displayImage || displayVideo || displayGif);

  return (
    <>
      <article className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-elevated hover:border-primary/50 transition-all duration-200 group shadow-sm">
        <div
          onClick={handleCardClick}
          className="cursor-pointer"
        >
          {/* Media Display (Image-only, Video, GIF) */}
          {hasMedia && variant !== "compact" && (
            <div className="relative w-full bg-gray-100 dark:bg-gray-900">
              {/* Image-only or Image from mixed */}
              {(mediaType === 'image' || (mediaType === 'mixed' && displayImage && !displayVideo && !displayGif)) && displayImage && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={displayImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    Image
                  </div>
                </div>
              )}

              {/* Video */}
              {(mediaType === 'video' || (mediaType === 'mixed' && displayVideo)) && displayVideo && (
                <div className="relative aspect-video w-full bg-black overflow-hidden">
                  {article.videoEmbedUrl ? (
                    <iframe
                      src={article.videoEmbedUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={article.title}
                    />
                  ) : (
                    <>
                      {displayImage && (
                        <img
                          src={displayImage}
                          alt={article.title}
                          className="w-full h-full object-cover opacity-50"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/70 rounded-full p-4">
                          <Play className="w-12 h-12 text-white" fill="white" />
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Video
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* GIF */}
              {(mediaType === 'gif' || (mediaType === 'mixed' && displayGif)) && displayGif && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={displayGif}
                    alt={article.title}
                    className={`w-full h-full object-cover ${gifPlaying ? '' : 'opacity-75'}`}
                    loading="lazy"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGifPlaying(!gifPlaying);
                      // Toggle GIF animation by adding/removing ?t= timestamp
                      const img = e.currentTarget;
                      if (gifPlaying) {
                        img.src = img.src.split('?')[0];
                      } else {
                        img.src = `${img.src.split('?')[0]}?t=${Date.now()}`;
                      }
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Gif className="w-3 h-3" />
                    GIF {gifPlaying ? 'Playing' : 'Paused'}
                  </div>
                  {!gifPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setGifPlaying(true);
                          const img = e.currentTarget.parentElement?.querySelector('img');
                          if (img) {
                            img.src = `${img.src.split('?')[0]}?t=${Date.now()}`;
                          }
                        }}
                        className="bg-black/70 rounded-full p-3 hover:bg-black/90 transition-colors"
                      >
                        <Play className="w-8 h-8 text-white" fill="white" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mixed Media Gallery */}
              {mediaType === 'mixed' && article.mediaUrls && article.mediaUrls.length > 1 && (
                <div className="grid grid-cols-2 gap-1 p-1">
                  {article.mediaUrls.slice(0, 4).map((url, idx) => (
                    <div key={idx} className="relative aspect-square overflow-hidden">
                      <img
                        src={url}
                        alt={`${article.title} - Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                  {article.mediaUrls.length > 4 && (
                    <div className="relative aspect-square bg-black/50 flex items-center justify-center text-white text-sm font-semibold">
                      +{article.mediaUrls.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="p-4">
            {/* Header */}
            <div className={`flex items-start gap-3 mb-2 ${hasMedia && variant !== "compact" ? '' : ''}`}>
              {article.thumbnail && variant !== "compact" && !hasMedia && (
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{article.source}</span>
                  <span>•</span>
                  <span>{formatRelativeTime(article.publishedAt)}</span>
                  {article.author && (
                    <>
                      <span>•</span>
                      <span>{article.author}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Excerpt */}
            {article.excerpt && variant !== "compact" && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                {truncate(article.excerpt, 150)}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleLike();
                  }}
                        className={`transition-colors hover:scale-110 ${liked ? "text-red-500" : "text-gray-600 hover:text-red-500"}`}
                  aria-label="Like article"
                >
                  <span className="text-sm font-medium">👍 {likesCount || 0}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleBookmark();
                  }}
                        className={`transition-colors hover:scale-110 ${bookmarked ? "text-yellow-500" : "text-gray-600 hover:text-yellow-500"}`}
                  aria-label="Bookmark article"
                >
                  🔖
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleShare();
                  }}
                        className="text-gray-600 hover:text-primary transition-colors hover:scale-110"
                  aria-label="Share article"
                >
                  📤
                </button>
              </div>
              {article.comments !== undefined && (
                      <span className="text-sm text-gray-600">
                  {article.comments} comments
                </span>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Login Prompt Modal */}
      <Modal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        title="Sign In Required"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to view articles and access all features.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogin}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </Modal>

      {/* Article Preview Modal */}
      {previewMode === "modal" || previewMode === "both" ? (
        <ArticlePreviewModal
          articleUrl={article.url}
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          onOpenFullPage={() => {
            navigate(`/article?url=${encodeURIComponent(article.url)}`);
          }}
        />
      ) : null}
    </>
  );
});

export function ArticleCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse shadow-sm">
      <Skeleton height={20} className="mb-2" />
      <Skeleton height={16} width="60%" className="mb-4" />
      <Skeleton height={16} width="40%" />
    </div>
  );
}
