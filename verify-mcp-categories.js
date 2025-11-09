#!/usr/bin/env node

/**
 * MCP Category Implementation Verification Script
 * Checks if MCP method is implemented for all categories in the React app
 */

import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = '/Users/khoo/Downloads/project4/projects/project-20251107-003428-web3news-aggregator';

// Read mcpService.ts to extract category mapping
const mcpServicePath = path.join(PROJECT_ROOT, 'src/lib/services/mcpService.ts');
const rssServicePath = path.join(PROJECT_ROOT, 'src/lib/services/rssService.ts');
const typesPath = path.join(PROJECT_ROOT, 'src/lib/sources/types.ts');

console.log('🔍 Verifying MCP Implementation for All Categories\n');

// Read files
const mcpService = fs.readFileSync(mcpServicePath, 'utf8');
const rssService = fs.readFileSync(rssServicePath, 'utf8');
const typesFile = fs.readFileSync(typesPath, 'utf8');

// Extract NewsCategory type
const categoryMatch = typesFile.match(/type NewsCategory = (.+?);/s);
if (!categoryMatch) {
  console.error('❌ Could not find NewsCategory type definition');
  process.exit(1);
}

const categories = categoryMatch[1]
  .split('|')
  .map(c => c.trim().replace(/['"]/g, ''))
  .filter(c => c);

console.log(`📋 Found ${categories.length} categories in NewsCategory type:\n`);
categories.forEach(cat => console.log(`  - ${cat}`));
console.log('');

// Extract category mapping from mcpService.ts
const mappingMatch = mcpService.match(/const categoryMap: Record<NewsCategory, string \| null> = \{([\s\S]*?)\};/);
if (!mappingMatch) {
  console.error('❌ Could not find categoryMap in mcpService.ts');
  process.exit(1);
}

const mappingText = mappingMatch[1];
const mappings: Record<string, string | null> = {};

mappingText.split('\n').forEach(line => {
  const match = line.match(/'([^']+)':\s*['"]?([^'",]+)['"]?/);
  if (match) {
    mappings[match[1]] = match[2] === 'null' ? null : match[2];
  }
});

console.log('🗺️  Category Mapping (React → MCP):\n');
Object.entries(mappings).forEach(([react, mcp]) => {
  const status = mcp ? '✅' : '❌';
  console.log(`  ${status} ${react.padEnd(15)} → ${mcp || 'NOT MAPPED'}`);
});
console.log('');

// Check if fetchNewsByCategoryViaMCP is called for all categories
const hasMCPCall = rssService.includes('fetchNewsByCategoryViaMCP');
const hasMCPEnabled = rssService.includes('VITE_USE_MCP_CATEGORY_FETCH');

console.log('🔧 MCP Integration Check:\n');
console.log(`  ${hasMCPCall ? '✅' : '❌'} fetchNewsByCategoryViaMCP is imported and used`);
console.log(`  ${hasMCPEnabled ? '✅' : '❌'} MCP category fetch is enabled (VITE_USE_MCP_CATEGORY_FETCH)`);
console.log('');

// Verify all categories are mapped
const unmapped = categories.filter(cat => !mappings[cat]);
const mapped = categories.filter(cat => mappings[cat]);

console.log('📊 Summary:\n');
console.log(`  Total Categories: ${categories.length}`);
console.log(`  ✅ Mapped: ${mapped.length}`);
console.log(`  ${unmapped.length > 0 ? '❌' : '✅'} Unmapped: ${unmapped.length}`);

if (unmapped.length > 0) {
  console.log('\n⚠️  Unmapped Categories:');
  unmapped.forEach(cat => console.log(`    - ${cat}`));
}

console.log('\n✅ Verification Complete!\n');

if (mapped.length === categories.length && hasMCPCall && hasMCPEnabled) {
  console.log('🎉 All categories have MCP implementation!');
  process.exit(0);
} else {
  console.log('⚠️  Some categories may not have MCP implementation');
  process.exit(1);
}

