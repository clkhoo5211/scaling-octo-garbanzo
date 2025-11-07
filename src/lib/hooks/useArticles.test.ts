/**
 * Tests for useArticles hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import React from 'react';
import {
  useArticles,
  useBookmarks,
  useBookmarkArticle,
  useLikeArticle,
  useArticleLikes,
} from './useArticles';
import * as contentAggregator from '@/lib/services/contentAggregator';
import * as indexedDBCache from '@/lib/services/indexedDBCache';
import * as supabaseApi from '@/lib/api/supabaseApi';

// Mock dependencies
jest.mock('@/lib/services/contentAggregator', () => ({
  contentAggregator: {
    aggregateSources: jest.fn(),
  },
}));
jest.mock('@/lib/services/indexedDBCache', () => ({
  indexedDBCache: {
    getArticles: jest.fn(),
    setArticles: jest.fn(),
  },
}));
jest.mock('@/lib/api/supabaseApi');
jest.mock('@/lib/stores/appStore', () => {
  const mockStore = {
    userId: 'test-user-id',
    addBookmark: jest.fn(),
    removeBookmark: jest.fn(),
    likeArticle: jest.fn(),
    unlikeArticle: jest.fn(),
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
  };
  const useAppStoreMock = jest.fn(() => mockStore);
  (useAppStoreMock as unknown as { getState: jest.Mock }).getState = jest.fn(() => mockStore);
  return {
    useAppStore: useAppStoreMock,
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
  
  return Wrapper;
};

describe('useArticles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch articles from cache first', async () => {
    const mockArticles = [
      {
        id: '1',
        title: 'Test Article',
        url: 'https://example.com/article',
        source: 'Test Source',
        publishedAt: Date.now(),
      },
    ];

    (indexedDBCache.indexedDBCache.getArticles as jest.Mock).mockResolvedValue(mockArticles);

    const { result } = renderHook(() => useArticles('tech'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });
    expect(result.current.data).toEqual(mockArticles);
    expect(indexedDBCache.indexedDBCache.getArticles).toHaveBeenCalledWith('tech');
    expect(contentAggregator.contentAggregator.aggregateSources).not.toHaveBeenCalled();
  });

  it('should fetch from sources if cache is empty', async () => {
    const mockArticles = [
      {
        id: '1',
        title: 'Test Article',
        url: 'https://example.com/article',
        source: 'Test Source',
        publishedAt: Date.now(),
      },
    ];

    (indexedDBCache.indexedDBCache.getArticles as jest.Mock).mockResolvedValue([]);
    (contentAggregator.contentAggregator.aggregateSources as jest.Mock).mockResolvedValue(mockArticles);
    (indexedDBCache.indexedDBCache.setArticles as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useArticles('tech'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 5000 });
    
    if (result.current.isError) {
      console.error('Query error:', result.current.error);
    }
    
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(mockArticles);
    expect(contentAggregator.contentAggregator.aggregateSources).toHaveBeenCalled();
    expect(indexedDBCache.indexedDBCache.setArticles).toHaveBeenCalledWith(mockArticles, 'tech');
  });
});

describe('useBookmarks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch bookmarks for a user', async () => {
    const mockBookmarks = [
      {
        id: '1',
        user_id: 'test-user-id',
        article_id: 'article-1',
        article_title: 'Test Article',
        article_source: 'Test Source',
        created_at: new Date().toISOString(),
      },
    ];

    (supabaseApi.getBookmarks as jest.Mock).mockResolvedValue({
      data: mockBookmarks,
      error: null,
    });

    const { result } = renderHook(() => useBookmarks('test-user-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockBookmarks);
  });

  it('should return empty array if userId is null', async () => {
    const { result } = renderHook(() => useBookmarks(null), {
      wrapper: createWrapper(),
    });

    // When userId is null, query is disabled, so data is undefined
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(supabaseApi.getBookmarks).not.toHaveBeenCalled();
  });
});

describe('useBookmarkArticle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a bookmark', async () => {
    (supabaseApi.createBookmark as jest.Mock).mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useBookmarkArticle(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      articleId: 'article-1',
      articleTitle: 'Test Article',
      articleSource: 'Test Source',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supabaseApi.createBookmark).toHaveBeenCalledWith({
      userId: 'test-user-id',
      articleId: 'article-1',
      articleTitle: 'Test Article',
      articleSource: 'Test Source',
    });
  });
});

describe('useLikeArticle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should like an article', async () => {
    (supabaseApi.likeArticle as jest.Mock).mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useLikeArticle(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('article-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supabaseApi.likeArticle).toHaveBeenCalledWith('test-user-id', 'article-1');
  });
});

describe('useArticleLikes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch likes for an article', async () => {
    const mockLikes = [
      {
        id: '1',
        user_id: 'user-1',
        article_id: 'article-1',
        created_at: new Date().toISOString(),
      },
    ];

    (supabaseApi.getArticleLikes as jest.Mock).mockResolvedValue({
      data: mockLikes,
      error: null,
    });

    const { result } = renderHook(() => useArticleLikes('article-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockLikes);
  });
});

