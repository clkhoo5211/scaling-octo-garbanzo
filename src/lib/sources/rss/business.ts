/**
 * Business RSS Sources
 */

import { BaseRSSSource } from "../baseRSSSource";

export const bloombergSource = new BaseRSSSource({
  id: "bloomberg",
  name: "Bloomberg",
  url: "https://feeds.bloomberg.com/markets/news.rss",
  category: "business",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

export const financialTimesSource = new BaseRSSSource({
  id: "financial-times",
  name: "Financial Times",
  url: "https://www.ft.com/?format=rss",
  category: "business",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const wallStreetJournalSource = new BaseRSSSource({
  id: "wall-street-journal",
  name: "Wall Street Journal",
  url: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",
  category: "business",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const forbesSource = new BaseRSSSource({
  id: "forbes",
  name: "Forbes",
  url: "https://www.forbes.com/real-time/feed2/",
  category: "business",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const businessInsiderSource = new BaseRSSSource({
  id: "business-insider",
  name: "Business Insider",
  url: "https://feeds.businessinsider.com/custom/all",
  category: "business",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

