/**
 * Lists Hooks
 * React Query hooks for curated lists functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLists,
  getList,
  createList,
  updateList,
  deleteList,
  getListArticles,
  addArticleToList,
  removeArticleFromList,
  subscribeToList,
  unsubscribeFromList,
  getListSubscriptions,
  type List,
  type ListArticle,
  type ListSubscription,
} from '@/lib/api/supabaseApi';
import { useAppStore } from '@/lib/stores/appStore';

/**
 * Hook to fetch lists
 */
export function useLists(filters?: {
  userId?: string;
  isPublic?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['lists', filters],
    queryFn: async () => {
      const { data, error } = await getLists(filters);
      if (error) throw error;
      return (data || []) as List[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single list
 */
export function useList(listId: string) {
  return useQuery({
    queryKey: ['list', listId],
    queryFn: async () => {
      const { data, error } = await getList(listId);
      if (error) throw error;
      return data as List | null;
    },
    enabled: !!listId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a list
 */
export function useCreateList() {
  const queryClient = useQueryClient();
  const { userId } = useAppStore();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      isPublic = false,
    }: {
      name: string;
      description?: string;
      isPublic?: boolean;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      const { data, error } = await createList({
        userId,
        name,
        description,
        isPublic,
      });
      if (error) throw error;
      return data as List;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

/**
 * Hook to update a list
 */
export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      name,
      description,
      isPublic,
    }: {
      listId: string;
      name?: string;
      description?: string;
      isPublic?: boolean;
    }) => {
      const { data, error } = await updateList({
        listId,
        name,
        description,
        isPublic,
      });
      if (error) throw error;
      return data as List;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['list', data.id] });
    },
  });
}

/**
 * Hook to delete a list
 */
export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await deleteList(listId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

/**
 * Hook to fetch articles in a list
 */
export function useListArticles(listId: string) {
  return useQuery({
    queryKey: ['list-articles', listId],
    queryFn: async () => {
      const { data, error } = await getListArticles(listId);
      if (error) throw error;
      return (data || []) as ListArticle[];
    },
    enabled: !!listId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to add an article to a list
 */
export function useAddArticleToList() {
  const queryClient = useQueryClient();
  const { userId } = useAppStore();

  return useMutation({
    mutationFn: async ({
      listId,
      articleId,
      articleTitle,
      articleUrl,
      articleSource,
    }: {
      listId: string;
      articleId: string;
      articleTitle?: string;
      articleUrl?: string;
      articleSource?: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      const { data, error } = await addArticleToList({
        listId,
        articleId,
        articleTitle,
        articleUrl,
        articleSource,
        addedBy: userId,
      });
      if (error) throw error;
      return data as ListArticle;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['list-articles', data.list_id] });
    },
  });
}

/**
 * Hook to remove an article from a list
 */
export function useRemoveArticleFromList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      articleId,
    }: {
      listId: string;
      articleId: string;
    }) => {
      const { error } = await removeArticleFromList(listId, articleId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['list-articles', variables.listId] });
    },
  });
}

/**
 * Hook to subscribe to a list
 */
export function useSubscribeToList() {
  const queryClient = useQueryClient();
  const { userId } = useAppStore();

  return useMutation({
    mutationFn: async (listId: string) => {
      if (!userId) throw new Error('User not authenticated');
      const { data, error } = await subscribeToList({ listId, userId });
      if (error) throw error;
      return data as ListSubscription;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['list', data.list_id] });
      queryClient.invalidateQueries({ queryKey: ['list-subscriptions'] });
    },
  });
}

/**
 * Hook to unsubscribe from a list
 */
export function useUnsubscribeFromList() {
  const queryClient = useQueryClient();
  const { userId } = useAppStore();

  return useMutation({
    mutationFn: async (listId: string) => {
      if (!userId) throw new Error('User not authenticated');
      const { error } = await unsubscribeFromList({ listId, userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['list-subscriptions'] });
    },
  });
}

/**
 * Hook to fetch user's list subscriptions
 */
export function useListSubscriptions(userId: string | null) {
  return useQuery({
    queryKey: ['list-subscriptions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await getListSubscriptions(userId);
      if (error) throw error;
      return (data || []) as ListSubscription[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

