import type { Article } from "./indexedDBCache";

/**
 * Link Extractor - Extracts and normalizes links from content
 * Pattern adapted from learn-anything knowledge graph approach
 */
export class LinkExtractor {
  /**
   * Extract all links from content (markdown, HTML, plain text)
   */
  extractLinks(content: string): string[] {
    const links: string[] = [];

    if (!content) return links;

    // 1. Extract markdown links: [text](url)
    const markdownLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
    markdownLinks.forEach((match) => {
      const url = match.match(/\(([^)]+)\)/)?.[1];
      if (url && this.isValidUrl(url)) {
        links.push(url);
      }
    });

    // 2. Extract plain URLs: https://example.com
    const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
    const plainUrls = content.match(urlRegex) || [];
    links.push(...plainUrls);

    // 3. Extract HTML links: <a href="url">
    const htmlLinks = content.match(/href=["']([^"']+)["']/g) || [];
    htmlLinks.forEach((match) => {
      const url = match.match(/["']([^"']+)["']/)?.[1];
      if (url && url.startsWith("http") && this.isValidUrl(url)) {
        links.push(url);
      }
    });

    // 4. Normalize and deduplicate
    return this.normalizeAndDeduplicate(links);
  }

  /**
   * Normalize URLs (remove tracking params, normalize protocol, etc.)
   */
  normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);

      // Remove tracking parameters
      const trackingParams = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "ref",
        "fbclid",
        "gclid",
        "source",
        "medium",
        "campaign",
        "term",
        "content",
      ];
      trackingParams.forEach((param) => parsed.searchParams.delete(param));

      // Normalize protocol (always HTTPS)
      parsed.protocol = "https:";

      // Normalize www subdomain
      if (parsed.hostname.startsWith("www.")) {
        parsed.hostname = parsed.hostname.substring(4);
      }

      // Remove trailing slash (except root)
      if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
        parsed.pathname = parsed.pathname.slice(0, -1);
      }

      // Remove fragment (hash)
      parsed.hash = "";

      return parsed.toString();
    } catch {
      return url;
    }
  }

  /**
   * Normalize and deduplicate links
   */
  normalizeAndDeduplicate(links: string[]): string[] {
    const normalized = links
      .map((link) => this.normalizeUrl(link))
      .filter((link) => this.isValidUrl(link));
    return Array.from(new Set(normalized));
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  /**
   * Extract links from GitHub README
   */
  async extractFromGitHubRepo(repoUrl: string): Promise<string[]> {
    try {
      // Convert GitHub repo URL to raw README URL
      const readmeUrl =
        repoUrl
          .replace("github.com/", "raw.githubusercontent.com/")
          .replace(/\/$/, "") + "/main/README.md";

      const response = await fetch(readmeUrl, {
        headers: {
          Accept: "text/plain",
        },
      });

      if (!response.ok) {
        // Try alternative branch names
        const branches = ["master", "develop", "dev"];
        for (const branch of branches) {
          const altUrl =
            repoUrl
              .replace("github.com/", "raw.githubusercontent.com/")
              .replace(/\/$/, "") + `/${branch}/README.md`;
          try {
            const altResponse = await fetch(altUrl);
            if (altResponse.ok) {
              const content = await altResponse.text();
              return this.extractLinks(content);
            }
          } catch {
            continue;
          }
        }
        return [];
      }

      const content = await response.text();
      return this.extractLinks(content);
    } catch (error) {
      console.error(
        `Failed to extract links from GitHub repo ${repoUrl}:`,
        error
      );
      return [];
    }
  }

  /**
   * Extract links from Reddit post content
   */
  async extractFromRedditPost(postId: string): Promise<string[]> {
    try {
      const response = await fetch(
        `https://www.reddit.com/r/all/comments/${postId}.json`,
        {
          headers: {
            "User-Agent": "Web3News/1.0",
          },
        }
      );

      if (!response.ok) return [];

      const data = await response.json();
      const links: string[] = [];

      if (data[0]?.data?.children) {
        data[0].data.children.forEach((child: any) => {
          const post = child.data;
          if (post.selftext) {
            links.push(...this.extractLinks(post.selftext));
          }
          if (post.url && post.url.startsWith("http")) {
            links.push(post.url);
          }
        });
      }

      return this.normalizeAndDeduplicate(links);
    } catch (error) {
      console.error(
        `Failed to extract links from Reddit post ${postId}:`,
        error
      );
      return [];
    }
  }

  /**
   * Extract links from article content
   */
  extractFromArticle(article: Article): string[] {
    const contentParts: string[] = [];

    // Collect all text content
    if (article.title) contentParts.push(article.title);
    if (article.excerpt) contentParts.push(article.excerpt);
    if (article.summary) contentParts.push(article.summary);
    if (article.content) {
      // Remove HTML tags if present
      const textContent = article.content.replace(/<[^>]*>/g, " ");
      contentParts.push(textContent);
    }

    const allContent = contentParts.join(" ");
    return this.extractLinks(allContent);
  }
}

// Export singleton instance
export const linkExtractor = new LinkExtractor();
