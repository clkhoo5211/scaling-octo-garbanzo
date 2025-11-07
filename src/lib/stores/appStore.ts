import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserPreferences {
  theme: "light" | "dark" | "system";
  category: "tech" | "crypto" | "social" | "general" | "all";
  fontSize: "small" | "medium" | "large";
  notifications: boolean;
}

interface AppState {
  // User preferences
  preferences: UserPreferences;
  setPreferences: (preferences: Partial<UserPreferences>) => void;

  // Current user
  userId: string | null;
  setUserId: (userId: string | null) => void;

  // Points balance
  pointsBalance: number;
  setPointsBalance: (balance: number) => void;

  // Selected category
  selectedCategory: "tech" | "crypto" | "social" | "general" | "all";
  setSelectedCategory: (
    category: "tech" | "crypto" | "social" | "general" | "all"
  ) => void;

  // Bookmarked articles
  bookmarks: Set<string>;
  addBookmark: (articleId: string) => void;
  removeBookmark: (articleId: string) => void;
  isBookmarked: (articleId: string) => boolean;

  // Liked articles
  likedArticles: Set<string>;
  likeArticle: (articleId: string) => void;
  unlikeArticle: (articleId: string) => void;
  isLiked: (articleId: string) => boolean;

  // Following users
  following: Set<string>;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;

  // Offline queue
  offlineQueue: Array<{
    id: string;
    type: "like" | "bookmark" | "follow" | "message" | "bid";
    payload: unknown;
    timestamp: number;
  }>;
  addToOfflineQueue: (action: {
    type: "like" | "bookmark" | "follow" | "message" | "bid";
    payload: unknown;
  }) => void;
  removeFromOfflineQueue: (id: string) => void;
  clearOfflineQueue: () => void;

  // Reading progress
  readingProgress: Map<string, number>; // articleId -> progress percentage
  setReadingProgress: (articleId: string, progress: number) => void;
  getReadingProgress: (articleId: string) => number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User preferences
      preferences: {
        theme: "system",
        category: "all",
        fontSize: "medium",
        notifications: true,
      },
      setPreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),

      // Current user
      userId: null,
      setUserId: (userId) => set({ userId }),

      // Points balance
      pointsBalance: 0,
      setPointsBalance: (balance) => set({ pointsBalance: balance }),

      // Selected category
      selectedCategory: "all",
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      // Bookmarked articles
      bookmarks: new Set(),
      addBookmark: (articleId) =>
        set((state) => {
          const newBookmarks = new Set(state.bookmarks);
          newBookmarks.add(articleId);
          return { bookmarks: newBookmarks };
        }),
      removeBookmark: (articleId) =>
        set((state) => {
          const newBookmarks = new Set(state.bookmarks);
          newBookmarks.delete(articleId);
          return { bookmarks: newBookmarks };
        }),
      isBookmarked: (articleId) => get().bookmarks.has(articleId),

      // Liked articles
      likedArticles: new Set(),
      likeArticle: (articleId) =>
        set((state) => {
          const newLiked = new Set(state.likedArticles);
          newLiked.add(articleId);
          return { likedArticles: newLiked };
        }),
      unlikeArticle: (articleId) =>
        set((state) => {
          const newLiked = new Set(state.likedArticles);
          newLiked.delete(articleId);
          return { likedArticles: newLiked };
        }),
      isLiked: (articleId) => get().likedArticles.has(articleId),

      // Following users
      following: new Set(),
      followUser: (userId) =>
        set((state) => {
          const newFollowing = new Set(state.following);
          newFollowing.add(userId);
          return { following: newFollowing };
        }),
      unfollowUser: (userId) =>
        set((state) => {
          const newFollowing = new Set(state.following);
          newFollowing.delete(userId);
          return { following: newFollowing };
        }),
      isFollowing: (userId) => get().following.has(userId),

      // Offline queue
      offlineQueue: [],
      addToOfflineQueue: (action) =>
        set((state) => ({
          offlineQueue: [
            ...state.offlineQueue,
            {
              id: `${Date.now()}-${Math.random()}`,
              ...action,
              timestamp: Date.now(),
            },
          ],
        })),
      removeFromOfflineQueue: (id) =>
        set((state) => ({
          offlineQueue: state.offlineQueue.filter((item) => item.id !== id),
        })),
      clearOfflineQueue: () => set({ offlineQueue: [] }),

      // Reading progress
      readingProgress: new Map<string, number>(),
      setReadingProgress: (articleId, progress) =>
        set((state) => {
          const newProgress = new Map(state.readingProgress);
          newProgress.set(articleId, progress);
          return { readingProgress: newProgress };
        }),
      getReadingProgress: (articleId) => {
        const progress = get().readingProgress.get(articleId);
        return progress || 0;
      },
    }),
    {
      name: "web3news-store",
      partialize: (state) => ({
        preferences: state.preferences,
        bookmarks: Array.from(state.bookmarks),
        likedArticles: Array.from(state.likedArticles),
        following: Array.from(state.following),
        readingProgress: Array.from(state.readingProgress.entries()),
      }),
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Restore Sets and Maps from arrays
          state.bookmarks = new Set(state.bookmarks as string[]);
          state.likedArticles = new Set(state.likedArticles as string[]);
          state.following = new Set(state.following as string[]);
          state.readingProgress = new Map(state.readingProgress as [string, number][]);
        }
      },
    }
  )
);
