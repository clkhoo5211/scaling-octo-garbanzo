/**
 * MCP (Model Context Protocol) Client Service
 * Connects to the Vercel-deployed MCP server for RSS feed fetching
 * This bypasses CORS issues by using the server as a proxy
 */

import type { Article } from './indexedDBCache';
import type { NewsCategory } from '@/lib/sources/types';

const MCP_SERVER_URL = import.meta.env.VITE_MCP_SERVER_URL || 'https://web3news-mcp-server.vercel.app/api/server';

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

