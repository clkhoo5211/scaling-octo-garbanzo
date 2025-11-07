import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentAggregator } from '@/lib/services/contentAggregator';
import { indexedDBCache } from '@/lib/services/indexedDBCache';
import type { Article } from '@/lib/services/indexedDBCache';
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
} from '@/lib/api/supabaseApi';
import { useAppStore } from '@/lib/stores/appStore';

/**
 * Hook to fetch articles with caching and enhanced aggregation
 * Now includes link extraction and pagination support
 */
export function useArticles(
  category?: 'tech' | 'crypto' | 'social' | 'general',
  options?: { usePagination?: boolean; extractLinks?: boolean }
) {
  return useQuery({
    queryKey: ['articles', category, options],
    queryFn: async () => {
      // Check cache first
      const cached = await indexedDBCache.getArticles(category);
      if (cached.length > 0) {
        return cached;
      }

      // Fetch from sources with enhanced options
      const articles = await contentAggregator.aggregateSources(category, {
        usePagination: options?.usePagination ?? false,
        extractLinks: options?.extractLinks ?? true,
      });

      // Cache articles
      await indexedDBCache.setArticles(articles, category);

      return articles;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to get bookmarks
 */
export function useBookmarks(userId: string | null) {
  return useQuery({
    queryKey: ['bookmarks', userId],
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
      if (!userId) throw new Error('User not authenticated');
      const { error } = await createBookmark({
        userId,
        ...data,
      });
      if (error) throw error;
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', userId] });
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
      if (!userId) throw new Error('User not authenticated');
      const { error } = await removeBookmark(userId, articleId);
      if (error) throw error;
    },
    onSuccess: (_, articleId) => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', userId] });
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
      if (!userId) throw new Error('User not authenticated');
      const { error } = await likeArticle(userId, articleId);
      if (error) throw error;
    },
    onSuccess: (_, articleId) => {
      queryClient.invalidateQueries({ queryKey: ['article-likes', articleId] });
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
      if (!userId) throw new Error('User not authenticated');
      const { error } = await unlikeArticle(userId, articleId);
      if (error) throw error;
    },
    onSuccess: (_, articleId) => {
      queryClient.invalidateQueries({ queryKey: ['article-likes', articleId] });
      useAppStore.getState().unlikeArticle(articleId);
    },
  });
}

export function useArticleLikes(articleId: string) {
  return useQuery({
    queryKey: ['article-likes', articleId],
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
      if (!userId) throw new Error('User not authenticated');
      const { error } = await followUser(userId, followingId);
      if (error) throw error;
    },
    onSuccess: (_, followingId) => {
      queryClient.invalidateQueries({ queryKey: ['following', userId] });
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
      if (!userId) throw new Error('User not authenticated');
      const { error } = await unfollowUser(userId, followingId);
      if (error) throw error;
    },
    onSuccess: (_, followingId) => {
      queryClient.invalidateQueries({ queryKey: ['following', userId] });
      useAppStore.getState().unfollowUser(followingId);
    },
  });
}

export function useFollowing(userId: string | null) {
  return useQuery({
    queryKey: ['following', userId],
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
    queryKey: ['notifications', userId],
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
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });
}

export function usePointsTransactions(userId: string | null) {
  return useQuery({
    queryKey: ['points-transactions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await getPointsTransactions(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

