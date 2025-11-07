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
 * Fetch Reddit articles as fallback for categories without contentAggregator support
 * This ensures categories have articles even when RSS feeds fail
 */
async function fetchRedditFallback(category: NewsCategory): Promise<Article[]> {
  const subredditMap: Record<string, string[]> = {
    business: ["business", "economics", "investing", "stocks"],
    science: ["science", "space", "technology", "futurology"],
    health: ["health", "medicine", "fitness", "nutrition"],
    sports: ["sports", "nba", "soccer", "nfl"],
    entertainment: ["entertainment", "movies", "music", "television"],
  };

  const subreddits = subredditMap[category] || [];
  if (subreddits.length === 0) return [];

  try {
    // Fetch from multiple subreddits in parallel with retry logic
    const results = await Promise.allSettled(
      subreddits.map(async (subreddit) => {
        return fetchWithRetry(
          async () => {
            // Add small random delay to avoid hitting rate limits
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
            
            const response = await fetch(
              `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`,
              {
                headers: {
                  "User-Agent": "Web3News/1.0 (https://web3news.app)",
                },
              }
            );

            if (!response.ok) {
              // Log but don't throw - continue with other subreddits
              console.warn(`Reddit r/${subreddit} returned ${response.status}`);
              return [];
            }

            const data = await response.json();
            const posts = data.data?.children || [];

            return posts
              .map((child: any) => {
                const post = child.data;
                // Skip Reddit internal links and self-posts without external URLs
                if (!post.url || 
                    post.url.startsWith("https://www.reddit.com/") ||
                    post.url.startsWith("https://reddit.com/") ||
                    post.url.startsWith("/r/")) {
                  return null;
                }

                return {
                  id: `reddit-${post.id}`,
                  title: post.title,
                  url: post.url,
                  source: `Reddit r/${subreddit}`,
                  category: category,
                  upvotes: post.ups || 0,
                  comments: post.num_comments || 0,
                  publishedAt: post.created_utc * 1000,
                  author: post.author,
                  excerpt: post.selftext?.substring(0, 200) || "",
                  thumbnail: post.thumbnail?.startsWith("http") ? post.thumbnail : undefined,
                  urlHash: "",
                  cachedAt: 0,
                } as Article;
              })
              .filter((article: Article | null) => article !== null);
          },
          2, // maxRetries: 2 (will try 3 times total)
          2000, // baseDelay: 2 seconds
          15000 // timeout: 15 seconds per attempt
        );
      })
    );

    const allArticles = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<Article[]>).value);

    const successfulSubreddits = results.filter((r) => 
      r.status === "fulfilled" && (r as PromiseFulfilledResult<Article[]>).value.length > 0
    ).length;

    console.log(`✓ Reddit fallback for ${category}: ${allArticles.length} articles from ${successfulSubreddits}/${subreddits.length} subreddits`);
    return allArticles;
  } catch (error) {
    console.error(`Error fetching Reddit fallback for ${category}:`, error);
    return [];
  }
}

/**
 * Hook to fetch articles - Real-time only, no caching
 * Uses modular RSS sources with adaptive rate limiting
 * Also includes non-RSS sources (Hacker News, Product Hunt, GitHub, Reddit)
 * Category is required - no "All" option for faster loading
 */
/**
 * Fetch with timeout - prevents hanging forever
 */
async function fetchWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 5000
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
  );
  return Promise.race([promise, timeout]);
}

/**
 * Fetch with exponential backoff retry logic
 * Handles rate limits (429) and timeouts (408) by retrying with increasing delays
 */
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  timeoutMs: number = 30000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Use timeout wrapper
      return await fetchWithTimeout(fetchFn(), timeoutMs);
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error?.message?.includes('401') || error?.message?.includes('403') || error?.message?.includes('404')) {
        throw error; // Auth/permission errors - don't retry
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate exponential backoff delay with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`[fetchWithRetry] Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Unknown error in fetchWithRetry');
}

export function useArticles(
  category: NewsCategory,
  options?: { usePagination?: boolean; extractLinks?: boolean; enableRealtime?: boolean }
) {
  // CRITICAL: Track client-side mount to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return useQuery({
    queryKey: ["articles", category, "realtime"],
    enabled: isClient,
    queryFn: async () => {
      console.log(`[useArticles] Fetching articles for ${category}...`);
      
      // CRITICAL: Try server-side RSS fetching first (bypasses CORS and rate limits)
      // Fallback to client-side fetching if server-side fails
      let rssArticlesResult: PromiseSettledResult<Article[]>;
      
      try {
        // Try server-side RSS fetching first
        const serverResponse = await fetch(`/api/rss?category=${category}`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(20000), // 20 second timeout
        });

        if (serverResponse.ok) {
          const serverData = await serverResponse.json();
          if (serverData.articles && serverData.articles.length > 0) {
            console.log(`[useArticles] ✅ Server-side RSS fetch succeeded for ${category}: ${serverData.articles.length} articles from ${serverData.successfulSources}/${serverData.totalSources} sources`);
            rssArticlesResult = {
              status: 'fulfilled',
              value: serverData.articles,
            };
          } else {
            // Server-side returned empty, fallback to client-side
            throw new Error('Server-side returned empty articles');
          }
        } else {
          throw new Error(`Server-side RSS fetch failed: ${serverResponse.status}`);
        }
      } catch (serverError) {
        console.warn(`[useArticles] Server-side RSS fetch failed for ${category}, falling back to client-side:`, serverError);
        // Fallback to client-side RSS fetching with retry logic
        rssArticlesResult = await Promise.allSettled([
          fetchWithRetry(
            () => modularRSSAggregator.fetchByCategory(category),
            2, // maxRetries: 2 (3 attempts total)
            2000, // baseDelay: 2 seconds
            30000 // timeout: 30 seconds per attempt
          ).catch((err) => {
            console.warn(`[useArticles] RSS fetch failed for ${category} after retries:`, err);
            return [];
          }),
        ]).then(results => results[0]);
      }

      const [rssArticles, nonRSSArticles] = await Promise.allSettled([
        Promise.resolve(rssArticlesResult.status === 'fulfilled' ? rssArticlesResult.value : []),
        (async () => {
          // Categories that have contentAggregator support (non-RSS sources)
          const supportedCategory = (category === "tech" || category === "crypto" || category === "social" || category === "general") 
            ? category as "tech" | "crypto" | "social" | "general"
            : undefined;
          
          if (supportedCategory) {
            // Use contentAggregator for categories with non-RSS sources
            return fetchWithRetry(
              () => contentAggregator.aggregateSources(supportedCategory, {
                usePagination: options?.usePagination ?? false,
                extractLinks: options?.extractLinks ?? true,
              }),
              2, // maxRetries: 2
              2000, // baseDelay: 2 seconds
              30000 // timeout: 30 seconds
            ).catch((err) => {
              console.warn(`[useArticles] Non-RSS fetch failed for ${category} after retries:`, err);
              return [];
            });
          } else {
            // For other categories (business, science, sports, etc.), they rely on RSS sources only
            // RSS sources are already fetched above, so return empty array here
            // Only use Reddit as a last resort fallback if RSS sources fail
            return [];
          }
        })(),
      ]);

      const rss = rssArticles.status === "fulfilled" ? rssArticles.value : [];
      const nonRSS = nonRSSArticles.status === "fulfilled" ? (Array.isArray(nonRSSArticles.value) ? nonRSSArticles.value : []) : [];

      // Combine and deduplicate
      let allArticles = [...rss, ...nonRSS];
      
      // If no articles from RSS or non-RSS sources, try Reddit fallback for certain categories
      if (allArticles.length === 0 && (category === "business" || category === "science" || category === "health" || category === "sports" || category === "entertainment")) {
        console.log(`[useArticles] No articles from RSS sources for ${category}, trying Reddit fallback with retry logic...`);
        try {
          const redditArticles = await fetchRedditFallback(category);
          allArticles = [...allArticles, ...redditArticles];
          if (redditArticles.length > 0) {
            console.log(`[useArticles] ✅ Reddit fallback succeeded for ${category}: ${redditArticles.length} articles`);
          }
        } catch (err) {
          console.warn(`[useArticles] Reddit fallback error for ${category}:`, err);
        }
      }
      
      const uniqueArticles = deduplicateArticles(allArticles);

      console.log(`[useArticles] ✅ Fetched ${uniqueArticles.length} articles for ${category} (RSS: ${rss.length}, Non-RSS: ${nonRSS.length})`);
      console.log(`[useArticles] Debug - RSS status: ${rssArticles.status}, Non-RSS status: ${nonRSSArticles.status}`);
      if (nonRSSArticles.status === "rejected") {
        console.error(`[useArticles] Non-RSS rejected:`, nonRSSArticles.reason);
      }
      if (rssArticles.status === "rejected") {
        console.error(`[useArticles] RSS rejected:`, rssArticles.reason);
      }

      // Return empty array if no articles (don't throw error)
      return uniqueArticles;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - use cached data
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Retry once on failure
    retryDelay: 1000, // 1 second delay
    refetchOnMount: false, // Don't refetch if we have cached data
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // CRITICAL: Enable real-time polling if requested (default: true)
    // Poll every 2 minutes for new articles - only updates when new articles appear
    refetchInterval: options?.enableRealtime !== false ? 2 * 60 * 1000 : false,
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
