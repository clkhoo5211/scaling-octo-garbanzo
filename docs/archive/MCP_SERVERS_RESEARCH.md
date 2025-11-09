# MCP Servers for News Sources - Research & Testing Results

## Found MCP Servers

### 1. **news_mcp** (skydockAI/news_mcp) ⭐ RECOMMENDED
- **Repository**: https://github.com/skydockAI/news_mcp
- **Language**: Python
- **Features**:
  - Built-in RSS feeds (CBC, BBC, TechCrunch)
  - Extracts full article content
  - Uses OpenAI for summarization and categorization
  - Supports sentiment analysis
- **Requirements**: 
  - OpenAI API key (required)
  - Python 3.x
  - Dependencies: `openai-agents`, `beautifulsoup4`
- **Tools Available**:
  - `get_news_rss_list()` - List configured RSS feeds
  - `get_news_feeds(rss_url)` - Fetch RSS feed items
  - `get_news_article(article_url)` - Extract full article with AI analysis
- **Categories Supported**: General, Tech (via TechCrunch)
- **Status**: ✅ Cloned, ready to test

### 2. **simply-feed-mcp** (hmmroger/simply-feed-mcp)
- **Repository**: https://github.com/hmmroger/simply-feed-mcp
- **Language**: TypeScript/Node.js
- **Features**:
  - General RSS feed management
  - Natural language search
  - Requires background worker process
- **Requirements**:
  - LLM API key (Gemini/OpenAI)
  - Node.js 20+
  - Background worker must run continuously
- **Tools Available**:
  - `get-recent-feed-items` - Recent items from all feeds
  - `get-feed-items` - Items from specific feed
  - `search-feed-items` - Natural language search
  - `list-feeds` - List all configured feeds
- **Categories Supported**: All (via custom feed configuration)
- **Status**: ✅ Cloned, requires worker setup

### 3. **crypto-rss-mcp** (kukapay/crypto-rss-mcp)
- **Repository**: https://github.com/kukapay/crypto-rss-mcp
- **Language**: Python
- **Features**:
  - Cryptocurrency news aggregation
  - OPML file support (Chainfeeds)
  - Keyword filtering
- **Requirements**:
  - Python 3.10+
  - `uv` package manager
  - Dependencies: `feedparser`, `html2text`, `mcp[cli]`, `opml`
- **Tools Available**:
  - `get_crypto_rss_list(keyword, opml_file)` - List crypto RSS feeds
  - `get_rss_feed(feed_url)` - Fetch RSS feed entries
- **Categories Supported**: Crypto only
- **Status**: ✅ Cloned, dependencies installed

### 4. **finance-news-mcp** (jvenkatasandeep/finance-news-mcp)
- **Repository**: https://github.com/jvenkatasandeep/finance-news-mcp
- **Language**: Python (FastMCP)
- **Features**:
  - Finance news from major RSS feeds
  - Real-time updates
- **Categories Supported**: Business, Economy, Finance
- **Status**: ✅ Cloned

### 5. **miniflux-mcp** (tssujt/miniflux-mcp)
- **Repository**: https://github.com/tssujt/miniflux-mcp
- **Language**: TypeScript/Node.js
- **Features**:
  - 40+ tools for Miniflux RSS reader
  - Requires Miniflux instance (self-hosted)
- **Requirements**: Miniflux instance + API key
- **Categories Supported**: All (via Miniflux)
- **Status**: ✅ Cloned (requires Miniflux setup)

## Testing Plan

### Test 1: news_mcp (Without API Key - Basic RSS Fetch)
Test if we can fetch RSS feeds without OpenAI API key:
```bash
cd test-mcp-servers/news_mcp
python3 -c "from config import Config; print(Config.RSS_FEEDS)"
```

### Test 2: crypto-rss-mcp (No API Key Required)
Test crypto RSS feed fetching:
```bash
cd test-mcp-servers/crypto-rss-mcp
uv run mcp dev src/crypto_rss_mcp/cli.py
```

### Test 3: MCP Inspector
Test MCP servers via Inspector:
```bash
npx @modelcontextprotocol/inspector
```

## Integration Recommendations

### Option 1: news_mcp (Best for General News)
- **Pros**: Built-in feeds, full article extraction, AI analysis
- **Cons**: Requires OpenAI API key
- **Best For**: General, Tech categories
- **Integration**: Add to project as Python subprocess or API service

### Option 2: crypto-rss-mcp (Best for Crypto)
- **Pros**: No API key required, OPML support, keyword filtering
- **Cons**: Crypto category only
- **Best For**: Crypto category
- **Integration**: Add as Python subprocess, call via MCP protocol

### Option 3: Custom MCP Server
- **Pros**: Full control, no API dependencies
- **Cons**: Requires development
- **Best For**: All categories
- **Integration**: Build custom MCP server using `@modelcontextprotocol/sdk`

## Next Steps

1. ✅ Clone all MCP servers
2. ⏳ Test each server via command line
3. ⏳ Evaluate which covers most categories
4. ⏳ Integrate selected server(s) into project
5. ⏳ Add configuration for all news categories

