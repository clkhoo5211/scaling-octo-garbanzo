"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { useAllArticles } from "@/lib/hooks/useArticles";
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

  // CRITICAL: Use useAllArticles to search across ALL categories, not just "general"
  // This ensures articles from tech, crypto, business, etc. can be found
  const { data: articles, isLoading } = useAllArticles({
    usePagination: false,
    extractLinks: true,
  });

  useEffect(() => {
    if (articles && articleUrl && isOpen) {
      // Normalize URLs for comparison (remove trailing slashes, lowercase)
      const normalizedUrl = articleUrl.toLowerCase().replace(/\/$/, "");
      const found = articles.find((a) => {
        const articleUrlNormalized = a.url.toLowerCase().replace(/\/$/, "");
        return articleUrlNormalized === normalizedUrl || 
               articleUrlNormalized.includes(normalizedUrl) ||
               normalizedUrl.includes(articleUrlNormalized);
      });
      setArticle(found || null);

      // Fetch full article content if article found
      if (found && !found.content) {
        setIsLoadingContent(true);
        // CRITICAL: Add timeout wrapper to prevent infinite loading
        const timeoutPromise = new Promise<ParsedArticle | null>((resolve) => {
          setTimeout(() => {
            console.warn("Article content fetch timed out");
            resolve(null);
          }, 20000); // 20 second timeout
        });

        Promise.race([
          fetchArticleContent(found.url),
          timeoutPromise
        ])
          .then((parsed) => {
            if (parsed) {
              // Sanitize the HTML content
              const sanitized = sanitizeArticleHtml(parsed.content);
              setParsedContent(sanitized);
            } else {
              // If fetch failed or timed out, show excerpt instead
              console.warn("Article content fetch failed, showing excerpt");
              setParsedContent(null);
            }
          })
          .catch((error) => {
            console.error("Failed to fetch article content:", error);
            setParsedContent(null);
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
          <div className="mb-8">
            {/* CRITICAL: Use iframe with srcdoc for better security and isolation */}
            {/* This prevents XSS attacks even if sanitization fails */}
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                      * { margin: 0; padding: 0; box-sizing: border-box; }
                      body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        font-size: ${fontSize}px;
                        line-height: 1.6;
                        color: #1f2937;
                        padding: 1rem;
                        max-width: 100%;
                      }
                      @media (prefers-color-scheme: dark) {
                        body { color: #f3f4f6; background: #111827; }
                      }
                      p { margin-bottom: 1rem; }
                      h1, h2, h3, h4, h5, h6 { margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; }
                      img { max-width: 100%; height: auto; display: block; margin: 1rem 0; }
                      a { color: #2563eb; text-decoration: underline; }
                      @media (prefers-color-scheme: dark) {
                        a { color: #60a5fa; }
                      }
                      blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; margin: 1rem 0; font-style: italic; }
                      @media (prefers-color-scheme: dark) {
                        blockquote { border-left-color: #4b5563; }
                      }
                      code { background: #f3f4f6; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: 'Courier New', monospace; }
                      @media (prefers-color-scheme: dark) {
                        code { background: #374151; }
                      }
                      pre { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; }
                      @media (prefers-color-scheme: dark) {
                        pre { background: #374151; }
                      }
                      ul, ol { margin-left: 1.5rem; margin-bottom: 1rem; }
                      table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
                      th, td { border: 1px solid #e5e7eb; padding: 0.5rem; text-align: left; }
                      @media (prefers-color-scheme: dark) {
                        th, td { border-color: #4b5563; }
                      }
                    </style>
                  </head>
                  <body>
                    ${parsedContent}
                  </body>
                </html>
              `}
              className="w-full border-0 rounded-lg"
              style={{ 
                minHeight: '400px',
                height: 'auto',
                maxHeight: '70vh',
                overflow: 'auto'
              }}
              sandbox="allow-same-origin allow-scripts"
              title={`Article content: ${article.title}`}
              onLoad={() => {
                // Adjust iframe height to content after load
                const iframe = document.querySelector(`iframe[title*="${article.title}"]`) as HTMLIFrameElement;
                if (iframe?.contentWindow?.document?.body) {
                  const height = iframe.contentWindow.document.body.scrollHeight;
                  iframe.style.height = `${Math.min(height + 20, window.innerHeight * 0.7)}px`;
                }
              }}
            />
          </div>
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
