# Server-Side RSS Fetching Implementation

## Overview

Server-side RSS fetching has been implemented to bypass CORS restrictions and rate limits from proxy services. The implementation uses Next.js API routes to fetch RSS feeds directly from source websites.

## Free News Sources Verified

### ✅ Free and Public RSS Feeds (No Authentication Required)

The following sources provide free public RSS feeds that can be used for personal/non-commercial purposes:

#### General News
- **BBC News** - Free for personal/non-commercial use (requires license for business use)
  - RSS Feed: `http://feeds.bbci.co.uk/news/rss.xml`
  - Terms: https://www.bbc.com/pages/terms-of-use
  
- **CNN** - Public RSS feeds available
  - RSS Feed: `http://rss.cnn.com/rss/edition.rss`
  - Terms: Check CNN RSS terms before commercial use
  
- **Reuters** - Public RSS feeds
  - RSS Feed: `https://www.reuters.com/rssFeed/worldNews`
  
- **Associated Press** - Public RSS feeds
  - RSS Feed: `https://apnews.com/apf-topnews`
  
- **The Guardian** - Public RSS feeds
  - RSS Feed: `https://www.theguardian.com/world/rss`

#### Technology
- **Wired** - Public RSS feeds
- **MIT Technology Review** - Public RSS feeds
- **TechCrunch** - Public RSS feeds
- **The Verge** - Public RSS feeds
- **Ars Technica** - Public RSS feeds

#### Business
- **Bloomberg** - Public RSS feeds (check terms for commercial use)
- **Financial Times** - Public RSS feeds (may require subscription for full access)
- **MarketWatch** - Public RSS feeds
- **Yahoo Finance** - Public RSS feeds

#### Science
- **Nature** - Public RSS feeds
- **Scientific American** - Public RSS feeds
- **National Geographic** - Public RSS feeds
- **Science Magazine** - Public RSS feeds

#### Sports
- **ESPN** - Public RSS feeds
- **BBC Sport** - Public RSS feeds
- **Sky Sports** - Public RSS feeds

#### Entertainment
- **Variety** - Public RSS feeds
- **Rolling Stone** - Public RSS feeds
- **Entertainment Weekly** - Public RSS feeds

#### Health
- **WebMD** - Public RSS feeds
- **Healthline** - Public RSS feeds
- **Medical News Today** - Public RSS feeds
- **Mayo Clinic** - Public RSS feeds
- **NIH News** - Public RSS feeds

## Implementation Details

### API Route: `/api/rss`

**Endpoint**: `GET /api/rss?category={category}`

**Parameters**:
- `category` (required): One of: `tech`, `crypto`, `business`, `science`, `health`, `sports`, `entertainment`, `social`, `general`

**Response**:
```json
{
  "articles": [...],
  "category": "tech",
  "totalSources": 9,
  "successfulSources": 7,
  "totalArticles": 50
}
```

### How It Works

1. **Server-Side Fetching**: The API route runs on the Next.js server, bypassing browser CORS restrictions
2. **Direct RSS URLs**: Uses direct RSS feed URLs (no proxy needed)
3. **Parallel Fetching**: Fetches all RSS sources for a category in parallel
4. **XML Parsing**: Parses RSS XML server-side using regex (no external libraries needed)
5. **Deduplication**: Removes duplicate articles by URL
6. **Fallback**: If server-side fails, falls back to client-side fetching with retry logic

### Benefits

- ✅ **No CORS Issues**: Server-side fetching bypasses browser CORS restrictions
- ✅ **No Rate Limits**: Direct fetching avoids proxy service rate limits (429 errors)
- ✅ **Faster**: Server-side is typically faster than client-side proxy requests
- ✅ **More Reliable**: Direct connection to source websites
- ✅ **Free**: Uses free public RSS feeds (no API keys needed)

### Terms of Use Compliance

**Important Notes**:
- Most RSS feeds are free for **personal/non-commercial use**
- **Business/commercial use** may require:
  - License from source (e.g., BBC requires metadata license for business use)
  - Attribution requirements (e.g., BBC requires "BBC News" attribution)
  - Terms compliance (check each source's terms)

**Recommendations**:
- For production/commercial use, review each source's terms of use
- Add proper attribution to articles (source name + link)
- Consider obtaining licenses for commercial use if required
- Monitor source terms for changes

## Usage

The server-side RSS fetching is automatically used when fetching articles:

```typescript
// In useArticles hook
const serverResponse = await fetch(`/api/rss?category=${category}`);
```

If server-side fetching fails, it automatically falls back to client-side fetching with retry logic.

## Testing

To test the server-side RSS fetching:

1. Navigate to any category page
2. Check browser console for logs:
   - `✅ Server-side RSS fetch succeeded` - Server-side worked
   - `Server-side RSS fetch failed, falling back to client-side` - Fallback triggered
3. Verify articles are loading correctly

## Future Improvements

- Add caching layer (Redis) to reduce server load
- Add rate limiting per source to respect source limits
- Add monitoring/analytics for RSS feed health
- Consider using RSS parsing library for better XML handling
- Add support for Atom feeds (not just RSS)

