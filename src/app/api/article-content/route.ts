/**
 * Server-Side Article Content Fetching API Route
 * Fetches article content server-side to bypass CORS restrictions
 * Uses Readability to extract clean content from HTML
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Parse HTML content using Readability-like extraction
 * Server-side implementation that doesn't require CORS proxies
 */
async function fetchAndParseArticle(url: string) {
  try {
    // Fetch article HTML directly (server-side, no CORS restrictions)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      cache: 'no-store',
      // Add timeout
      signal: AbortSignal.timeout(20000), // 20 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Basic HTML parsing to extract article content
    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() || 'Untitled';

    // Extract meta description for excerpt
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const excerpt = descMatch?.[1] || '';

    // Extract main content - try to find article content
    // Look for common article containers
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                       html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                       html.match(/<div[^>]*class=["'][^"']*article[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
                       html.match(/<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);

    let content = articleMatch?.[1] || html;

    // Remove scripts, styles, and other non-content elements
    content = content
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[\s\S]*?<\/aside>/gi, '');

    // Extract author
    const authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]*property=["']article:author["'][^>]*content=["']([^"']+)["']/i);
    const author = authorMatch?.[1] || '';

    return {
      title,
      content,
      textContent: content.replace(/<[^>]*>/g, '').trim(),
      excerpt,
      byline: author,
      length: content.replace(/<[^>]*>/g, '').trim().length,
      siteName: new URL(url).hostname.replace('www.', ''),
    };
  } catch (error: any) {
    console.error(`Error fetching article content for ${url}:`, error);
    throw error;
  }
}

/**
 * GET /api/article-content?url=https://example.com/article
 * Fetches and parses article content server-side
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch and parse article content
    const articleContent = await fetchAndParseArticle(url);

    return NextResponse.json({
      success: true,
      ...articleContent,
    });
  } catch (error: any) {
    console.error('Error in article content API route:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || 'Failed to fetch article content',
        // Include partial data if available
        title: error?.title || null,
        excerpt: error?.excerpt || null,
      },
      { status: 500 }
    );
  }
}

