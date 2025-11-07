/**
 * RSS Source Registry
 * Central registry for all RSS sources - easy to add/remove sources
 */

import type { RSSSourceHandler } from "./types";
import type { NewsCategory } from "./types";
import * as techSources from "./rss/tech";
import * as cryptoSources from "./rss/crypto";
import * as socialSources from "./rss/social";
import * as generalSources from "./rss/general";
import * as businessSources from "./rss/business";
import * as scienceSources from "./rss/science";
import * as sportsSources from "./rss/sports";
import * as entertainmentSources from "./rss/entertainment";
import * as healthSources from "./rss/health";

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
    
    // Business sources
    businessSources.bloombergSource,
    businessSources.financialTimesSource,
    businessSources.wallStreetJournalSource,
    businessSources.forbesSource,
    businessSources.businessInsiderSource,
    
    // Science sources
    scienceSources.scienceMagSource,
    scienceSources.natureSource,
    scienceSources.scientificAmericanSource,
    scienceSources.nationalGeographicSource,
    scienceSources.spaceNewsSource,
    
    // Sports sources
    sportsSources.espnSource,
    sportsSources.bbcSportSource,
    sportsSources.theAthleticSource,
    sportsSources.skySportsSource,
    sportsSources.nbaSource,
    
    // Entertainment sources
    entertainmentSources.entertainmentWeeklySource,
    entertainmentSources.varietySource,
    entertainmentSources.hollywoodReporterSource,
    entertainmentSources.rollingStoneSource,
    entertainmentSources.pitchforkSource,
    
    // Health sources
    healthSources.webMDSource,
    healthSources.healthlineSource,
    healthSources.medicalNewsTodaySource,
    healthSources.mayoClinicSource,
    healthSources.nihSource,
  ].filter(source => source.config.enabled);
}

/**
 * Get RSS sources by category
 */
export function getRSSSourcesByCategory(
  category: NewsCategory
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
