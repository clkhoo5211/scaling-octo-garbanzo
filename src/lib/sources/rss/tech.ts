/**
 * Tech RSS Sources
 * Individual source files for easy management
 */

import { BaseRSSSource } from "../baseRSSSource";
import type { RSSSourceConfig } from "../types";

// Tech Sources
export const hackerNoonSource = new BaseRSSSource({
  id: "hackernoon",
  name: "HackerNoon",
  url: "https://hackernoon.com/feed",
  category: "tech",
  enabled: true,
  updateFrequency: 3600000, // 1 hour
  maxArticles: 20,
});

export const wiredSource = new BaseRSSSource({
  id: "wired",
  name: "Wired",
  url: "https://www.wired.com/feed/rss",
  category: "tech",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const mitTechReviewSource = new BaseRSSSource({
  id: "mit-tech-review",
  name: "MIT Technology Review",
  url: "https://www.technologyreview.com/feed/",
  category: "tech",
  enabled: true,
  updateFrequency: 3600000, // 1 hour
  maxArticles: 20,
});

export const theNextWebSource = new BaseRSSSource({
  id: "the-next-web",
  name: "The Next Web",
  url: "https://thenextweb.com/feed",
  category: "tech",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const techCrunchSource = new BaseRSSSource({
  id: "techcrunch",
  name: "TechCrunch",
  url: "https://techcrunch.com/feed/",
  category: "tech",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

export const theVergeSource = new BaseRSSSource({
  id: "the-verge",
  name: "The Verge",
  url: "https://www.theverge.com/rss/index.xml",
  category: "tech",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 20,
});

export const arsTechnicaSource = new BaseRSSSource({
  id: "ars-technica",
  name: "Ars Technica",
  url: "https://feeds.arstechnica.com/arstechnica/index",
  category: "tech",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const mediumSource = new BaseRSSSource({
  id: "medium",
  name: "Medium",
  url: "https://medium.com/feed",
  category: "tech",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

