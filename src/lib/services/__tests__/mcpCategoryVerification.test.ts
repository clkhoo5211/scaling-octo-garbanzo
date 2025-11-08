/**
 * MCP Category Verification Tests
 * Verifies that MCP server data is correctly filtered, categorized, and tabulated
 */

import { fetchNewsByCategoryViaMCP } from '../mcpService';
import type { NewsCategory } from '@/lib/sources/types';

/**
 * Test MCP category fetching and verify categorization
 */
export async function verifyMCPCategoryIntegration() {
  const results: Record<string, any> = {};
  
  const categories: NewsCategory[] = [
    'tech',
    'crypto',
    'general',
    'business',
    'science',
    'health',
    'sports',
    'entertainment',
    'politics',
    'environment',
  ];

  console.log('🧪 Testing MCP Category Integration...\n');

  for (const category of categories) {
    try {
      console.log(`Testing category: ${category}`);
      const result = await fetchNewsByCategoryViaMCP(category, 3);
      
      if (result.success) {
        // Verify all articles have correct category
        const correctCategory = result.articles.every(article => article.category === category);
        const uniqueSources = new Set(result.articles.map(a => a.source));
        
        results[category] = {
          success: true,
          articleCount: result.articles.length,
          correctCategory,
          uniqueSources: uniqueSources.size,
          sources: Array.from(uniqueSources).slice(0, 5),
          sampleArticles: result.articles.slice(0, 3).map(a => ({
            title: a.title.substring(0, 50),
            source: a.source,
            category: a.category,
            url: a.url.substring(0, 50),
          })),
        };
        
        console.log(`  ✅ ${category}: ${result.articles.length} articles, ${uniqueSources.size} sources, category correct: ${correctCategory}`);
      } else {
        results[category] = {
          success: false,
          error: result.error,
        };
        console.log(`  ❌ ${category}: ${result.error}`);
      }
    } catch (error: any) {
      results[category] = {
        success: false,
        error: error.message,
      };
      console.log(`  ❌ ${category}: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Summary:');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
}

/**
 * Verify category mapping
 */
export function verifyCategoryMapping() {
  const mappings: Record<NewsCategory, string | null> = {
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

  console.log('🗺️ Category Mapping:');
  Object.entries(mappings).forEach(([reactCategory, mcpCategory]) => {
    console.log(`  ${reactCategory} → ${mcpCategory}`);
  });

  return mappings;
}

