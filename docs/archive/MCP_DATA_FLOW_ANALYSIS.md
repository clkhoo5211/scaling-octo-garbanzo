# MCP Server Data Flow Analysis

**Date:** 2025-11-09  
**Question:** Are all news list, news details, and news content pulled from MCP server?

## 📊 Current Data Flow

### ✅ What MCP Server Provides

**1. News List (Article Listings)**
- ✅ **YES** - MCP server provides article metadata via `get_news_by_category` tool
- **Data includes:**
  - Title
  - URL (link to original article)
  - Source name
  - Published date
  - Summary/excerpt (first 200 chars)
  - Category

**2. News Details (Article Metadata)**
- ✅ **YES** - Same as above, article details come from MCP server
- **Data includes:**
  - Article ID (generated: `mcp-category-{source}-{timestamp}-{index}`)
  - Title
  - URL
  - Source
  - Published date
  - Excerpt/summary
  - Category

**3. News Content (Full Article Body)**
- ❌ **NO** - Full article content is **NOT** fetched from MCP server
- **How it works:**
  - MCP server only returns article metadata (title, URL, excerpt)
  - When user clicks an article, the app fetches full content directly from the original article URL
  - Uses CORS proxies (allorigins.win, corsproxy.io, etc.) to bypass CORS
  - Uses Readability library to extract clean content from HTML
  - This happens client-side in `articleContent.ts` service

## 🔄 Complete Data Flow

### Step 1: Article List Fetching
```
User selects category (e.g., "Tech")
  ↓
fetchRSSFeeds("tech")
  ↓
fetchNewsByCategoryViaMCP("tech")  ← MCP Server
  ↓
MCP Server returns article list with metadata
  ↓
Articles displayed in list view
```

### Step 2: Article Details Display
```
User clicks article from list
  ↓
Article metadata already available (from Step 1)
  ↓
Display article title, source, date, excerpt
```

### Step 3: Full Article Content Fetching
```
User opens article detail page
  ↓
ArticleReaderClient component
  ↓
fetchArticleContent(article.url)  ← NOT MCP Server
  ↓
Fetches HTML from original article URL via CORS proxy
  ↓
Uses Readability to extract clean content
  ↓
Displays full article content
```

## 📋 Summary Table

| Data Type | Source | MCP Server? |
|-----------|--------|-------------|
| **Article List** | MCP `get_news_by_category` | ✅ YES |
| **Article Metadata** | MCP `get_news_by_category` | ✅ YES |
| **Article Excerpt** | MCP `get_news_by_category` | ✅ YES |
| **Full Article Content** | Original article URL (via CORS proxy) | ❌ NO |

## 🎯 Answer to Your Question

**"Are all news list, news details, and news content pulled from MCP server?"**

**Answer:**
- ✅ **News List:** YES - Pulled from MCP server
- ✅ **News Details:** YES - Pulled from MCP server (metadata only)
- ❌ **News Content:** NO - Pulled directly from original article URLs (not from MCP server)

## 💡 Why This Design?

**MCP Server Role:**
- Acts as an **aggregation service** for article discovery
- Provides article metadata efficiently from multiple sources
- Bypasses CORS for RSS feed fetching

**Article Content Fetching:**
- Full article content is fetched **on-demand** when user opens an article
- Uses original article URL to get latest content
- Uses CORS proxies to bypass browser restrictions
- Uses Readability to extract clean, readable content

**Benefits:**
- MCP server doesn't need to store/fetch full article content (saves bandwidth)
- Users get latest article content directly from source
- Better performance (only fetch content when needed)
- More accurate content (direct from source, not cached)

## 🔍 Code References

**MCP Article Fetching:**
- `src/lib/services/mcpService.ts` - `fetchNewsByCategoryViaMCP()`
- Returns: `{ title, url, source, publishedAt, excerpt, category }`

**Article Content Fetching:**
- `src/lib/services/articleContent.ts` - `fetchArticleContent()`
- Fetches from: Original article URL via CORS proxy
- Uses: Readability library to parse HTML

**Article Display:**
- `src/components/article/ArticleReaderClient.tsx`
- Uses article metadata from MCP + fetches content separately

