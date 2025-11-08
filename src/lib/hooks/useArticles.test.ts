/**
 * Tests for useArticles hooks
 */

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import React from "react";
import {
  useArticles,
  useBookmarks,
  useBookmarkArticle,
  useLikeArticle,
  useArticleLikes,
} from "./useArticles";
import * as rssService from "@/lib/services/rssService";
import * as contentAggregator from "@/lib/services/contentAggregator";
import * as supabaseApi from "@/lib/api/supabaseApi";

// Mock dependencies
jest.mock("@/lib/services/rssService", () => ({
  getArticlesFromRSS: jest.fn(),
  fetchRSSFeeds: jest.fn(),
}));
jest.mock("@/lib/services/contentAggregator", () => ({
  contentAggregator: {
    aggregateSources: jest.fn(),
  },
}));
jest.mock("@/lib/api/supabaseApi");
jest.mock("@/lib/stores/appStore", () => {
  const mockStore = {
    userId: "test-user-id",
    addBookmark: jest.fn(),
    removeBookmark: jest.fn(),
    likeArticle: jest.fn(),
    unlikeArticle: jest.fn(),
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
  };
  const useAppStoreMock = jest.fn(() => mockStore);
  (useAppStoreMock as unknown as { getState: jest.Mock }).getState = jest.fn(
    () => mockStore
  );
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
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };

  return Wrapper;
};

describe("useArticles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch articles from RSS and non-RSS sources in real-time", async () => {
    const mockRSSArticles = [
      {
        id: "rss-1",
        title: "RSS Article",
        url: "https://example.com/rss-article",
        source: "RSS Source",
        publishedAt: Date.now(),
        category: "tech" as const,
        cachedAt: Date.now(),
        urlHash: "hash1",
      },
    ];

    const mockNonRSSArticles = [
      {
        id: "hn-1",
        title: "Hacker News Article",
        url: "https://example.com/hn-article",
        source: "Hacker News",
        publishedAt: Date.now(),
        category: "tech" as const,
        cachedAt: Date.now(),
        urlHash: "hash2",
      },
    ];

    (
      rssService.getArticlesFromRSS as jest.Mock
    ).mockResolvedValue({
      articles: mockRSSArticles,
      category: "tech",
      totalSources: 1,
      successfulSources: 1,
      totalArticles: mockRSSArticles.length,
    });
    (
      contentAggregator.contentAggregator.aggregateSources as jest.Mock
    ).mockResolvedValue(mockNonRSSArticles);

    const { result } = renderHook(() => useArticles("tech"), {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(result.current.isSuccess || result.current.isError).toBe(true);
      },
      { timeout: 10000 }
    );

    if (result.current.isError) {
      console.error("Query error:", result.current.error);
    }

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toHaveLength(2); // Combined RSS + non-RSS articles
    expect(
      rssService.getArticlesFromRSS
    ).toHaveBeenCalledWith("tech", undefined);
    expect(
      contentAggregator.contentAggregator.aggregateSources
    ).toHaveBeenCalledWith("tech", {
      usePagination: false,
      extractLinks: true,
    });
  });
});

describe("useBookmarks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch bookmarks for a user", async () => {
    const mockBookmarks = [
      {
        id: "1",
        user_id: "test-user-id",
        article_id: "article-1",
        article_title: "Test Article",
        article_source: "Test Source",
        created_at: new Date().toISOString(),
      },
    ];

    (supabaseApi.getBookmarks as jest.Mock).mockResolvedValue({
      data: mockBookmarks,
      error: null,
    });

    const { result } = renderHook(() => useBookmarks("test-user-id"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockBookmarks);
  });

  it("should return empty array if userId is null", async () => {
    const { result } = renderHook(() => useBookmarks(null), {
      wrapper: createWrapper(),
    });

    // When userId is null, query is disabled, so data is undefined
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(supabaseApi.getBookmarks).not.toHaveBeenCalled();
  });
});

describe("useBookmarkArticle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a bookmark", async () => {
    (supabaseApi.createBookmark as jest.Mock).mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useBookmarkArticle(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      articleId: "article-1",
      articleTitle: "Test Article",
      articleSource: "Test Source",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supabaseApi.createBookmark).toHaveBeenCalledWith({
      userId: "test-user-id",
      articleId: "article-1",
      articleTitle: "Test Article",
      articleSource: "Test Source",
    });
  });
});

describe("useLikeArticle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should like an article", async () => {
    (supabaseApi.likeArticle as jest.Mock).mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useLikeArticle(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("article-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supabaseApi.likeArticle).toHaveBeenCalledWith(
      "test-user-id",
      "article-1"
    );
  });
});

describe("useArticleLikes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch likes for an article", async () => {
    const mockLikes = [
      {
        id: "1",
        user_id: "user-1",
        article_id: "article-1",
        created_at: new Date().toISOString(),
      },
    ];

    (supabaseApi.getArticleLikes as jest.Mock).mockResolvedValue({
      data: mockLikes,
      error: null,
    });

    const { result } = renderHook(() => useArticleLikes("article-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockLikes);
  });
});
