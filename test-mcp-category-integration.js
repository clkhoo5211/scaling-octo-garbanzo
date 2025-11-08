// Test script to verify MCP category integration
// Run in browser console: import('./src/lib/services/__tests__/mcpCategoryVerification.test.ts')

const MCP_SERVER_URL = 'https://web3news-mcp-server.vercel.app/api/server';

// Test category mapping
const categoryMap = {
  'tech': 'tech',
  'crypto': 'crypto',
  'social': 'general',
  'general': 'general',
  'business': 'business',
  'economy': 'business',
  'science': 'science',
  'sports': 'sports',
  'entertainment': 'entertainment',
  'health': 'health',
  'politics': 'politics',
  'environment': 'environment',
  'education': 'general',
  'local': 'general',
};

console.log('🧪 Testing MCP Category Integration...\n');

// Test 1: Get news by category (tech)
async function testCategoryFetch(category) {
  const mcpCategory = categoryMap[category] || category;
  
  try {
    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'get_news_by_category',
          arguments: {
            category: mcpCategory,
            max_items_per_source: 3,
          },
        },
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.log(`❌ ${category} (${mcpCategory}): ${data.error.message}`);
      return null;
    }
    
    const text = data.result?.content?.[0]?.text || '';
    
    // Parse response
    const sourceRegex = /## ([^\n]+)\n([\s\S]*?)(?=\n## |$)/g;
    const sources = [];
    let match;
    
    while ((match = sourceRegex.exec(text)) !== null) {
      const sourceName = match[1].trim();
      const articleCount = (match[2].match(/\d+\. \*\*/g) || []).length;
      sources.push({ name: sourceName, articles: articleCount });
    }
    
    console.log(`✅ ${category} (${mcpCategory}):`);
    console.log(`   Sources: ${sources.length}`);
    console.log(`   Total articles: ${sources.reduce((sum, s) => sum + s.articles, 0)}`);
    console.log(`   Sample sources: ${sources.slice(0, 5).map(s => `${s.name} (${s.articles})`).join(', ')}`);
    
    return { category, mcpCategory, sources, totalArticles: sources.reduce((sum, s) => sum + s.articles, 0) };
  } catch (error) {
    console.log(`❌ ${category}: ${error.message}`);
    return null;
  }
}

// Test all categories
async function testAllCategories() {
  const categories = ['tech', 'crypto', 'general', 'business', 'science', 'health', 'sports', 'entertainment', 'politics', 'environment'];
  const results = [];
  
  for (const category of categories) {
    const result = await testCategoryFetch(category);
    if (result) results.push(result);
    await new Promise(r => setTimeout(r, 1000)); // Delay between requests
  }
  
  console.log('\n📊 Summary:');
  console.log(`Total categories tested: ${categories.length}`);
  console.log(`Successful: ${results.length}`);
  console.log(`Total articles across all categories: ${results.reduce((sum, r) => sum + r.totalArticles, 0)}`);
  console.log(`Total sources: ${results.reduce((sum, r) => sum + r.sources.length, 0)}`);
  
  return results;
}

// Run tests
testAllCategories().then(results => {
  console.log('\n✅ Verification complete!');
  console.log('Results:', results);
});

