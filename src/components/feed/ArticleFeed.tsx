"use client";

import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/lib/services/indexedDBCache";
import { useEffect, useRef, useState } from "react";

interface ArticleFeedProps {
  articles: Article[];
  onSelectArticle?: (article: Article) => void;
}

export function ArticleFeed({ articles, onSelectArticle }: ArticleFeedProps) {
  // Track which articles are "new" (just appeared)
  const [newArticleIds, setNewArticleIds] = useState<Set<string>>(new Set());
  const previousArticleIdsRef = useRef<Set<string>>(new Set());
  const isInitialMountRef = useRef(true);

  // Detect new articles when articles list updates
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      // Store initial article IDs
      previousArticleIdsRef.current = new Set(articles.map(a => a.id));
      return;
    }

    // Create set of current article IDs
    const currentArticleIds = new Set(articles.map(a => a.id));
    
    // Find new articles (in current but not in previous)
    const newIds = new Set<string>();
    currentArticleIds.forEach(id => {
      if (!previousArticleIdsRef.current.has(id)) {
        newIds.add(id);
      }
    });

    // If there are new articles, mark them for animation
    if (newIds.size > 0) {
      setNewArticleIds(newIds);
      
      // Remove animation class after animation completes (1.5s)
      const timeout = setTimeout(() => {
        setNewArticleIds(new Set());
      }, 1500);

      // Update previous IDs
      previousArticleIdsRef.current = currentArticleIds;

      return () => clearTimeout(timeout);
    } else {
      // Update previous IDs even if no new articles
      previousArticleIdsRef.current = currentArticleIds;
    }
  }, [articles]);

  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        {/* CRITICAL: Use CSS icon instead of lucide-react to prevent hydration mismatch */}
        <div className="mb-4 w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-600 text-2xl">📄</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No articles found
        </h3>
        <p className="text-sm text-gray-600 mb-4 max-w-md">
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, index) => {
        const isNew = newArticleIds.has(article.id);
        return (
          <div
            key={article.id}
            className={`article-card-wrapper ${
              isNew ? 'article-new-pop-in' : ''
            }`}
            style={{
              animationDelay: isNew ? `${Math.min(index * 0.05, 0.5)}s` : '0s',
            }}
          >
        <ArticleCard
          article={article}
          onSelect={onSelectArticle}
        />
          </div>
        );
      })}
    </div>
  );
}
