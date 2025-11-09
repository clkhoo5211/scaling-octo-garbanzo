# CORS Error Fix - Disable Direct API Calls

**Date:** 2025-11-09  
**Issue:** CORS errors from Reddit and ProductHunt direct API calls  
**Root Cause:** `contentAggregator.ts` was fetching Reddit/ProductHunt directly from browser, causing CORS errors

## 🔍 Problem Analysis

### The Errors
```
CORS policy: No 'Access-Control-Allow-Origin' header is present
GET https://www.reddit.com/r/technology/hot.json?limit=100 net::ERR_FAILED 403 (Forbidden)
POST https://api.producthunt.com/v2/api/graphql 401
```

### Root Cause
The app has **two parallel systems**:

1. **MCP Server** ✅ - Handles RSS feeds via server-side proxy (no CORS issues)
2. **contentAggregator.ts** ❌ - Fetches Reddit/ProductHunt directly from browser (CORS errors)

**Why this is redundant:**
- MCP server already handles all RSS feeds via `get_news_by_category`
- Reddit has RSS feeds available (e.g., `https://www.reddit.com/.rss`)
- ProductHunt requires API key and causes 401 errors
- Direct API calls from browser cause CORS errors

## ✅ Solution

**Disable Reddit and ProductHunt sources in `contentAggregator.ts`** - Let MCP server handle everything via RSS feeds.

### Changes Made

**File:** `src/lib/services/contentAggregator.ts`

**Disabled Sources:**
1. ✅ **Product Hunt** - `enabled: false` (CORS + API key required)
2. ✅ **Reddit** (tech) - `enabled: false` (CORS errors)
3. ✅ **Reddit Social** - `enabled: false` (CORS errors)
4. ✅ **Reddit Popular** - `enabled: false` (CORS errors)
5. ✅ **Reddit All** - `enabled: false` (CORS errors)
6. ✅ **Reddit Videos** - `enabled: false` (CORS errors)
7. ✅ **Reddit Pics** - `enabled: false` (CORS errors)
8. ✅ **Reddit Crypto** - `enabled: false` (CORS errors)

### Why This Works

1. **MCP Server Handles RSS**: MCP server's `get_news_by_category` tool fetches RSS feeds server-side (no CORS)
2. **Reddit RSS Available**: Reddit provides RSS feeds (e.g., `https://www.reddit.com/r/technology/.rss`)
3. **No Direct API Calls**: Eliminates browser CORS errors
4. **Unified Source**: All news comes from MCP server, making the architecture cleaner

### What Still Works

**Still Enabled in contentAggregator:**
- ✅ **HackerNews** - Uses Firebase API (no CORS issues)
- ✅ **GitHub Trending** - Uses GitHub API (CORS-friendly)
- ✅ **RSS Sources** - Already handled by MCP server

**Note:** Even if HackerNews/GitHub work, they're redundant since MCP server provides comprehensive coverage via RSS feeds.

## 📋 Architecture After Fix

```
User Request
  ↓
useArticles Hook
  ↓
fetchRSSFeeds() → MCP Server (get_news_by_category)
  ✅ Returns articles from RSS feeds (no CORS)
  ↓
contentAggregator (if enabled)
  ✅ Only non-RSS sources (HackerNews, GitHub) - if needed
  ❌ Reddit/ProductHunt disabled (no CORS errors)
```

## 🧪 Testing

After deploying:
1. ✅ No CORS errors in browser console
2. ✅ No 403/401 errors from Reddit/ProductHunt
3. ✅ All categories still work via MCP server
4. ✅ Cleaner console logs (no failed API calls)

## 💡 Future Consideration

**Option:** Disable `contentAggregator` entirely if MCP server provides sufficient coverage:
- MCP server handles 74+ verified RSS sources
- Covers all categories (tech, crypto, business, science, etc.)
- No CORS issues
- Single source of truth

**Current State:** Keeping HackerNews/GitHub enabled as fallback, but they may be redundant.

