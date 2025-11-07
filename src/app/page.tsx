"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { ArticleFeed } from "@/components/feed/ArticleFeed";
import { CategoryTabs } from "@/components/feed/CategoryTabs";
import { Autocomplete } from "@/components/search/Autocomplete";
import { FilterChips, type FilterChip } from "@/components/search/FilterChips";
import { useState } from "react";
import { useArticles } from "@/lib/hooks/useArticles";
import type { Article } from "@/lib/services/indexedDBCache";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<
    "tech" | "crypto" | "social" | "general" | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterChip[]>([]);

  const { data: articles, isLoading } = useArticles(selectedCategory, {
    usePagination: true,
    extractLinks: true,
  });

  const filteredArticles = articles?.filter((article) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(query) ||
        article.excerpt?.toLowerCase().includes(query) ||
        article.source.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      // Add search filter chip
      const searchFilter: FilterChip = {
        id: "search",
        label: `Search: ${query}`,
        type: "tag",
        value: query,
      };
      setFilters([searchFilter]);
    } else {
      setFilters([]);
    }
  };

  const handleSelectArticle = (article: Article) => {
    // Navigate to article reader view
    window.location.href = `/article?url=${encodeURIComponent(article.url)}`;
  };

  const handleRemoveFilter = (id: string) => {
    if (id === "search") {
      setSearchQuery("");
    }
    setFilters(filters.filter((f) => f.id !== id));
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setFilters([]);
  };

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <Autocomplete
            articles={articles || []}
            onSelect={handleSelectArticle}
            onSearch={handleSearch}
            isLoading={isLoading}
            placeholder="Search articles..."
            maxResults={5}
          />
        </div>

        {/* Filter Chips */}
        {filters.length > 0 && (
          <FilterChips
            filters={filters}
            onRemove={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />
        )}

        {/* Category Tabs */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Article Feed */}
        {isLoading ? (
          <LoadingState message="Loading articles..." />
        ) : (
          <ArticleFeed
            articles={filteredArticles || []}
            onSelectArticle={handleSelectArticle}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
