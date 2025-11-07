"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import type { Article } from "@/lib/services/indexedDBCache";

interface AutocompleteProps {
  articles: Article[];
  onSelect: (article: Article) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  maxResults?: number;
}

/**
 * Autocomplete Component
 * Search input with autocomplete suggestions
 * CRITICAL: Client-only to prevent hydration mismatches with lucide-react icons
 */
export function Autocomplete({
  articles,
  onSelect,
  onSearch,
  isLoading = false,
  placeholder = "Search articles...",
  maxResults = 5,
}: AutocompleteProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // CRITICAL: Only render icons after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter articles based on query
  const filteredArticles = articles
    .filter(
      (article) =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(query.toLowerCase()) ||
        article.source.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, maxResults);

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    setShowSuggestions(value.length > 0);
    if (value.length > 0) {
      onSearch(value);
    }
  };

  // Handle article selection
  const handleSelect = (article: Article) => {
    setQuery("");
    setShowSuggestions(false);
    onSelect(article);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredArticles.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredArticles.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredArticles.length) {
          handleSelect(filteredArticles[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        {mounted && (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`w-full ${mounted ? 'pl-10' : 'pl-4'} pr-10 py-2 border border-gray-500 rounded-lg bg-gray-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary`}
        />
        {mounted && isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
        {mounted && query && !isLoading && (
          <button
            onClick={() => handleInputChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700 rounded"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredArticles.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {filteredArticles.map((article, index) => (
            <button
              key={article.id}
              onClick={() => handleSelect(article)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
                index === selectedIndex ? "bg-gray-700" : ""
              } ${index === 0 ? "rounded-t-lg" : ""} ${
                index === filteredArticles.length - 1 ? "rounded-b-lg" : ""
              }`}
            >
              <div className="font-medium text-sm text-white truncate">
                {article.title}
              </div>
              <div className="text-xs text-gray-400 mt-1 truncate">
                {article.source} • {article.category}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showSuggestions &&
        query.length > 0 &&
        filteredArticles.length === 0 &&
        !isLoading && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50 p-4 text-center text-sm text-gray-300">
            No articles found
          </div>
        )}
    </div>
  );
}
