/**
 * RSS Source Registry
 * Central registry for all RSS sources - easy to add/remove sources
 */

import type { RSSSourceHandler } from "../types";
import * as techSources from "./rss/tech";
import * as cryptoSources from "./rss/crypto";
import * as socialSources from "./rss/social";
import * as generalSources from "./rss/general";

/**
 * Get all RSS sources
 */
export function getAllRSSSources(): RSSSourceHandler[] {
  return [
    // Tech sources
    techSources.hackerNoonSource,
    techSources.wiredSource,
    techSources.mitTechReviewSource,
    techSources.theNextWebSource,
    techSources.techCrunchSource,
    techSources.theVergeSource,
    techSources.arsTechnicaSource,
    techSources.mediumSource,
    
    // Crypto sources
    cryptoSources.coinDeskSource,
    cryptoSources.coinTelegraphSource,
    cryptoSources.decryptSource,
    cryptoSources.bitcoinMagazineSource,
    cryptoSources.theBlockSource,
    cryptoSources.cryptoSlateSource,
    cryptoSources.coinMarketCapSource,
    
    // Social sources
    socialSources.youtubeViralSource,
    socialSources.youtubeMusicSource,
    socialSources.youtubeGamingSource,
    
    // General sources
    generalSources.bbcNewsSource,
    generalSources.reutersSource,
    generalSources.theGuardianSource,
    generalSources.cnnSource,
    generalSources.associatedPressSource,
    generalSources.newYorkTimesSource,
  ].filter(source => source.config.enabled);
}

/**
 * Get RSS sources by category
 */
export function getRSSSourcesByCategory(
  category: "tech" | "crypto" | "social" | "general"
): RSSSourceHandler[] {
  return getAllRSSSources().filter(
    source => source.config.category === category
  );
}

/**
 * Get RSS source by ID
 */
export function getRSSSourceById(id: string): RSSSourceHandler | undefined {
  return getAllRSSSources().find(source => source.config.id === id);
}

/**
 * Add a new RSS source (for dynamic addition)
 * Usage: addRSSSource(new BaseRSSSource({ id: "new-source", ... }))
 */
export function addRSSSource(source: RSSSourceHandler): void {
  // In a real implementation, you might want to store this in a registry
  // For now, sources are statically defined in their respective files
  console.warn("addRSSSource: Sources should be added to their respective category files");
}

