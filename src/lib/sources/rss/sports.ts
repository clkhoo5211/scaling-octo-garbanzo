/**
 * Sports RSS Sources
 */

import { BaseRSSSource } from "../baseRSSSource";

export const espnSource = new BaseRSSSource({
  id: "espn",
  name: "ESPN",
  url: "https://www.espn.com/espn/rss/news",
  category: "sports",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

export const bbcSportSource = new BaseRSSSource({
  id: "bbc-sport",
  name: "BBC Sport",
  url: "https://feeds.bbci.co.uk/sport/rss.xml",
  category: "sports",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

export const theAthleticSource = new BaseRSSSource({
  id: "the-athletic",
  name: "The Athletic",
  url: "https://theathletic.com/rss/",
  category: "sports",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const skySportsSource = new BaseRSSSource({
  id: "sky-sports",
  name: "Sky Sports",
  url: "https://www.skysports.com/rss/12040",
  category: "sports",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

export const nbaSource = new BaseRSSSource({
  id: "nba",
  name: "NBA",
  url: "https://www.nba.com/.rss/free/news",
  category: "sports",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

