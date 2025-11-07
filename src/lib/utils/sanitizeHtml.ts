/**
 * HTML Sanitization Utility
 * Uses DOMPurify to sanitize HTML content for safe rendering
 * Improved to preserve more HTML structure for better article display
 */

import DOMPurify from "dompurify";
import type { Config } from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - Raw HTML string to sanitize
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export function sanitizeHtml(
  html: string,
  options?: {
    allowImages?: boolean;
    allowLinks?: boolean;
    allowTables?: boolean;
  }
): string {
  if (typeof window === "undefined") {
    // Server-side: return empty string (will be sanitized on client)
    return "";
  }

  const config: Config = {
    // Allow common article content tags
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "b",
      "i",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "span",
      "div",
      "article",
      "section",
      "header",
      "footer",
      "main",
      "hr",
    ],
    ALLOWED_ATTR: ["class", "id", "style", "data-*"],
    // Preserve more structure
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  };

  // Conditionally allow images
  if (options?.allowImages) {
    config.ALLOWED_TAGS?.push("img", "figure", "figcaption");
    config.ALLOWED_ATTR?.push("src", "alt", "title", "width", "height", "loading", "srcset");
  }

  // Conditionally allow links
  if (options?.allowLinks) {
    config.ALLOWED_TAGS?.push("a");
    config.ALLOWED_ATTR?.push("href", "target", "rel", "title", "data-*");
  }

  // Conditionally allow tables
  if (options?.allowTables) {
    config.ALLOWED_TAGS?.push(
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
      "caption"
    );
    config.ALLOWED_ATTR?.push("colspan", "rowspan", "scope");
  }

  return DOMPurify.sanitize(html, config);
}

/**
 * Sanitize HTML specifically for article content
 * Allows images, links, and tables for rich article display
 * Preserves more HTML structure for better formatting
 */
export function sanitizeArticleHtml(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  // Ensure we have valid HTML structure
  let cleanedHtml = html.trim();
  
  // If content doesn't start with HTML tag, wrap it
  if (!cleanedHtml.startsWith("<")) {
    cleanedHtml = `<div>${cleanedHtml}</div>`;
  }

  return sanitizeHtml(cleanedHtml, {
    allowImages: true,
    allowLinks: true,
    allowTables: true,
  });
}
