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

// CDC (Centers for Disease Control and Prevention) - Free public health news
export const cdcSource = new BaseRSSSource({
  id: "cdc",
  name: "CDC News",
  url: "https://tools.cdc.gov/api/v2/resources/media/132950.rss",
  category: "health",
  enabled: true,
  updateFrequency: 3600000, // 1 hour
  maxArticles: 20,
});

// Medical Xpress - Free medical and health news
export const medicalXpressSource = new BaseRSSSource({
  id: "medical-xpress",
  name: "Medical Xpress",
  url: "https://medicalxpress.com/rss-feed/health-news/",
  category: "health",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

// News-Medical.net - Free medical news
export const newsMedicalSource = new BaseRSSSource({
  id: "news-medical",
  name: "News-Medical.net",
  url: "https://www.news-medical.net/rss/health-news.aspx",
  category: "health",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

// ScienceDaily Health - Free health and medicine news
export const scienceDailyHealthSource = new BaseRSSSource({
  id: "sciencedaily-health",
  name: "ScienceDaily Health",
  url: "https://www.sciencedaily.com/rss/health_medicine.xml",
  category: "health",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

// MedlinePlus Health News - Free health information from NIH
export const medlinePlusSource = new BaseRSSSource({
  id: "medlineplus",
  name: "MedlinePlus",
  url: "https://medlineplus.gov/rss/all_healthnews.xml",
  category: "health",
  enabled: true,
  updateFrequency: 3600000, // 1 hour
  maxArticles: 20,
});

// FDA News - Free FDA health and safety news
export const fdaSource = new BaseRSSSource({
  id: "fda",
  name: "FDA News",
  url: "https://www.fda.gov/AboutFDA/ContactFDA/StayInformed/RSSFeeds/FDANewsroom/rss.xml",
  category: "health",
  enabled: true,
  updateFrequency: 3600000, // 1 hour
  maxArticles: 20,
});

