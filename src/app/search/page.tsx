"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { Autocomplete } from "@/components/search/Autocomplete";
import { FilterChips, type FilterChip } from "@/components/search/FilterChips";
import { ArticleFeed } from "@/components/feed/ArticleFeed";
import { useState } from "react";
import { useArticles } from "@/lib/hooks/useArticles";
import type { Article } from "@/lib/services/indexedDBCache";
import type { NewsCategory } from "@/lib/sources/types";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterChip[]>([]);
  const [selectedCategory] = useState<NewsCategory | undefined>(undefined);

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
        article.source.toLowerCase().includes(query) ||
        article.author?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
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
    // This is called when modal opens (for analytics/tracking)
    // Actual navigation happens via modal's "Full Page" button
    // No need to navigate here - modal handles it
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Search Articles
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find articles across all sources and categories
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Autocomplete
            articles={articles || []}
            onSelect={handleSelectArticle}
            onSearch={handleSearch}
            isLoading={isLoading}
            placeholder="Search articles, sources, authors..."
            maxResults={10}
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

        {/* Results */}
        {isLoading ? (
          <LoadingState message="Searching articles..." />
        ) : filteredArticles && filteredArticles.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Found {filteredArticles.length} article
              {filteredArticles.length !== 1 ? "s" : ""}
            </p>
            <ArticleFeed
              articles={filteredArticles}
              onSelectArticle={handleSelectArticle}
            />
          </div>
        ) : searchQuery ? (
          <EmptyState
            title="No results found"
            message={`No articles match "${searchQuery}". Try different keywords or check your filters.`}
            icon={<Search className="w-12 h-12 text-gray-400" />}
          />
        ) : (
          <EmptyState
            title="Start searching"
            message="Enter keywords to search for articles across all sources"
            icon={<Search className="w-12 h-12 text-gray-400" />}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
