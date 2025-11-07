"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { useArticles } from "@/lib/hooks/useArticles";
import {
  fetchArticleContent,
  estimateReadingTime,
} from "@/lib/services/articleContent";
import { sanitizeArticleHtml } from "@/lib/utils/sanitizeHtml";
import type { Article } from "@/lib/services/indexedDBCache";
import { FileText, ExternalLink, Maximize2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ArticlePreviewModalProps {
  articleUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenFullPage?: () => void;
}

/**
 * ArticlePreviewModal Component
 * Displays article content in a modal overlay for quick preview
 * Users can read the article without leaving the feed
 */
export function ArticlePreviewModal({
  articleUrl,
  isOpen,
  onClose,
  onOpenFullPage,
}: ArticlePreviewModalProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [parsedContent, setParsedContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  // Use "general" category to find article by URL
  const { data: articles, isLoading } = useArticles("general", {
    usePagination: false,
    extractLinks: true,
  });

  useEffect(() => {
    if (articles && articleUrl && isOpen) {
      const found = articles.find((a) => a.url === articleUrl);
      setArticle(found || null);

      // Fetch full article content if article found
      if (found && !found.content) {
        setIsLoadingContent(true);
        fetchArticleContent(found.url)
          .then((parsed) => {
            if (parsed) {
              // Sanitize the HTML content
              const sanitized = sanitizeArticleHtml(parsed.content);
              setParsedContent(sanitized);
            }
          })
          .catch((error) => {
            console.error("Failed to fetch article content:", error);
          })
          .finally(() => {
            setIsLoadingContent(false);
          });
      } else if (found?.content) {
        // Sanitize cached content
        const sanitized = sanitizeArticleHtml(found.content);
        setParsedContent(sanitized);
      }
    }
  }, [articles, articleUrl, isOpen]);

  const handleOpenFullPage = () => {
    if (onOpenFullPage) {
      onOpenFullPage();
    } else {
      router.push(`/article?url=${encodeURIComponent(articleUrl)}`);
    }
    onClose();
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        title="Loading article..."
      >
        <LoadingState message="Loading article..." />
      </Modal>
    );
  }

  if (!article) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        title="Article not found"
      >
        <EmptyState
          title="Article not found"
          message="The article you're looking for doesn't exist or has been removed."
          icon={<FileText className="w-12 h-12 text-gray-400" />}
        />
      </Modal>
    );
  }

  const readingTime = parsedContent
    ? estimateReadingTime(parsedContent.replace(/<[^>]*>/g, ""))
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
              {article.title}
            </h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{article.source}</span>
              <span>•</span>
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              {readingTime && (
                <>
                  <span>•</span>
                  <span>{readingTime} min read</span>
                </>
              )}
              {article.author && (
                <>
                  <span>•</span>
                  <span>{article.author}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={handleOpenFullPage}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Open in full page"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Full Page</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Article Content */}
        {isLoadingContent ? (
          <LoadingState message="Loading article content..." />
        ) : parsedContent ? (
          <div
            className="prose dark:prose-invert max-w-none mb-8"
            style={{ fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{ __html: parsedContent }}
          />
        ) : article.excerpt ? (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {article.excerpt}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Read full article on {article.source}
              </a>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Content unavailable"
            message="Unable to load article content. Please try opening the original article."
            icon={<FileText className="w-12 h-12 text-gray-400" />}
          />
        )}

        {/* Font Size Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 2))}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={fontSize <= 12}
            >
              A-
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
              {fontSize}px
            </span>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 2))}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={fontSize >= 24}
            >
              A+
            </button>
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ExternalLink className="w-4 h-4" />
            Original Source
          </a>
        </div>
      </div>
    </Modal>
  );
}
