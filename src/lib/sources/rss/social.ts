/**
 * Social RSS Sources
 */

import { BaseRSSSource } from "../baseRSSSource";

export const youtubeViralSource = new BaseRSSSource({
  id: "youtube-viral",
  name: "YouTube Viral",
  url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ",
  category: "social",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const youtubeMusicSource = new BaseRSSSource({
  id: "youtube-music",
  name: "YouTube Music",
  url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC-9-kyTW8ZkZNDHQJ6FgpwQ",
  category: "social",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

export const youtubeGamingSource = new BaseRSSSource({
  id: "youtube-gaming",
  name: "YouTube Gaming",
  url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCOpNcN46UbXVtpKMrmU4Abg",
  category: "social",
  enabled: true,
  updateFrequency: 1800000, // 30 minutes
  maxArticles: 20,
});

