"use client";

import { memo, useMemo } from "react";
import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/lib/services/indexedDBCache";

interface ArticleTimelineProps {
  articles: Article[];
  onSelectArticle?: (article: Article) => void;
}

/**
 * Format date for timeline grouping
 * Groups articles by: Today, Yesterday, This Week, or specific date
 */
function formatDateGroup(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const articleDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (articleDate.getTime() === today.getTime()) {
    return "Today";
  } else if (articleDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else if (articleDate.getTime() >= weekAgo.getTime()) {
    return "This Week";
  } else {
    // Format as "Monday, January 15, 2024"
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

/**
 * ArticleTimeline Component
 * 
 * Displays articles in a timeline format grouped by date (Today, Yesterday, This Week, etc.)
 */
export const ArticleTimeline = memo(function ArticleTimeline({
  articles,
  onSelectArticle,
}: ArticleTimelineProps) {
  // Group articles by date
  const groupedArticles = useMemo(() => {
    const groups: Record<string, Article[]> = {};

    articles.forEach((article) => {
      const date = new Date(article.publishedAt);
      const dateKey = formatDateGroup(date);

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(article);
    });

    // Sort articles within each group by published date (newest first)
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => b.publishedAt - a.publishedAt);
    });

    // Sort groups by date (Today first, then Yesterday, then This Week, then older dates)
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const order: Record<string, number> = {
        "Today": 0,
        "Yesterday": 1,
        "This Week": 2,
      };

      const orderA = order[a] ?? 999;
      const orderB = order[b] ?? 999;

      if (orderA !== 999 || orderB !== 999) {
        return orderA - orderB;
      }

      // For older dates, sort by date (newest first)
      const dateA = new Date(groups[a][0].publishedAt);
      const dateB = new Date(groups[b][0].publishedAt);
      return dateB.getTime() - dateA.getTime();
    });

    return sortedKeys.map((key) => ({
      dateKey: key,
      articles: groups[key],
    }));
  }, [articles]);

  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-gray-600 dark:text-gray-400 text-2xl">📄</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No articles found
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md">
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="article-timeline max-w-4xl mx-auto px-4 py-6">
      {groupedArticles.map(({ dateKey, articles: dateArticles }) => (
        <div key={dateKey} className="mb-8">
          {/* Date Header (Sticky) */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 py-4 border-b border-gray-200 dark:border-gray-700 mb-4 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {dateKey}
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({dateArticles.length} {dateArticles.length === 1 ? 'article' : 'articles'})
              </span>
            </h2>
          </div>

          {/* Articles for this date */}
          <div className="space-y-4">
            {dateArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onSelect={onSelectArticle}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

