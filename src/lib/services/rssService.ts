/**
 * Client-Side RSS Fetching Service
 * Fetches RSS feeds client-side
 * Falls back to MCP server for CORS-blocked feeds
 */

import { getRSSSourcesByCategory } from '@/lib/sources/rssRegistry';
import { getCountryNewsSources } from '@/lib/sources/rss/country';
import type { NewsCategory } from '@/lib/sources/types';
import type { Article } from '../services/indexedDBCache';
import { fetchRSSFeedViaMCP, fetchRSSFeedViaMCPRealtime, fetchNewsByCategoryViaMCP } from './mcpService';
import { extractMediaFromRSSItem } from './mediaExtractor';

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

        // Extract media information
        const mediaInfo = extractMediaFromRSSItem(itemXml);

        articles.push({
          id: `rss-client-${sourceName.toLowerCase().replace(/\s+/g, '-')}-${publishedAt}-${index}`,
          title,
          url: link,
          source: sourceName,
          category,
          publishedAt,
          author: authorMatch?.[1]?.trim(),
          excerpt: descMatch?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').replace(/<[^>]*>/g, "").trim().substring(0, 200),
          thumbnail: thumbnailMatch?.[1] || mediaInfo.imageUrl || mediaInfo.mediaUrl,
          cachedAt: Date.now(),
          urlHash: link.toLowerCase().replace(/\/$/, ''),
          // Media support
          mediaType: mediaInfo.mediaType,
          mediaUrl: mediaInfo.mediaUrl,
          mediaUrls: mediaInfo.mediaUrls,
          imageUrl: mediaInfo.imageUrl,
          videoUrl: mediaInfo.videoUrl,
          gifUrl: mediaInfo.gifUrl,
          videoEmbedUrl: mediaInfo.videoEmbedUrl,
        });
      }
    }
  } catch (error) {
    console.error(`Error parsing RSS XML for ${sourceName}:`, error);
  }

  return articles;
}

/**
 * Fetch RSS feed - MCP server is PRIMARY, direct fetch is fallback
 * Changed: Use MCP server first (no CORS), fallback to direct fetch only if MCP fails
 */
async function fetchRSSFeed(url: string, sourceName: string, category: NewsCategory, forceRealtime?: boolean) {
  // PRIMARY: Try MCP server first (no CORS issues, server-side fetching)
  try {
    // Use real-time function if forceRealtime is enabled
    const mcpResult = forceRealtime 
      ? await fetchRSSFeedViaMCPRealtime(url, sourceName, category)
      : await fetchRSSFeedViaMCP(url, sourceName, category);
    
    if (mcpResult.success && mcpResult.articles.length > 0) {
      console.debug(`✅ MCP server fetched ${sourceName}: ${mcpResult.articles.length} articles`);
      return {
        success: true,
        articles: mcpResult.articles,
        source: sourceName,
      };
    } else {
      console.debug(`⚠️ MCP server failed for ${sourceName}: ${mcpResult.error || 'Unknown error'}. Trying direct fetch fallback...`);
    }
  } catch (mcpError) {
    console.debug(`⚠️ MCP server error for ${sourceName}:`, mcpError);
  }

  // FALLBACK: Try direct fetch only if MCP fails (may have CORS issues)
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
    
    if (articles.length > 0) {
      console.debug(`✅ Direct fetch succeeded for ${sourceName}: ${articles.length} articles`);
      return {
        success: true,
        articles,
        source: sourceName,
      };
    }
  } catch (error: any) {
    // Direct fetch failed - log but don't throw (MCP already tried)
    console.debug(`⚠️ Direct fetch also failed for ${sourceName}:`, error?.message || error);
  }
  
  // All methods failed
  return {
    success: false,
    articles: [],
    source: sourceName,
    error: 'MCP server and direct fetch both failed',
  };
}

/**
 * Fetch RSS feeds for a specific category
 * 
 * NEW: Optionally uses MCP server's get_news_by_category tool for better coverage
 * Falls back to individual RSS feeds if MCP fails
 */
export async function fetchRSSFeeds(category: NewsCategory, countryCode?: string, forceRealtime?: boolean) {
  try {
    if (!category) {
      throw new Error('Category parameter is required');
    }

    // Skip MCP for "local" category - it needs country-specific sources, not general news
    // MCP maps "local" to "general" which returns global news, not country-specific news
    const useMCPCategoryFetch = import.meta.env.VITE_USE_MCP_CATEGORY_FETCH !== 'false' && category !== 'local';
    
    if (useMCPCategoryFetch) {
      try {
        console.log(`[RSS] Attempting MCP category fetch for ${category}...`);
        const mcpResult = await fetchNewsByCategoryViaMCP(category, 5);
        
        if (mcpResult.success && mcpResult.articles.length > 0) {
          console.log(`[RSS] ✅ MCP category fetch succeeded for ${category}: ${mcpResult.articles.length} articles`);
          
          // Deduplicate by URL
          const uniqueArticles = Array.from(
            new Map(mcpResult.articles.map(article => [article.url, article])).values()
          );
          
          // Sort by published date (newest first)
          uniqueArticles.sort((a, b) => b.publishedAt - a.publishedAt);
          
          // Limit to top 50 articles
          const limitedArticles = uniqueArticles.slice(0, 50);
          
          return {
            articles: limitedArticles,
            category,
            totalSources: 0, // MCP doesn't provide source count
            successfulSources: 0,
            totalArticles: limitedArticles.length,
            source: 'mcp-category',
          };
        } else {
          console.debug(`[RSS] ⚠️ MCP category fetch failed for ${category}: ${mcpResult.error || 'Unknown error'}. Falling back to individual RSS feeds...`);
        }
      } catch (mcpError) {
        console.debug(`[RSS] ⚠️ MCP category fetch error for ${category}:`, mcpError);
        // Continue to fallback RSS fetching
      }
    } else if (category === 'local') {
      console.log(`[RSS] Skipping MCP for "local" category - using country-specific RSS feeds instead`);
    }

    // Fallback: Get RSS sources for this category and fetch individually
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
        fetchRSSFeed(source.config.url, source.config.name, category, forceRealtime)
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
export async function getArticlesFromRSS(category: NewsCategory, countryCode?: string, forceRealtime?: boolean) {
  return fetchRSSFeeds(category, countryCode, forceRealtime);
}

