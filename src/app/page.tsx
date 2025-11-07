"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { ArticleFeed } from "@/components/feed/ArticleFeed";
import { CategoryTabs } from "@/components/feed/CategoryTabs";
import { ShowMoreButton } from "@/components/feed/ShowMoreButton";
import { Autocomplete } from "@/components/search/Autocomplete";
import { FilterChips, type FilterChip } from "@/components/search/FilterChips";
import { useState } from "react";
import { useArticles } from "@/lib/hooks/useArticles";
import type { Article } from "@/lib/services/indexedDBCache";
import type { NewsCategory } from "@/lib/sources/types";

const ARTICLES_PER_PAGE = 10; // Top 10 for guests

export default function HomePage() {
  // Default to "tech" category - no "All" option for faster loading
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>("tech");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterChip[]>([]);
  const [showAllArticles, setShowAllArticles] = useState(false);

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
  }) || [];

  // Limit to top 10 for guests, show all for logged-in users who clicked "Show More"
  const displayedArticles = showAllArticles 
    ? filteredArticles 
    : filteredArticles.slice(0, ARTICLES_PER_PAGE);

  const hasMoreArticles = filteredArticles.length > ARTICLES_PER_PAGE;

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

  const handleShowMore = () => {
    setShowAllArticles(true);
  };

  // Reset showAllArticles when category changes
  const handleCategoryChange = (category: NewsCategory) => {
    setSelectedCategory(category);
    setShowAllArticles(false);
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
          onSelectCategory={handleCategoryChange}
        />

        {/* Article Feed */}
        {isLoading ? (
          <LoadingState message="Loading articles..." />
        ) : (
          <>
            <ArticleFeed
              articles={displayedArticles}
              onSelectArticle={handleSelectArticle}
            />
            
            {/* Show More Button - only show if there are more articles and not already showing all */}
            {hasMoreArticles && !showAllArticles && (
              <ShowMoreButton onClick={handleShowMore} />
            )}
            
            {/* Show count info */}
            {displayedArticles.length > 0 && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                {showAllArticles 
                  ? `Showing all ${filteredArticles.length} articles`
                  : `Showing top ${displayedArticles.length} of ${filteredArticles.length} articles${hasMoreArticles ? " (Click 'Show More' to see all)" : ""}`
                }
              </p>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
