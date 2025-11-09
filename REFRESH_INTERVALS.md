# Refresh Intervals and Cache Settings

**Date:** 2025-11-09  
**Question:** What is the interval for refreshing news articles?

## ⏱️ Refresh Intervals Summary

### 1. Article List Refresh (MCP Server Polling)

**Interval:** **2 minutes** (120,000 ms)

**Location:** `src/lib/hooks/useArticles.ts` (line 306)

```typescript
refetchInterval: options?.enableRealtime !== false ? 2 * 60 * 1000 : false
```

**What it does:**
- Automatically polls MCP server every 2 minutes for new articles
- Only updates UI when new articles are found
- Can be disabled by setting `enableRealtime: false`

**Note:** This is the main refresh interval for fetching new articles from the MCP server.

---

### 2. Article Cache TTL (Time To Live)

**Interval:** **30 minutes** (1,800,000 ms)

**Location:** `src/lib/services/indexedDBCache.ts` (line 30)

```typescript
ttl: 30 * 60 * 1000, // 30 minutes
```

**What it does:**
- Articles are cached in IndexedDB for 30 minutes
- After 30 minutes, cached articles are considered expired
- Expired articles are automatically removed from cache

---

### 3. Article Content Cache TTL

**Interval:** **30 minutes** (1,800,000 ms)

**Location:** `src/lib/services/articleContent.ts` (line 23)

```typescript
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
```

**What it does:**
- Full article content (HTML) is cached for 30 minutes
- Prevents re-fetching the same article content multiple times
- Reduces bandwidth and improves performance

---

### 4. React Query Stale Time

**Interval:** **2 minutes** (120,000 ms)

**Location:** `src/lib/hooks/useArticles.ts` (line 297)

```typescript
staleTime: 2 * 60 * 1000, // 2 minutes - use cached data
```

**What it does:**
- Data is considered "fresh" for 2 minutes
- React Query won't refetch if data is less than 2 minutes old
- Works together with `refetchInterval` for optimal performance

---

### 5. React Query Garbage Collection Time

**Interval:** **5 minutes** (300,000 ms)

**Location:** `src/lib/hooks/useArticles.ts` (line 298)

```typescript
gcTime: 5 * 60 * 1000, // 5 minutes
```

**What it does:**
- Unused query data is kept in memory for 5 minutes
- After 5 minutes of inactivity, data is garbage collected
- Helps manage memory usage

---

### 6. Adaptive Rate Limiter (RSS Sources)

**Intervals:** Variable (adaptive)

**Location:** `src/lib/sources/adaptiveRateLimiter.ts`

```typescript
MIN_INTERVAL = 120000;    // 2 minutes minimum
MAX_INTERVAL = 3600000;   // 1 hour maximum
BASE_INTERVAL = 300000;   // 5 minutes default
```

**What it does:**
- Dynamically adjusts fetch intervals based on source update frequency
- Prevents over-fetching from slow-updating sources
- Adapts to source behavior (frequent updates = shorter interval)

---

## 📊 Complete Timeline

```
┌─────────────────────────────────────────────────────────┐
│ 0:00 - Initial fetch from MCP server                    │
│ 0:02 - Data becomes "stale" (but still usable)         │
│ 0:02 - First auto-refresh (polling)                      │
│ 0:04 - Second auto-refresh                              │
│ 0:05 - Unused data garbage collected                    │
│ 0:06 - Third auto-refresh                               │
│ ...                                                      │
│ 0:30 - Cache expires (articles removed from cache)      │
│ ...                                                      │
│ 1:00 - Cache expires for content                        │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Summary Table

| Type | Interval | Purpose |
|------|----------|---------|
| **MCP Server Polling** | **2 minutes** | Fetch new articles from MCP server |
| **Article Cache TTL** | 30 minutes | Keep articles in IndexedDB cache |
| **Content Cache TTL** | 30 minutes | Keep article HTML content cached |
| **Stale Time** | 2 minutes | React Query considers data fresh |
| **GC Time** | 5 minutes | Cleanup unused query data |
| **Rate Limiter (Min)** | 2 minutes | Minimum RSS fetch interval |
| **Rate Limiter (Max)** | 1 hour | Maximum RSS fetch interval |
| **Rate Limiter (Base)** | 5 minutes | Default RSS fetch interval |

## 💡 Key Points

1. **Main Refresh:** Articles are fetched from MCP server **every 2 minutes**
2. **Caching:** Articles are cached for **30 minutes** to reduce server load
3. **Performance:** Stale time of **2 minutes** ensures fresh data without over-fetching
4. **Adaptive:** RSS sources use adaptive intervals (2 min - 1 hour) based on update frequency

## 🔧 How to Change Intervals

### Change MCP Polling Interval

Edit `src/lib/hooks/useArticles.ts`:

```typescript
refetchInterval: options?.enableRealtime !== false ? 5 * 60 * 1000 : false, // 5 minutes
```

### Change Cache TTL

Edit `src/lib/services/indexedDBCache.ts`:

```typescript
ttl: 60 * 60 * 1000, // 1 hour
```

### Disable Auto-Refresh

Pass `enableRealtime: false` to `useArticles`:

```typescript
const { data } = useArticles('tech', { enableRealtime: false });
```

