/**
 * Entertainment RSS Sources
 */

import { BaseRSSSource } from "../baseRSSSource";

export const entertainmentWeeklySource = new BaseRSSSource({
  id: "entertainment-weekly",
  name: "Entertainment Weekly",
  url: "https://ew.com/feed/",
  category: "entertainment",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const varietySource = new BaseRSSSource({
  id: "variety",
  name: "Variety",
  url: "https://variety.com/feed/",
  category: "entertainment",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

export const hollywoodReporterSource = new BaseRSSSource({
  id: "hollywood-reporter",
  name: "The Hollywood Reporter",
  url: "https://www.hollywoodreporter.com/feed/",
  category: "entertainment",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const rollingStoneSource = new BaseRSSSource({
  id: "rolling-stone",
  name: "Rolling Stone",
  url: "https://www.rollingstone.com/feed/",
  category: "entertainment",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const pitchforkSource = new BaseRSSSource({
  id: "pitchfork",
  name: "Pitchfork",
  url: "https://pitchfork.com/feed/feed-news/rss/",
  category: "entertainment",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

