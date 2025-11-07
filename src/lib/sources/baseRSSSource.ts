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
      // CRITICAL: Use CORS proxy to avoid browser CORS errors
      // RSS feeds don't allow direct browser requests due to CORS policy
      // Use allorigins.win as a free CORS proxy (supports RSS feeds)
      let xmlText: string | null = null;
      
      // Try CORS proxy first (for browser environments)
      if (typeof window !== 'undefined') {
        try {
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(this.config.url)}`;
          const proxyResponse = await fetch(proxyUrl, {
            headers: {
              'User-Agent': 'Web3News/1.0',
            },
            cache: 'no-store',
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });

          if (proxyResponse.ok) {
            const proxyData = await proxyResponse.json();
            xmlText = proxyData.contents || null;
            if (!xmlText) {
              throw new Error('Empty response from CORS proxy');
            }
          } else {
            throw new Error(`CORS proxy returned ${proxyResponse.status}`);
          }
        } catch (proxyError: any) {
          // Only log warning if it's not a timeout (timeouts are expected for slow feeds)
          if (!proxyError?.name?.includes('Timeout') && !proxyError?.name?.includes('Abort')) {
            console.warn(`⚠ ${this.config.name}: CORS proxy failed, trying RSS2JSON...`, proxyError.message);
          }
          
          // Fallback to RSS2JSON proxy
          try {
            const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(this.config.url)}`;
            const rss2jsonResponse = await fetch(rss2jsonUrl, {
              headers: {
                'User-Agent': 'Web3News/1.0',
              },
              cache: 'no-store',
              // Add timeout to prevent hanging
              signal: AbortSignal.timeout(10000), // 10 second timeout
            });

            if (rss2jsonResponse.ok) {
              const rss2jsonData = await rss2jsonResponse.json();
              if (rss2jsonData.status === 'ok' && rss2jsonData.items) {
                // Convert RSS2JSON format to our Article format directly
                const maxArticles = this.config.maxArticles || 50;
                const limitedItems = rss2jsonData.items.slice(0, maxArticles);
                
                const articles: Article[] = limitedItems.map((item: any, index: number) => {
                  const publishedAt = item.pubDate 
                    ? new Date(item.pubDate).getTime()
                    : Date.now() - (index * 60000);

                  return {
                    id: `rss-${this.config.id}-${publishedAt}-${index}`,
                    title: item.title || "Untitled",
                    url: item.link || this.config.url,
                    source: this.config.name,
                    category: this.config.category,
                    publishedAt,
                    author: item.author,
                    excerpt: item.description?.replace(/<[^>]*>/g, "").substring(0, 200),
                    thumbnail: item.enclosure?.link || item.thumbnail,
                    urlHash: "",
                    cachedAt: 0,
                  };
                });

                const latestUpdateTime = articles.length > 0 
                  ? Math.max(...articles.map(a => a.publishedAt))
                  : Date.now();
                
                adaptiveRateLimiter.recordFetch(this.config.id, fetchStartTime, latestUpdateTime);

                return {
                  articles,
                  lastFetchTime: fetchStartTime,
                  nextFetchTime: fetchStartTime + this.getAdaptiveInterval(),
                };
              }
            }
          } catch (rss2jsonError: any) {
            // Only log if it's not a timeout
            if (!rss2jsonError?.name?.includes('Timeout') && !rss2jsonError?.name?.includes('Abort')) {
              console.warn(`⚠ ${this.config.name}: RSS2JSON proxy also failed`, rss2jsonError.message);
            }
          }
        }
      } else {
        // Server-side: Direct fetch (no CORS restrictions)
        const response = await fetch(this.config.url, {
          headers: {
            'User-Agent': 'Web3News/1.0',
          },
          cache: 'no-store',
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

        xmlText = await response.text();
      }

      // If we have XML text, parse it
      if (!xmlText) {
        adaptiveRateLimiter.recordError(this.config.id);
        return {
          articles: [],
          lastFetchTime: fetchStartTime,
          nextFetchTime: fetchStartTime + this.getAdaptiveInterval(),
          error: `Failed to fetch RSS feed: No data received`,
        };
      }

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

