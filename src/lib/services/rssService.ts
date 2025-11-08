/**
 * Client-Side RSS Fetching Service
 * Fetches RSS feeds client-side
 * Note: Some feeds may require CORS proxy in production
 */

import { getRSSSourcesByCategory } from '@/lib/sources/rssRegistry';
import { getCountryNewsSources } from '@/lib/sources/rss/country';
import type { NewsCategory } from '@/lib/sources/types';
import type { Article } from '../services/indexedDBCache';

/**
 * Parse RSS XML to extract articles
 */
function parseRSSXML(xmlText: string, sourceName: string, category: NewsCategory): Article[] {
  const articles: Article[] = [];

  try {
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    const itemMatches: RegExpExecArray[] = [];
    let match: RegExpExecArray | null;
    while ((match = itemRegex.exec(xmlText)) !== null) {
      itemMatches.push(match);
    }

    for (let index = 0; index < itemMatches.length; index++) {
      const itemXml = itemMatches[index][1];
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
        const publishedAt = dateMatch?.[1] 
          ? new Date(dateMatch[1].trim()).getTime()
          : Date.now() - (index * 60000);

        articles.push({
          id: `rss-client-${sourceName.toLowerCase().replace(/\s+/g, '-')}-${publishedAt}-${index}`,
          title,
          url: link,
          source: sourceName,
          category,
          publishedAt,
          author: authorMatch?.[1]?.trim(),
          excerpt: descMatch?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').replace(/<[^>]*>/g, "").trim().substring(0, 200),
          thumbnail: thumbnailMatch?.[1],
          cachedAt: Date.now(),
          urlHash: link.toLowerCase().replace(/\/$/, ''),
        });
      }
    }
  } catch (error) {
    console.error(`Error parsing RSS XML for ${sourceName}:`, error);
  }

  return articles;
}

/**
 * Fetch RSS feed client-side
 * Handles CORS errors gracefully - some feeds may block cross-origin requests
 */
async function fetchRSSFeed(url: string, sourceName: string, category: NewsCategory) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Web3News/1.0 (Client-Side RSS Fetcher)',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000), // 15 second timeout
      mode: 'cors', // Explicitly request CORS
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();
    const articles = parseRSSXML(xmlText, sourceName, category);
    
    return {
      success: true,
      articles,
      source: sourceName,
    };
  } catch (error: any) {
    // Handle CORS errors gracefully - don't spam console with errors
    const isCorsError = error?.message?.includes('CORS') || 
                       error?.message?.includes('Failed to fetch') ||
                       error?.name === 'TypeError';
    
    if (isCorsError) {
      // CORS errors are expected for some RSS feeds - log at debug level only
      console.debug(`⚠️ CORS blocked RSS feed ${sourceName} (${url}). This is expected for some feeds.`);
    } else {
      // Other errors should be logged normally
      console.error(`❌ Error fetching RSS feed ${sourceName} (${url}):`, error?.message || error);
    }
    
    return {
      success: false,
      articles: [],
      source: sourceName,
      error: isCorsError ? 'CORS blocked' : (error?.message || 'Unknown error'),
    };
  }
}

/**
 * Fetch RSS feeds for a specific category
 */
export async function fetchRSSFeeds(category: NewsCategory, countryCode?: string) {
  try {
    if (!category) {
      throw new Error('Category parameter is required');
    }

    // Get RSS sources for this category
    let sources = getRSSSourcesByCategory(category);

    // If category is "local", fetch country-specific sources only
    if (category === 'local') {
      const country = countryCode || 'US';
      const countrySources = getCountryNewsSources(country);
      sources = countrySources;
    }
    // If category is "general", add country-specific sources (mixed with general)
    else if (category === 'general') {
      const country = countryCode || 'US';
      const countrySources = getCountryNewsSources(country);
      sources = [...sources, ...countrySources];
    }

    if (sources.length === 0) {
      return {
        articles: [],
        category,
        sources: [],
        message: `No RSS sources found for category: ${category}`,
      };
    }

    // Fetch all RSS feeds in parallel
    const results = await Promise.allSettled(
      sources.map(source => 
        fetchRSSFeed(source.config.url, source.config.name, category)
      )
    );

    // Combine all successful results
    const allArticles = results
      .filter((r) => r.status === 'fulfilled' && r.value.success)
      .flatMap((r) => (r as PromiseFulfilledResult<{ articles: any[] }>).value.articles);

    // Deduplicate by URL
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.url, article])).values()
    );

    // Sort by published date (newest first)
    uniqueArticles.sort((a, b) => b.publishedAt - a.publishedAt);

    // Limit to top 50 articles
    const limitedArticles = uniqueArticles.slice(0, 50);

    const successfulSources = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success && r.value.articles.length > 0
    ).length;

    return {
      articles: limitedArticles,
      category,
      totalSources: sources.length,
      successfulSources,
      totalArticles: limitedArticles.length,
    };
  } catch (error: any) {
    console.error('Error in RSS service:', error);
    throw error;
  }
}

/**
 * Fetches RSS feeds client-side for a specific category
 * Alias for fetchRSSFeeds for backward compatibility
 */
export async function getArticlesFromRSS(category: NewsCategory, countryCode?: string) {
  return fetchRSSFeeds(category, countryCode);
}

