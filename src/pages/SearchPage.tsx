import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { Autocomplete } from "@/components/search/Autocomplete";
import { FilterChips, type FilterChip } from "@/components/search/FilterChips";
import { ArticleFeed } from "@/components/feed/ArticleFeed";
import { useMemo, useState } from "react";
import { useArticles } from "@/lib/hooks/useArticles";
import type { Article } from "@/lib/services/indexedDBCache";
import type { NewsCategory } from "@/lib/sources/types";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterChip[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedCategory] = useState<NewsCategory>("general");

  const { data: articles, isLoading } = useArticles(selectedCategory, {
    usePagination: true,
    extractLinks: true,
  });

  const filteredArticles = useMemo(() => {
    if (selectedArticleId && articles) {
      return articles.filter((article) => article.id === selectedArticleId);
    }

    if (searchQuery && articles) {
      const query = searchQuery.toLowerCase();
      return articles.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.excerpt?.toLowerCase().includes(query) ||
          article.source.toLowerCase().includes(query) ||
          article.author?.toLowerCase().includes(query)
      );
    }

    return articles;
  }, [articles, searchQuery, selectedArticleId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedArticleId(null);
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
    setSelectedArticleId(article.id);
    setSearchQuery(article.title);
    setFilters([
      {
        id: "search",
        label: `Search: ${article.title}`,
        type: "tag",
        value: article.title,
      },
    ]);
  };

  const handleRemoveFilter = (id: string) => {
    if (id === "search") {
      setSearchQuery("");
      setSelectedArticleId(null);
    }
    setFilters(filters.filter((f) => f.id !== id));
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setFilters([]);
    setSelectedArticleId(null);
  };

  return (
    <ErrorBoundary>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-text-primary">
            Search Articles
          </h1>
          <p className="text-text-secondary">
            Find articles across all sources and categories
          </p>
        </div>

        <div className="mb-6 rounded-card border border-border-subtle bg-background-elevated p-4 shadow-card sm:p-6">
          <Autocomplete
            articles={articles || []}
            onSelect={handleSelectArticle}
            onSearch={handleSearch}
            isLoading={isLoading}
            placeholder="Search articles, sources, authors..."
            maxResults={10}
          />
        </div>

        {filters.length > 0 && (
          <FilterChips
            filters={filters}
            onRemove={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />
        )}

        {selectedArticleId && filteredArticles && filteredArticles.length === 1 && (
          <div className="mb-4 flex items-center gap-3 rounded-card border border-border-subtle bg-surface-subtle/60 px-4 py-3 text-sm text-text-secondary">
            Showing the selected article.{" "}
            <button
              onClick={handleClearAllFilters}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Clear selection
            </button>
          </div>
        )}

        {isLoading ? (
          <LoadingState message="Searching articles..." />
        ) : filteredArticles && filteredArticles.length > 0 ? (
          <div>
            <p className="mb-4 text-sm text-text-tertiary">
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
            icon={<Search className="h-12 w-12 text-text-tertiary" />}
          />
        ) : (
          <EmptyState
            title="Start searching"
            message="Enter keywords to search for articles across all sources"
            icon={<Search className="h-12 w-12 text-text-tertiary" />}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

