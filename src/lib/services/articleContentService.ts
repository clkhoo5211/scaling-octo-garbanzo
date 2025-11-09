/**
 * Client-Side Article Content Fetching Service
 * Uses CORS proxies to fetch article content (avoids CORS errors)
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
 * CORS Proxy Options (in order of preference)
 * Try multiple proxies for better reliability
 */
const CORS_PROXIES = [
  "https://api.allorigins.win/get?url=",
  "https://corsproxy.io/?",
  "https://api.codetabs.com/v1/proxy?quest=",
];

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
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  timeout: number = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Web3News/1.0)",
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Parse HTML content using Readability-like extraction
 * Uses CORS proxies to avoid CORS errors
 */
async function fetchAndParseArticle(url: string) {
  // Try each CORS proxy in order
  for (const proxyBase of CORS_PROXIES) {
    try {
      const proxyUrl = `${proxyBase}${encodeURIComponent(url)}`;
      console.log(`[ArticleContent] Fetching via proxy: ${proxyBase.substring(0, 30)}...`);

      // Fetch with timeout
      const response = await fetchWithTimeout(proxyUrl, 8000);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // Handle different proxy response formats
      const html = data.contents || data.content || (typeof data === "string" ? data : null);

      if (!html || typeof html !== "string") {
        throw new Error("Invalid HTML content received from proxy");
      }

      // Parse HTML with DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Extract title
      const title = doc.querySelector("title")?.textContent?.trim() || 
                    doc.querySelector("h1")?.textContent?.trim() ||
                    "Untitled";

      // Extract description/excerpt
      const excerpt = doc.querySelector("meta[name='description']")?.getAttribute("content") ||
                      doc.querySelector("meta[property='og:description']")?.getAttribute("content") ||
                      "";

      // Extract author
      const byline = doc.querySelector("meta[name='author']")?.getAttribute("content") ||
                     doc.querySelector("meta[property='article:author']")?.getAttribute("content") ||
                     "";

      // Try to find article content
      const articleElement = doc.querySelector("article") ||
                            doc.querySelector("main") ||
                            doc.querySelector("[class*='article']") ||
                            doc.querySelector("[class*='content']") ||
                            doc.body;

      if (!articleElement) {
        throw new Error("Could not find article content");
      }

      // Remove scripts, styles, and other non-content elements
      const scripts = articleElement.querySelectorAll("script, style, nav, header, footer, aside, .ad, .advertisement, [class*='ad-']");
      scripts.forEach(el => el.remove());

      // Get clean HTML content
      let content = articleElement.innerHTML;

      // Remove remaining scripts and styles
      content = content
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<aside[\s\S]*?<\/aside>/gi, '');

      // Get text content for length calculation
      const textContent = articleElement.textContent || "";

      console.log(`[ArticleContent] Successfully parsed article: ${title.substring(0, 50)}...`);

      return {
        title,
        content,
        textContent: textContent.trim(),
        excerpt,
        byline,
        length: textContent.trim().length,
        siteName: new URL(url).hostname.replace('www.', ''),
      };
    } catch (error: any) {
      console.warn(`[ArticleContent] Proxy ${proxyBase.substring(0, 30)} failed:`, error?.message || error);
      // Try next proxy
      continue;
    }
  }

  // All proxies failed
  throw new Error("All CORS proxies failed to fetch article content");
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

    // Fetch and parse article content via CORS proxy
    const articleContent = await fetchAndParseArticle(url);

    return {
      success: true,
      ...articleContent,
    };
  } catch (error: any) {
    console.error('[ArticleContent] Error fetching article content:', error);
    
    return {
      success: false,
      error: error?.message || 'Failed to fetch article content',
      title: null,
      excerpt: null,
    };
  }
}

