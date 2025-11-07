/**
 * Modular RSS Aggregator
 * Uses modular RSS sources with adaptive rate limiting
 * No caching - real-time fetching only
 */

import type { Article } from "../services/indexedDBCache";
import { getAllRSSSources, getRSSSourcesByCategory } from "./rssRegistry";

export class ModularRSSAggregator {
  /**
   * Fetch articles from all enabled RSS sources
   */
  async fetchAllSources(): Promise<Article[]> {
    const sources = getAllRSSSources();
    console.log(`Fetching from ${sources.length} RSS sources...`);

    const results = await Promise.allSettled(
      sources.map(async (source) => {
        try {
          const result = await source.fetch();
          if (result.error) {
            console.warn(`⚠ ${source.config.name}: ${result.error}`);
            return [];
          }
          console.log(`✓ ${source.config.name}: ${result.articles.length} articles`);
          return result.articles;
        } catch (error) {
          console.error(`✗ ${source.config.name}:`, error);
          return [];
        }
      })
    );

    const allArticles = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<Article[]>).value);

    // Deduplicate by URL
    const uniqueArticles = this.deduplicateArticles(allArticles);

    // Sort by published date (newest first)
    return uniqueArticles.sort((a, b) => b.publishedAt - a.publishedAt);
  }

  /**
   * Fetch articles from sources in a specific category
   */
  async fetchByCategory(
    category: "tech" | "crypto" | "social" | "general"
  ): Promise<Article[]> {
    const sources = getRSSSourcesByCategory(category);
    console.log(`Fetching ${category} articles from ${sources.length} sources...`);

    const results = await Promise.allSettled(
      sources.map(async (source) => {
        try {
          const result = await source.fetch();
          if (result.error) {
            console.warn(`⚠ ${source.config.name}: ${result.error}`);
            return [];
          }
          console.log(`✓ ${source.config.name}: ${result.articles.length} articles`);
          return result.articles;
        } catch (error) {
          console.error(`✗ ${source.config.name}:`, error);
          return [];
        }
      })
    );

    const allArticles = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<Article[]>).value);

    // Deduplicate by URL
    const uniqueArticles = this.deduplicateArticles(allArticles);

    // Sort by published date (newest first)
    return uniqueArticles.sort((a, b) => b.publishedAt - a.publishedAt);
  }

  /**
   * Deduplicate articles by URL
   */
  private deduplicateArticles(articles: Article[]): Article[] {
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
}

// Export singleton instance
export const modularRSSAggregator = new ModularRSSAggregator();

