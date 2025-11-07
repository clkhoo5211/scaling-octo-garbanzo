/**
 * Health RSS Sources
 */

import { BaseRSSSource } from "../baseRSSSource";

export const webMDSource = new BaseRSSSource({
  id: "webmd",
  name: "WebMD",
  url: "https://www.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC",
  category: "health",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const healthlineSource = new BaseRSSSource({
  id: "healthline",
  name: "Healthline",
  url: "https://www.healthline.com/health-news/rss",
  category: "health",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const medicalNewsTodaySource = new BaseRSSSource({
  id: "medical-news-today",
  name: "Medical News Today",
  url: "https://www.medicalnewstoday.com/rss",
  category: "health",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const mayoClinicSource = new BaseRSSSource({
  id: "mayo-clinic",
  name: "Mayo Clinic",
  url: "https://www.mayoclinic.org/rss/all-mayo-clinic-news",
  category: "health",
  enabled: true,
  updateFrequency: 3600000, // 1 hour
  maxArticles: 20,
});

export const nihSource = new BaseRSSSource({
  id: "nih",
  name: "NIH News",
  url: "https://www.nih.gov/news-events/news-releases/rss.xml",
  category: "health",
  enabled: true,
  updateFrequency: 3600000, // 1 hour
  maxArticles: 20,
});

