"use client";

import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/lib/services/indexedDBCache";

interface ArticleFeedProps {
  articles: Article[];
  onSelectArticle?: (article: Article) => void;
}

export function ArticleFeed({ articles, onSelectArticle }: ArticleFeedProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        {/* CRITICAL: Use CSS icon instead of lucide-react to prevent hydration mismatch */}
        <div className="mb-4 w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
          <span className="text-gray-400 text-2xl">📄</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No articles found
        </h3>
        <p className="text-sm text-gray-400 mb-4 max-w-md">
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onSelect={onSelectArticle}
        />
      ))}
    </div>
  );
}
