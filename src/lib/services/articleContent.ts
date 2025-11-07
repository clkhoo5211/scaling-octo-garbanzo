/**
 * Article Content Service
 * Fetches and parses article content using @mozilla/readability
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
 * Fetch article content and parse with Readability
 * Note: This is a client-side only function due to CORS restrictions
 */
export async function fetchArticleContent(
  url: string
): Promise<ParsedArticle | null> {
  if (typeof window === "undefined") {
    // Server-side: return null (will be fetched on client)
    return null;
  }

  try {
    // Use CORS proxy for cross-origin requests
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }

    const data = await response.json();
    const html = data.contents;

    // Parse HTML with DOMParser (client-side only)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Use Readability to extract clean content
    const reader = new Readability(doc);
    const article = reader.parse();

    if (!article) {
      return null;
    }

    return {
      title: article.title,
      content: article.content,
      textContent: article.textContent,
      excerpt: article.excerpt || "",
      byline: article.byline || undefined,
      length: article.length,
      siteName: article.siteName || undefined,
    };
  } catch (error) {
    console.error("Error fetching article content:", error);
    return null;
  }
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
