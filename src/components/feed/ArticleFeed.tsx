"use client";

import { ArticleCard } from "./ArticleCard";
import { EmptyState } from "@/components/ui/LoadingState";
import type { Article } from "@/lib/services/indexedDBCache";
import { FileText } from "lucide-react";

interface ArticleFeedProps {
  articles: Article[];
  onSelectArticle?: (article: Article) => void;
}

export function ArticleFeed({ articles, onSelectArticle }: ArticleFeedProps) {
  if (!articles || articles.length === 0) {
    return (
      <EmptyState
        title="No articles found"
        message="Try adjusting your filters or check back later"
        icon={<FileText className="w-12 h-12 text-gray-400" />}
      />
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
