import type { Article } from "./indexedDBCache";
import { linkExtractor } from "./linkExtractor";

interface SourceConfig {
  name: string;
  type: "firebase" | "graphql" | "rest" | "rss";
  endpoint: string;
  category: "tech" | "crypto" | "social" | "general";
  enabled: boolean;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private retryDelays: Map<string, number> = new Map();

  async wait(source: string, limit = 10, window = 60000): Promise<void> {
    const now = Date.now();
    const requests = this.requests.get(source) || [];

    // Remove old requests (outside window)
    const recentRequests = requests.filter((time) => now - time < window);

    if (recentRequests.length >= limit) {
      const oldestRequest = recentRequests[0];
      const waitTime = window - (now - oldestRequest);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(source, recentRequests);
  }

  /**
   * Enhanced: Exponential backoff for rate limit errors
   */
  async waitWithBackoff(source: string, retryCount = 0): Promise<void> {
    const baseDelay = 1000; // 1 second
    const maxDelay = 60000; // 60 seconds
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);

    const lastRetry = this.retryDelays.get(source) || 0;
    const timeSinceLastRetry = Date.now() - lastRetry;

    if (timeSinceLastRetry < delay) {
      await new Promise((resolve) =>
        setTimeout(resolve, delay - timeSinceLastRetry)
      );
    }

    this.retryDelays.set(source, Date.now());
  }

  /**
   * Reset retry delay for a source
   */
  resetBackoff(source: string): void {
    this.retryDelays.delete(source);
  }
}

class ContentAggregator {
  private rateLimiter: RateLimiter;
  private sources: SourceConfig[];

  constructor() {
    this.rateLimiter = new RateLimiter();
    this.sources = [
      {
        name: "Hacker News",
        type: "firebase",
        endpoint: "https://hacker-news.firebaseio.com/v0",
        category: "tech",
        enabled: true,
      },
      {
        name: "Product Hunt",
        type: "graphql",
        endpoint: "https://api.producthunt.com/v2/api/graphql",
        category: "tech",
        enabled: true,
      },
      {
        name: "GitHub Trending",
        type: "rest",
        endpoint: "https://api.github.com",
        category: "tech",
        enabled: true,
      },
      {
        name: "Reddit",
        type: "rest",
        endpoint: "https://www.reddit.com",
        category: "tech",
        enabled: true,
      },
      {
        name: "Medium",
        type: "rss",
        endpoint: "https://medium.com/feed",
        category: "tech",
        enabled: true,
      },
      {
        name: "CoinDesk",
        type: "rss",
        endpoint: "https://www.coindesk.com/arc/outboundfeeds/rss/",
        category: "crypto",
        enabled: true,
      },
      {
        name: "CoinTelegraph",
        type: "rss",
        endpoint: "https://cointelegraph.com/rss",
        category: "crypto",
        enabled: true,
      },
      {
        name: "Decrypt",
        type: "rss",
        endpoint: "https://decrypt.co/feed",
        category: "crypto",
        enabled: true,
      },
      {
        name: "Bitcoin Magazine",
        type: "rss",
        endpoint: "https://bitcoinmagazine.com/.rss/full/",
        category: "crypto",
        enabled: true,
      },
      {
        name: "The Block",
        type: "rss",
        endpoint: "https://www.theblock.co/rss.xml",
        category: "crypto",
        enabled: true,
      },
      {
        name: "CoinGecko",
        type: "rest",
        endpoint: "https://api.coingecko.com/api/v3",
        category: "crypto",
        enabled: true,
      },
    ];
  }

  /**
   * Fetch from Hacker News Firebase API
   */
  private async fetchHackerNews(limit = 30): Promise<Article[]> {
    await this.rateLimiter.wait("hackernews");

    try {
      // Fetch top story IDs
      const response = await fetch(
        "https://hacker-news.firebaseio.com/v0/topstories.json"
      );
      const storyIds: number[] = await response.json();

      // Fetch story details (parallel)
      const stories = await Promise.allSettled(
        storyIds
          .slice(0, limit)
          .map((id) =>
            fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
              (r) => r.json()
            )
          )
      );

      return stories
        .filter((result) => result.status === "fulfilled")
        .map((result) => {
          const story = (result as PromiseFulfilledResult<any>).value;
          return {
            id: `hn-${story.id}`,
            title: story.title,
            url:
              story.url || `https://news.ycombinator.com/item?id=${story.id}`,
            source: "Hacker News",
            category: "tech" as const,
            upvotes: story.score || 0,
            comments: story.descendants || 0,
            publishedAt: story.time * 1000,
            author: story.by,
            urlHash: "",
            cachedAt: 0,
          };
        });
    } catch (error) {
      console.error("Error fetching Hacker News:", error);
      return [];
    }
  }

  /**
   * Fetch from Product Hunt GraphQL API
   */
  private async fetchProductHunt(limit = 20): Promise<Article[]> {
    await this.rateLimiter.wait("producthunt");

    try {
      const query = `
        query GetPosts($first: Int!) {
          posts(first: $first) {
            edges {
              node {
                id
                name
                tagline
                url
                votesCount
                commentsCount
                createdAt
                user {
                  username
                }
              }
            }
          }
        }
      `;

      const response = await fetch(
        "https://api.producthunt.com/v2/api/graphql",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PRODUCT_HUNT_TOKEN || ""}`,
          },
          body: JSON.stringify({
            query,
            variables: { first: limit },
          }),
        }
      );

      const data = await response.json();
      const posts = data.data?.posts?.edges || [];

      return posts.map((edge: any) => {
        const post = edge.node;
        return {
          id: `ph-${post.id}`,
          title: post.name,
          url: post.url,
          source: "Product Hunt",
          category: "tech" as const,
          upvotes: post.votesCount || 0,
          comments: post.commentsCount || 0,
          publishedAt: new Date(post.createdAt).getTime(),
          author: post.user?.username,
          excerpt: post.tagline,
          urlHash: "",
          cachedAt: 0,
        };
      });
    } catch (error) {
      console.error("Error fetching Product Hunt:", error);
      return [];
    }
  }

  /**
   * Fetch from GitHub Trending with pagination support
   */
  private async fetchGitHubTrending(
    language?: string,
    limit = 30,
    page = 1
  ): Promise<Article[]> {
    await this.rateLimiter.wait("github");

    try {
      const url = language
        ? `https://api.github.com/search/repositories?q=language:${language}&sort=stars&order=desc&per_page=${Math.min(limit, 100)}&page=${page}`
        : `https://api.github.com/search/repositories?q=stars:>1000&sort=stars&order=desc&per_page=${Math.min(limit, 100)}&page=${page}`;

      const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
      };

      // Add auth token if available (increases rate limit)
      const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
      if (token) {
        headers["Authorization"] = `token ${token}`;
      }

      const response = await fetch(url, { headers });

      // Handle rate limiting with exponential backoff
      if (response.status === 403) {
        const retryAfter = response.headers.get("Retry-After");
        if (retryAfter) {
          await this.rateLimiter.waitWithBackoff(
            "github",
            parseInt(retryAfter)
          );
          return this.fetchGitHubTrending(language, limit, page);
        }
        await this.rateLimiter.waitWithBackoff("github");
        return this.fetchGitHubTrending(language, limit, page);
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      const repos = data.items || [];

      const articles = repos.map((repo: any) => ({
        id: `gh-${repo.id}`,
        title: repo.name,
        url: repo.html_url,
        source: "GitHub",
        category: "tech" as const,
        upvotes: repo.stargazers_count || 0,
        comments: repo.open_issues_count || 0,
        publishedAt: new Date(repo.created_at).getTime(),
        author: repo.owner?.login,
        excerpt: repo.description,
        thumbnail: repo.owner?.avatar_url,
        urlHash: "",
        cachedAt: 0,
      }));

      // Extract links from GitHub repos (learn-anything pattern)
      const enrichedArticles = await Promise.all(
        articles.map(async (article) => {
          try {
            const links = await linkExtractor.extractFromGitHubRepo(
              article.url
            );
            return {
              ...article,
              links: links.length > 0 ? links : undefined,
            };
          } catch {
            return article;
          }
        })
      );

      return enrichedArticles;
    } catch (error) {
      console.error("Error fetching GitHub Trending:", error);
      return [];
    }
  }

  /**
   * Fetch all pages from GitHub (up to maxPages)
   */
  private async fetchGitHubTrendingAllPages(
    language?: string,
    maxPages = 3
  ): Promise<Article[]> {
    const allArticles: Article[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= maxPages) {
      const articles = await this.fetchGitHubTrending(language, 100, page);
      allArticles.push(...articles);

      // Check if more pages exist (GitHub returns max 100 per page)
      hasMore = articles.length === 100;
      page++;

      // Small delay between pages
      if (hasMore && page <= maxPages) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return allArticles;
  }

  /**
   * Fetch from Reddit with pagination support
   */
  private async fetchReddit(
    subreddit: string,
    limit = 25,
    after?: string
  ): Promise<{ articles: Article[]; nextAfter?: string }> {
    await this.rateLimiter.wait("reddit");

    try {
      let url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${Math.min(limit, 100)}`;
      if (after) {
        url += `&after=${after}`;
      }

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Web3News/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();
      const posts = data.data?.children || [];
      const nextAfter = data.data?.after;

      const articles = posts.map((child: any) => {
        const post = child.data;
        const article: Article = {
          id: `rd-${post.id}`,
          title: post.title,
          url: post.url,
          source: `Reddit r/${subreddit}`,
          category: "tech" as const,
          upvotes: post.ups || 0,
          comments: post.num_comments || 0,
          publishedAt: post.created_utc * 1000,
          author: post.author,
          excerpt: post.selftext?.substring(0, 200),
          thumbnail: post.thumbnail?.startsWith("http")
            ? post.thumbnail
            : undefined,
          urlHash: "",
          cachedAt: 0,
        };

        // Extract links from Reddit post content (learn-anything pattern)
        if (post.selftext) {
          const links = linkExtractor.extractLinks(post.selftext);
          if (links.length > 0) {
            (article as any).links = links;
          }
        }

        return article;
      });

      return { articles, nextAfter };
    } catch (error) {
      console.error("Error fetching Reddit:", error);
      return { articles: [] };
    }
  }

  /**
   * Fetch all pages from Reddit (up to maxPages)
   */
  private async fetchRedditAllPages(
    subreddit: string,
    maxPages = 3
  ): Promise<Article[]> {
    const allArticles: Article[] = [];
    let after: string | undefined;
    let page = 1;

    while (page <= maxPages) {
      const { articles, nextAfter } = await this.fetchReddit(
        subreddit,
        100,
        after
      );
      allArticles.push(...articles);

      if (!nextAfter) break;
      after = nextAfter;
      page++;

      // Small delay between pages
      if (page <= maxPages) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return allArticles;
  }

  /**
   * Fetch from RSS feed
   */
  private async fetchRSSFeed(
    url: string,
    sourceName: string
  ): Promise<Article[]> {
    await this.rateLimiter.wait("rss");

    try {
      // Use CORS proxy for RSS feeds
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const items = data.items || [];

      return items.map((item: any) => ({
        id: `rss-${item.guid || item.link}`,
        title: item.title,
        url: item.link,
        source: sourceName,
        category: "crypto" as const,
        publishedAt: new Date(item.pubDate).getTime(),
        author: item.author,
        excerpt: item.description?.substring(0, 200),
        thumbnail: item.enclosure?.link,
        urlHash: "",
        cachedAt: 0,
      }));
    } catch (error) {
      console.error(`Error fetching RSS feed ${url}:`, error);
      return [];
    }
  }

  /**
   * Get sources for a specific category
   */
  private getSourcesForCategory(
    category?: "tech" | "crypto" | "social" | "general"
  ): SourceConfig[] {
    if (!category) {
      return this.sources.filter((s) => s.enabled);
    }
    return this.sources.filter((s) => s.enabled && s.category === category);
  }

  /**
   * Fetch from a single source
   */
  private async fetchSource(
    source: SourceConfig,
    usePagination = false
  ): Promise<Article[]> {
    try {
      switch (source.name) {
        case "Hacker News":
          return await this.fetchHackerNews();
        case "Product Hunt":
          return await this.fetchProductHunt();
        case "GitHub Trending":
          // Use pagination for GitHub if enabled
          return usePagination
            ? await this.fetchGitHubTrendingAllPages()
            : await this.fetchGitHubTrending();
        case "Reddit":
          // Use pagination for Reddit if enabled
          return usePagination
            ? await this.fetchRedditAllPages("technology")
            : (await this.fetchReddit("technology")).articles;
        case "Medium":
          return await this.fetchRSSFeed(source.endpoint, "Medium");
        case "CoinDesk":
          return await this.fetchRSSFeed(source.endpoint, "CoinDesk");
        case "CoinTelegraph":
          return await this.fetchRSSFeed(source.endpoint, "CoinTelegraph");
        case "Decrypt":
          return await this.fetchRSSFeed(source.endpoint, "Decrypt");
        case "Bitcoin Magazine":
          return await this.fetchRSSFeed(source.endpoint, "Bitcoin Magazine");
        case "The Block":
          return await this.fetchRSSFeed(source.endpoint, "The Block");
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error fetching ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Transform and deduplicate articles with link extraction
   */
  private transformAndDeduplicate(
    results: PromiseSettledResult<Article[]>[]
  ): Article[] {
    const allArticles: Article[] = [];
    const seenUrls = new Set<string>();

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        result.value.forEach((article) => {
          const normalizedUrl = linkExtractor.normalizeUrl(article.url);
          if (!seenUrls.has(normalizedUrl)) {
            seenUrls.add(normalizedUrl);

            // Extract links from article content if not already extracted
            if (!(article as any).links) {
              const links = linkExtractor.extractFromArticle(article);
              if (links.length > 0) {
                (article as any).links = links;
              }
            }

            allArticles.push(article);
          }
        });
      }
    });

    return allArticles.sort((a, b) => b.publishedAt - a.publishedAt);
  }

  /**
   * Aggregate articles from all sources with optional pagination and link extraction
   */
  async aggregateSources(
    category?: "tech" | "crypto" | "social" | "general",
    options?: { usePagination?: boolean; extractLinks?: boolean }
  ): Promise<Article[]> {
    const sources = this.getSourcesForCategory(category);
    const usePagination = options?.usePagination ?? false;
    const extractLinks = options?.extractLinks ?? true;

    // Fetch from all sources in parallel
    const results = await Promise.allSettled(
      sources.map((source) => this.fetchSource(source, usePagination))
    );

    // Transform and deduplicate (with link extraction if enabled)
    let articles = this.transformAndDeduplicate(results);

    // Additional link extraction pass if enabled
    if (extractLinks) {
      articles = await Promise.all(
        articles.map(async (article) => {
          // Only extract if not already done
          if (!(article as any).links) {
            const links = linkExtractor.extractFromArticle(article);
            return {
              ...article,
              links: links.length > 0 ? links : undefined,
            };
          }
          return article;
        })
      );
    }

    return articles;
  }
}

// Export singleton instance
export const contentAggregator = new ContentAggregator();
