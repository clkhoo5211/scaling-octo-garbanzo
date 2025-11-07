/**
 * Economy & Stock Market RSS Sources
 */

import { BaseRSSSource } from "../baseRSSSource";

// Stock Market & Financial News
export const yahooFinanceSource = new BaseRSSSource({
  id: "yahoo-finance",
  name: "Yahoo Finance",
  url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US",
  category: "economy",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const marketWatchSource = new BaseRSSSource({
  id: "marketwatch",
  name: "MarketWatch",
  url: "https://www.marketwatch.com/rss/topstories",
  category: "economy",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const investingComSource = new BaseRSSSource({
  id: "investing-com",
  name: "Investing.com",
  url: "https://www.investing.com/rss/news.rss",
  category: "economy",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const nasdaqSource = new BaseRSSSource({
  id: "nasdaq",
  name: "NASDAQ",
  url: "https://www.nasdaq.com/feed/rssoutbound?category=Stocks",
  category: "economy",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const cnbcMarketsSource = new BaseRSSSource({
  id: "cnbc-markets",
  name: "CNBC Markets",
  url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
  category: "economy",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const reutersMarketsSource = new BaseRSSSource({
  id: "reuters-markets",
  name: "Reuters Markets",
  url: "https://www.reuters.com/markets/rss",
  category: "economy",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const bloombergMarketsSource = new BaseRSSSource({
  id: "bloomberg-markets",
  name: "Bloomberg Markets",
  url: "https://www.bloomberg.com/feeds/markets.rss",
  category: "economy",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const financialTimesMarketsSource = new BaseRSSSource({
  id: "ft-markets",
  name: "Financial Times Markets",
  url: "https://www.ft.com/markets?format=rss",
  category: "economy",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const wallStreetJournalMarketsSource = new BaseRSSSource({
  id: "wsj-markets",
  name: "WSJ Markets",
  url: "https://www.wsj.com/xml/rss/3_7085.xml",
  category: "economy",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const morningstarSource = new BaseRSSSource({
  id: "morningstar",
  name: "Morningstar",
  url: "https://www.morningstar.com/rss/news",
  category: "economy",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

