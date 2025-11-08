# Deploy MCP Server to Vercel - Complete Guide

## 📋 What You Need

### 1. Separate GitHub Repository
Create a new repo: `web3news-mcp-server`

### 2. Required Files

#### **vercel.json** (Vercel Configuration)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/sse",
      "dest": "api/index.py"
    },
    {
      "src": "/",
      "dest": "api/index.py"
    }
  ],
  "env": {
    "PYTHON_VERSION": "3.10"
  }
}
```

#### **api/index.py** (Vercel Serverless Function)
```python
from mcp.server.fastmcp import FastMCP
import feedparser
import httpx
import html2text
import re
from typing import List

# Initialize MCP server
mcp = FastMCP("Crypto RSS Reader")

async def fetch_rss_feed(url: str):
    """Fetch and parse an RSS feed."""
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return feedparser.parse(response.text)

@mcp.tool()
async def get_rss_feed(feed_url: str) -> str:
    """Retrieve RSS feed content."""
    feed = await fetch_rss_feed(feed_url)
    entries = feed.entries[:10]
    
    h = html2text.HTML2Text()
    h.body_width = 0
    h.ignore_links = True
    h.ignore_images = True
    
    result = f"# Feed: {feed.feed.title}\n\n"
    for i, entry in enumerate(entries):
        summary_text = h.handle(entry.summary).strip()
        result += f"## Entry {i + 1}\n"
        result += f"- **Title**: {entry.title}\n"
        result += f"- **Link**: {entry.link}\n"
        result += f"- **Published**: {entry.published}\n"
        result += f"- **Summary**: {summary_text}\n\n"
    return result

# Vercel serverless function handler
def handler(request):
    """Vercel serverless function entry point."""
    # FastMCP runs on SSE transport
    return mcp.run(transport="sse")
```

#### **requirements.txt**
```
feedparser>=6.0.11
html2text>=2025.4.15
mcp[cli]>=1.6.0
httpx>=0.24.0
```

#### **README.md**
```markdown
# Web3News MCP Server

MCP server for fetching RSS feeds, deployed on Vercel.

## Deployment

1. Connect GitHub repo to Vercel
2. Vercel auto-detects Python
3. Deploy automatically on push

## Endpoints

- `/sse` - SSE transport endpoint for MCP
```

### 3. Vercel Setup Steps

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Import `web3news-mcp-server` repo
   - Vercel auto-detects Python

3. **Configure Build Settings**
   - Framework Preset: Other
   - Build Command: (leave empty - Vercel handles it)
   - Output Directory: (leave empty)
   - Install Command: `pip install -r requirements.txt`

4. **Deploy**
   - Click "Deploy"
   - Get URL: `https://your-app.vercel.app`

### 4. Connect from React App

```typescript
// src/lib/services/mcpClient.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const MCP_SERVER_URL = import.meta.env.VITE_MCP_SERVER_URL || 'https://your-app.vercel.app';

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

### 5. Environment Variables

**Vercel Dashboard:**
- No env vars needed for basic RSS server

**React App (.env.local):**
```bash
VITE_MCP_SERVER_URL=https://your-app.vercel.app
```

## 📁 Complete File Structure

```
web3news-mcp-server/
├── api/
│   └── index.py          # Vercel serverless function
├── vercel.json           # Vercel configuration
├── requirements.txt      # Python dependencies
├── README.md            # Documentation
└── .gitignore           # Git ignore file
```

## 🚀 Quick Start

1. **Create Repo:**
   ```bash
   mkdir web3news-mcp-server
   cd web3news-mcp-server
   git init
   ```

2. **Create Files:**
   - Copy `vercel.json` above
   - Copy `api/index.py` above
   - Copy `requirements.txt` above

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial MCP server"
   git remote add origin https://github.com/yourusername/web3news-mcp-server.git
   git push -u origin main
   ```

4. **Deploy to Vercel:**
   - Go to vercel.com
   - Import GitHub repo
   - Click Deploy
   - Get URL

5. **Update React App:**
   - Add `VITE_MCP_SERVER_URL` to `.env.local`
   - Use `mcpClient.ts` in your code

## ⚠️ Important Notes

- **Vercel Free Tier Limits:**
  - 100GB bandwidth/month
  - Serverless functions timeout: 10s (Hobby), 60s (Pro)
  - Cold starts possible

- **FastMCP on Vercel:**
  - Must use SSE transport (not stdio)
  - Serverless functions are stateless
  - Each request is a new function invocation

- **CORS:**
  - Vercel handles CORS automatically
  - No additional CORS config needed

## 💰 Cost

- **Free Tier:** Sufficient for testing
- **Pro Tier ($20/month):** If you need more resources

## ✅ Checklist

- [ ] Create separate GitHub repo
- [ ] Add `vercel.json`
- [ ] Add `api/index.py`
- [ ] Add `requirements.txt`
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Get deployment URL
- [ ] Add `VITE_MCP_SERVER_URL` to React app
- [ ] Test connection from React app

