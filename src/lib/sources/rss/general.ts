/**
 * General News RSS Sources
 */

import { BaseRSSSource } from "../baseRSSSource";

export const bbcNewsSource = new BaseRSSSource({
  id: "bbc-news",
  name: "BBC News",
  url: "https://feeds.bbci.co.uk/news/rss.xml",
  category: "general",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const reutersSource = new BaseRSSSource({
  id: "reuters",
  name: "Reuters",
  url: "https://www.reuters.com/business/finance/rss",
  category: "general",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const theGuardianSource = new BaseRSSSource({
  id: "the-guardian",
  name: "The Guardian",
  url: "https://www.theguardian.com/world/rss",
  category: "general",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const cnnSource = new BaseRSSSource({
  id: "cnn",
  name: "CNN",
  url: "http://rss.cnn.com/rss/cnn_topstories.rss",
  category: "general",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const associatedPressSource = new BaseRSSSource({
  id: "associated-press",
  name: "Associated Press",
  url: "https://apnews.com/apf-topnews",
  category: "general",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const newYorkTimesSource = new BaseRSSSource({
  id: "new-york-times",
  name: "The New York Times",
  url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
  category: "general",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 30,
});

// New General News Sources (Added 2025-11-07)

export const msnSource = new BaseRSSSource({
  id: "msn",
  name: "MSN",
  url: "https://www.msn.com/en-us/news/rss",
  category: "general",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

