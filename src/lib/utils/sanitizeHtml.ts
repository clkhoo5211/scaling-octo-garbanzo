/**
 * HTML Sanitization Utility
 * Uses DOMPurify to sanitize HTML content for safe rendering
 */

import DOMPurify from "dompurify";

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

  const config: DOMPurify.Config = {
    // Allow common article content tags
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
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
    ],
    ALLOWED_ATTR: ["class", "id", "style"],
  };

  // Conditionally allow images
  if (options?.allowImages) {
    config.ALLOWED_TAGS?.push("img");
    config.ALLOWED_ATTR?.push("src", "alt", "title", "width", "height");
  }

  // Conditionally allow links
  if (options?.allowLinks) {
    config.ALLOWED_TAGS?.push("a");
    config.ALLOWED_ATTR?.push("href", "target", "rel", "title");
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
      "td"
    );
    config.ALLOWED_ATTR?.push("colspan", "rowspan");
  }

  return DOMPurify.sanitize(html, config);
}

/**
 * Sanitize HTML specifically for article content
 * Allows images, links, and tables for rich article display
 */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowImages: true,
    allowLinks: true,
    allowTables: true,
  });
}
