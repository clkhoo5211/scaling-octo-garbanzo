"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { useEffect, useState, lazy, Suspense } from "react";
import { useAllArticles } from "@/lib/hooks/useArticles";
import {
  useArticleLikes,
  useLikeArticle,
  useUnlikeArticle,
  useBookmarkArticle,
  useRemoveBookmark,
  useBookmarks,
} from "@/lib/hooks/useArticles";
import {
  fetchArticleContent,
  estimateReadingTime,
} from "@/lib/services/articleContentService";
import { sanitizeArticleHtml } from "@/lib/utils/sanitizeHtml";
import type { Article } from "@/lib/services/indexedDBCache";
import { FileText } from "lucide-react";
import { useAppStore } from "@/lib/stores/appStore";
import { shareContent } from "@/lib/utils";

// Lazy load heavy reader components
const ReadingProgress = lazy(() =>
  import("@/components/reader/ReadingProgress").then((m) => ({
    default: m.ReadingProgress,
  }))
);
const ReaderControls = lazy(() =>
  import("@/components/reader/ReaderControls").then((m) => ({
    default: m.ReaderControls,
  }))
);
const ActionBar = lazy(() =>
  import("@/components/reader/ActionBar").then((m) => ({
    default: m.ActionBar,
  }))
);

interface ArticleReaderClientProps {
  url: string;
}

export function ArticleReaderClient({
  url: articleUrl,
}: ArticleReaderClientProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [parsedContent, setParsedContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { userId } = useAppStore();

  // Search across ALL categories to find article by URL
  const { data: allArticles, isLoading } = useAllArticles({
    usePagination: false,
    extractLinks: true,
  });

  const { data: likes } = useArticleLikes(article?.id || "");
  const { data: bookmarks } = useBookmarks(userId);
  const likeMutation = useLikeArticle();
  const unlikeMutation = useUnlikeArticle();
  const bookmarkMutation = useBookmarkArticle();
  const removeBookmarkMutation = useRemoveBookmark();

  const isLiked = article
    ? (likes?.some((like) => like.user_id === userId) ?? false)
    : false;
  const isBookmarked = article
    ? (bookmarks?.some((b) => b.article_id === article.id) ?? false)
    : false;
  const likesCount = likes?.length || 0;

  useEffect(() => {
    if (allArticles.length > 0 && articleUrl) {
      // Normalize URL for comparison (remove trailing slashes, lowercase)
      const normalizedUrl = articleUrl.toLowerCase().replace(/\/$/, "");
      const found = allArticles.find((a) => {
        const articleUrlNormalized = a.url.toLowerCase().replace(/\/$/, "");
        return articleUrlNormalized === normalizedUrl || 
               articleUrlNormalized.includes(normalizedUrl) ||
               normalizedUrl.includes(articleUrlNormalized);
      });
      setArticle(found || null);

      // Fetch full article content if article found
      if (found && !found.content) {
        setIsLoadingContent(true);
        
        // CRITICAL: Wrap async code in async IIFE since useEffect callback cannot be async
        (async () => {
          // Use client-side article content service
          try {
            const result = await fetchArticleContent(found.url);
            if (result.success && result.content) {
              console.log(`✅ Article content fetch succeeded for: ${found.url.substring(0, 50)}...`);
              // Sanitize the HTML content
              const sanitized = sanitizeArticleHtml(result.content);
              setParsedContent(sanitized);
            } else {
              console.warn("Article content fetch failed, showing excerpt");
              setParsedContent(null);
            }
          } catch (error) {
            console.error("Failed to fetch article content:", error);
            setParsedContent(null);
          } finally {
            setIsLoadingContent(false);
          }
        })();
      } else if (found?.content) {
        // Sanitize cached content
        const sanitized = sanitizeArticleHtml(found.content);
        setParsedContent(sanitized);
      }
    }
  }, [allArticles, articleUrl]);

  const handleLike = () => {
    if (!article || !userId) return;
    if (isLiked) {
      unlikeMutation.mutate(article.id);
    } else {
      likeMutation.mutate(article.id);
    }
  };

  const handleBookmark = () => {
    if (!article || !userId) return;
    if (isBookmarked) {
      removeBookmarkMutation.mutate(article.id);
    } else {
      bookmarkMutation.mutate({
        articleId: article.id,
        articleTitle: article.title,
        articleSource: article.source,
      });
    }
  };

  const handleShare = async () => {
    if (!article) return;
    await shareContent({
      title: article.title,
      text: article.excerpt || "",
      url: article.url,
    });
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
    document.documentElement.classList.toggle("dark");
  };

  if (isLoading) {
    return <LoadingState message="Loading article..." fullScreen />;
  }

  if (!article) {
    return (
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            title="Article not found"
            message="The article you're looking for doesn't exist or has been removed."
            icon={<FileText className="w-12 h-12 text-gray-400" />}
          />
        </div>
      </ErrorBoundary>
    );
  }

  const readingTime = parsedContent
    ? estimateReadingTime(parsedContent.replace(/<[^>]*>/g, ""))
    : null;

  return (
    <ErrorBoundary>
      <div
        className={`min-h-screen bg-white dark:bg-gray-900 ${theme === "dark" ? "dark" : ""}`}
      >
        <Suspense fallback={null}>
          <ReadingProgress />
        </Suspense>

        {/* Article Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
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

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
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
                  maxHeight: '80vh',
                  overflow: 'auto'
                }}
                sandbox="allow-same-origin allow-scripts"
                title={`Article content: ${article.title}`}
                onLoad={() => {
                  // Adjust iframe height to content after load
                  const iframe = document.querySelector(`iframe[title*="${article.title}"]`) as HTMLIFrameElement;
                  if (iframe?.contentWindow?.document?.body) {
                    const height = iframe.contentWindow.document.body.scrollHeight;
                    iframe.style.height = `${Math.min(height + 20, window.innerHeight * 0.8)}px`;
                  }
                }}
              />
            </div>
          ) : article.excerpt ? (
            <div className="prose dark:prose-invert max-w-none mb-8">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {article.excerpt}
              </p>
            </div>
          ) : null}

          {/* Extracted Links */}
          {article.links && article.links.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Related Links:
              </h3>
              <ul className="space-y-2">
                {article.links.slice(0, 5).map((link, index) => (
                  <li key={index}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      {
                        link
                          .replace(/^(https?:\/\/)?(www\.)?/, "")
                          .split("/")[0]
                      }
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article Actions */}
          <Suspense fallback={<LoadingState message="Loading actions..." />}>
            <ActionBar
              articleId={article.id}
              likes={likesCount}
              comments={article.comments || 0}
              isLiked={isLiked}
              isBookmarked={isBookmarked}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onShare={handleShare}
            />
          </Suspense>

          {/* Reader Controls */}
          <Suspense fallback={null}>
            <ReaderControls
              articleId={article.id}
              articleUrl={article.url}
              isBookmarked={isBookmarked}
              onBookmarkToggle={handleBookmark}
              onShare={handleShare}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              theme={theme}
              onThemeToggle={handleThemeToggle}
            />
          </Suspense>
        </div>

        {/* External Link Notice */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> This is a reader view. For the full
              article, visit{" "}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                {article.source}
              </a>
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
