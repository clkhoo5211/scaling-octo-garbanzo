import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import type { Article } from "@/lib/services/indexedDBCache";

/**
 * Deduplicate articles by URL
 */
function deduplicateArticles(articles: Article[]): Article[] {
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

/**
 * Hook to fetch articles - Real-time only, no caching
 * Uses modular RSS sources with adaptive rate limiting
 * Also includes non-RSS sources (Hacker News, Product Hunt, GitHub, Reddit)
 * Category is required - no "All" option for faster loading
 */
export function useArticles(
  category: NewsCategory,
  options?: { usePagination?: boolean; extractLinks?: boolean }
) {
  // CRITICAL: Track client-side mount to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return useQuery({
    queryKey: ["articles", category, "realtime"], // Always real-time
    // CRITICAL: Only enable query on client-side to prevent hydration mismatch
    enabled: isClient,
    queryFn: async () => {
      console.log(`Fetching real-time articles for ${category}...`);
      
      // Fetch RSS sources using modular aggregator (no caching)
      // CRITICAL: Use Promise.allSettled to fetch sources in parallel for faster loading
      const rssArticles = await modularRSSAggregator.fetchByCategory(category);

      // Fetch non-RSS sources (Hacker News, Product Hunt, GitHub, Reddit)
      // Only pass supported categories to contentAggregator
      const supportedCategory = (category === "tech" || category === "crypto" || category === "social" || category === "general") 
        ? category as "tech" | "crypto" | "social" | "general"
        : undefined;
      const nonRSSArticles = supportedCategory 
        ? await contentAggregator.aggregateSources(supportedCategory, {
            usePagination: options?.usePagination ?? false,
            extractLinks: options?.extractLinks ?? true,
          })
        : [];

      // Combine and deduplicate
      const allArticles = [...rssArticles, ...nonRSSArticles];
      const uniqueArticles = deduplicateArticles(allArticles);

      console.log(`Fetched ${uniqueArticles.length} real-time articles for ${category}`);

      return uniqueArticles;
    },
    staleTime: 0, // No stale time - always fetch fresh data
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache
    retry: 0, // No retries - fail fast
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    // CRITICAL: Provide consistent initial state to prevent hydration mismatch
    placeholderData: [], // Empty array ensures server and client both start with same state
  });
}

/**
 * Hook to fetch articles from all categories
 * Useful for searching articles by URL across all sources
 */
export function useAllArticles(options?: { usePagination?: boolean; extractLinks?: boolean }) {
  // Call all hooks at top level (React rules)
  const techQuery = useArticles("tech", options);
  const cryptoQuery = useArticles("crypto", options);
  const socialQuery = useArticles("social", options);
  const generalQuery = useArticles("general", options);
  const businessQuery = useArticles("business", options);
  const scienceQuery = useArticles("science", options);
  const sportsQuery = useArticles("sports", options);
  const entertainmentQuery = useArticles("entertainment", options);
  const healthQuery = useArticles("health", options);
  
  const queries = [techQuery, cryptoQuery, socialQuery, generalQuery, businessQuery, scienceQuery, sportsQuery, entertainmentQuery, healthQuery];
  
  const isLoading = queries.some(q => q.isLoading);
  const isError = queries.some(q => q.isError);
  const error = queries.find(q => q.error)?.error;
  
  // Combine all articles and deduplicate
  const allArticles = queries
    .map(q => q.data || [])
    .flat()
    .filter((a, index, self) => 
      index === self.findIndex((t) => t.url === a.url)
    );
  
  return {
    data: allArticles,
    isLoading,
    isError,
    error,
  };
}

/**
 * Hook to get bookmarks
 */
export function useBookmarks(userId: string | null) {
  return useQuery({
    queryKey: ["bookmarks", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await getBookmarks(userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

/**
 * Hook to bookmark an article
 */
export function useBookmarkArticle() {
  const queryClient = useQueryClient();
  const { userId } = useAppStore();

  return useMutation({
    mutationFn: async (data: {
      articleId: string;
      articleTitle: string;
      articleSource: string;
    }) => {
      if (!userId) throw new Error("User not authenticated");
      const { error } = await createBookmark({
        userId,
        ...data,
      });
      if (error) throw error;
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", userId] });
      useAppStore.getState().addBookmark(data.articleId);
    },
  });
}

/**
 * Hook to remove bookmark
 */
export function useRemoveBookmark() {
  const queryClient = useQueryClient();
  const { userId } = useAppStore();

  return useMutation({
    mutationFn: async (articleId: string) => {
      if (!userId) throw new Error("User not authenticated");
      const { error } = await removeBookmark(userId, articleId);
      if (error) throw error;
    },
    onSuccess: (_, articleId) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", userId] });
      useAppStore.getState().removeBookmark(articleId);
    },
  });
}

/**
 * Hook to like an article
 */
export function useLikeArticle() {
  const queryClient = useQueryClient();
  const { userId } = useAppStore();

  return useMutation({
    mutationFn: async (articleId: string) => {
      if (!userId) throw new Error("User not authenticated");
      const { error } = await likeArticle(userId, articleId);
      if (error) throw error;
    },
    onSuccess: (_, articleId) => {
      queryClient.invalidateQueries({ queryKey: ["article-likes", articleId] });
      useAppStore.getState().likeArticle(articleId);
    },
  });
}

/**
 * Hook to unlike an article
 */
export function useUnlikeArticle() {
  const queryClient = useQueryClient();
  const { userId } = useAppStore();

  return useMutation({
    mutationFn: async (articleId: string) => {
      if (!userId) throw new Error("User not authenticated");
      const { error } = await unlikeArticle(userId, articleId);
      if (error) throw error;
    },
    onSuccess: (_, articleId) => {
      queryClient.invalidateQueries({ queryKey: ["article-likes", articleId] });
      useAppStore.getState().unlikeArticle(articleId);
    },
  });
}

export function useArticleLikes(articleId: string) {
  return useQuery({
    queryKey: ["article-likes", articleId],
    queryFn: async () => {
      const { data, error } = await getArticleLikes(articleId);
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to follow a user
 */
export function useFollowUser() {
  const queryClient = useQueryClient();
  const { userId } = useAppStore();

  return useMutation({
    mutationFn: async (followingId: string) => {
      if (!userId) throw new Error("User not authenticated");
      const { error } = await followUser(userId, followingId);
      if (error) throw error;
    },
    onSuccess: (_, followingId) => {
      queryClient.invalidateQueries({ queryKey: ["following", userId] });
      useAppStore.getState().followUser(followingId);
    },
  });
}

/**
 * Hook to unfollow a user
 */
export function useUnfollowUser() {
  const queryClient = useQueryClient();
  const { userId } = useAppStore();

  return useMutation({
    mutationFn: async (followingId: string) => {
      if (!userId) throw new Error("User not authenticated");
      const { error } = await unfollowUser(userId, followingId);
      if (error) throw error;
    },
    onSuccess: (_, followingId) => {
      queryClient.invalidateQueries({ queryKey: ["following", userId] });
      useAppStore.getState().unfollowUser(followingId);
    },
  });
}

export function useFollowing(userId: string | null) {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await getFollowing(userId);
      if (error) throw error;
      // Extract following IDs from UserFollow objects
      return data?.map((follow) => follow.following_id) || [];
    },
    enabled: !!userId,
  });
}

/**
 * Hook to get notifications
 */
export function useNotifications(userId: string | null) {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await getNotifications(userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { userId } = useAppStore();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await markNotificationRead(notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });
}

export function usePointsTransactions(userId: string | null) {
  return useQuery({
    queryKey: ["points-transactions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await getPointsTransactions(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
