# 📊 Data Pipeline Architecture

## Web3News - Blockchain Content Aggregator

**Created:** 2025-11-07  
**Data Agent:** Data Engineering & Analytics Specialist  
**Status:** ✅ Complete  
**Next Agent:** Develop Agent (`/develop`)

---

## 📋 DATA INFRASTRUCTURE OVERVIEW

**Architecture Type:** Client-Side PWA Data Pipeline  
**Storage:** IndexedDB (Client Cache) + Supabase (Content Database)  
**Analytics:** Dune Analytics (On-Chain) + Supabase Analytics (Off-Chain) + Clerk Analytics (Users)  
**Caching Strategy:** 30-min TTL, 2,000 article limit  
**Offline Support:** IndexedDB + Service Worker + Background Sync

---

## 🔄 DATA PIPELINES

### Pipeline 1: Content Aggregation Pipeline

**Purpose:** Aggregate content from 30+ external sources  
**Type:** Client-Side ETL (Extract, Transform, Load)  
**Source:** 30+ external APIs (Hacker News, Product Hunt, GitHub, Reddit, RSS feeds, etc.)  
**Destination:** IndexedDB (cache) + Supabase (persistent storage)

**Flow:**

```
[User Opens Feed]
    ↓
[Check IndexedDB Cache]
    ├─ Cache Hit (Valid) → [Return Cached Articles]
    └─ Cache Miss/Expired → [Trigger Aggregation Pipeline]
            ↓
    [Extract Phase]
    ├─ Parallel Fetching (Promise.all)
    │   ├─ Hacker News API
    │   ├─ Product Hunt GraphQL
    │   ├─ GitHub REST API
    │   ├─ Reddit JSON
    │   ├─ RSS Feeds (Medium, CoinDesk, etc.)
    │   └─ Price APIs (CoinGecko, etc.)
    │
    ├─ Rate Limiting (10 req/min per source)
    ├─ Error Handling (Retry with exponential backoff)
    └─ CORS Proxy (if needed)
            ↓
    [Transform Phase]
    ├─ Normalize Data Structure
    │   ├─ Standardize Article Schema
    │   ├─ Extract Metadata (title, source, author, date)
    │   ├─ Generate Thumbnails (if missing)
    │   └─ Categorize (tech, crypto, social, general)
    │
    ├─ Deduplication
    │   ├─ Hash URL (SHA-256)
    │   ├─ Check Existing (IndexedDB + Supabase)
    │   └─ Skip Duplicates
    │
    └─ Enrichment
        ├─ Add Timestamps
        ├─ Calculate Scores (upvotes, comments)
        └─ Generate Excerpts
            ↓
    [Load Phase]
    ├─ IndexedDB Cache
    │   ├─ Store Articles (30-min TTL)
    │   ├─ Update Timestamps
    │   └─ Cleanup Old (keep last 2,000)
    │
    └─ Supabase (Optional - User Submissions Only)
        └─ Store User-Submitted Articles
            ↓
    [Display Articles]
```

**Implementation:**

```typescript
// lib/services/contentAggregator.ts
class ContentAggregator {
  private cache: IndexedDBCache;
  private rateLimiter: RateLimiter;
  private sources: SourceConfig[];

  async aggregateSources(category?: string): Promise<Article[]> {
    // 1. Check cache first
    const cached = await this.cache.getArticles(category);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    // 2. Fetch from sources (parallel)
    const sources = this.getSourcesForCategory(category);
    const results = await Promise.allSettled(
      sources.map((source) => this.fetchSource(source))
    );

    // 3. Transform and deduplicate
    const articles = this.transformAndDeduplicate(results);

    // 4. Cache in IndexedDB
    await this.cache.setArticles(articles, category);

    return articles;
  }

  private async fetchSource(source: SourceConfig): Promise<Article[]> {
    await this.rateLimiter.wait(source.name);

    try {
      switch (source.type) {
        case "firebase":
          return await this.fetchFirebase(source);
        case "graphql":
          return await this.fetchGraphQL(source);
        case "rest":
          return await this.fetchREST(source);
        case "rss":
          return await this.fetchRSS(source);
        default:
          return [];
      }
    } catch (error) {
      console.error(`Failed to fetch ${source.name}:`, error);
      return [];
    }
  }

  private transformAndDeduplicate(
    results: PromiseSettledResult<Article[]>[]
  ): Article[] {
    const allArticles: Article[] = [];
    const seenUrls = new Set<string>();

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        result.value.forEach((article) => {
          const urlHash = this.hashUrl(article.url);
          if (!seenUrls.has(urlHash)) {
            seenUrls.add(urlHash);
            allArticles.push(this.normalizeArticle(article));
          }
        });
      }
    });

    return allArticles.sort((a, b) => b.publishedAt - a.publishedAt);
  }
}
```

**Performance Targets:**

- Fetch Time: < 5 seconds (parallel fetching)
- Cache Hit Rate: > 80% (30-min TTL)
- Deduplication: 100% (no duplicates)
- Error Rate: < 5% (retry logic)

---

### Pipeline 2: IndexedDB Caching Pipeline

**Purpose:** Client-side caching with TTL and size limits  
**Type:** Client-Side Cache Management  
**Source:** Content Aggregation Pipeline  
**Destination:** IndexedDB (browser storage)

**Flow:**

```
[Article Received]
    ↓
[Check Cache Validity]
    ├─ TTL Valid (< 30 min) → [Return Cached]
    └─ TTL Expired → [Fetch Fresh]
            ↓
    [Store in IndexedDB]
    ├─ Add Timestamp (cachedAt)
    ├─ Set TTL (30 minutes)
    ├─ Store Article Object
    └─ Update Indexes
            ↓
    [Cleanup Old Articles]
    ├─ Check Article Count (> 2,000)
    ├─ Sort by cachedAt (oldest first)
    ├─ Remove Oldest (keep last 2,000)
    └─ Update Indexes
```

**Implementation:**

```typescript
// lib/services/indexedDBCache.ts
class IndexedDBCache {
  private db: IDBDatabase;
  private storeName = "articles";
  private ttl = 30 * 60 * 1000; // 30 minutes
  private maxArticles = 2000;

  async getArticles(category?: string): Promise<Article[]> {
    const transaction = this.db.transaction([this.storeName], "readonly");
    const store = transaction.objectStore(this.storeName);
    const index = category ? store.index("category") : store.index("cachedAt");

    const request = index.getAll();
    const articles = await this.promisifyRequest<Article[]>(request);

    // Filter expired articles
    const now = Date.now();
    const validArticles = articles.filter((article) => {
      const age = now - article.cachedAt;
      return age < this.ttl;
    });

    // Remove expired articles
    if (validArticles.length < articles.length) {
      await this.removeExpiredArticles(
        articles.filter((a) => !validArticles.includes(a))
      );
    }

    return validArticles;
  }

  async setArticles(articles: Article[], category?: string): Promise<void> {
    const transaction = this.db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);

    const now = Date.now();
    const articlesToStore = articles.map((article) => ({
      ...article,
      cachedAt: now,
      category: category || article.category,
    }));

    // Store articles
    await Promise.all(articlesToStore.map((article) => store.put(article)));

    // Cleanup old articles
    await this.cleanupOldArticles();
  }

  private async cleanupOldArticles(): Promise<void> {
    const transaction = this.db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);
    const index = store.index("cachedAt");

    const request = index.getAll();
    const allArticles = await this.promisifyRequest<Article[]>(request);

    if (allArticles.length > this.maxArticles) {
      // Sort by cachedAt (oldest first)
      allArticles.sort((a, b) => a.cachedAt - b.cachedAt);

      // Remove oldest articles
      const toRemove = allArticles.slice(
        0,
        allArticles.length - this.maxArticles
      );
      await Promise.all(toRemove.map((article) => store.delete(article.url)));
    }
  }
}
```

**Cache Strategy:**

- **TTL:** 30 minutes (configurable)
- **Max Articles:** 2,000 (configurable)
- **Cleanup:** Automatic (on read/write)
- **Indexes:** `url` (primary), `category`, `source`, `cachedAt`

---

### Pipeline 3: Offline Sync Pipeline

**Purpose:** Sync pending actions when online  
**Type:** Background Sync (Service Worker)  
**Source:** IndexedDB Offline Queue  
**Destination:** Supabase + Smart Contracts

**Flow:**

```
[User Action (Offline)]
    ↓
[Store in Offline Queue]
    ├─ Like Article → [Queue Like Action]
    ├─ Bookmark Article → [Queue Bookmark Action]
    ├─ Follow User → [Queue Follow Action]
    ├─ Send Message → [Queue Message Action]
    └─ Place Bid → [Queue Bid Action]
            ↓
    [Background Sync (When Online)]
    ├─ Service Worker Detects Online
    ├─ Process Queue (FIFO)
    ├─ Sync to Supabase
    ├─ Sync to Smart Contracts (if Web3 action)
    └─ Remove from Queue (on success)
            ↓
    [Error Handling]
    ├─ Retry Failed Actions (3 attempts)
    ├─ Exponential Backoff
    └─ Notify User (if persistent failure)
```

**Implementation:**

```typescript
// lib/services/offlineSync.ts
class OfflineSync {
  private queueStore: LocalForage;
  private maxRetries = 3;

  async queueAction(action: OfflineAction): Promise<void> {
    await this.queueStore.setItem(action.id, {
      ...action,
      createdAt: Date.now(),
      retries: 0,
    });
  }

  async syncQueue(): Promise<void> {
    const queue = await this.queueStore.keys();

    for (const key of queue) {
      const action = await this.queueStore.getItem<OfflineAction>(key);
      if (!action) continue;

      try {
        await this.processAction(action);
        await this.queueStore.removeItem(key);
      } catch (error) {
        await this.handleSyncError(action, error);
      }
    }
  }

  private async processAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case "like":
        await supabase.from("article_likes").insert({
          article_id: action.payload.articleId,
          user_id: action.payload.userId,
        });
        break;
      case "bookmark":
        await supabase.from("bookmarks").insert({
          article_id: action.payload.articleId,
          user_id: action.payload.userId,
        });
        break;
      case "follow":
        await supabase.from("user_follows").insert({
          follower_id: action.payload.followerId,
          following_id: action.payload.followingId,
        });
        break;
      case "message":
        await supabase.from("messages").insert({
          conversation_id: action.payload.conversationId,
          sender_id: action.payload.senderId,
          content: action.payload.content,
        });
        break;
      case "bid":
        // Smart contract interaction
        await this.placeBidOnChain(action.payload);
        break;
    }
  }

  private async handleSyncError(
    action: OfflineAction,
    error: any
  ): Promise<void> {
    if (action.retries >= this.maxRetries) {
      // Notify user of persistent failure
      await this.notifyUser(action, error);
      await this.queueStore.removeItem(action.id);
    } else {
      // Retry with exponential backoff
      const delay = Math.pow(2, action.retries) * 1000; // 1s, 2s, 4s
      setTimeout(() => {
        action.retries++;
        this.queueStore.setItem(action.id, action);
        this.syncQueue();
      }, delay);
    }
  }
}
```

**Service Worker Integration:**

```typescript
// public/sw.js
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-offline-queue") {
    event.waitUntil(syncOfflineQueue());
  }
});

async function syncOfflineQueue() {
  const sync = new OfflineSync();
  await sync.syncQueue();
}
```

---

### Pipeline 4: Analytics Pipeline

**Purpose:** Track user behavior, performance, and on-chain metrics  
**Type:** Multi-Source Analytics  
**Sources:** Client Events, Supabase, Smart Contracts  
**Destinations:** Dune Analytics, Supabase Analytics, Clerk Analytics

**Flow:**

```
[User Event]
    ↓
[Track Event]
    ├─ Client-Side Event (click, view, scroll)
    ├─ Supabase Event (like, bookmark, follow)
    └─ On-Chain Event (bid, vote, convert)
            ↓
    [Route to Analytics]
    ├─ On-Chain Events → [Dune Analytics]
    │   ├─ Ad Auctions
    │   ├─ Subscriptions
    │   └─ Governance Votes
    │
    ├─ Off-Chain Events → [Supabase Analytics]
    │   ├─ Content Views
    │   ├─ User Engagement
    │   └─ Social Interactions
    │
    └─ User Events → [Clerk Analytics]
        ├─ Signups
        ├─ Retention
        └─ Subscription Tiers
            ↓
    [Aggregate Metrics]
    ├─ Daily Active Users (DAU)
    ├─ Monthly Active Users (MAU)
    ├─ Engagement Rate
    ├─ Revenue Metrics
    └─ Performance Metrics
```

**Implementation:**

```typescript
// lib/services/analytics.ts
class Analytics {
  private duneClient: DuneClient;
  private supabaseClient: SupabaseClient;
  private clerkClient: ClerkClient;

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    // Route to appropriate analytics service
    switch (event.type) {
      case "onchain":
        await this.trackOnChain(event);
        break;
      case "offchain":
        await this.trackOffChain(event);
        break;
      case "user":
        await this.trackUser(event);
        break;
    }
  }

  private async trackOnChain(event: OnChainEvent): Promise<void> {
    // Dune Analytics (on-chain metrics)
    await this.duneClient.insertEvent({
      event_type: event.type,
      chain_id: event.chainId,
      transaction_hash: event.txHash,
      block_number: event.blockNumber,
      timestamp: event.timestamp,
      data: event.data,
    });
  }

  private async trackOffChain(event: OffChainEvent): Promise<void> {
    // Supabase Analytics (off-chain metrics)
    await this.supabaseClient.from("analytics_events").insert({
      event_type: event.type,
      user_id: event.userId,
      article_id: event.articleId,
      timestamp: event.timestamp,
      data: event.data,
    });
  }

  private async trackUser(event: UserEvent): Promise<void> {
    // Clerk Analytics (user metrics)
    await this.clerkClient.analytics.track({
      event: event.type,
      userId: event.userId,
      properties: event.properties,
    });
  }
}
```

**Metrics Tracked:**

- **On-Chain:** Ad auctions, subscriptions, governance votes, points conversions
- **Off-Chain:** Content views, engagement, social interactions, search queries
- **Users:** Signups, retention, subscription tiers, points balance

---

## 📊 DATA QUALITY & GOVERNANCE

### Data Quality Rules

**Rule 1: Article Validation**

- Title: Required, max 500 characters
- URL: Required, valid URL format, unique
- Source: Required, from allowed sources list
- Published Date: Required, valid timestamp
- Category: Required, from allowed categories (tech, crypto, social, general)

**Rule 2: Deduplication**

- URL Hash: SHA-256 hash of normalized URL
- Check: IndexedDB + Supabase before storing
- Action: Skip duplicate, log warning

**Rule 3: Cache Validity**

- TTL: 30 minutes (configurable)
- Check: On read, remove expired
- Action: Fetch fresh if expired

**Rule 4: Rate Limiting**

- Limit: 10 requests/minute per source
- Check: Before API call
- Action: Wait if limit exceeded

**Rule 5: Error Handling**

- Retry: 3 attempts with exponential backoff
- Fallback: Return cached data if available
- Logging: Log all errors for monitoring

---

### Data Governance Policies

**Access Control:**

- **Public:** Articles, proposals (read-only)
- **Authenticated:** Submissions, bookmarks, likes (read/write own)
- **System:** Points transactions, notifications (system-only)

**Data Retention:**

- **IndexedDB:** 30 days (auto-cleanup)
- **Supabase:** Indefinite (user data), 90 days (analytics events)
- **Analytics:** 1 year (aggregated metrics)

**Data Privacy:**

- **GDPR Compliance:** User data anonymization, right to deletion
- **Data Minimization:** Only collect necessary data
- **Consent:** User consent for analytics tracking

**Data Lineage:**

- **Source Tracking:** Track origin of each article
- **Transformation Log:** Log all data transformations
- **Audit Trail:** Track all data modifications

---

## 🔍 ANALYTICS DASHBOARDS

### Dashboard 1: Content Analytics

**Metrics:**

- Total Articles: Count of articles in cache
- Sources: Articles per source
- Categories: Articles per category
- Cache Hit Rate: Percentage of cache hits
- Freshness: Average article age

**Visualization:**

- Line chart: Articles over time
- Pie chart: Articles by source
- Bar chart: Articles by category
- Gauge: Cache hit rate

---

### Dashboard 2: User Engagement Analytics

**Metrics:**

- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Engagement Rate: (Likes + Bookmarks + Shares) / Views
- Average Session Duration
- Bounce Rate

**Visualization:**

- Line chart: DAU/MAU over time
- Bar chart: Engagement by category
- Heatmap: Engagement by time of day
- Funnel: User journey (view → like → bookmark → share)

---

### Dashboard 3: On-Chain Analytics (Dune Analytics)

**Metrics:**

- Total Ad Auctions: Count of auctions
- Total Revenue: Sum of auction bids
- Active Subscriptions: Count of active subscriptions
- Governance Participation: Count of votes
- Points Conversions: Count of conversions

**Visualization:**

- Line chart: Revenue over time
- Bar chart: Revenue by chain
- Pie chart: Subscription tiers
- Table: Top bidders

---

## ✅ DATA PIPELINE ARCHITECTURE COMPLETE

**Status:** ✅ Data Pipeline Architecture Complete  
**Next:** GitHub Actions Workflows  
**Next Agent:** Develop Agent (`/develop`) - After data approval

**Total Pipelines:** 4 comprehensive pipelines  
**Caching Strategy:** IndexedDB (30-min TTL, 2,000 limit)  
**Offline Support:** Service Worker + Background Sync  
**Analytics:** Multi-source (Dune, Supabase, Clerk)
