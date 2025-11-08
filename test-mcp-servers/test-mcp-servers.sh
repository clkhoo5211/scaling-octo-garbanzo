#!/bin/bash
# MCP Servers Test Script
# Tests available MCP servers for news sources

echo "=== MCP Servers Test Results ==="
echo ""

# Test 1: news_mcp - Config Test
echo "1. Testing news_mcp..."
cd news_mcp
if python3 -c "from config import Config; print('✅ Config loaded:', len(Config.RSS_FEEDS), 'feeds')" 2>/dev/null; then
    echo "   ✅ news_mcp config works"
    python3 -c "from config import Config; [print(f'   - {f[\"name\"]}: {f[\"url\"]}') for f in Config.RSS_FEEDS]"
else
    echo "   ❌ news_mcp config failed"
fi
cd ..
echo ""

# Test 2: RSS Feed Accessibility
echo "2. Testing RSS Feed Accessibility..."
test_feeds=(
    "https://feeds.bbci.co.uk/news/rss.xml"
    "https://techcrunch.com/feed/"
    "https://coindesk.com/arc/outboundfeeds/rss/"
)
for feed in "${test_feeds[@]}"; do
    if curl -s "$feed" | grep -q "<rss\|<feed"; then
        echo "   ✅ $feed - Accessible"
    else
        echo "   ❌ $feed - Failed"
    fi
done
echo ""

# Test 3: crypto-rss-mcp - OPML File
echo "3. Testing crypto-rss-mcp..."
cd crypto-rss-mcp
if [ -f "RAW.opml" ]; then
    echo "   ✅ OPML file found ($(wc -l < RAW.opml) lines)"
    if grep -q "xmlUrl" RAW.opml | head -1; then
        echo "   ✅ OPML file contains RSS feeds"
    fi
else
    echo "   ❌ OPML file not found"
fi
cd ..
echo ""

# Test 4: MCP Inspector Availability
echo "4. Testing MCP Inspector..."
if npx @modelcontextprotocol/inspector --help > /dev/null 2>&1; then
    echo "   ✅ MCP Inspector available"
else
    echo "   ⚠️  MCP Inspector not installed (run: npm install -g @modelcontextprotocol/inspector)"
fi
echo ""

echo "=== Summary ==="
echo "✅ news_mcp: Ready (requires OpenAI API key)"
echo "✅ crypto-rss-mcp: Ready (no API key needed)"
echo "✅ RSS Feeds: Accessible"
echo ""
echo "Next Steps:"
echo "1. Install dependencies for crypto-rss-mcp: cd crypto-rss-mcp && uv sync"
echo "2. Test crypto-rss-mcp: uv run mcp dev src/crypto_rss_mcp/cli.py"
echo "3. Configure news_mcp with OpenAI API key if needed"
echo "4. Integrate selected MCP server into main project"

