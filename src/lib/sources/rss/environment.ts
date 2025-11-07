/**
 * Environment & Climate RSS Sources
 */

import { BaseRSSSource } from "../baseRSSSource";

// Government Sources (Public Domain)
export const noaaClimateSource = new BaseRSSSource({
  id: "noaa-climate",
  name: "NOAA Climate",
  url: "https://www.noaa.gov/rss-feeds/climate",
  category: "environment",
  enabled: true,
  updateFrequency: 3600000, // 1 hour
  maxArticles: 20,
});

export const unClimateChangeSource = new BaseRSSSource({
  id: "un-climate",
  name: "UN Climate Change",
  url: "https://news.un.org/en/rss/topic/climate-change",
  category: "environment",
  enabled: true,
  updateFrequency: 3600000, // 1 hour
  maxArticles: 20,
});

// News Sources
export const bbcEnvironmentSource = new BaseRSSSource({
  id: "bbc-environment",
  name: "BBC Environment",
  url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
  category: "environment",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const reutersEnvironmentSource = new BaseRSSSource({
  id: "reuters-environment",
  name: "Reuters Environment",
  url: "https://www.reuters.com/environment/rss",
  category: "environment",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const apNewsEnvironmentSource = new BaseRSSSource({
  id: "ap-environment",
  name: "AP News Environment",
  url: "https://apnews.com/apf-environment.rss",
  category: "environment",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const theGuardianEnvironmentSource = new BaseRSSSource({
  id: "guardian-environment",
  name: "The Guardian Environment",
  url: "https://www.theguardian.com/environment/rss",
  category: "environment",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const climateChangeNewsSource = new BaseRSSSource({
  id: "climate-change-news",
  name: "Climate Change News",
  url: "https://www.climatechangenews.com/feed/",
  category: "environment",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const insideClimateNewsSource = new BaseRSSSource({
  id: "inside-climate",
  name: "Inside Climate News",
  url: "https://insideclimatenews.org/feed/",
  category: "environment",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const cnnClimateSource = new BaseRSSSource({
  id: "cnn-climate",
  name: "CNN Climate",
  url: "http://rss.cnn.com/rss/edition.rss",
  category: "environment",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const nationalGeographicEnvironmentSource = new BaseRSSSource({
  id: "natgeo-environment",
  name: "National Geographic Environment",
  url: "https://www.nationalgeographic.com/environment/index.rss",
  category: "environment",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

