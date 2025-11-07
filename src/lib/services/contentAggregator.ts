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
      // Social Category Sources
      {
        name: "Reddit Social",
        type: "rest",
        endpoint: "https://www.reddit.com",
        category: "social",
        enabled: true,
      },
      {
        name: "Mastodon",
        type: "rss",
        endpoint: "https://mastodon.social/api/v1/timelines/public",
        category: "social",
        enabled: false, // Disabled by default - requires API key
      },
      // General Category Sources
      {
        name: "BBC News",
        type: "rss",
        endpoint: "https://feeds.bbci.co.uk/news/rss.xml",
        category: "general",
        enabled: true,
      },
      {
        name: "Reuters",
        type: "rss",
        endpoint: "https://www.reuters.com/tools/rss",
        category: "general",
        enabled: true,
      },
      {
        name: "The Guardian",
        type: "rss",
        endpoint: "https://www.theguardian.com/world/rss",
        category: "general",
        enabled: true,
      },
      {
        name: "TechCrunch",
        type: "rss",
        endpoint: "https://techcrunch.com/feed/",
        category: "general",
        enabled: true,
      },
      {
        name: "The Verge",
        type: "rss",
        endpoint: "https://www.theverge.com/rss/index.xml",
        category: "general",
        enabled: true,
      },
      {
        name: "Ars Technica",
        type: "rss",
        endpoint: "https://feeds.arstechnica.com/arstechnica/index",
        category: "general",
        enabled: true,
      },
      // Additional Tech Sources
      {
        name: "HackerNoon",
        type: "rss",
        endpoint: "https://hackernoon.com/feed",
        category: "tech",
        enabled: true,
      },
      {
        name: "Wired",
        type: "rss",
        endpoint: "https://www.wired.com/feed/rss",
        category: "tech",
        enabled: true,
      },
      {
        name: "MIT Technology Review",
        type: "rss",
        endpoint: "https://www.technologyreview.com/feed/",
        category: "tech",
        enabled: true,
      },
      {
        name: "The Next Web",
        type: "rss",
        endpoint: "https://thenextweb.com/feed",
        category: "tech",
        enabled: true,
      },
      // Additional Crypto Sources
      {
        name: "CryptoCompare",
        type: "rest",
        endpoint: "https://min-api.cryptocompare.com",
        category: "crypto",
        enabled: true,
      },
      {
        name: "CoinMarketCap",
        type: "rss",
        endpoint: "https://coinmarketcap.com/headlines/news/",
        category: "crypto",
        enabled: true,
      },
      {
        name: "CryptoSlate",
        type: "rss",
        endpoint: "https://cryptoslate.com/feed/",
        category: "crypto",
        enabled: true,
      },
      // Additional Social Sources
      {
        name: "Reddit Popular",
        type: "rest",
        endpoint: "https://www.reddit.com",
        category: "social",
        enabled: true,
      },
      {
        name: "Reddit All",
        type: "rest",
        endpoint: "https://www.reddit.com",
        category: "social",
        enabled: true,
      },
      {
        name: "Reddit Videos",
        type: "rest",
        endpoint: "https://www.reddit.com",
        category: "social",
        enabled: true,
      },
      {
        name: "Reddit Pics",
        type: "rest",
        endpoint: "https://www.reddit.com",
        category: "social",
        enabled: true,
      },
      {
        name: "Reddit Crypto",
        type: "rest",
        endpoint: "https://www.reddit.com",
        category: "crypto", // FIXED: Should be crypto, not social
        enabled: true,
      },
      {
        name: "YouTube Viral",
        type: "rss",
        endpoint: "https://www.youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ", // YouTube Trending
        category: "social",
        enabled: true,
      },
      {
        name: "YouTube Music",
        type: "rss",
        endpoint: "https://www.youtube.com/feeds/videos.xml?channel_id=UC-9-kyTW8ZkZNDHQJ6FgpwQ", // YouTube Music
        category: "social",
        enabled: true,
      },
      {
        name: "YouTube Gaming",
        type: "rss",
        endpoint: "https://www.youtube.com/feeds/videos.xml?channel_id=UCOpNcN46UbXVtpKMrmU4Abg", // YouTube Gaming
        category: "social",
        enabled: true,
      },
      // Additional General Sources
      {
        name: "CNN",
        type: "rss",
        endpoint: "http://rss.cnn.com/rss/cnn_topstories.rss",
        category: "general",
        enabled: true,
      },
      {
        name: "Associated Press",
        type: "rss",
        endpoint: "https://apnews.com/apf-topnews",
        category: "general",
        enabled: true,
      },
      {
        name: "The New York Times",
        type: "rss",
        endpoint: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
        category: "general",
        enabled: true,
      },
      {
        name: "Wired General",
        type: "rss",
        endpoint: "https://www.wired.com/feed/rss",
        category: "general",
        enabled: false, // Already added to tech
      },
      // YouTube Sources (RSS feeds)
      {
        name: "YouTube Tech",
        type: "rss",
        endpoint: "https://www.youtube.com/feeds/videos.xml?channel_id=UCsXVk37bltHxD1rDPwtNM8Q", // VergeTech
        category: "tech",
        enabled: true,
      },
      {
        name: "YouTube Crypto",
        type: "rss",
        endpoint: "https://www.youtube.com/feeds/videos.xml?channel_id=UCqNCLd2r19wpWWQE6yDLOeQ", // Coin Bureau
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
        articles.map(async (article: Article) => {
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
    after?: string,
    category: "tech" | "crypto" | "social" | "general" = "tech"
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
        console.error(`Reddit API error for r/${subreddit}: ${response.status} ${response.statusText}`);
        return { articles: [] };
      }

      const data = await response.json();
      
      // Check if Reddit returned an error
      if (data.error) {
        console.error(`Reddit API error for r/${subreddit}:`, data.error);
        return { articles: [] };
      }

      const posts = data.data?.children || [];
      const nextAfter = data.data?.after;

      if (posts.length === 0) {
        console.warn(`Reddit r/${subreddit} returned no posts`);
        return { articles: [], nextAfter };
      }

      const articles = posts.map((child: any) => {
        const post = child.data;
        const article: Article = {
          id: `rd-${post.id}`,
          title: post.title,
          url: post.url.startsWith("http") ? post.url : `https://reddit.com${post.permalink || post.url}`,
          source: `Reddit r/${subreddit}`,
          category: category,
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

      console.log(`✓ Reddit r/${subreddit}: ${articles.length} articles`);
      return { articles, nextAfter };
    } catch (error) {
      console.error(`Error fetching Reddit r/${subreddit}:`, error);
      return { articles: [] };
    }
  }

  /**
   * Fetch all pages from Reddit (up to maxPages)
   */
  private async fetchRedditAllPages(
    subreddit: string,
    maxPages = 3,
    category: "tech" | "crypto" | "social" | "general" = "tech"
  ): Promise<Article[]> {
    const allArticles: Article[] = [];
    let after: string | undefined;
    let page = 1;

    while (page <= maxPages) {
      const { articles, nextAfter } = await this.fetchReddit(
        subreddit,
        100,
        after,
        category
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
   * Fetch from CryptoCompare API
   */
  private async fetchCryptoCompare(limit = 20): Promise<Article[]> {
    await this.rateLimiter.wait("cryptocompare");

    try {
      // CryptoCompare News API (free tier)
      const response = await fetch(
        `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&limit=${limit}`,
        {
          headers: {
            Authorization: `Apikey ${process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY || ""}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CryptoCompare API error: ${response.status}`);
      }

      const data = await response.json();
      const newsItems = data.Data || [];

      return newsItems.map((item: any) => ({
        id: `cc-${item.id}`,
        title: item.title,
        url: item.url,
        source: item.source || "CryptoCompare",
        category: "crypto" as const,
        publishedAt: item.published_on * 1000,
        author: item.source_info?.name,
        excerpt: item.body?.substring(0, 200),
        thumbnail: item.imageurl,
        urlHash: "",
        cachedAt: 0,
      }));
    } catch (error) {
      console.error("Error fetching CryptoCompare:", error);
      return [];
    }
  }

  /**
   * Parse RSS XML directly (fallback when proxy fails)
   */
  private parseRSSXML(xmlText: string): Array<{
    title?: string;
    link?: string;
    description?: string;
    pubDate?: string;
    author?: string;
    thumbnail?: string;
  }> {
    const items: Array<{
      title?: string;
      link?: string;
      description?: string;
      pubDate?: string;
      author?: string;
      thumbnail?: string;
    }> = [];

    try {
      // Match all <item> tags
      const itemMatches = xmlText.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi);

      for (const match of itemMatches) {
        const itemXml = match[1];
        const titleMatch = itemXml.match(/<title[^>]*>(.*?)<\/title>/is);
        const linkMatch = itemXml.match(/<link[^>]*>(.*?)<\/link>/is);
        const descMatch = itemXml.match(/<description[^>]*>(.*?)<\/description>/is);
        const dateMatch = itemXml.match(/<pubDate[^>]*>(.*?)<\/pubDate>/is);
        const authorMatch = itemXml.match(/<(?:author|dc:creator)[^>]*>(.*?)<\/(?:author|dc:creator)>/is);
        const thumbnailMatch = itemXml.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i) ||
                                itemXml.match(/<enclosure[^>]*url=["']([^"']+)["']/i);

        const title = titleMatch?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() || titleMatch?.[1]?.trim();
        const link = linkMatch?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() || linkMatch?.[1]?.trim();

        if (title && link) {
          items.push({
            title,
            link,
            description: descMatch?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() || descMatch?.[1]?.trim(),
            pubDate: dateMatch?.[1]?.trim(),
            author: authorMatch?.[1]?.trim(),
            thumbnail: thumbnailMatch?.[1],
          });
        }
      }
    } catch (error) {
      console.error("Error parsing RSS XML:", error);
    }

    return items;
  }

  /**
   * Fetch from RSS feed with fallback parsing
   */
  private async fetchRSSFeed(
    url: string,
    sourceName: string,
    category: "tech" | "crypto" | "social" | "general" = "general"
  ): Promise<Article[]> {
    await this.rateLimiter.wait("rss");

    // Try proxy first
    try {
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Web3News/1.0',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Check if RSS2JSON returned an error
        if (data.status === "error") {
          throw new Error(`RSS2JSON error: ${data.message || 'Unknown error'}`);
        }

        const items = data.items || [];
        
        if (items.length > 0) {
          return items.map((item: any) => ({
            id: `rss-${item.guid || item.link || `${sourceName}-${Date.now()}-${Math.random()}`}`,
            title: item.title || "Untitled",
            url: item.link || url,
            source: sourceName,
            category: category,
            publishedAt: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
            author: item.author,
            excerpt: item.description?.replace(/<[^>]*>/g, "").substring(0, 200),
            thumbnail: item.enclosure?.link || item.thumbnail,
            urlHash: "",
            cachedAt: 0,
          }));
        }
      }
    } catch (proxyError) {
      console.warn(`RSS proxy failed for ${sourceName}, trying direct parsing...`, proxyError);
    }

    // Fallback: Direct RSS parsing
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Web3News/1.0',
        },
      });

      if (!response.ok) {
        console.warn(`RSS feed ${sourceName} returned status ${response.status}`);
        return [];
      }

      const xmlText = await response.text();
      const items = this.parseRSSXML(xmlText);

      if (items.length === 0) {
        console.warn(`RSS feed ${sourceName} returned no items after parsing`);
        return [];
      }

      return items.map((item) => ({
        id: `rss-${item.link || `${sourceName}-${Date.now()}-${Math.random()}`}`,
        title: item.title || "Untitled",
        url: item.link || url,
        source: sourceName,
        category: category,
        publishedAt: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
        author: item.author,
        excerpt: item.description?.replace(/<[^>]*>/g, "").substring(0, 200),
        thumbnail: item.thumbnail,
        urlHash: "",
        cachedAt: 0,
      }));
    } catch (error) {
      console.error(`Error fetching RSS feed ${sourceName} (${url}):`, error);
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
            ? await this.fetchRedditAllPages("technology", 3, source.category)
            : (await this.fetchReddit("technology", 25, undefined, source.category)).articles;
        case "Reddit Social":
          // Fetch from social subreddits
          const socialSubreddits = ["funny", "gaming", "movies", "music", "videos", "pics", "memes", "aww"];
          const socialArticles = await Promise.allSettled(
            socialSubreddits.map((sub) =>
              usePagination
                ? this.fetchRedditAllPages(sub, 2, source.category)
                : this.fetchReddit(sub, 25, undefined, source.category).then((r) => r.articles)
            )
          );
          const successfulSocial = socialArticles
            .filter((r) => r.status === "fulfilled")
            .flatMap((r) => (r as PromiseFulfilledResult<Article[]>).value);
          const failedSocial = socialArticles.filter((r) => r.status === "rejected");
          if (failedSocial.length > 0) {
            console.warn(`Reddit Social: ${failedSocial.length} subreddits failed`);
          }
          console.log(`Reddit Social: Fetched ${successfulSocial.length} articles from ${socialSubreddits.length} subreddits`);
          return successfulSocial;
        case "Reddit Popular":
          // Fetch from r/popular (aggregated popular content)
          return usePagination
            ? await this.fetchRedditAllPages("popular", 3, source.category)
            : (await this.fetchReddit("popular", 50, undefined, source.category)).articles;
        case "Reddit All":
          // Fetch from r/all (all subreddits)
          return usePagination
            ? await this.fetchRedditAllPages("all", 3, source.category)
            : (await this.fetchReddit("all", 50, undefined, source.category)).articles;
        case "Reddit Videos":
          // Fetch from r/videos
          return usePagination
            ? await this.fetchRedditAllPages("videos", 2, source.category)
            : (await this.fetchReddit("videos", 25, undefined, source.category)).articles;
        case "Reddit Pics":
          // Fetch from r/pics
          return usePagination
            ? await this.fetchRedditAllPages("pics", 2, source.category)
            : (await this.fetchReddit("pics", 25, undefined, source.category)).articles;
        case "Medium":
          return await this.fetchRSSFeed(source.endpoint, "Medium", source.category);
        case "CoinDesk":
          return await this.fetchRSSFeed(source.endpoint, "CoinDesk", source.category);
        case "CoinTelegraph":
          return await this.fetchRSSFeed(source.endpoint, "CoinTelegraph", source.category);
        case "Decrypt":
          return await this.fetchRSSFeed(source.endpoint, "Decrypt", source.category);
        case "Bitcoin Magazine":
          return await this.fetchRSSFeed(source.endpoint, "Bitcoin Magazine", source.category);
        case "The Block":
          return await this.fetchRSSFeed(source.endpoint, "The Block", source.category);
        case "Reddit Crypto":
          // Fetch from crypto subreddits
          const cryptoSubreddits = ["cryptocurrency", "bitcoin", "ethereum", "CryptoCurrency"];
          const cryptoArticles = await Promise.allSettled(
            cryptoSubreddits.map((sub) =>
              usePagination
                ? this.fetchRedditAllPages(sub, 3, source.category)
                : this.fetchReddit(sub, 25, undefined, source.category).then((r) => r.articles)
            )
          );
          return cryptoArticles
            .filter((r) => r.status === "fulfilled")
            .flatMap((r) => (r as PromiseFulfilledResult<Article[]>).value);
        case "CryptoCompare":
          return await this.fetchCryptoCompare();
        case "HackerNoon":
        case "Wired":
        case "MIT Technology Review":
        case "The Next Web":
        case "CoinMarketCap":
        case "CryptoSlate":
        case "CNN":
        case "Associated Press":
        case "The New York Times":
        case "YouTube Tech":
        case "YouTube Crypto":
        case "YouTube Viral":
        case "YouTube Music":
        case "YouTube Gaming":
          return await this.fetchRSSFeed(source.endpoint, source.name, source.category);
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

    console.log(`Aggregating from ${sources.length} sources for category: ${category || "all"}`);
    console.log(`Sources:`, sources.map(s => s.name).join(", "));

        // Fetch from all sources in parallel
        const results = await Promise.allSettled(
          sources.map(async (source) => {
            try {
              console.log(`Fetching from ${source.name}...`);
              const articles = await this.fetchSource(source, usePagination);
              if (articles.length > 0) {
                console.log(`✓ ${source.name}: ${articles.length} articles`);
              } else {
                console.warn(`⚠ ${source.name}: 0 articles (may be rate limited or source unavailable)`);
              }
              return articles;
            } catch (error) {
              console.error(`✗ ${source.name}:`, error);
              return [];
            }
          })
        );

    // Log results
    const successful = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;
    console.log(`Fetch results: ${successful} successful, ${failed} failed`);

    // Transform and deduplicate (with link extraction if enabled)
    let articles = this.transformAndDeduplicate(results);

    console.log(`After deduplication: ${articles.length} articles`);

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
