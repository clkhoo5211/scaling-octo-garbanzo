/**
 * Media Detection and Extraction Utilities
 * Detects and extracts media content (images, videos, GIFs) from RSS feeds
 */

export type MediaType = 'text' | 'image' | 'video' | 'gif' | 'mixed';

export interface MediaInfo {
  mediaType: MediaType;
  mediaUrl?: string;
  mediaUrls?: string[];
  imageUrl?: string;
  videoUrl?: string;
  gifUrl?: string;
  videoEmbedUrl?: string;
}

/**
 * Detect media type from URL
 */
export function detectMediaTypeFromUrl(url: string): 'image' | 'video' | 'gif' | null {
  if (!url) return null;

  const lowerUrl = url.toLowerCase();

  // GIF detection
  if (lowerUrl.includes('.gif') || lowerUrl.includes('/gif/') || lowerUrl.includes('giphy.com')) {
    return 'gif';
  }

  // Video detection
  if (
    lowerUrl.includes('.mp4') ||
    lowerUrl.includes('.webm') ||
    lowerUrl.includes('.mov') ||
    lowerUrl.includes('youtube.com') ||
    lowerUrl.includes('youtu.be') ||
    lowerUrl.includes('vimeo.com') ||
    lowerUrl.includes('dailymotion.com') ||
    lowerUrl.includes('twitch.tv')
  ) {
    return 'video';
  }

  // Image detection
  if (
    lowerUrl.includes('.jpg') ||
    lowerUrl.includes('.jpeg') ||
    lowerUrl.includes('.png') ||
    lowerUrl.includes('.webp') ||
    lowerUrl.includes('.svg') ||
    lowerUrl.includes('imgur.com') ||
    lowerUrl.includes('i.redd.it') ||
    lowerUrl.includes('i.imgur.com')
  ) {
    return 'image';
  }

  return null;
}

/**
 * Extract YouTube embed URL from various YouTube URL formats
 */
export function extractYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return null;
}

/**
 * Extract Vimeo embed URL
 */
export function extractVimeoEmbedUrl(url: string): string | null {
  if (!url) return null;

  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }

  return null;
}

/**
 * Extract media URLs from RSS item XML
 * Supports: media:content, media:group, enclosure, og:image, and inline images
 */
export function extractMediaFromRSSItem(itemXml: string): MediaInfo {
  const mediaInfo: MediaInfo = {
    mediaType: 'text',
  };

  const mediaUrls: string[] = [];
  let hasImage = false;
  let hasVideo = false;
  let hasGif = false;

  // 1. Extract media:content tags (RSS Media Module)
  const mediaContentMatches = itemXml.matchAll(/<media:content[^>]*url=["']([^"']+)["'][^>]*>/gi);
  for (const match of mediaContentMatches) {
    const url = match[1];
    if (url) {
      mediaUrls.push(url);
      const type = detectMediaTypeFromUrl(url);
      if (type === 'image') {
        hasImage = true;
        if (!mediaInfo.imageUrl) mediaInfo.imageUrl = url;
      } else if (type === 'video') {
        hasVideo = true;
        if (!mediaInfo.videoUrl) mediaInfo.videoUrl = url;
      } else if (type === 'gif') {
        hasGif = true;
        if (!mediaInfo.gifUrl) mediaInfo.gifUrl = url;
      }
    }
  }

  // 2. Extract media:group tags (for multiple media items)
  const mediaGroupMatches = itemXml.matchAll(/<media:group[^>]*>([\s\S]*?)<\/media:group>/gi);
  for (const match of mediaGroupMatches) {
    const groupXml = match[1];
    const groupContentMatches = groupXml.matchAll(/<media:content[^>]*url=["']([^"']+)["'][^>]*>/gi);
    for (const contentMatch of groupContentMatches) {
      const url = contentMatch[1];
      if (url && !mediaUrls.includes(url)) {
        mediaUrls.push(url);
        const type = detectMediaTypeFromUrl(url);
        if (type === 'image' && !hasImage) {
          hasImage = true;
          if (!mediaInfo.imageUrl) mediaInfo.imageUrl = url;
        } else if (type === 'video' && !hasVideo) {
          hasVideo = true;
          if (!mediaInfo.videoUrl) mediaInfo.videoUrl = url;
        } else if (type === 'gif' && !hasGif) {
          hasGif = true;
          if (!mediaInfo.gifUrl) mediaInfo.gifUrl = url;
        }
      }
    }
  }

  // 3. Extract enclosure tags (for media files)
  const enclosureMatches = itemXml.matchAll(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']([^"']+)["'][^>]*>/gi);
  for (const match of enclosureMatches) {
    const url = match[1];
    const type = match[2]?.toLowerCase() || '';
    if (url) {
      if (!mediaUrls.includes(url)) {
        mediaUrls.push(url);
      }

      if (type.startsWith('image/') || detectMediaTypeFromUrl(url) === 'image') {
        hasImage = true;
        if (!mediaInfo.imageUrl) mediaInfo.imageUrl = url;
      } else if (type.startsWith('video/') || detectMediaTypeFromUrl(url) === 'video') {
        hasVideo = true;
        if (!mediaInfo.videoUrl) mediaInfo.videoUrl = url;
      } else if (type.includes('gif') || detectMediaTypeFromUrl(url) === 'gif') {
        hasGif = true;
        if (!mediaInfo.gifUrl) mediaInfo.gifUrl = url;
      }
    }
  }

  // 4. Extract media:thumbnail (often used for videos)
  const thumbnailMatches = itemXml.matchAll(/<media:thumbnail[^>]*url=["']([^"']+)["'][^>]*>/gi);
  for (const match of thumbnailMatches) {
    const url = match[1];
    if (url && !mediaUrls.includes(url)) {
      // Thumbnail might indicate video content
      if (hasVideo && !mediaInfo.imageUrl) {
        mediaInfo.imageUrl = url; // Use as thumbnail for video
      }
    }
  }

  // 5. Extract images from description HTML (og:image, img src)
  const descMatch = itemXml.match(/<description[^>]*>(.*?)<\/description>/is);
  if (descMatch) {
    const description = descMatch[1];
    
    // Extract og:image
    const ogImageMatch = description.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogImageMatch && ogImageMatch[1]) {
      const url = ogImageMatch[1];
      if (!mediaUrls.includes(url)) {
        mediaUrls.push(url);
        hasImage = true;
        if (!mediaInfo.imageUrl) mediaInfo.imageUrl = url;
      }
    }

    // Extract img src tags
    const imgMatches = description.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi);
    for (const match of imgMatches) {
      const url = match[1];
      if (url && url.startsWith('http') && !mediaUrls.includes(url)) {
        mediaUrls.push(url);
        const type = detectMediaTypeFromUrl(url);
        if (type === 'image' && !hasImage) {
          hasImage = true;
          if (!mediaInfo.imageUrl) mediaInfo.imageUrl = url;
        } else if (type === 'gif' && !hasGif) {
          hasGif = true;
          if (!mediaInfo.gifUrl) mediaInfo.gifUrl = url;
        }
      }
    }
  }

  // 6. Extract video embed URLs (YouTube, Vimeo)
  const videoUrlMatch = itemXml.match(/(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)[^\s<>"']+)/i);
  if (videoUrlMatch && videoUrlMatch[1]) {
    const url = videoUrlMatch[1];
    hasVideo = true;
    if (!mediaInfo.videoUrl) mediaInfo.videoUrl = url;
    
    // Generate embed URL
    const youtubeEmbed = extractYouTubeEmbedUrl(url);
    const vimeoEmbed = extractVimeoEmbedUrl(url);
    if (youtubeEmbed) {
      mediaInfo.videoEmbedUrl = youtubeEmbed;
    } else if (vimeoEmbed) {
      mediaInfo.videoEmbedUrl = vimeoEmbed;
    }
  }

  // Determine media type
  const mediaCount = (hasImage ? 1 : 0) + (hasVideo ? 1 : 0) + (hasGif ? 1 : 0);
  
  if (mediaCount === 0) {
    mediaInfo.mediaType = 'text';
  } else if (mediaCount === 1) {
    if (hasGif) {
      mediaInfo.mediaType = 'gif';
      mediaInfo.mediaUrl = mediaInfo.gifUrl;
    } else if (hasVideo) {
      mediaInfo.mediaType = 'video';
      mediaInfo.mediaUrl = mediaInfo.videoUrl;
    } else if (hasImage) {
      mediaInfo.mediaType = 'image';
      mediaInfo.mediaUrl = mediaInfo.imageUrl;
    }
  } else {
    mediaInfo.mediaType = 'mixed';
    mediaInfo.mediaUrl = mediaInfo.imageUrl || mediaInfo.videoUrl || mediaInfo.gifUrl;
  }

  // Set mediaUrls array if we have multiple
  if (mediaUrls.length > 0) {
    mediaInfo.mediaUrls = mediaUrls;
  }

  return mediaInfo;
}

