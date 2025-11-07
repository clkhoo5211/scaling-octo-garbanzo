/**
 * Country-Specific News RSS Sources
 * Based on user's IP geolocation
 */

import { BaseRSSSource } from "../baseRSSSource";

// US News Sources
export const usNewsSources = {
  abcNewsUS: new BaseRSSSource({
    id: "abc-news-us",
    name: "ABC News US",
    url: "http://feeds.abcnews.com/abcnews/usheadlines",
    category: "general",
    enabled: true,
    updateFrequency: 900000, // 15 minutes
    maxArticles: 30,
  }),
  cbsNewsUS: new BaseRSSSource({
    id: "cbs-news-us",
    name: "CBS News US",
    url: "http://www.cbsnews.com/latest/rss/main",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
  nbcNewsUS: new BaseRSSSource({
    id: "nbc-news-us",
    name: "NBC News US",
    url: "http://feeds.nbcnews.com/feeds/topstories",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
  usaTodayUS: new BaseRSSSource({
    id: "usa-today-us",
    name: "USA Today US",
    url: "http://content.usatoday.com/marketing/rss/rsstrans.aspx?feedId=news2",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
};

// UK News Sources
export const ukNewsSources = {
  bbcUK: new BaseRSSSource({
    id: "bbc-uk",
    name: "BBC UK",
    url: "https://feeds.bbci.co.uk/news/uk/rss.xml",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
  theGuardianUK: new BaseRSSSource({
    id: "guardian-uk",
    name: "The Guardian UK",
    url: "https://www.theguardian.com/uk/rss",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
  skyNewsUK: new BaseRSSSource({
    id: "sky-news-uk",
    name: "Sky News UK",
    url: "https://feeds.skynews.com/feeds/rss/uk.xml",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
};

// Canada News Sources
export const canadaNewsSources = {
  cbcNews: new BaseRSSSource({
    id: "cbc-news",
    name: "CBC News",
    url: "https://www.cbc.ca/cmlink/rss-topstories",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
  ctvNews: new BaseRSSSource({
    id: "ctv-news",
    name: "CTV News",
    url: "https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822289",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
};

// Australia News Sources
export const australiaNewsSources = {
  abcAustralia: new BaseRSSSource({
    id: "abc-australia",
    name: "ABC Australia",
    url: "https://www.abc.net.au/news/feed/51120/rss.xml",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
  sbsNews: new BaseRSSSource({
    id: "sbs-news",
    name: "SBS News",
    url: "https://www.sbs.com.au/news/rss",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
};

// India News Sources
export const indiaNewsSources = {
  timesOfIndia: new BaseRSSSource({
    id: "times-of-india",
    name: "Times of India",
    url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
  theHindu: new BaseRSSSource({
    id: "the-hindu",
    name: "The Hindu",
    url: "https://www.thehindu.com/news/feeder/default.rss",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
};

// Germany News Sources
export const germanyNewsSources = {
  dwNewsDE: new BaseRSSSource({
    id: "dw-news-de",
    name: "DW News (DE)",
    url: "https://rss.dw.com/rdf/rss-de-all",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
  spiegel: new BaseRSSSource({
    id: "spiegel",
    name: "Der Spiegel",
    url: "https://www.spiegel.de/international/index.rss",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
};

// France News Sources
export const franceNewsSources = {
  france24: new BaseRSSSource({
    id: "france24",
    name: "France 24",
    url: "https://www.france24.com/en/rss",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
  leMonde: new BaseRSSSource({
    id: "le-monde",
    name: "Le Monde",
    url: "https://www.lemonde.fr/rss/une.xml",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
};

// Japan News Sources
export const japanNewsSources = {
  nhkWorld: new BaseRSSSource({
    id: "nhk-world",
    name: "NHK World",
    url: "https://www3.nhk.or.jp/nhkworld/en/news/rss.xml",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
  japanTimes: new BaseRSSSource({
    id: "japan-times",
    name: "Japan Times",
    url: "https://www.japantimes.co.jp/rss/news/",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
};

// China News Sources
export const chinaNewsSources = {
  xinhuaNews: new BaseRSSSource({
    id: "xinhua-news",
    name: "Xinhua News",
    url: "http://www.xinhuanet.com/english/rss.xml",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
  chinaDaily: new BaseRSSSource({
    id: "china-daily",
    name: "China Daily",
    url: "https://www.chinadaily.com.cn/rss/china_rss.xml",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
};

// Brazil News Sources
export const brazilNewsSources = {
  bbcBrasil: new BaseRSSSource({
    id: "bbc-brasil",
    name: "BBC Brasil",
    url: "https://www.bbc.com/portuguese/index.xml",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
  folhaSP: new BaseRSSSource({
    id: "folha-sp",
    name: "Folha de S.Paulo",
    url: "https://feeds.folha.uol.com.br/rss/homepage.xml",
    category: "general",
    enabled: true,
    updateFrequency: 900000,
    maxArticles: 30,
  }),
};

// Map country codes to their news sources
export const countryNewsMap: Record<string, BaseRSSSource[]> = {
  US: Object.values(usNewsSources),
  GB: Object.values(ukNewsSources),
  UK: Object.values(ukNewsSources),
  CA: Object.values(canadaNewsSources),
  AU: Object.values(australiaNewsSources),
  IN: Object.values(indiaNewsSources),
  DE: Object.values(germanyNewsSources),
  FR: Object.values(franceNewsSources),
  JP: Object.values(japanNewsSources),
  CN: Object.values(chinaNewsSources),
  BR: Object.values(brazilNewsSources),
};

/**
 * Get country-specific news sources by country code
 */
export function getCountryNewsSources(countryCode: string): BaseRSSSource[] {
  return countryNewsMap[countryCode.toUpperCase()] || Object.values(usNewsSources); // Default to US
}

