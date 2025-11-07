/**
 * Science RSS Sources
 */

import { BaseRSSSource } from "../baseRSSSource";

export const scienceMagSource = new BaseRSSSource({
  id: "science-mag",
  name: "Science Magazine",
  url: "https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science",
  category: "science",
  enabled: true,
  updateFrequency: 3600000, // 1 hour
  maxArticles: 20,
});

export const natureSource = new BaseRSSSource({
  id: "nature",
  name: "Nature",
  url: "https://www.nature.com/nature.rss",
  category: "science",
  enabled: true,
  updateFrequency: 3600000, // 1 hour
  maxArticles: 20,
});

export const scientificAmericanSource = new BaseRSSSource({
  id: "scientific-american",
  name: "Scientific American",
  url: "https://rss.sciam.com/ScientificAmerican-Global",
  category: "science",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const nationalGeographicSource = new BaseRSSSource({
  id: "national-geographic",
  name: "National Geographic",
  url: "https://www.nationalgeographic.com/index.rss",
  category: "science",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const spaceNewsSource = new BaseRSSSource({
  id: "space-news",
  name: "Space News",
  url: "https://spacenews.com/feed/",
  category: "science",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

