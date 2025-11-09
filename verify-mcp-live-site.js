// MCP Server Verification Script for Live Site
// Run this in the browser console at: https://clkhoo5211.github.io/scaling-octo-garbanzo/

console.log('🔍 MCP Server Verification Script');
console.log('================================\n');

// 1. Check if MCP server URL is configured
const mcpUrl = import.meta.env.VITE_MCP_SERVER_URL || 'https://web3news-mcp-server.vercel.app/api/server';
console.log('1️⃣ MCP Server URL Configuration:');
console.log(`   URL: ${mcpUrl}`);
console.log(`   From env: ${import.meta.env.VITE_MCP_SERVER_URL ? '✅ Set' : '⚠️ Using default'}`);
console.log('');

// 2. Check if MCP category fetch is enabled
const mcpCategoryFetch = import.meta.env.VITE_USE_MCP_CATEGORY_FETCH !== 'false';
console.log('2️⃣ MCP Category Fetch:');
console.log(`   Enabled: ${mcpCategoryFetch ? '✅ Yes' : '❌ No'}`);
console.log(`   Value: ${import.meta.env.VITE_USE_MCP_CATEGORY_FETCH || 'true (default)'}`);
console.log('');

// 3. Test MCP server connectivity
console.log('3️⃣ Testing MCP Server Connectivity...');
fetch(mcpUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'get_news_by_category',
      arguments: { category: 'tech', max_items_per_source: 2 }
    }
  })
})
.then(r => r.json())
.then(data => {
  if (data.error) {
    console.log(`   ❌ Error: ${data.error.message}`);
  } else {
    const text = data.result?.content?.[0]?.text || '';
    const hasArticles = text.includes('##') || text.includes('Entry');
    console.log(`   ${hasArticles ? '✅' : '⚠️'} Server responded`);
    console.log(`   Response length: ${text.length} characters`);
    console.log(`   Has articles: ${hasArticles ? 'Yes' : 'No'}`);
  }
})
.catch(err => {
  console.log(`   ❌ Connection failed: ${err.message}`);
})
.finally(() => {
  console.log('');
  
  // 4. Monitor network requests
  console.log('4️⃣ Network Request Monitoring:');
  console.log('   Open Network tab and filter by "web3news-mcp-server"');
  console.log('   Look for POST requests to:', mcpUrl);
  console.log('');
  
  // 5. Check console logs
  console.log('5️⃣ Console Log Monitoring:');
  console.log('   Look for these log messages:');
  console.log('   - "[RSS] Attempting MCP category fetch for..."');
  console.log('   - "[RSS] ✅ MCP category fetch succeeded..."');
  console.log('   - "[RSS] ⚠️ MCP category fetch failed..."');
  console.log('');
  
  console.log('✅ Verification script complete!');
  console.log('   Switch to Network tab to monitor MCP requests');
  console.log('   Change categories to see MCP requests in action');
});

