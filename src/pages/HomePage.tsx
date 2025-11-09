import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ArticleTimeline } from "@/components/feed/ArticleTimeline";
import { CategoryTabs } from "@/components/feed/CategoryTabs";
import { ShowMoreButton } from "@/components/feed/ShowMoreButton";
import { Autocomplete } from "@/components/search/Autocomplete";
import { FilterChips, type FilterChip } from "@/components/search/FilterChips";
import { useState, useEffect } from "react";
import { useArticles } from "@/lib/hooks/useArticles";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import type { Article } from "@/lib/services/indexedDBCache";
import type { NewsCategory } from "@/lib/sources/types";

const ARTICLES_PER_PAGE = 10;

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterChip[]>([]);
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (selectedCategory === null) {
      setSelectedCategory("tech");
    }
  }, [selectedCategory]);

  const activeCategory = selectedCategory || "tech";
  const { geolocation } = useGeolocation();
  const countryCode = geolocation?.countryCode;

  const { data: articles, isLoading, isError, error } = useArticles(activeCategory, {
    usePagination: true,
    extractLinks: true,
    enableRealtime: true,
    forceRealtime: true, // 🔥 Enable real-time updates (no cache, 30s polling)
    countryCode: countryCode || undefined,
  });

  if (typeof window !== 'undefined') {
    console.log(`[HomePage] Category: ${activeCategory}, Articles: ${articles?.length || 0}, Loading: ${isLoading}, Error: ${isError}`);
  }

  const filteredArticles = (articles || []).filter((article) => {
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

  const displayedArticles = showAllArticles 
    ? filteredArticles 
    : filteredArticles.slice(0, ARTICLES_PER_PAGE);

  const hasMoreArticles = filteredArticles.length > ARTICLES_PER_PAGE;

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
    // Modal handles navigation
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

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {filters.length > 0 && (
          <FilterChips
            filters={filters}
            onRemove={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />
        )}

        {mounted && (
          <CategoryTabs
            selectedCategory={selectedCategory || "tech"}
            onSelectCategory={(category) => {
              setSelectedCategory(category);
              setShowAllArticles(false);
            }}
          />
        )}

        {isLoading ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center gap-4 p-8">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Loading articles...</p>
          </div>
        ) : isError ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center gap-4 p-8">
            <p className="text-sm text-red-400">Error loading articles: {error?.message || 'Unknown error'}</p>
          </div>
        ) : (
          <>
            {/* Use ArticleTimeline for real-time mode (forceRealtime: true) */}
            <ArticleTimeline
              articles={displayedArticles}
              onSelectArticle={handleSelectArticle}
            />
            
            {hasMoreArticles && !showAllArticles && (
              <ShowMoreButton onClick={handleShowMore} />
            )}
            
            {displayedArticles.length > 0 && (
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
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

