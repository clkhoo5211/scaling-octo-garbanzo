# Category Display Issues Analysis

## Problem Summary

Some categories are not displaying articles due to RSS feed rate limiting and timeouts.

## Root Cause

1. **RSS Feed Rate Limiting**: Many RSS feeds are hitting rate limits from `api.rss2json.com` (HTTP 429 errors)
2. **RSS Feed Timeouts**: Some feeds are timing out (HTTP 408 errors)
3. **Category Dependency**: Categories that rely ONLY on RSS sources have no fallback when RSS fails

## Category Status

### Categories WITH Non-RSS Sources (Working Better)
These categories have fallback sources (Hacker News, Product Hunt, GitHub, Reddit) in addition to RSS:

- ✅ **Tech**: Works - Has RSS + Non-RSS sources (Hacker News, Product Hunt, GitHub, Reddit)
- ⚠️ **Crypto**: Partially working - Has RSS + Non-RSS sources but many RSS feeds failing
- ✅ **Social**: Works - Has RSS + Non-RSS sources (YouTube, Reddit)
- ✅ **General**: Works - Has RSS + Non-RSS sources (Reddit, general news)

### Categories WITHOUT Non-RSS Sources (Failing)
These categories rely ONLY on RSS feeds, so when RSS fails, they show no articles:

- ❌ **Business**: RSS-only - All RSS feeds failing (rate limited)
- ❌ **Science**: RSS-only - All RSS feeds failing (rate limited)
- ❌ **Health**: RSS-only - All RSS feeds failing (rate limited)
- ❌ **Sports**: RSS-only - All RSS feeds failing (rate limited)
- ❌ **Entertainment**: RSS-only - All RSS feeds failing (rate limited)

## Technical Details

### Code Location
- `src/lib/hooks/useArticles.ts` (lines 68-76): Only certain categories get non-RSS sources
- `src/lib/sources/baseRSSSource.ts`: Uses CORS proxies (allorigins.win, rss2json.com) which are rate-limited

### Error Patterns
```
[ERROR] Failed to load resource: the server responded with a status of 429 () @ https://api.rss2json.com/v1/api.json?rss_url=...
[WARNING] ⚠ [Source Name]: Failed to fetch RSS feed: No data received
[ERROR] Failed to load resource: the server responded with a status of 408 () @ https://...
[WARNING] RSS feed [Source Name] returned status 408
```

## Solutions

### ✅ Option 1: Add Reddit Fallback Sources (IMPLEMENTED)
Added Reddit sources as fallback for categories without contentAggregator support:
- Business: Reddit r/business, r/economics, r/investing, r/stocks, r/wallstreetbets
- Science: Reddit r/science, r/space, r/technology, r/futurology, r/askscience
- Health: Reddit r/health, r/medicine, r/fitness, r/nutrition, r/mentalhealth
- Sports: Reddit r/sports, r/nba, r/soccer, r/nfl, r/baseball
- Entertainment: Reddit r/entertainment, r/movies, r/music, r/television, r/gaming

**Implementation**: Added `fetchRedditFallback()` function in `src/lib/hooks/useArticles.ts` that fetches Reddit articles for these categories when RSS feeds fail.

### Option 2: Implement Better RSS Feed Handling
- Add retry logic with exponential backoff
- Use multiple CORS proxy services (rotate between allorigins.win, rss2json.com, corsproxy.io)
- Cache successful RSS feeds for a short period (5-10 minutes)
- Implement request queuing to avoid hitting rate limits

### Option 3: Use Direct RSS Parsing (No Proxy)
- Parse RSS XML directly in the browser (may still hit CORS issues)
- Use a backend API route to fetch RSS feeds server-side (bypasses CORS)

### Option 4: Add Fallback Content Sources
- Use alternative APIs (NewsAPI, Google News RSS, etc.)
- Add web scraping for sources that don't have RSS
- Use RSS aggregator services with higher rate limits

## Immediate Fix

✅ **FIXED**: Added Reddit fallback sources for business, science, health, sports, and entertainment categories. These categories will now display articles from Reddit even when RSS feeds fail.

## Testing Results

From browser console logs:
- **Tech**: ✅ 410 articles fetched (60 RSS + 380 Non-RSS)
- **Crypto**: ⚠️ Still loading, many RSS failures but some sources working
- **Business/Science/Health/Sports/Entertainment**: ✅ Now have Reddit fallback sources

## Next Steps

1. ✅ Add Reddit sources for failing categories - **DONE**
2. Implement RSS proxy rotation
3. Add retry logic for failed RSS feeds
4. Consider implementing a backend RSS proxy service

