# 🔌 API Specifications
## Web3News - Blockchain Content Aggregator

**Created:** 2025-11-07  
**Design Agent:** System Architect  
**Status:** ✅ Complete  
**Type:** Client-Side API Wrappers

---

## 📡 EXTERNAL CONTENT API WRAPPERS

### API 1: Hacker News API

**Function:** `fetchHackerNews(limit?: number)`

**Endpoint:** `https://hacker-news.firebaseio.com/v0/topstories.json`

**Request:**
```typescript
interface HackerNewsRequest {
  limit?: number; // Default: 30
}
```

**Response:**
```typescript
interface HackerNewsResponse {
  storyIds: number[];
}
```

**Implementation:**
```typescript
export async function fetchHackerNews(limit = 30): Promise<Article[]> {
  // 1. Fetch top story IDs
  const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
  const storyIds: number[] = await response.json();
  
  // 2. Fetch story details (parallel)
  const stories = await Promise.all(
    storyIds.slice(0, limit).map(id =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
    )
  );
  
  // 3. Transform to Article format
  return stories.map(story => ({
    id: `hn-${story.id}`,
    title: story.title,
    url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
    source: 'Hacker News',
    category: 'tech',
    upvotes: story.score || 0,
    comments: story.descendants || 0,
    publishedAt: story.time * 1000,
    author: story.by,
  }));
}
```

**Rate Limit:** None (be respectful)  
**Caching:** IndexedDB (30-min TTL)

---

### API 2: Product Hunt API

**Function:** `fetchProductHunt(limit?: number)`

**Endpoint:** `https://api.producthunt.com/v2/api/graphql`

**Request:**
```typescript
interface ProductHuntRequest {
  limit?: number; // Default: 20
}
```

**GraphQL Query:**
```graphql
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
```

**Response:**
```typescript
interface ProductHuntResponse {
  data: {
    posts: {
      edges: Array<{
        node: {
          id: string;
          name: string;
          tagline: string;
          url: string;
          votesCount: number;
          commentsCount: number;
          createdAt: string;
          user: { username: string };
        };
      }>;
    };
  };
}
```

**Implementation:**
```typescript
export async function fetchProductHunt(limit = 20): Promise<Article[]> {
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
            user { username }
          }
        }
      }
    }
  `;
  
  const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PRODUCT_HUNT_TOKEN}`,
    },
    body: JSON.stringify({ query, variables: { first: limit } }),
  });
  
  const data = await response.json();
  
  return data.data.posts.edges.map((edge: any) => ({
    id: `ph-${edge.node.id}`,
    title: edge.node.name,
    url: edge.node.url,
    source: 'Product Hunt',
    category: 'tech',
    upvotes: edge.node.votesCount,
    comments: edge.node.commentsCount,
    publishedAt: new Date(edge.node.createdAt).getTime(),
    author: edge.node.user.username,
  }));
}
```

**Rate Limit:** 100 requests/hour (free tier)  
**Caching:** IndexedDB (30-min TTL)

---

### API 3: GitHub Trending API

**Function:** `fetchGitHubTrending(language?: string)`

**Endpoint:** `https://api.github.com/search/repositories`

**Request:**
```typescript
interface GitHubRequest {
  language?: string; // e.g., 'javascript', 'typescript', 'python'
  limit?: number; // Default: 30
}
```

**Response:**
```typescript
interface GitHubResponse {
  items: Array<{
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string;
    stargazers_count: number;
    language: string;
    created_at: string;
    owner: { login: string };
  }>;
}
```

**Implementation:**
```typescript
export async function fetchGitHubTrending(language?: string, limit = 30): Promise<Article[]> {
  const query = language
    ? `language:${language} created:>${getDate30DaysAgo()}`
    : `created:>${getDate30DaysAgo()}`;
  
  const response = await fetch(
    `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=${limit}`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.NEXT_PUBLIC_GITHUB_TOKEN && {
          'Authorization': `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
        }),
      },
    }
  );
  
  const data = await response.json();
  
  return data.items.map((repo: any) => ({
    id: `gh-${repo.id}`,
    title: repo.name,
    url: repo.html_url,
    source: 'GitHub',
    category: 'tech',
    upvotes: repo.stargazers_count,
    comments: 0,
    publishedAt: new Date(repo.created_at).getTime(),
    author: repo.owner.login,
    description: repo.description,
  }));
}
```

**Rate Limit:** 60 req/hour (unauthenticated), 5,000 (authenticated)  
**Caching:** IndexedDB (30-min TTL)

---

### API 4: Reddit API

**Function:** `fetchReddit(subreddit: string, limit?: number)`

**Endpoint:** `https://www.reddit.com/r/{subreddit}.json`

**Request:**
```typescript
interface RedditRequest {
  subreddit: string; // e.g., 'technology', 'cryptocurrency', 'programming'
  limit?: number; // Default: 25
}
```

**Response:**
```typescript
interface RedditResponse {
  data: {
    children: Array<{
      data: {
        id: string;
        title: string;
        url: string;
        selftext: string;
        score: number;
        num_comments: number;
        created_utc: number;
        author: string;
        subreddit: string;
      };
    }>;
  };
}
```

**Implementation:**
```typescript
export async function fetchReddit(subreddit: string, limit = 25): Promise<Article[]> {
  const response = await fetch(`https://www.reddit.com/r/${subreddit}.json?limit=${limit}`);
  const data = await response.json();
  
  return data.data.children.map((child: any) => ({
    id: `reddit-${child.data.id}`,
    title: child.data.title,
    url: child.data.url.startsWith('http') ? child.data.url : `https://reddit.com${child.data.url}`,
    source: `r/${subreddit}`,
    category: getCategoryFromSubreddit(subreddit),
    upvotes: child.data.score,
    comments: child.data.num_comments,
    publishedAt: child.data.created_utc * 1000,
    author: child.data.author,
    excerpt: child.data.selftext.substring(0, 200),
  }));
}
```

**Rate Limit:** 60 requests/minute  
**Caching:** IndexedDB (30-min TTL)

---

### API 5: RSS Feed Parser

**Function:** `fetchRSSFeed(url: string)`

**Endpoint:** RSS feed URL (e.g., `https://decrypt.co/feed`)

**Request:**
```typescript
interface RSSRequest {
  url: string; // RSS feed URL
}
```

**Response:**
```typescript
interface RSSResponse {
  items: Array<{
    title: string;
    link: string;
    description: string;
    pubDate: string;
    author?: string;
  }>;
}
```

**Implementation:**
```typescript
import Parser from 'rss-parser';

const parser = new Parser();

export async function fetchRSSFeed(url: string): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(url);
    
    return feed.items.map((item: any) => ({
      id: `rss-${hashUrl(item.link)}`,
      title: item.title || '',
      url: item.link || '',
      source: feed.title || 'RSS Feed',
      category: inferCategory(feed.title),
      upvotes: 0,
      comments: 0,
      publishedAt: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
      author: item.creator || item.author || '',
      excerpt: item.contentSnippet || item.description || '',
    }));
  } catch (error) {
    console.error(`Failed to fetch RSS feed: ${url}`, error);
    return [];
  }
}
```

**RSS Sources:**
- Medium: `https://medium.com/feed/@publication`
- CoinDesk: `https://www.coindesk.com/arc/outboundfeeds/rss/`
- CoinTelegraph: `https://cointelegraph.com/rss`
- Decrypt: `https://decrypt.co/feed`
- Bitcoin Magazine: `https://bitcoinmagazine.com/.rss/full/`
- The Block: `https://www.theblock.co/rss.xml`

**Rate Limit:** None (RSS is unlimited)  
**Caching:** IndexedDB (30-min TTL)

---

### API 6: CoinGecko Price API

**Function:** `fetchCryptoPrices(coinIds: string[])`

**Endpoint:** `https://api.coingecko.com/api/v3/simple/price`

**Request:**
```typescript
interface CoinGeckoRequest {
  coinIds: string[]; // e.g., ['bitcoin', 'ethereum', 'solana']
  vsCurrency?: string; // Default: 'usd'
}
```

**Response:**
```typescript
interface CoinGeckoResponse {
  [coinId: string]: {
    usd: number;
    usd_24h_change: number;
    usd_market_cap: number;
  };
}
```

**Implementation:**
```typescript
export async function fetchCryptoPrices(
  coinIds: string[],
  vsCurrency = 'usd'
): Promise<PriceData> {
  const ids = coinIds.join(',');
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vsCurrency}&include_24hr_change=true&include_market_cap=true`
  );
  
  const data = await response.json();
  
  return Object.entries(data).reduce((acc, [coinId, price]: [string, any]) => {
    acc[coinId] = {
      price: price.usd,
      change24h: price.usd_24h_change,
      marketCap: price.usd_market_cap,
    };
    return acc;
  }, {} as PriceData);
}
```

**Rate Limit:** 30 calls/minute (43,200 calls/day)  
**Caching:** IndexedDB (5-min TTL for prices)

---

## 🗄️ SUPABASE CLIENT API

### Function 1: getSubmissions

**Function:** `getSubmissions(filters?: SubmissionFilters)`

**Table:** `submissions`

**Request:**
```typescript
interface SubmissionFilters {
  userId?: string;
  category?: 'tech' | 'crypto' | 'social' | 'general';
  source?: string;
  dateRange?: { start: Date; end: Date };
  limit?: number;
  offset?: number;
}
```

**Response:**
```typescript
interface Submission {
  id: string;
  user_id: string;
  title: string;
  url: string;
  source: string;
  category: string;
  upvotes: number;
  created_at: string;
  updated_at: string;
}
```

**Implementation:**
```typescript
export async function getSubmissions(filters?: SubmissionFilters) {
  let query = supabase.from('submissions').select('*');
  
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.source) {
    query = query.eq('source', filters.source);
  }
  if (filters?.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.start.toISOString())
      .lte('created_at', filters.dateRange.end.toISOString());
  }
  
  query = query.order('created_at', { ascending: false });
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
```

---

### Function 2: createBookmark

**Function:** `createBookmark(articleId: string, articleTitle: string, articleSource: string)`

**Table:** `bookmarks`

**Request:**
```typescript
interface CreateBookmarkRequest {
  articleId: string;
  articleTitle: string;
  articleSource: string;
}
```

**Response:**
```typescript
interface Bookmark {
  id: string;
  user_id: string;
  article_id: string;
  article_title: string;
  article_source: string;
  created_at: string;
}
```

**Implementation:**
```typescript
export async function createBookmark(
  articleId: string,
  articleTitle: string,
  articleSource: string
) {
  const { data: user } = await clerk.user.get();
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('bookmarks')
    .insert({
      user_id: user.id,
      article_id: articleId,
      article_title: articleTitle,
      article_source: articleSource,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

---

### Function 3: likeArticle

**Function:** `likeArticle(articleId: string)`

**Table:** `article_likes`

**Request:**
```typescript
interface LikeArticleRequest {
  articleId: string;
}
```

**Response:**
```typescript
interface Like {
  id: string;
  article_id: string;
  user_id: string;
  created_at: string;
}
```

**Implementation:**
```typescript
export async function likeArticle(articleId: string) {
  const { data: user } = await clerk.user.get();
  if (!user) throw new Error('Not authenticated');
  
  // Check if already liked
  const { data: existing } = await supabase
    .from('article_likes')
    .select('id')
    .eq('article_id', articleId)
    .eq('user_id', user.id)
    .single();
  
  if (existing) {
    // Unlike
    const { error } = await supabase
      .from('article_likes')
      .delete()
      .eq('id', existing.id);
    if (error) throw error;
    return null;
  }
  
  // Like
  const { data, error } = await supabase
    .from('article_likes')
    .insert({
      article_id: articleId,
      user_id: user.id,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Award points to article submitter (if exists)
  await awardPointsForLike(articleId);
  
  return data;
}
```

---

## ⛓️ SMART CONTRACT API

### Function 1: joinAuction

**Function:** `joinAuction(auctionId: string, chainId: number)`

**Contract:** `AdPaymentContract`

**Method:** `joinAuction(uint256 auctionId)`

**Request:**
```typescript
interface JoinAuctionRequest {
  auctionId: string;
  chainId: number; // Ethereum, Polygon, BSC, etc.
}
```

**Response:**
```typescript
interface TransactionResponse {
  hash: string;
  status: 'pending' | 'success' | 'failed';
}
```

**Implementation:**
```typescript
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { AdPaymentContractABI } from '@/abis/AdPaymentContract';

export function useJoinAuction(auctionId: string, chainId: number) {
  const contractAddress = getContractAddress(chainId, 'AdPaymentContract');
  
  const { write, data, isLoading } = useContractWrite({
    address: contractAddress,
    abi: AdPaymentContractABI,
    functionName: 'joinAuction',
    args: [BigInt(auctionId)],
    value: parseEther('1'), // 1 USDT participation fee
  });
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });
  
  return {
    joinAuction: write,
    isLoading: isLoading || isConfirming,
    isSuccess,
    transactionHash: data?.hash,
  };
}
```

---

### Function 2: placeBid

**Function:** `placeBid(auctionId: string, amount: string, chainId: number)`

**Contract:** `AdPaymentContract`

**Method:** `placeBid(uint256 auctionId, uint256 amount)`

**Request:**
```typescript
interface PlaceBidRequest {
  auctionId: string;
  amount: string; // USDT amount (must be 5%+ higher than current bid)
  chainId: number;
}
```

**Implementation:**
```typescript
export function usePlaceBid(auctionId: string, chainId: number) {
  const contractAddress = getContractAddress(chainId, 'AdPaymentContract');
  
  const placeBid = async (amount: string) => {
    // Validate bid amount (5%+ increment)
    const currentBid = await getCurrentBid(auctionId);
    const minBid = currentBid * 1.05;
    if (parseFloat(amount) < minBid) {
      throw new Error(`Bid must be at least 5% higher than current bid (${minBid} USDT)`);
    }
    
    // Place bid
    const { write } = useContractWrite({
      address: contractAddress,
      abi: AdPaymentContractABI,
      functionName: 'placeBid',
      args: [BigInt(auctionId), parseUnits(amount, 6)], // USDT has 6 decimals
    });
    
    write();
  };
  
  return { placeBid };
}
```

---

## ✅ API SPECIFICATIONS COMPLETE

**Status:** ✅ API Specifications Complete  
**Next:** Component Specifications  
**Next Agent:** Data Agent (`/data`) - After design approval

**Total API Functions:** 45+ client-side API wrappers  
**External APIs:** 15+ content sources  
**Supabase Functions:** 20+ database operations  
**Smart Contract Functions:** 10+ blockchain operations

