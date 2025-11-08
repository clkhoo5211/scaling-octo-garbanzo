/**
 * Client-Side Article Content Fetching Service
 * Fetches article content client-side (may require CORS proxy for some sites)
 * Uses Readability to extract clean content from HTML
 */

interface ArticleContentResult {
  success: boolean;
  title?: string | null;
  content?: string;
  textContent?: string;
  excerpt?: string | null;
  byline?: string;
  length?: number;
  siteName?: string;
  error?: string;
}

/**
 * Estimate reading time based on word count
 */
export function estimateReadingTime(
  textContent: string,
  wordsPerMinute = 200
): number {
  const words = textContent.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Parse HTML content using Readability-like extraction
 */
async function fetchAndParseArticle(url: string) {
  try {
    // Fetch article HTML directly
    // Note: Some sites may block CORS - in production, you'd use a proxy
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(20000), // 20 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Basic HTML parsing to extract article content
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() || 'Untitled';

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const excerpt = descMatch?.[1] || '';

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
 * Fetch article content by URL
 */
export async function fetchArticleContent(url: string): Promise<ArticleContentResult> {
  try {
    if (!url) {
      throw new Error('URL parameter is required');
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    // Fetch and parse article content
    const articleContent = await fetchAndParseArticle(url);

    return {
      success: true,
      ...articleContent,
    };
  } catch (error: any) {
    console.error('Error in article content service:', error);
    
    return {
      success: false,
      error: error?.message || 'Failed to fetch article content',
      title: error?.title || null,
      excerpt: error?.excerpt || null,
    };
  }
}

