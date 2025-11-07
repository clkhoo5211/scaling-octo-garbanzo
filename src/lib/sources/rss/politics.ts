/**
 * Politics RSS Sources
 */

import { BaseRSSSource } from "../baseRSSSource";

export const apNewsPoliticsSource = new BaseRSSSource({
  id: "ap-politics",
  name: "AP News Politics",
  url: "https://apnews.com/apf-politics.rss",
  category: "politics",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const reutersPoliticsSource = new BaseRSSSource({
  id: "reuters-politics",
  name: "Reuters Politics",
  url: "https://www.reuters.com/politics/rss",
  category: "politics",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const bbcPoliticsSource = new BaseRSSSource({
  id: "bbc-politics",
  name: "BBC Politics",
  url: "https://feeds.bbci.co.uk/news/politics/rss.xml",
  category: "politics",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const nprPoliticsSource = new BaseRSSSource({
  id: "npr-politics",
  name: "NPR Politics",
  url: "https://feeds.npr.org/1014/rss.xml",
  category: "politics",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const politicoSource = new BaseRSSSource({
  id: "politico",
  name: "POLITICO",
  url: "https://www.politico.com/rss/politics08.xml",
  category: "politics",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const theGuardianPoliticsSource = new BaseRSSSource({
  id: "guardian-politics",
  name: "The Guardian Politics",
  url: "https://www.theguardian.com/politics/rss",
  category: "politics",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const realClearPoliticsSource = new BaseRSSSource({
  id: "realclearpolitics",
  name: "RealClearPolitics",
  url: "https://www.realclearpolitics.com/index.xml",
  category: "politics",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const theHillSource = new BaseRSSSource({
  id: "the-hill",
  name: "The Hill",
  url: "https://thehill.com/rss/syndicator/19110",
  category: "politics",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const cnnPoliticsSource = new BaseRSSSource({
  id: "cnn-politics",
  name: "CNN Politics",
  url: "http://rss.cnn.com/rss/edition.rss",
  category: "politics",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const newYorkTimesPoliticsSource = new BaseRSSSource({
  id: "nyt-politics",
  name: "NY Times Politics",
  url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
  category: "politics",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

