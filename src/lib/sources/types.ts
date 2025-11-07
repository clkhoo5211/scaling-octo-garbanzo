/**
 * Base types for modular RSS sources
 * Each source is a self-contained module that can be easily added/removed
 */

import type { Article } from "../services/indexedDBCache";

export type NewsCategory = 
  | "tech" 
  | "crypto" 
  | "social" 
  | "general"
  | "business"
  | "economy"
  | "science"
  | "sports"
  | "entertainment"
  | "health"
  | "politics"
  | "environment"
  | "education"
  | "local";

export interface RSSSourceConfig {
  /** Unique identifier for the source */
  id: string;
  /** Display name */
  name: string;
  /** RSS feed URL */
  url: string;
  /** Category classification */
  category: NewsCategory;
  /** Whether this source is enabled */
  enabled: boolean;
  /** Expected update frequency in milliseconds (for adaptive rate limiting) */
  updateFrequency?: number;
  /** Maximum number of articles to fetch per request */
  maxArticles?: number;
}

export interface RSSSourceResult {
  articles: Article[];
  lastFetchTime: number;
  nextFetchTime: number;
  error?: string;
}

/**
 * Base RSS Source Handler
 * Each RSS source implements this interface
 */
export interface RSSSourceHandler {
  /** Source configuration */
  config: RSSSourceConfig;
  
  /** Fetch articles from this source */
  fetch(): Promise<RSSSourceResult>;
  
  /** Get the adaptive interval for this source */
  getAdaptiveInterval(): number;
}
