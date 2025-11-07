# How NewsNow Achieves Multiple News Sources

## Reference
- **Repository**: https://github.com/ourongxing/newsnow
- **Live Demo**: https://newsnow.busiyi.world
- **Stars**: 13.6k+ ⭐
- **Sources**: 40+ news channels

## Key Architectural Differences

### 1. **Server-Side Scraping vs Client-Side Fetching**

**NewsNow Approach:**
- ✅ **Server-side scraping** using Nitro server (Nuxt.js backend)
- ✅ No CORS limitations
- ✅ Can scrape any website directly
- ✅ Better rate limit handling
- ✅ Can use proxies/rotating IPs

**Our Current Approach:**
- ❌ **Client-side fetching** (browser-based)
- ❌ CORS limitations (many sites block direct access)
- ❌ Limited to public APIs and RSS feeds
- ❌ Rate limits enforced by browser

### 2. **Modular Source Architecture**

**NewsNow Structure:**
```
shared/sources/          # Shared type definitions
  ├── types.ts          # Source type definitions
  └── ...
server/sources/          # Individual source implementations
  ├── hackernews.ts
  ├── reddit.ts
  ├── weibo.ts
  ├── zhihu.ts
  └── ...
```

**Our Current Structure:**
```
src/lib/services/
  └── contentAggregator.ts  # Single monolithic class
```

### 3. **Adaptive Scraping Intervals**

**NewsNow:**
- ✅ Adjusts scraping frequency based on source update rate
- ✅ Minimum 2-minute interval
- ✅ Prevents IP bans
- ✅ Optimizes resource usage

**Our Current:**
- ❌ Fixed intervals
- ❌ No adaptive behavior
- ❌ Risk of rate limiting

### 4. **Database Caching**

**NewsNow:**
- ✅ Cloudflare D1 database
- ✅ 30-minute default cache
- ✅ User-specific cache invalidation
- ✅ Persistent storage

**Our Current:**
- ✅ IndexedDB (client-side)
- ✅ 30-minute TTL
- ❌ No server-side persistence
- ❌ Cache lost on browser clear

### 5. **Source Types Supported**

**NewsNow Supports:**
1. **RSS Feeds** - Standard RSS parsing
2. **REST APIs** - Direct API calls
3. **Web Scraping** - HTML parsing (server-side)
4. **GraphQL APIs** - GraphQL queries
5. **Chinese Platforms** - Weibo, Zhihu, Douyin, etc.

**Our Current Supports:**
1. ✅ RSS Feeds (with proxy fallback)
2. ✅ REST APIs (Hacker News, GitHub, Reddit)
3. ✅ GraphQL (Product Hunt)
4. ❌ Web Scraping (CORS blocked)
5. ❌ Chinese Platforms (requires server-side)

## How NewsNow Gets So Many Sources

### 1. **Server-Side Scraping**
```typescript
// NewsNow can scrape directly (no CORS)
const response = await fetch('https://any-website.com', {
  headers: { 'User-Agent': 'NewsNow/1.0' }
});
```

### 2. **Modular Source System**
Each source is a separate module:
```typescript
// server/sources/reddit.ts
export default {
  name: 'Reddit',
  url: 'https://www.reddit.com',
  handler: async () => {
    // Source-specific logic
  }
}
```

### 3. **Type-Safe Source Definitions**
```typescript
// shared/sources/types.ts
interface Source {
  name: string;
  url: string;
  handler: () => Promise<Article[]>;
  interval?: number; // Adaptive interval
}
```

### 4. **Database Caching**
```typescript
// Cache articles in D1 database
await db.insert('articles', articles);
// Check cache before scraping
const cached = await db.select('articles', { source: 'reddit' });
```

### 5. **Chinese Platform Support**
- **Weibo (微博)**: API scraping
- **Zhihu (知乎)**: RSS + API
- **Douyin (抖音)**: Third-party API
- **Xiaohongshu (小红书)**: OpenAPI

## Recommendations for Our Project

### Option 1: Add Server-Side API Routes (Recommended)

Create Next.js API routes for server-side scraping:

```typescript
// app/api/sources/[source]/route.ts
export async function GET(request: Request) {
  const source = request.url.split('/').pop();
  
  // Server-side scraping (no CORS)
  const articles = await scrapeSource(source);
  
  return Response.json(articles);
}
```

**Benefits:**
- ✅ No CORS limitations
- ✅ Can scrape any website
- ✅ Better rate limit handling
- ✅ Can use proxies

### Option 2: Modularize Source System

Split `contentAggregator.ts` into individual source files:

```
src/lib/sources/
  ├── hackernews.ts
  ├── reddit.ts
  ├── rss.ts
  └── index.ts
```

**Benefits:**
- ✅ Easier to add new sources
- ✅ Better code organization
- ✅ Type-safe source definitions

### Option 3: Add Adaptive Intervals

Implement adaptive scraping based on source update frequency:

```typescript
class AdaptiveRateLimiter {
  private intervals: Map<string, number> = new Map();
  
  getInterval(source: string): number {
    const lastUpdate = this.getLastUpdateTime(source);
    const updateFrequency = this.calculateFrequency(source);
    
    // Adjust interval based on frequency
    return Math.max(120000, updateFrequency * 0.8); // Min 2 min
  }
}
```

### Option 4: Add More RSS Sources

Many news sites provide RSS feeds (free, no API needed):

**Tech Sources:**
- Ars Technica ✅ (already added)
- The Verge ✅ (already added)
- Wired ✅ (already added)
- TechCrunch ✅ (already added)
- Engadget
- Gizmodo
- The Next Web ✅ (already added)

**Crypto Sources:**
- CoinDesk ✅ (already added)
- CoinTelegraph ✅ (already added)
- Decrypt ✅ (already added)
- Bitcoin Magazine ✅ (already added)
- The Block ✅ (already added)
- CryptoSlate ✅ (already added)

**General News:**
- BBC News ✅ (already added)
- Reuters ✅ (already added)
- The Guardian ✅ (already added)
- CNN ✅ (already added)
- Associated Press ✅ (already added)
- The New York Times ✅ (already added)

### Option 5: Use RSS Aggregator Services

Services that aggregate RSS feeds:
- **RSS2JSON** (already using, but has rate limits)
- **AllSides RSS** - Multiple perspectives
- **Google News RSS** - Aggregated news
- **Feedly API** - RSS aggregator (paid)

## Implementation Priority

### Phase 1: Quick Wins (This Week)
1. ✅ Add more RSS sources (already done)
2. ✅ Improve RSS parsing with fallback (already done)
3. ✅ Add better error handling (already done)

### Phase 2: Architecture Improvements (Next Week)
1. **Modularize sources** - Split into individual files
2. **Add server-side API routes** - For sources that need scraping
3. **Improve caching** - Add server-side cache layer

### Phase 3: Advanced Features (Future)
1. **Adaptive intervals** - Based on source update frequency
2. **Proxy support** - For rate-limited sources
3. **Chinese platforms** - If needed (requires server-side)

## Current Status

**We Already Have:**
- ✅ 31+ sources configured
- ✅ RSS feed parsing with fallback
- ✅ Reddit API integration
- ✅ GitHub, Hacker News, Product Hunt APIs
- ✅ Client-side caching (IndexedDB)

**What We're Missing:**
- ❌ Server-side scraping capability
- ❌ Modular source architecture
- ❌ Adaptive intervals
- ❌ Server-side database caching

## Conclusion

NewsNow achieves many sources through:
1. **Server-side scraping** (no CORS limits)
2. **Modular architecture** (easy to add sources)
3. **Database caching** (persistent storage)
4. **Adaptive intervals** (prevents bans)

**For our project**, we can:
- ✅ Continue adding RSS sources (free, no API needed)
- ✅ Add server-side API routes for scraping
- ✅ Modularize our source system
- ✅ Implement adaptive intervals

**Next Steps:**
1. Add server-side API routes for sources that need scraping
2. Modularize the source system
3. Add more RSS sources (many available)
4. Implement adaptive rate limiting

