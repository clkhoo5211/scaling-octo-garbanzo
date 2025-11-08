/**
 * MCP (Model Context Protocol) Client Service
 * Connects to the Vercel-deployed MCP server for RSS feed fetching
 * This bypasses CORS issues by using the server as a proxy
 * 
 * NEW: Now supports MCP server's category-based fetching tools
 */

import type { Article } from './indexedDBCache';
import type { NewsCategory } from '@/lib/sources/types';

const MCP_SERVER_URL = import.meta.env.VITE_MCP_SERVER_URL || 'https://web3news-mcp-server.vercel.app/api/server';

/**
 * Map React app categories to MCP server categories
 * MCP server uses: general, tech, business, crypto, science, health, sports, entertainment, politics, environment
 * React app uses: tech, crypto, social, general, business, economy, science, sports, entertainment, health, politics, environment, education, local
 */
function mapCategoryToMCP(category: NewsCategory): string | null {
  const categoryMap: Record<NewsCategory, string | null> = {
    'tech': 'tech',
    'crypto': 'crypto',
    'social': 'general', // MCP doesn't have 'social', use 'general'
    'general': 'general',
    'business': 'business',
    'economy': 'business', // MCP doesn't have 'economy', use 'business'
    'science': 'science',
    'sports': 'sports',
    'entertainment': 'entertainment',
    'health': 'health',
    'politics': 'politics',
    'environment': 'environment',
    'education': 'general', // MCP doesn't have 'education', use 'general'
    'local': 'general', // MCP doesn't have 'local', use 'general'
  };
  
  return categoryMap[category] || null;
}

/**
 * Initialize MCP connection
 */
async function initializeMCP(): Promise<boolean> {
  try {
    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'web3news-aggregator',
            version: '1.0.0',
          },
        },
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.result?.protocolVersion === '2024-11-05';
  } catch (error) {
    console.debug('[MCP] Initialize failed:', error);
    return false;
  }
}

/**
 * Call MCP tool to fetch RSS feed
 */
async function callMCPTool(feedUrl: string): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'get_rss_feed',
          arguments: {
            feed_url: feedUrl,
          },
        },
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message || 'Unknown MCP error',
      };
    }

    if (data.result?.content?.[0]?.type === 'text') {
      return {
        success: true,
        text: data.result.content[0].text,
      };
    }

    return {
      success: false,
      error: 'Invalid MCP response format',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Network error',
    };
  }
}

/**
 * Call MCP tool to get news by category
 * NEW: Uses MCP server's get_news_by_category tool
 */
async function callMCPGetNewsByCategory(
  category: string,
  maxItemsPerSource: number = 5
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'get_news_by_category',
          arguments: {
            category,
            max_items_per_source: maxItemsPerSource,
          },
        },
      }),
      signal: AbortSignal.timeout(60000), // 60 second timeout for category fetch
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message || 'Unknown MCP error',
      };
    }

    if (data.result?.content?.[0]?.type === 'text') {
      return {
        success: true,
        text: data.result.content[0].text,
      };
    }

    return {
      success: false,
      error: 'Invalid MCP response format',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Network error',
    };
  }
}

/**
 * Parse MCP server response text into Article array
 * MCP server returns markdown-formatted text like:
 * # Feed: Title
 * ## Entry 1
 * - **Title**: ...
 * - **Link**: ...
 * - **Published**: ...
 * - **Summary**: ...
 * 
 * OR for category responses:
 * # News from Category: tech
 * ## Source Name
 * 1. **Title**
 *    - Link: [url](url)
 *    - Published: date
 *    - Summary: ...
 */
function parseMCPResponse(
  text: string,
  sourceName: string,
  category: NewsCategory
): Article[] {
  const articles: Article[] = [];

  try {
    // Check if this is a category response (has "## Source Name" format)
    const isCategoryResponse = text.includes('# News from Category:') || text.match(/^## [^#]/m);
    
    if (isCategoryResponse) {
      // Parse category response format
      return parseMCPCategoryResponse(text, category);
    }
    
    // Parse single feed response format
    // Split by entry markers
    const entryRegex = /## Entry \d+\n([\s\S]*?)(?=\n## Entry \d+|\n*$)/g;
    const entries: RegExpMatchArray[] = [];
    let match: RegExpMatchArray | null;
    while ((match = entryRegex.exec(text)) !== null) {
      entries.push(match);
    }

    entries.forEach((entryMatch, index) => {
      const entryText = entryMatch[1];
      
      // Extract fields from markdown format
      const titleMatch = entryText.match(/- \*\*Title\*\*: (.+)/);
      const linkMatch = entryText.match(/- \*\*Link\*\*: \[([^\]]+)\]\(([^)]+)\)/);
      const pubDateMatch = entryText.match(/- \*\*Published\*\*: (.+)/);
      const summaryMatch = entryText.match(/- \*\*Summary\*\*: ([\s\S]*?)(?=\n-|\n*$)/);

      const title = titleMatch?.[1]?.trim();
      const link = linkMatch?.[2]?.trim() || linkMatch?.[1]?.trim();
      const pubDate = pubDateMatch?.[1]?.trim();
      const summary = summaryMatch?.[1]?.trim();

      if (title && link) {
        const publishedAt = pubDate 
          ? new Date(pubDate).getTime() || Date.now() - (index * 60000)
          : Date.now() - (index * 60000);

        articles.push({
          id: `mcp-${sourceName.toLowerCase().replace(/\s+/g, '-')}-${publishedAt}-${index}`,
          title,
          url: link,
          source: sourceName,
          category,
          publishedAt,
          excerpt: summary?.substring(0, 200) || '',
          cachedAt: Date.now(),
          urlHash: link.toLowerCase().replace(/\/$/, ''),
        });
      }
    });
  } catch (error) {
    console.error(`[MCP] Error parsing response for ${sourceName}:`, error);
  }

  return articles;
}

/**
 * Parse MCP category response format
 * Format:
 * # News from Category: tech
 * 
 * Sources checked: 5
 * 
 * ## Source Name
 * 1. **Title**
 *    - Link: [url](url)
 *    - Published: date
 *    - Summary: ...
 */
function parseMCPCategoryResponse(text: string, category: NewsCategory): Article[] {
  const articles: Article[] = [];
  
  try {
    // Split by source sections (## Source Name)
    // Updated regex to handle both "## Source Name" and "## Source Name\n\n" formats
    const sourceRegex = /## ([^\n]+)\n+([\s\S]*?)(?=\n## |$)/g;
    let sourceMatch: RegExpExecArray | null;
    
    while ((sourceMatch = sourceRegex.exec(text)) !== null) {
      const sourceName = sourceMatch[1].trim();
      const sourceContent = sourceMatch[2];
      
      // Skip if source name indicates failure
      if (sourceName.includes('❌') || sourceName.includes('Failed')) {
        continue;
      }
      
      // Parse articles from this source (numbered list format: "1. **Title**")
      const articleRegex = /(\d+)\. \*\*([^\n]+)\*\*\n+([\s\S]*?)(?=\n\d+\. \*\*|\n## |$)/g;
      let articleMatch: RegExpExecArray | null;
      
      while ((articleMatch = articleRegex.exec(sourceContent)) !== null) {
        const articleText = articleMatch[0];
        const title = articleMatch[2].trim();
        
        // Extract link - try both formats: "- **Link**: [text](url)" and "- Link: [text](url)"
        const linkMatch = articleText.match(/- \*\*Link\*\*: \[([^\]]+)\]\(([^)]+)\)/) ||
                         articleText.match(/- Link: \[([^\]]+)\]\(([^)]+)\)/);
        const pubDateMatch = articleText.match(/- \*\*Published\*\*: (.+)/) ||
                            articleText.match(/- Published: (.+)/);
        const summaryMatch = articleText.match(/- \*\*Summary\*\*: ([\s\S]*?)(?=\n-|\n*$)/) ||
                            articleText.match(/- Summary: ([\s\S]*?)(?=\n-|\n*$)/);
        
        const link = linkMatch?.[2]?.trim() || linkMatch?.[1]?.trim();
        const pubDate = pubDateMatch?.[1]?.trim();
        const summary = summaryMatch?.[1]?.trim();
        
        if (title && link) {
          const publishedAt = pubDate 
            ? new Date(pubDate).getTime() || Date.now()
            : Date.now();
          
          articles.push({
            id: `mcp-category-${sourceName.toLowerCase().replace(/\s+/g, '-')}-${publishedAt}-${articles.length}`,
            title,
            url: link,
            source: sourceName,
            category,
            publishedAt,
            excerpt: summary?.substring(0, 200) || '',
            cachedAt: Date.now(),
            urlHash: link.toLowerCase().replace(/\/$/, ''),
          });
        }
      }
    }
  } catch (error) {
    console.error(`[MCP] Error parsing category response:`, error);
  }
  
  return articles;
}

/**
 * Initialize MCP connection
 */
async function initializeMCP(): Promise<boolean> {
  try {
    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'web3news-aggregator',
            version: '1.0.0',
          },
        },
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.result?.protocolVersion === '2024-11-05';
  } catch (error) {
    console.debug('[MCP] Initialize failed:', error);
    return false;
  }
}

/**
 * Call MCP tool to fetch RSS feed
 */
async function callMCPTool(feedUrl: string): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'get_rss_feed',
          arguments: {
            feed_url: feedUrl,
          },
        },
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message || 'Unknown MCP error',
      };
    }

    if (data.result?.content?.[0]?.type === 'text') {
      return {
        success: true,
        text: data.result.content[0].text,
      };
    }

    return {
      success: false,
      error: 'Invalid MCP response format',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Network error',
    };
  }
}

/**
 * Parse MCP server response text into Article array
 * MCP server returns markdown-formatted text like:
 * # Feed: Title
 * ## Entry 1
 * - **Title**: ...
 * - **Link**: ...
 * - **Published**: ...
 * - **Summary**: ...
 */
function parseMCPResponse(
  text: string,
  sourceName: string,
  category: NewsCategory
): Article[] {
  const articles: Article[] = [];

  try {
    // Split by entry markers
    const entryRegex = /## Entry \d+\n([\s\S]*?)(?=\n## Entry \d+|\n*$)/g;
    const entries: RegExpMatchArray[] = [];
    let match: RegExpMatchArray | null;
    while ((match = entryRegex.exec(text)) !== null) {
      entries.push(match);
    }

    entries.forEach((entryMatch, index) => {
      const entryText = entryMatch[1];
      
      // Extract fields from markdown format
      const titleMatch = entryText.match(/- \*\*Title\*\*: (.+)/);
      const linkMatch = entryText.match(/- \*\*Link\*\*: \[([^\]]+)\]\(([^)]+)\)/);
      const pubDateMatch = entryText.match(/- \*\*Published\*\*: (.+)/);
      const summaryMatch = entryText.match(/- \*\*Summary\*\*: ([\s\S]*?)(?=\n-|\n*$)/);

      const title = titleMatch?.[1]?.trim();
      const link = linkMatch?.[2]?.trim() || linkMatch?.[1]?.trim();
      const pubDate = pubDateMatch?.[1]?.trim();
      const summary = summaryMatch?.[1]?.trim();

      if (title && link) {
        const publishedAt = pubDate 
          ? new Date(pubDate).getTime() || Date.now() - (index * 60000)
          : Date.now() - (index * 60000);

        articles.push({
          id: `mcp-${sourceName.toLowerCase().replace(/\s+/g, '-')}-${publishedAt}-${index}`,
          title,
          url: link,
          source: sourceName,
          category,
          publishedAt,
          excerpt: summary?.substring(0, 200) || '',
          cachedAt: Date.now(),
          urlHash: link.toLowerCase().replace(/\/$/, ''),
        });
      }
    });
  } catch (error) {
    console.error(`[MCP] Error parsing response for ${sourceName}:`, error);
  }

  return articles;
}

/**
 * Fetch news by category using MCP server's get_news_by_category tool
 * NEW: Direct category-based fetching from MCP server
 */
export async function fetchNewsByCategoryViaMCP(
  category: NewsCategory,
  maxItemsPerSource: number = 5
): Promise<{ success: boolean; articles: Article[]; error?: string }> {
  // Check if MCP server URL is configured
  if (!MCP_SERVER_URL || MCP_SERVER_URL === 'https://web3news-mcp-server.vercel.app/api/server') {
    if (!import.meta.env.VITE_MCP_SERVER_URL) {
      return {
        success: false,
        articles: [],
        error: 'MCP server URL not configured',
      };
    }
  }

  // Map React category to MCP category
  const mcpCategory = mapCategoryToMCP(category);
  if (!mcpCategory) {
    return {
      success: false,
      articles: [],
      error: `Category ${category} not supported by MCP server`,
    };
  }

  try {
    // Call MCP get_news_by_category tool
    const result = await callMCPGetNewsByCategory(mcpCategory, maxItemsPerSource);

    if (!result.success || !result.text) {
      return {
        success: false,
        articles: [],
        error: result.error || 'MCP tool call failed',
      };
    }

    // Parse response (category format)
    const articles = parseMCPCategoryResponse(result.text, category);

    if (articles.length === 0) {
      return {
        success: false,
        articles: [],
        error: 'No articles parsed from MCP response',
      };
    }

    return {
      success: true,
      articles,
    };
  } catch (error: any) {
    console.debug(`[MCP] Error fetching news by category ${category}:`, error);
    return {
      success: false,
      articles: [],
      error: error?.message || 'Unknown error',
    };
  }
}

/**
 * Fetch RSS feed via MCP server
 * This bypasses CORS issues by using the server as a proxy
 */
export async function fetchRSSFeedViaMCP(
  url: string,
  sourceName: string,
  category: NewsCategory
): Promise<{ success: boolean; articles: Article[]; error?: string }> {
  // Check if MCP server URL is configured
  if (!MCP_SERVER_URL || MCP_SERVER_URL === 'https://web3news-mcp-server.vercel.app/api/server') {
    // Only use default URL if explicitly set, otherwise skip
    if (!import.meta.env.VITE_MCP_SERVER_URL) {
      return {
        success: false,
        articles: [],
        error: 'MCP server URL not configured',
      };
    }
  }

  try {
    // Call MCP tool
    const result = await callMCPTool(url);

    if (!result.success || !result.text) {
      return {
        success: false,
        articles: [],
        error: result.error || 'MCP tool call failed',
      };
    }

    // Parse response
    const articles = parseMCPResponse(result.text, sourceName, category);

    if (articles.length === 0) {
      return {
        success: false,
        articles: [],
        error: 'No articles parsed from MCP response',
      };
    }

    return {
      success: true,
      articles,
    };
  } catch (error: any) {
    console.debug(`[MCP] Error fetching RSS feed ${sourceName} (${url}):`, error);
    return {
      success: false,
      articles: [],
      error: error?.message || 'Unknown error',
    };
  }
}

/**
 * Check if MCP server is available
 */
export async function checkMCPServerAvailable(): Promise<boolean> {
  if (!MCP_SERVER_URL || !import.meta.env.VITE_MCP_SERVER_URL) {
    return false;
  }

  try {
    const response = await fetch(MCP_SERVER_URL, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return data.status === 'MCP Server Running';
    }

    return false;
  } catch (error) {
    return false;
  }
}

