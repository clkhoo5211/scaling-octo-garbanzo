/**
 * Article Content Service
 * Fetches and parses article content using @mozilla/readability
 * Improved with timeout, retry logic, faster CORS proxy, and client-side caching
 */

import { Readability } from "@mozilla/readability";

export interface ParsedArticle {
  title: string;
  content: string; // Clean HTML content
  textContent: string; // Plain text version
  excerpt: string;
  byline?: string;
  length: number;
  siteName?: string;
}

/**
 * Client-side cache for article content (IndexedDB or Memory)
 */
const contentCache = new Map<string, { content: ParsedArticle; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

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
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  timeout: number = 8000 // Reduced timeout from 10s to 8s for faster failure
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
 * Fetch article content and parse with Readability
 * Note: This is a client-side only function due to CORS restrictions
 * Improved with timeout, retry logic, multiple proxy fallbacks, and caching
 */
export async function fetchArticleContent(
  url: string,
  retries: number = 1 // Reduced retries for faster failure
): Promise<ParsedArticle | null> {
  if (typeof window === "undefined") {
    // Server-side: return null (will be fetched on client)
    return null;
  }

  // Check cache first
  const cached = contentCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Using cached content for: ${url.substring(0, 50)}...`);
    return cached.content;
  }

  // Try each CORS proxy in order
  for (const proxyBase of CORS_PROXIES) {
    try {
      const proxyUrl = `${proxyBase}${encodeURIComponent(url)}`;
      console.log(`Fetching article content via proxy: ${proxyBase.substring(0, 30)}...`);

      // Fetch with 10-second timeout
      const response = await fetchWithTimeout(proxyUrl, 10000);

      if (!response.ok) {
        throw new Error(`Failed to fetch article: ${response.statusText}`);
      }

      const data = await response.json();
      // Handle different proxy response formats
      const html = data.contents || data.content || (typeof data === "string" ? data : null);

      if (!html || typeof html !== "string") {
        throw new Error("Invalid HTML content received");
      }

      // Parse HTML with DOMParser (client-side only)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Use Readability to extract clean content
      const reader = new Readability(doc);
      const article = reader.parse();

      if (!article) {
        console.warn("Readability failed to parse article content");
        // Fallback: return basic HTML structure
        const fallbackContent = {
          title: doc.title || "Untitled",
          content: `<div>${html.substring(0, 5000)}</div>`, // Truncate if too long
          textContent: doc.body?.textContent || "",
          excerpt: doc.querySelector("meta[name='description']")?.getAttribute("content") || "",
          length: doc.body?.textContent?.length || 0,
        };
        // Cache fallback content
        contentCache.set(url, { content: fallbackContent, timestamp: Date.now() });
        return fallbackContent;
      }

      console.log(`Successfully parsed article: ${article.title.substring(0, 50)}...`);

      const parsedContent = {
        title: article.title,
        content: article.content, // This is HTML string from Readability
        textContent: article.textContent,
        excerpt: article.excerpt || "",
        byline: article.byline || undefined,
        length: article.length,
        siteName: article.siteName || undefined,
      };

      // Cache successful fetch
      contentCache.set(url, { content: parsedContent, timestamp: Date.now() });

      return parsedContent;
    } catch (error) {
      console.warn(`Proxy ${proxyBase.substring(0, 30)} failed:`, error);
      // Try next proxy
      continue;
    }
  }

  // All proxies failed - return cached content even if expired
  if (cached) {
    console.warn("All proxies failed, using expired cache");
    return cached.content;
  }

  console.error("All CORS proxies failed for:", url);
  return null;
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
