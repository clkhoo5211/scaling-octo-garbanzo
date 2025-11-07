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

// New Financial News Sources (Added 2025-11-07)

export const cnbcSource = new BaseRSSSource({
  id: "cnbc",
  name: "CNBC",
  url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
  category: "business",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

export const marketWatchSource = new BaseRSSSource({
  id: "marketwatch",
  name: "MarketWatch",
  url: "https://feeds.marketwatch.com/marketwatch/topstories/",
  category: "business",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

export const investingComSource = new BaseRSSSource({
  id: "investing-com",
  name: "Investing.com",
  url: "https://www.investing.com/rss/news.rss",
  category: "business",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

export const nasdaqSource = new BaseRSSSource({
  id: "nasdaq",
  name: "Nasdaq",
  url: "https://www.nasdaq.com/feed/rssoutbound?category=Stocks",
  category: "business",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

export const foxBusinessSource = new BaseRSSSource({
  id: "fox-business",
  name: "Fox Business",
  url: "https://feeds.foxnews.com/foxnews/business",
  category: "business",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

export const morningstarSource = new BaseRSSSource({
  id: "morningstar",
  name: "Morningstar",
  url: "https://www.morningstar.com/rss/news",
  category: "business",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const barronsSource = new BaseRSSSource({
  id: "barrons",
  name: "Barron's",
  url: "https://www.barrons.com/feed/all",
  category: "business",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const investorsComSource = new BaseRSSSource({
  id: "investors-com",
  name: "Investors.com",
  url: "https://www.investors.com/feed/",
  category: "business",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

export const yahooFinanceSource = new BaseRSSSource({
  id: "yahoo-finance",
  name: "Yahoo Finance",
  url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=%5EGSPC&region=US&lang=en-US",
  category: "business",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

export const theStarSource = new BaseRSSSource({
  id: "the-star",
  name: "The Star (Malaysia)",
  url: "https://www.thestar.com.my/rss/business",
  category: "business",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const bursaMalaysiaSource = new BaseRSSSource({
  id: "bursa-malaysia",
  name: "Bursa Malaysia",
  url: "https://www.bursamalaysia.com/rss/news",
  category: "business",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

