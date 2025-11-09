import localforage from "localforage";
import type { NewsCategory } from "../sources/types";

export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  category: NewsCategory;
  author?: string;
  publishedAt: number;
  thumbnail?: string;
  excerpt?: string;
  summary?: string;
  content?: string;
  upvotes?: number;
  comments?: number;
  cachedAt: number;
  urlHash: string;
  links?: string[]; // Extracted links from content (learn-anything pattern)
  topics?: string[]; // Extracted topics/keywords
  // Media support (for image-only, video, GIF feeds)
  mediaType?: 'text' | 'image' | 'video' | 'gif' | 'mixed'; // Type of media content
  mediaUrl?: string; // Primary media URL (image/video/GIF)
  mediaUrls?: string[]; // Multiple media URLs (for galleries)
  imageUrl?: string; // Specific image URL
  videoUrl?: string; // Specific video URL (YouTube, Vimeo, direct)
  gifUrl?: string; // Specific GIF URL
  videoEmbedUrl?: string; // Embed URL for videos (YouTube, Vimeo)
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxArticles: number; // Maximum articles to cache
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 30 * 60 * 1000, // 30 minutes
  maxArticles: 2000,
};

class IndexedDBCache {
  private store: LocalForage;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.store = localforage.createInstance({
      name: "web3news",
      storeName: "articles",
      description: "Cached articles with TTL",
    });
  }

  /**
   * Normalize URL for consistent hashing
   */
  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      urlObj.search = "";
      urlObj.hash = "";
      return urlObj.toString().replace(/\/$/, "");
    } catch {
      return url;
    }
  }

  /**
   * Generate SHA-256 hash of URL for deduplication
   */
  private async hashUrl(url: string): Promise<string> {
    const normalized = this.normalizeUrl(url);
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(article: Article): boolean {
    const age = Date.now() - article.cachedAt;
    return age < this.config.ttl;
  }

  /**
   * Get articles from cache, filtered by category if provided
   */
  async getArticles(category?: NewsCategory): Promise<Article[]> {
    try {
      const keys = await this.store.keys();
      const articles: Article[] = [];

      for (const key of keys) {
        const article = await this.store.getItem<Article>(key);
        if (article && this.isCacheValid(article)) {
          if (!category || article.category === category) {
            articles.push(article);
          }
        } else if (article && !this.isCacheValid(article)) {
          // Remove expired article
          await this.store.removeItem(key);
        }
      }

      // Sort by publishedAt (newest first)
      return articles.sort((a, b) => b.publishedAt - a.publishedAt);
    } catch (error) {
      console.error("Error getting articles from cache:", error);
      return [];
    }
  }

  /**
   * Store articles in cache
   */
  async setArticles(articles: Article[], category?: NewsCategory): Promise<void> {
    try {
      const now = Date.now();

      for (const article of articles) {
        // Generate URL hash if not present
        if (!article.urlHash) {
          article.urlHash = await this.hashUrl(article.url);
        }

        // Add cache metadata
        const cachedArticle: Article = {
          ...article,
          cachedAt: now,
          category: (category || article.category) as NewsCategory,
        };

        // Store by URL hash for deduplication
        await this.store.setItem(cachedArticle.urlHash, cachedArticle);
      }

      // Cleanup old articles
      await this.cleanupOldArticles();
    } catch (error) {
      console.error("Error storing articles in cache:", error);
    }
  }

  /**
   * Cleanup old articles, keeping only the most recent maxArticles
   */
  private async cleanupOldArticles(): Promise<void> {
    try {
      const keys = await this.store.keys();
      const articles: Article[] = [];

      for (const key of keys) {
        const article = await this.store.getItem<Article>(key);
        if (article) {
          articles.push(article);
        }
      }

      if (articles.length > this.config.maxArticles) {
        // Sort by cachedAt (oldest first)
        articles.sort((a, b) => a.cachedAt - b.cachedAt);

        // Remove oldest articles
        const toRemove = articles.slice(
          0,
          articles.length - this.config.maxArticles
        );
        for (const article of toRemove) {
          await this.store.removeItem(article.urlHash);
        }
      }
    } catch (error) {
      console.error("Error cleaning up old articles:", error);
    }
  }

  /**
   * Check if article exists in cache (by URL hash)
   */
  async hasArticle(url: string): Promise<boolean> {
    try {
      const urlHash = await this.hashUrl(url);
      const article = await this.store.getItem<Article>(urlHash);
      return article !== null && this.isCacheValid(article);
    } catch {
      return false;
    }
  }

  /**
   * Get single article by URL
   */
  async getArticle(url: string): Promise<Article | null> {
    try {
      const urlHash = await this.hashUrl(url);
      const article = await this.store.getItem<Article>(urlHash);
      if (article && this.isCacheValid(article)) {
        return article;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Clear all cached articles
   */
  async clear(): Promise<void> {
    try {
      await this.store.clear();
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ total: number; valid: number; expired: number }> {
    try {
      const keys = await this.store.keys();
      let valid = 0;
      let expired = 0;

      for (const key of keys) {
        const article = await this.store.getItem<Article>(key);
        if (article) {
          if (this.isCacheValid(article)) {
            valid++;
          } else {
            expired++;
          }
        }
      }

      return {
        total: keys.length,
        valid,
        expired,
      };
    } catch {
      return { total: 0, valid: 0, expired: 0 };
    }
  }
}

// Export singleton instance
export const indexedDBCache = new IndexedDBCache();
