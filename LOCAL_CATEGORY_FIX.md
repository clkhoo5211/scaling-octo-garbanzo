# Local Category Fix - Malaysia News Issue

**Date:** 2025-11-09  
**Issue:** "Local (Malaysia)" category was showing non-Malaysia news  
**Root Cause:** MCP server maps "local" to "general", returning global news instead of country-specific news

## 🔍 Problem Analysis

### The Issue
When users clicked "Local (Malaysia)", they saw general news from sources like BBC, Reuters, etc., instead of Malaysia-specific sources like The Star Malaysia and New Straits Times.

### Root Cause
1. **MCP Mapping**: The `mapCategoryToMCP()` function maps `'local'` → `'general'` (line 34 in `mcpService.ts`)
2. **MCP Success**: MCP server successfully returns general news, so the fallback to country-specific RSS feeds never happens
3. **Fallback Logic**: The country-specific RSS feed logic (lines 188-193 in `rssService.ts`) only runs when MCP fails

### Flow Before Fix
```
User clicks "Local (Malaysia)"
  → fetchRSSFeeds('local', 'MY')
    → Try MCP category fetch ('local' → 'general')
      → ✅ MCP succeeds with general news
        → Return general news (BBC, Reuters, etc.) ❌
    → Never reaches country-specific RSS feeds
```

## ✅ Solution

**Skip MCP for "local" category** - go directly to country-specific RSS feeds.

### Code Change
**File:** `src/lib/services/rssService.ts`

**Before:**
```typescript
const useMCPCategoryFetch = import.meta.env.VITE_USE_MCP_CATEGORY_FETCH !== 'false';
```

**After:**
```typescript
// Skip MCP for "local" category - it needs country-specific sources, not general news
// MCP maps "local" to "general" which returns global news, not country-specific news
const useMCPCategoryFetch = import.meta.env.VITE_USE_MCP_CATEGORY_FETCH !== 'false' && category !== 'local';
```

### Flow After Fix
```
User clicks "Local (Malaysia)"
  → fetchRSSFeeds('local', 'MY')
    → Skip MCP (category === 'local')
    → Get country-specific sources: getCountryNewsSources('MY')
      → Returns: [The Star Malaysia, New Straits Times]
        → Fetch Malaysia RSS feeds ✅
          → Return Malaysia news ✅
```

## 📋 Malaysia News Sources

The following Malaysia-specific sources are configured:

1. **The Star Malaysia**
   - URL: `https://www.thestar.com.my/rss/News`
   - Category: `general`
   - Max Articles: 30

2. **New Straits Times**
   - URL: `https://www.nst.com.my/rss/news`
   - Category: `general`
   - Max Articles: 30

## 🧪 Testing

After deploying this fix:

1. **Geolocation Detection**: The app automatically detects user's country via IP geolocation
2. **Malaysia Users**: If detected as Malaysia (MY), "Local" category will show "Local (Malaysia)"
3. **Malaysia Sources**: Should only show articles from The Star Malaysia and New Straits Times
4. **Other Countries**: Will show their respective country-specific sources

## 📝 Notes

- **Geolocation**: Uses `useGeolocation()` hook which detects country via IP geolocation APIs
- **Fallback**: If geolocation fails, defaults to US sources
- **Cache**: Geolocation is cached for 24 hours to avoid repeated API calls
- **Other Categories**: All other categories (Tech, Crypto, Business, etc.) continue to use MCP server

## 🚀 Deployment

1. ✅ Code fix applied
2. ⏳ Build and deploy to GitHub Pages
3. ⏳ Test "Local (Malaysia)" category shows only Malaysia news
4. ⏳ Verify other categories still work with MCP

