/**
 * Education RSS Sources
 */

import { BaseRSSSource } from "../baseRSSSource";

export const bbcEducationSource = new BaseRSSSource({
  id: "bbc-education",
  name: "BBC Education",
  url: "https://feeds.bbci.co.uk/news/education/rss.xml",
  category: "education",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const reutersEducationSource = new BaseRSSSource({
  id: "reuters-education",
  name: "Reuters Education",
  url: "https://www.reuters.com/education/rss",
  category: "education",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const apNewsEducationSource = new BaseRSSSource({
  id: "ap-education",
  name: "AP News Education",
  url: "https://apnews.com/apf-education.rss",
  category: "education",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const theGuardianEducationSource = new BaseRSSSource({
  id: "guardian-education",
  name: "The Guardian Education",
  url: "https://www.theguardian.com/education/rss",
  category: "education",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

export const edWeekSource = new BaseRSSSource({
  id: "edweek",
  name: "Education Week",
  url: "https://www.edweek.org/feed/rss",
  category: "education",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const chronicleOfHigherEdSource = new BaseRSSSource({
  id: "chronicle-higher-ed",
  name: "Chronicle of Higher Education",
  url: "https://www.chronicle.com/rss",
  category: "education",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const insideHigherEdSource = new BaseRSSSource({
  id: "inside-higher-ed",
  name: "Inside Higher Ed",
  url: "https://www.insidehighered.com/rss.xml",
  category: "education",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const cnnEducationSource = new BaseRSSSource({
  id: "cnn-education",
  name: "CNN Education",
  url: "http://rss.cnn.com/rss/edition.rss",
  category: "education",
  enabled: true,
  updateFrequency: 900000, // 15 minutes
  maxArticles: 30,
});

