# 📊 Data Quality & Analytics Report

## Web3News - Blockchain Content Aggregator

**Created:** 2025-11-07  
**Data Agent:** Data Engineering & Analytics Specialist  
**Status:** ✅ Complete  
**Next Agent:** Develop Agent (`/develop`)

---

## 📋 DATA QUALITY FRAMEWORK

### Data Quality Dimensions

**1. Completeness**

- **Articles:** Title, URL, source, published date required
- **User Actions:** User ID, action type, timestamp required
- **Metrics:** All required fields populated

**2. Accuracy**

- **URLs:** Valid URL format, accessible
- **Timestamps:** Valid date/time, not in future
- **Categories:** From allowed list (tech, crypto, social, general)

**3. Consistency**

- **Data Format:** Standardized article schema
- **Naming:** Consistent source names
- **Categories:** Consistent categorization

**4. Timeliness**

- **Cache TTL:** 30 minutes (configurable)
- **Sync Delay:** < 1 minute (offline queue)
- **Analytics:** Real-time (on-chain), near real-time (off-chain)

**5. Validity**

- **URL Hash:** SHA-256 hash for deduplication
- **User ID:** Clerk user ID format
- **Points:** Non-negative integers

**6. Uniqueness**

- **Articles:** URL hash uniqueness
- **Bookmarks:** User + Article uniqueness
- **Likes:** User + Article uniqueness

---

## 🔍 DATA QUALITY RULES

### Rule 1: Article Validation

**Schema:**

```typescript
interface Article {
  id: string; // Required, unique
  title: string; // Required, max 500 chars
  url: string; // Required, valid URL, unique
  source: string; // Required, from allowed sources
  category: string; // Required, from allowed categories
  author?: string; // Optional
  publishedAt: number; // Required, valid timestamp
  thumbnail?: string; // Optional, valid URL
  excerpt?: string; // Optional, max 500 chars
  upvotes?: number; // Optional, non-negative
  comments?: number; // Optional, non-negative
  cachedAt: number; // Required, cache timestamp
}
```

**Validation:**

- Title: Required, non-empty, max 500 characters
- URL: Required, valid URL format, unique (by hash)
- Source: Required, from allowed sources list
- Category: Required, from allowed categories
- Published Date: Required, valid timestamp, not in future
- Cached Date: Required, valid timestamp

**Error Handling:**

- Invalid article: Skip, log warning
- Duplicate article: Skip, log info
- Missing required field: Skip, log error

---

### Rule 2: Deduplication Strategy

**Method:** URL Hash (SHA-256)

**Process:**

1. Normalize URL (remove query params, fragments, trailing slashes)
2. Generate SHA-256 hash
3. Check IndexedDB cache (by hash)
4. Check Supabase (by hash, if user submission)
5. Skip if duplicate found

**Implementation:**

```typescript
function hashUrl(url: string): string {
  // Normalize URL
  const normalized = normalizeUrl(url);

  // Generate SHA-256 hash
  const hash = sha256(normalized);

  return hash;
}

function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove query params and fragments
    urlObj.search = "";
    urlObj.hash = "";
    // Remove trailing slash
    return urlObj.toString().replace(/\/$/, "");
  } catch (error) {
    return url;
  }
}
```

**Performance:**

- Hash Generation: < 1ms per URL
- Duplicate Check: < 5ms (IndexedDB lookup)
- Total Deduplication: < 10ms per article

---

### Rule 3: Cache Validity

**TTL:** 30 minutes (configurable)

**Validation:**

- Check `cachedAt` timestamp on read
- Calculate age: `now - cachedAt`
- If age > TTL: Fetch fresh, update cache
- If age < TTL: Return cached

**Cleanup:**

- On read: Remove expired articles
- On write: Cleanup old articles (keep last 2,000)
- Background: Periodic cleanup (every hour)

**Implementation:**

```typescript
function isCacheValid(article: Article, ttl = 30 * 60 * 1000): boolean {
  const age = Date.now() - article.cachedAt;
  return age < ttl;
}
```

---

### Rule 4: Rate Limiting

**Limit:** 10 requests/minute per source

**Implementation:**

```typescript
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

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
}
```

**Error Handling:**

- Rate limit exceeded: Wait, retry
- Persistent rate limit: Fallback to cache
- API error: Retry with exponential backoff

---

### Rule 5: Error Handling & Retry Logic

**Retry Strategy:**

- Max Attempts: 3
- Backoff: Exponential (1s, 2s, 4s)
- Fallback: Return cached data if available

**Implementation:**

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

**Error Types:**

- Network Error: Retry with backoff
- API Error (4xx): Don't retry, log error
- API Error (5xx): Retry with backoff
- Timeout: Retry with backoff

---

## 📊 ANALYTICS INTEGRATION

### Analytics 1: Dune Analytics (On-Chain)

**Purpose:** Track on-chain metrics (ad auctions, subscriptions, governance)

**Events Tracked:**

- Ad Auction Participation
- Ad Auction Bids
- Subscription Purchases
- Governance Proposals
- Governance Votes
- Points Conversions

**Implementation:**

```typescript
// lib/services/duneAnalytics.ts
class DuneAnalytics {
  private apiKey: string;
  private baseUrl = "https://api.dune.com/api/v1";

  async trackEvent(event: OnChainEvent): Promise<void> {
    const query = `
      INSERT INTO web3news_events (
        event_type,
        chain_id,
        transaction_hash,
        block_number,
        timestamp,
        data
      ) VALUES (
        '${event.type}',
        ${event.chainId},
        '${event.txHash}',
        ${event.blockNumber},
        '${event.timestamp}',
        '${JSON.stringify(event.data)}'
      )
    `;

    await fetch(`${this.baseUrl}/query`, {
      method: "POST",
      headers: {
        "X-Dune-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
  }
}
```

**Dashboards:**

- Ad Auction Analytics
- Subscription Analytics
- Governance Analytics
- Revenue Analytics

---

### Analytics 2: Supabase Analytics (Off-Chain)

**Purpose:** Track off-chain metrics (content views, engagement, social)

**Events Tracked:**

- Article Views
- Article Likes
- Article Bookmarks
- Article Shares
- User Follows
- Messages Sent
- Search Queries

**Implementation:**

```typescript
// lib/services/supabaseAnalytics.ts
class SupabaseAnalytics {
  private supabase: SupabaseClient;

  async trackEvent(event: OffChainEvent): Promise<void> {
    await this.supabase.from("analytics_events").insert({
      event_type: event.type,
      user_id: event.userId,
      article_id: event.articleId,
      timestamp: new Date().toISOString(),
      data: event.data,
    });
  }

  async getMetrics(timeRange: "day" | "week" | "month"): Promise<Metrics> {
    const { data } = await this.supabase
      .from("analytics_events")
      .select("*")
      .gte("timestamp", getTimeRangeStart(timeRange));

    return calculateMetrics(data);
  }
}
```

**Metrics:**

- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Engagement Rate
- Average Session Duration
- Bounce Rate

---

### Analytics 3: Clerk Analytics (Users)

**Purpose:** Track user metrics (signups, retention, subscriptions)

**Events Tracked:**

- User Signups
- User Logins
- Email Verifications
- Subscription Upgrades
- Subscription Cancellations

**Implementation:**

```typescript
// lib/services/clerkAnalytics.ts
class ClerkAnalytics {
  private clerk: ClerkClient;

  async trackEvent(event: UserEvent): Promise<void> {
    await this.clerk.analytics.track({
      event: event.type,
      userId: event.userId,
      properties: {
        ...event.properties,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async getUserMetrics(): Promise<UserMetrics> {
    const users = await this.clerk.users.getUserList();

    return {
      totalUsers: users.totalCount,
      activeUsers: users.data.filter((u) => u.lastSignInAt).length,
      subscriptionTiers: calculateSubscriptionTiers(users.data),
    };
  }
}
```

**Metrics:**

- Total Users
- Active Users
- Subscription Tiers Distribution
- Retention Rate
- Churn Rate

---

## 🔄 DATA SYNCHRONIZATION

### Sync Strategy: Offline-First

**Priority:** Local First, Sync When Online

**Flow:**

1. User action → Store in IndexedDB (immediate)
2. Check online status
3. If online → Sync to Supabase/Blockchain
4. If offline → Queue for later sync
5. Background sync when online

**Conflict Resolution:**

- Last Write Wins (for user actions)
- Server Wins (for content updates)
- Manual Resolution (for critical conflicts)

---

## ✅ DATA QUALITY & ANALYTICS COMPLETE

**Status:** ✅ Data Quality & Analytics Complete  
**Next:** Update CLAUDE.md and coordinate with Progress/Project Manager  
**Next Agent:** Develop Agent (`/develop`) - After data approval

**Data Quality Rules:** 5 comprehensive rules  
**Analytics Integration:** 3 analytics services (Dune, Supabase, Clerk)  
**Sync Strategy:** Offline-first with background sync
