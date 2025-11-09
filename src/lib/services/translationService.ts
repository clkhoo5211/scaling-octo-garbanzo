/**
 * Translation Service
 * Uses Google Translate API (FREE tier: 500k characters/month)
 * Supports 100+ languages with auto-detection
 * Caches translations in IndexedDB for instant subsequent loads
 */

import { openDB, type IDBPDatabase } from 'idb';

export interface TranslationResult {
  success: boolean;
  translatedText: string;
  detectedLanguage?: string;
  targetLanguage: string;
  error?: string;
}

export interface TranslationCache {
  articleUrl: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
}

// Google Translate API endpoint (FREE tier)
const GOOGLE_TRANSLATE_API = 'https://translation.googleapis.com/language/translate/v2';
const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || '';

// IndexedDB database name and version
const DB_NAME = 'web3news-translations';
const DB_VERSION = 1;
const STORE_NAME = 'translations';

/**
 * Initialize IndexedDB for translation caching
 */
async function initTranslationDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'articleUrl' });
        store.createIndex('timestamp', 'timestamp');
      }
    },
  });
}

/**
 * Get cached translation from IndexedDB
 */
async function getCachedTranslation(
  articleUrl: string,
  targetLanguage: string
): Promise<TranslationCache | null> {
  try {
    const db = await initTranslationDB();
    const cached = await db.get(STORE_NAME, articleUrl);
    
    if (cached && cached.targetLanguage === targetLanguage) {
      // Check if cache is still valid (7 days)
      const cacheAge = Date.now() - cached.timestamp;
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      if (cacheAge < maxAge) {
        return cached;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('[Translation] Failed to get cached translation:', error);
    return null;
  }
}

/**
 * Cache translation in IndexedDB
 */
async function cacheTranslation(cache: TranslationCache): Promise<void> {
  try {
    const db = await initTranslationDB();
    await db.put(STORE_NAME, cache);
  } catch (error) {
    console.warn('[Translation] Failed to cache translation:', error);
  }
}

/**
 * Detect language of text using Google Translate API
 */
export async function detectLanguage(text: string): Promise<string | null> {
  if (!API_KEY) {
    console.warn('[Translation] Google Translate API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${GOOGLE_TRANSLATE_API}/detect?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text.substring(0, 1000), // Limit to first 1000 chars for detection
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data?.detections?.[0]?.[0]?.language || null;
  } catch (error) {
    console.error('[Translation] Language detection failed:', error);
    return null;
  }
}

/**
 * Translate text using Google Translate API
 * 
 * @param text - Text to translate
 * @param targetLanguage - Target language code (e.g., 'en', 'zh', 'ja')
 * @param sourceLanguage - Source language code (optional, auto-detected if not provided)
 * @param articleUrl - Article URL for caching (optional)
 */
export async function translateText(
  text: string,
  targetLanguage: string = 'en',
  sourceLanguage?: string,
  articleUrl?: string
): Promise<TranslationResult> {
  // Check cache first if articleUrl provided
  if (articleUrl) {
    const cached = await getCachedTranslation(articleUrl, targetLanguage);
    if (cached && cached.originalText === text) {
      console.log('[Translation] Using cached translation');
      return {
        success: true,
        translatedText: cached.translatedText,
        detectedLanguage: cached.sourceLanguage,
        targetLanguage: cached.targetLanguage,
      };
    }
  }

  if (!API_KEY) {
    return {
      success: false,
      translatedText: '',
      targetLanguage,
      error: 'Google Translate API key not configured. Please set VITE_GOOGLE_TRANSLATE_API_KEY in your environment variables.',
    };
  }

  // Auto-detect source language if not provided
  let detectedLang = sourceLanguage;
  if (!detectedLang) {
    detectedLang = await detectLanguage(text) || 'auto';
  }

  // Don't translate if source and target are the same
  if (detectedLang === targetLanguage) {
    return {
      success: true,
      translatedText: text,
      detectedLanguage: detectedLang,
      targetLanguage,
    };
  }

  try {
    const response = await fetch(
      `${GOOGLE_TRANSLATE_API}?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLanguage,
          source: detectedLang === 'auto' ? undefined : detectedLang,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    const translatedText = data.data?.translations?.[0]?.translatedText || '';

    if (!translatedText) {
      throw new Error('No translation returned from API');
    }

    const result: TranslationResult = {
      success: true,
      translatedText,
      detectedLanguage: detectedLang,
      targetLanguage,
    };

    // Cache translation if articleUrl provided
    if (articleUrl) {
      await cacheTranslation({
        articleUrl,
        originalText: text,
        translatedText,
        sourceLanguage: detectedLang || 'unknown',
        targetLanguage,
        timestamp: Date.now(),
      });
    }

    return result;
  } catch (error) {
    console.error('[Translation] Translation failed:', error);
    return {
      success: false,
      translatedText: '',
      targetLanguage,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user's preferred language from browser settings
 */
export function getUserLanguage(): string {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language.split('-')[0]; // e.g., 'en-US' -> 'en'
  }
  return 'en'; // Default to English
}

/**
 * Get language name from code
 */
export function getLanguageName(code: string): string {
  const languageNames: Record<string, string> = {
    en: 'English',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    pt: 'Portuguese',
    ru: 'Russian',
    ar: 'Arabic',
    hi: 'Hindi',
    it: 'Italian',
    nl: 'Dutch',
    pl: 'Polish',
    tr: 'Turkish',
    vi: 'Vietnamese',
    th: 'Thai',
    id: 'Indonesian',
    cs: 'Czech',
    sv: 'Swedish',
    da: 'Danish',
    fi: 'Finnish',
    no: 'Norwegian',
    he: 'Hebrew',
    uk: 'Ukrainian',
    ro: 'Romanian',
    hu: 'Hungarian',
    el: 'Greek',
    bg: 'Bulgarian',
    hr: 'Croatian',
    sk: 'Slovak',
    sl: 'Slovenian',
    et: 'Estonian',
    lv: 'Latvian',
    lt: 'Lithuanian',
    mt: 'Maltese',
    ga: 'Irish',
    cy: 'Welsh',
  };

  return languageNames[code] || code.toUpperCase();
}

