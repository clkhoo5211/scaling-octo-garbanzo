# Adding New RSS Sources

## Quick Guide

To add a new RSS source, simply create a new source instance in the appropriate category file:

### Example: Adding a Tech RSS Source

1. Open `src/lib/sources/rss/tech.ts`
2. Add a new source:

```typescript
export const myNewSource = new BaseRSSSource({
  id: "my-new-source",           // Unique identifier
  name: "My New Source",         // Display name
  url: "https://example.com/rss", // RSS feed URL
  category: "tech",              // Category: tech | crypto | social | general
  enabled: true,                 // Enable/disable this source
  updateFrequency: 1800000,      // Expected update frequency in ms (30 min)
  maxArticles: 20,               // Max articles to fetch per request
});
```

3. Add it to the registry in `src/lib/sources/rssRegistry.ts`:

```typescript
import { myNewSource } from "./rss/tech";

export function getAllRSSSources(): RSSSourceHandler[] {
  return [
    // ... existing sources
    techSources.myNewSource,  // Add here
    // ...
  ].filter(source => source.config.enabled);
}
```

That's it! The source will automatically:
- ✅ Use adaptive rate limiting
- ✅ Fetch in real-time (no caching)
- ✅ Handle errors gracefully
- ✅ Appear in the appropriate category

## Source Configuration Options

```typescript
{
  id: string;                    // Required: Unique identifier
  name: string;                  // Required: Display name
  url: string;                   // Required: RSS feed URL
  category: "tech" | "crypto" | "social" | "general";  // Required
  enabled: boolean;               // Required: Enable/disable
  updateFrequency?: number;      // Optional: Expected update frequency (ms)
  maxArticles?: number;           // Optional: Max articles (default: 50)
}
```

## Adaptive Rate Limiting

The system automatically adjusts fetch intervals based on:
- **Expected frequency**: If you set `updateFrequency`, it uses that as a base
- **Historical data**: Learns from previous fetches
- **Error rate**: Increases interval if errors occur frequently
- **Update patterns**: Adjusts based on when sources actually update

**Minimum interval**: 2 minutes  
**Maximum interval**: 1 hour  
**Default interval**: 5 minutes (for new sources)

## Real-Time Fetching

- ✅ **No caching**: Articles are always fetched fresh
- ✅ **No history**: Previous articles are not stored
- ✅ **Always current**: Latest articles on every fetch
- ✅ **Cache headers**: Uses `cache: 'no-store'` to prevent browser caching

## Category Files

- **Tech**: `src/lib/sources/rss/tech.ts`
- **Crypto**: `src/lib/sources/rss/crypto.ts`
- **Social**: `src/lib/sources/rss/social.ts`
- **General**: `src/lib/sources/rss/general.ts`

## Testing Your Source

After adding a source:

1. Check browser console for fetch logs
2. Look for: `✓ {Source Name}: X articles`
3. If errors: `⚠ {Source Name}: {error message}`

## Disabling a Source

Simply set `enabled: false` - the source will be skipped but remain in the code for easy re-enabling.

