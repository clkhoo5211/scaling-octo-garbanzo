# MCP Server Integration Guide

## ✅ Integration Complete!

Your React app is now connected to the MCP server deployed on Vercel.

## 🔧 How It Works

1. **Primary Method**: Direct RSS fetch (fast, no server dependency)
2. **Fallback Method**: MCP server (bypasses CORS when direct fetch fails)

## 📋 Setup Steps

### 1. GitHub Secrets Configuration

You've already set `VITE_MCP_SERVER_URL` in GitHub Settings → Secrets and variables → Actions.

**Value should be:**
```
https://web3news-mcp-server.vercel.app/api/server
```

### 2. Local Development (.env.local)

Create/update `.env.local`:

```bash
VITE_MCP_SERVER_URL=https://web3news-mcp-server.vercel.app/api/server
```

### 3. How It Works

The RSS service (`src/lib/services/rssService.ts`) now:

1. **Tries direct fetch first** (fast, works for most feeds)
2. **Falls back to MCP server** if CORS blocks the direct fetch
3. **Logs success/failure** for debugging

## 📊 Testing

### Test MCP Server Directly

```bash
curl -X POST https://web3news-mcp-server.vercel.app/api/server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_rss_feed",
      "arguments": {
        "feed_url": "https://cointelegraph.com/rss"
      }
    }
  }'
```

### Test in Browser Console

```javascript
// Check if MCP server is available
import { checkMCPServerAvailable } from './lib/services/mcpService';
const available = await checkMCPServerAvailable();
console.log('MCP Server Available:', available);

// Test fetching a feed via MCP
import { fetchRSSFeedViaMCP } from './lib/services/mcpService';
const result = await fetchRSSFeedViaMCP(
  'https://cointelegraph.com/rss',
  'CoinTelegraph',
  'crypto'
);
console.log('MCP Result:', result);
```

## 🎯 Benefits

- ✅ **Bypasses CORS**: MCP server acts as a proxy
- ✅ **Automatic Fallback**: Only uses MCP when needed
- ✅ **No Breaking Changes**: Existing RSS feeds still work
- ✅ **Better Coverage**: More RSS feeds will work now

## 📝 Files Changed

1. **`src/lib/services/mcpService.ts`** (NEW)
   - MCP client implementation
   - Parses MCP server responses
   - Converts to Article format

2. **`src/lib/services/rssService.ts`** (UPDATED)
   - Added MCP fallback logic
   - Automatic CORS detection
   - Seamless integration

3. **`src/vite-env.d.ts`** (UPDATED)
   - Added `VITE_MCP_SERVER_URL` type definition

## 🚀 Next Steps

1. **Deploy to GitHub Pages** - The MCP server URL will be used automatically
2. **Monitor Console Logs** - Check which feeds use MCP fallback
3. **Test Different Categories** - Verify RSS feeds work across all categories

## 🔍 Debugging

### Check MCP Server Status

```javascript
// In browser console
fetch('https://web3news-mcp-server.vercel.app/api/server')
  .then(r => r.json())
  .then(console.log);
```

### Monitor RSS Fetching

Open browser DevTools → Console → Filter by "MCP" or "RSS"

You'll see:
- `⚠️ CORS blocked RSS feed... Trying MCP server fallback...`
- `✅ MCP server successfully fetched...`
- `⚠️ MCP server also failed...`

## 📚 Related Files

- MCP Server Repo: `projects/web3news-mcp-server/`
- MCP Server URL: https://web3news-mcp-server.vercel.app/api/server
- RSS Service: `src/lib/services/rssService.ts`
- MCP Service: `src/lib/services/mcpService.ts`

