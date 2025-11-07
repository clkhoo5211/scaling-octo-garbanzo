/**
 * Server-Side RSS Fetching API Route
 * Fetches RSS feeds server-side to bypass CORS and rate limits
 * Uses direct RSS feed URLs (no proxy needed server-side)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRSSSourcesByCategory } from '@/lib/sources/rssRegistry';
import type { NewsCategory } from '@/lib/sources/types';

/**
 * Parse RSS XML to extract articles
 */
function parseRSSXML(xmlText: string, sourceName: string, category: NewsCategory) {
  const articles: Array<{
    id: string;
    title: string;
    url: string;
    source: string;
    category: NewsCategory;
    publishedAt: number;
    author?: string;
    excerpt?: string;
    thumbnail?: string;
  }> = [];

  try {
    // Match all <item> tags
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
          : Date.now() - (index * 60000); // Fallback: spread over time

        articles.push({
          id: `rss-server-${sourceName.toLowerCase().replace(/\s+/g, '-')}-${publishedAt}-${index}`,
          title,
          url: link,
          source: sourceName,
          category,
          publishedAt,
          author: authorMatch?.[1]?.trim(),
          excerpt: descMatch?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').replace(/<[^>]*>/g, "").trim().substring(0, 200),
          thumbnail: thumbnailMatch?.[1],
        });
      }
    }
  } catch (error) {
    console.error(`Error parsing RSS XML for ${sourceName}:`, error);
  }

  return articles;
}

/**
 * Fetch RSS feed server-side (no CORS restrictions)
 */
async function fetchRSSFeed(url: string, sourceName: string, category: NewsCategory) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Web3News/1.0 (Server-Side RSS Fetcher)',
      },
      cache: 'no-store',
      // Add timeout
      signal: AbortSignal.timeout(15000), // 15 second timeout
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
    console.error(`Error fetching RSS feed ${url}:`, error);
    return {
      success: false,
      articles: [],
      source: sourceName,
      error: error?.message || 'Unknown error',
    };
  }
}

/**
 * GET /api/rss?category=tech
 * Fetches RSS feeds server-side for a specific category
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as NewsCategory;

    if (!category) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      );
    }

    // Get RSS sources for this category
    const sources = getRSSSourcesByCategory(category);

    if (sources.length === 0) {
      return NextResponse.json({
        articles: [],
        category,
        sources: [],
        message: `No RSS sources found for category: ${category}`,
      });
    }

    // Fetch all RSS feeds in parallel (server-side, no CORS issues)
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

    return NextResponse.json({
      articles: limitedArticles,
      category,
      totalSources: sources.length,
      successfulSources,
      totalArticles: limitedArticles.length,
    });
  } catch (error: any) {
    console.error('Error in RSS API route:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

