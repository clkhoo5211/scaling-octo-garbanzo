/**
 * Crypto RSS Sources
 */

import { BaseRSSSource } from "../baseRSSSource";

export const coinDeskSource = new BaseRSSSource({
  id: "coindesk",
  name: "CoinDesk",
  url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
  category: "crypto",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const coinTelegraphSource = new BaseRSSSource({
  id: "cointelegraph",
  name: "CoinTelegraph",
  url: "https://cointelegraph.com/rss",
  category: "crypto",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const decryptSource = new BaseRSSSource({
  id: "decrypt",
  name: "Decrypt",
  url: "https://decrypt.co/feed",
  category: "crypto",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const bitcoinMagazineSource = new BaseRSSSource({
  id: "bitcoin-magazine",
  name: "Bitcoin Magazine",
  url: "https://bitcoinmagazine.com/.rss/full/",
  category: "crypto",
  enabled: true,
  updateFrequency: 3600000, // 1 hour
  maxArticles: 20,
});

export const theBlockSource = new BaseRSSSource({
  id: "the-block",
  name: "The Block",
  url: "https://www.theblock.co/rss.xml",
  category: "crypto",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const cryptoSlateSource = new BaseRSSSource({
  id: "cryptoslate",
  name: "CryptoSlate",
  url: "https://cryptoslate.com/feed/",
  category: "crypto",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const coinMarketCapSource = new BaseRSSSource({
  id: "coinmarketcap",
  name: "CoinMarketCap",
  url: "https://coinmarketcap.com/headlines/news/",
  category: "crypto",
  enabled: true,
  updateFrequency: 3600000, // 1 hour
  maxArticles: 20,
});

