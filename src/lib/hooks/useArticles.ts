import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { modularRSSAggregator } from "@/lib/sources/modularRSSAggregator";
import { contentAggregator } from "@/lib/services/contentAggregator";
import type { NewsCategory } from "@/lib/sources/types";
import {
  getBookmarks,
  createBookmark,
  removeBookmark,
  likeArticle,
  unlikeArticle,
  getArticleLikes,
  followUser,
  unfollowUser,
  getFollowing,
  getNotifications,
  markNotificationRead,
  getPointsTransactions,
} from "@/lib/api/supabaseApi";
import { useAppStore } from "@/lib/stores/appStore";

/**
 * Hook to fetch articles - Real-time only, no caching
 * Uses modular RSS sources with adaptive rate limiting
 * Also includes non-RSS sources (Hacker News, Product Hunt, GitHub, Reddit)
 */
export function useArticles(
  category?: NewsCategory,
  options?: { usePagination?: boolean; extractLinks?: boolean }
) {
  return useQuery({
    queryKey: ["articles", category, "realtime"], // Always real-time
    queryFn: async () => {
      console.log(`Fetching real-time articles for ${category || "all"}...`);
      
      // Fetch RSS sources using modular aggregator (no caching)
      const rssArticles = category
        ? await modularRSSAggregator.fetchByCategory(category)
        : await modularRSSAggregator.fetchAllSources();

      // Fetch non-RSS sources (Hacker News, Product Hunt, GitHub, Reddit)
      // Only fetch if category matches or no category specified
      const nonRSSArticles = await contentAggregator.aggregateSources(category, {
        usePagination: options?.usePagination ?? false,
        extractLinks: options?.extractLinks ?? true,
      });

      // Combine and deduplicate
      const allArticles = [...rssArticles, ...nonRSSArticles];
      const uniqueArticles = deduplicateArticles(allArticles);

      console.log(`Fetched ${uniqueArticles.length} real-time articles for ${category || "all"}`);

      return uniqueArticles;
    },
    staleTime: 0, // Always fetch fresh (no caching)
    gcTime: 0, // No cache time
    retry: 2,
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
}

/**
 * Deduplicate articles by URL
 */
function deduplicateArticles(articles: any[]): any[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    const normalizedUrl = article.url.toLowerCase().replace(/\/$/, "");
    if (seen.has(normalizedUrl)) {
      return false;
    }
    seen.add(normalizedUrl);
    return true;
  });
}
