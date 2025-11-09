# MCP Server Deployment Guide - Separate Backend

## ✅ Architecture Overview

```
┌─────────────────────┐         HTTP/SSE         ┌─────────────────────┐
│   React App         │ ────────────────────────> │   MCP Server        │
│   (GitHub Pages)     │                           │   (Separate Repo)   │
│   Static Files      │ <──────────────────────── │   (Vercel/Railway)  │
└─────────────────────┘         Response         └─────────────────────┘
```

## 🎯 Deployment Options

### Option 1: Vercel (Recommended for Python/Node.js)

**Pros:**
- ✅ Free tier available
- ✅ Easy GitHub integration
- ✅ Supports Python and Node.js
- ✅ Automatic HTTPS
- ✅ Serverless functions

**Steps:**
1. Create separate repo: `web3news-mcp-server`
2. Deploy to Vercel: Connect GitHub repo → Auto-deploy
3. Get URL: `https://your-mcp-server.vercel.app`
4. Connect from React: Use HTTP/SSE transport

### Option 2: Railway

**Pros:**
- ✅ Free tier ($5 credit/month)
- ✅ Supports Python/Node.js
- ✅ Easy deployment
- ✅ Auto HTTPS

**Steps:**
1. Create separate repo: `web3news-mcp-server`
2. Deploy to Railway: Connect GitHub → Deploy
3. Get URL: `https://your-app.railway.app`
4. Connect from React: Use HTTP transport

### Option 3: Render

**Pros:**
- ✅ Free tier available
- ✅ Supports Python/Node.js
- ✅ Auto-deploy from GitHub

**Steps:**
1. Create separate repo: `web3news-mcp-server`
2. Deploy to Render: New Web Service → Connect GitHub
3. Get URL: `https://your-app.onrender.com`
4. Connect from React: Use HTTP transport

## 📋 Implementation Steps

### Step 1: Create MCP Server Repo

```bash
# Create new repo
mkdir web3news-mcp-server
cd web3news-mcp-server

# Copy crypto-rss-mcp or create new server
# Structure:
# - server.py (MCP server code)
# - requirements.txt (Python dependencies)
# - vercel.json or railway.json (deployment config)
```

### Step 2: Deploy MCP Server

**For Vercel (Python):**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.py"
    }
  ]
}
```

**For Railway:**
```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "python server.py"
```

### Step 3: Connect from React App

```typescript
// src/lib/services/mcpClient.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const MCP_SERVER_URL = import.meta.env.VITE_MCP_SERVER_URL || 'https://your-mcp-server.vercel.app';

export async function callMCPServer(tool: string, args: any) {
  const client = new Client({
    name: 'web3news-client',
    version: '1.0.0',
  }, {
    transport: {
      type: 'sse',
      url: `${MCP_SERVER_URL}/sse`,
    },
  });

  await client.connect();
  
  const result = await client.callTool({
    name: tool,
    arguments: args,
  });
  
  await client.close();
  return result;
}
```

### Step 4: Use in React Components

```typescript
// src/lib/services/rssService.ts
import { callMCPServer } from './mcpClient';

export async function fetchRSSFeedsViaMCP(category: string) {
  try {
    const result = await callMCPServer('get_rss_feed', {
      feed_url: `https://feeds.bbci.co.uk/news/rss.xml`
    });
    return result.content;
  } catch (error) {
    console.error('MCP server error:', error);
    // Fallback to direct RSS fetching
    return fetchRSSFeeds(category);
  }
}
```

## 🔧 Environment Variables

**React App (.env.local):**
```bash
VITE_MCP_SERVER_URL=https://your-mcp-server.vercel.app
```

**MCP Server (Vercel/Railway):**
```bash
PYTHON_VERSION=3.10
PORT=8000
```

## 📊 Pros & Cons

### ✅ Pros:
- ✅ MCP server runs separately (can use Python/Node.js)
- ✅ React app stays pure (no backend code)
- ✅ Can scale MCP server independently
- ✅ Free tiers available on most platforms

### ❌ Cons:
- ⚠️ Requires separate deployment
- ⚠️ Additional latency (network call)
- ⚠️ Need to manage CORS
- ⚠️ Costs money if traffic exceeds free tier

## 🎯 Recommendation

**For your use case (React-only, no backend preference):**

**Option A: Keep Current Approach** ⭐ RECOMMENDED
- ✅ No backend needed
- ✅ Works perfectly
- ✅ Zero cost
- ✅ No deployment complexity

**Option B: Add MCP Server** (if you want more features)
- Deploy crypto-rss-mcp to Vercel
- Connect from React via HTTP/SSE
- Use for crypto category only
- Keep direct RSS for other categories

## 📝 Next Steps (If You Want MCP)

1. **Create MCP Server Repo:**
   ```bash
   git clone https://github.com/kukapay/crypto-rss-mcp.git web3news-mcp-server
   ```

2. **Deploy to Vercel:**
   - Connect GitHub repo
   - Auto-deploy
   - Get URL

3. **Add MCP Client to React:**
   - Install `@modelcontextprotocol/sdk`
   - Create `mcpClient.ts`
   - Update `rssService.ts` to use MCP

4. **Test:**
   - Deploy React app
   - Test MCP connection
   - Verify RSS feeds work

## 💡 Conclusion

**Yes, you CAN deploy MCP separately**, but:
- Requires backend deployment (Vercel/Railway/Render)
- Adds complexity and latency
- Your current direct RSS approach is simpler and works great

**Recommendation:** Keep your current approach unless you specifically need MCP features.

