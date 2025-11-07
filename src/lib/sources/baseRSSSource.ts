/**
 * Base RSS Source Implementation
 * Provides common RSS parsing functionality
 */

import type { Article } from "../services/indexedDBCache";
import type { RSSSourceConfig, RSSSourceHandler, RSSSourceResult } from "./types";
import { adaptiveRateLimiter } from "./adaptiveRateLimiter";

export class BaseRSSSource implements RSSSourceHandler {
  config: RSSSourceConfig;

  constructor(config: RSSSourceConfig) {
    this.config = config;
  }

  /**
   * Parse RSS XML directly (no proxy needed)
   */
  protected parseRSSXML(xmlText: string): Array<{
    title?: string;
    link?: string;
    description?: string;
    pubDate?: string;
    author?: string;
    thumbnail?: string;
  }> {
    const items: Array<{
      title?: string;
      link?: string;
      description?: string;
      pubDate?: string;
      author?: string;
      thumbnail?: string;
    }> = [];

    try {
      // Match all <item> tags (compatible regex)
      const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
      const itemMatches: RegExpExecArray[] = [];
      let match: RegExpExecArray | null;
      while ((match = itemRegex.exec(xmlText)) !== null) {
        itemMatches.push(match);
      }

      for (const match of itemMatches) {
        const itemXml = match[1];
        const titleMatch = itemXml.match(/<title[^>]*>(.*?)<\/title>/i);
        const linkMatch = itemXml.match(/<link[^>]*>(.*?)<\/link>/i);
        const descMatch = itemXml.match(/<description[^>]*>(.*?)<\/description>/i);
        const dateMatch = itemXml.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i);
        const authorMatch = itemXml.match(/<(?:author|dc:creator)[^>]*>(.*?)<\/(?:author|dc:creator)>/i);
        const thumbnailMatch = itemXml.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i) ||
                                itemXml.match(/<enclosure[^>]*url=["']([^"']+)["']/i);

        const title = titleMatch?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() || titleMatch?.[1]?.trim();
        const link = linkMatch?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() || linkMatch?.[1]?.trim();

        if (title && link) {
          items.push({
            title,
            link,
            description: descMatch?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() || descMatch?.[1]?.trim(),
            pubDate: dateMatch?.[1]?.trim(),
            author: authorMatch?.[1]?.trim(),
            thumbnail: thumbnailMatch?.[1],
          });
        }
      }
    } catch (error) {
      console.error(`Error parsing RSS XML for ${this.config.name}:`, error);
    }

    return items;
  }

  /**
   * Fetch articles from RSS feed (real-time, no caching)
   */
  async fetch(): Promise<RSSSourceResult> {
    const fetchStartTime = Date.now();

    // Check if we should fetch now (adaptive rate limiting)
    if (!adaptiveRateLimiter.shouldFetch(this.config.id, this.config.updateFrequency)) {
      const timeUntilNext = adaptiveRateLimiter.getTimeUntilNextFetch(
        this.config.id,
        this.config.updateFrequency
      );
      return {
        articles: [],
        lastFetchTime: fetchStartTime,
        nextFetchTime: fetchStartTime + timeUntilNext,
        error: `Rate limited: wait ${Math.round(timeUntilNext / 1000)}s`,
      };
    }

    try {
      // Fetch RSS feed directly (no proxy, no caching)
      const response = await fetch(this.config.url, {
        headers: {
          'User-Agent': 'Web3News/1.0',
        },
        cache: 'no-store', // No caching - always fetch fresh
      });

      if (!response.ok) {
        adaptiveRateLimiter.recordError(this.config.id);
        return {
          articles: [],
          lastFetchTime: fetchStartTime,
          nextFetchTime: fetchStartTime + this.getAdaptiveInterval(),
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const xmlText = await response.text();
      const items = this.parseRSSXML(xmlText);

      // Limit articles if specified
      const maxArticles = this.config.maxArticles || 50;
      const limitedItems = items.slice(0, maxArticles);

      // Convert to Article format
      const articles: Article[] = limitedItems.map((item, index) => {
        const publishedAt = item.pubDate 
          ? new Date(item.pubDate).getTime()
          : Date.now() - (index * 60000); // Fallback: spread over time

        return {
          id: `rss-${this.config.id}-${publishedAt}-${index}`,
          title: item.title || "Untitled",
          url: item.link || this.config.url,
          source: this.config.name,
          category: this.config.category,
          publishedAt,
          author: item.author,
          excerpt: item.description?.replace(/<[^>]*>/g, "").substring(0, 200),
          thumbnail: item.thumbnail,
          urlHash: "",
          cachedAt: 0, // No caching - always 0
        };
      });

      // Record successful fetch
      const latestUpdateTime = articles.length > 0 
        ? Math.max(...articles.map(a => a.publishedAt))
        : Date.now();
      
      adaptiveRateLimiter.recordFetch(this.config.id, fetchStartTime, latestUpdateTime);

      const nextFetchTime = fetchStartTime + this.getAdaptiveInterval();

      return {
        articles,
        lastFetchTime: fetchStartTime,
        nextFetchTime,
      };
    } catch (error) {
      adaptiveRateLimiter.recordError(this.config.id);
      return {
        articles: [],
        lastFetchTime: fetchStartTime,
        nextFetchTime: fetchStartTime + this.getAdaptiveInterval(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get adaptive interval for this source
   */
  getAdaptiveInterval(): number {
    return adaptiveRateLimiter.getInterval(
      this.config.id,
      this.config.updateFrequency
    );
  }
}

