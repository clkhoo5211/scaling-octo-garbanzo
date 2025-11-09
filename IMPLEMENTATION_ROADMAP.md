# Implementation Roadmap: Web3News Aggregator

## 🎯 Current Status Summary

### ✅ Completed (This Session)

#### MCP Server (web3news-mcp-server)
- ✅ Added 25+ RSSHub sources from Folo
- ✅ Added `social` and `education` categories
- ✅ Updated `NEWS_SOURCES_JSON.json` and minified version
- ✅ Created comprehensive documentation
- ✅ Committed and pushed to GitHub

#### React Aggregator (web3news-aggregator)
- ✅ Updated `useArticles.ts` with `forceRealtime` option
- ✅ Real-time fetching infrastructure ready
- ✅ Documentation created (`FOLO_UI_INTEGRATION.md`)

---

## 🚀 Next Implementation Steps

### Phase 1: Complete Real-Time Implementation (2-3 hours)

#### 1.1 Create Real-Time MCP Service Function ⏳

**File**: `src/lib/services/mcpService.ts`

Add new function that bypasses all caching:

```typescript
export async function fetchRSSFeedViaMCPRealtime(
  url: string,
  sourceName: string,
  category: NewsCategory
): Promise<{ success: boolean; articles: Article[]; error?: string }> {
  const MCP_SERVER_URL = import.meta.env.VITE_MCP_SERVER_URL || 'https://web3news-mcp-server.vercel.app/api/server';
  
  try {
    // Cache-busting URL
    const cacheBuster = `?nocache=${Date.now()}`;
    const serverUrl = `${MCP_SERVER_URL}${cacheBuster}`;
    
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'get_rss_feed',
          arguments: {
            feed_url: url,
            max_items: 50,
            nocache: Date.now(),
          },
        },
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return {
        success: false,
        articles: [],
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        success: false,
        articles: [],
        error: data.error.message || 'Unknown MCP error',
      };
    }

    if (data.result?.content?.[0]?.type === 'text') {
      const articles = parseMCPResponse(data.result.content[0].text, sourceName, category);
      return {
        success: true,
        articles,
      };
    }

    return {
      success: false,
      articles: [],
      error: 'Invalid MCP response format',
    };
  } catch (error: any) {
    return {
      success: false,
      articles: [],
      error: error?.message || 'Network error',
    };
  }
}
```

**Priority**: High  
**Estimated Time**: 30 minutes

---

#### 1.2 Update RSS Service for Real-Time ⏳

**File**: `src/lib/services/rssService.ts`

Update `fetchRSSFeed` function to use real-time MCP when needed:

```typescript
async function fetchRSSFeed(
  url: string, 
  sourceName: string, 
  category: NewsCategory,
  forceRealtime: boolean = false // NEW parameter
) {
  // PRIMARY: MCP server (real-time if requested)
  try {
    if (forceRealtime) {
      const { fetchRSSFeedViaMCPRealtime } = await import('./mcpService');
      const mcpResult = await fetchRSSFeedViaMCPRealtime(url, sourceName, category);
      
      if (mcpResult.success && mcpResult.articles.length > 0) {
        console.debug(`✅ [REALTIME] MCP server fetched ${sourceName}: ${mcpResult.articles.length} articles`);
        return {
          success: true,
          articles: mcpResult.articles,
          source: sourceName,
        };
      }
    } else {
      // Regular MCP fetch (with caching)
      const mcpResult = await fetchRSSFeedViaMCP(url, sourceName, category);
      // ... existing logic
    }
  } catch (mcpError) {
    // ... error handling
  }
  
  // FALLBACK: Direct fetch
  // ... existing fallback logic
}
```

**Priority**: High  
**Estimated Time**: 30 minutes

---

#### 1.3 Enable Real-Time in HomePage ⏳

**File**: `src/pages/HomePage.tsx`

**Current**:
```typescript
const { data: articles, isLoading, isError, error } = useArticles(activeCategory, {
  usePagination: true,
  extractLinks: true,
  enableRealtime: true,
  countryCode: countryCode || undefined,
});
```

**Update to**:
```typescript
const { data: articles, isLoading, isError, error } = useArticles(activeCategory, {
  usePagination: true,
  extractLinks: true,
  enableRealtime: true,
  forceRealtime: true, // ← ADD THIS for true real-time
  countryCode: countryCode || undefined,
});
```

**Priority**: High  
**Estimated Time**: 5 minutes

---

### Phase 2: Folo UI Components (4-6 hours)

#### 2.1 Create FoloTimeline Component ⏳

**File**: `src/components/feed/FoloTimeline.tsx`

**Purpose**: Timeline view that groups articles by date (Folo's signature feature)

**Key Features**:
- Group articles by date (Today, Yesterday, This Week, etc.)
- Sticky date headers
- Smooth animations for new articles
- Responsive grid layout

**Priority**: Medium  
**Estimated Time**: 1-2 hours

---

#### 2.2 Create FoloReader Component ⏳

**File**: `src/components/article/FoloReader.tsx`

**Purpose**: Distraction-free reader with customizable settings

**Key Features**:
- Font size adjustment (A- / A+ buttons)
- Line height control
- Theme switching (Light / Dark / Sepia)
- Minimal header with close button
- Clean typography optimized for reading

**Priority**: Medium  
**Estimated Time**: 1-2 hours

---

#### 2.3 Create TranslationButton Component ⏳

**File**: `src/components/article/TranslationButton.tsx`

**Purpose**: AI-powered translation (like Folo)

**Key Features**:
- One-click translation
- Language auto-detection
- Translation caching (IndexedDB)
- Toggle between original/translated text

**Implementation Options**:
1. Google Translate API (free tier: 500k chars/month)
2. Browser's built-in translation API
3. OpenAI API (if available)

**Priority**: Low (Nice to have)  
**Estimated Time**: 2-3 hours

---

#### 2.4 Create ShareList Component ⏳

**File**: `src/components/feed/ShareList.tsx`

**Purpose**: Share curated lists of articles (Folo community feature)

**Key Features**:
- Create shareable lists
- Generate shareable URLs
- Copy to clipboard
- Social sharing integration

**Priority**: Low (Nice to have)  
**Estimated Time**: 1-2 hours

---

### Phase 3: CSS Styling (1-2 hours)

#### 3.1 Add Folo-Inspired Styles ⏳

**File**: `src/app/globals.css`

Add CSS classes:
- `.folo-timeline` - Timeline container
- `.folo-reader` - Reader container
- `.folo-reader-header` - Reader header
- `.folo-reader-content` - Reader content area
- `.folo-reader-dark` - Dark theme
- `.folo-reader-sepia` - Sepia theme

**Priority**: Medium  
**Estimated Time**: 1 hour

---

## 📋 Quick Implementation Checklist

### Immediate (Today)
- [ ] Create `fetchRSSFeedViaMCPRealtime` function
- [ ] Update `rssService.ts` to support real-time
- [ ] Enable `forceRealtime: true` in HomePage
- [ ] Test real-time updates (verify no caching)

### This Week
- [ ] Create `FoloTimeline` component
- [ ] Create `FoloReader` component
- [ ] Add Folo CSS styles
- [ ] Integrate Folo components into HomePage

### Next Week
- [ ] Create `TranslationButton` component
- [ ] Create `ShareList` component
- [ ] Polish UI/UX
- [ ] Add tests

---

## 🧪 Testing Plan

### Real-Time Testing
```typescript
// Test in browser console
const testRealtime = async () => {
  const start = Date.now();
  const res1 = await fetch('/api/articles/tech?nocache=' + Date.now());
  const articles1 = await res1.json();
  console.log(`First: ${articles1.length} articles in ${Date.now() - start}ms`);
  
  await new Promise(r => setTimeout(r, 1000));
  
  const start2 = Date.now();
  const res2 = await fetch('/api/articles/tech?nocache=' + Date.now());
  const articles2 = await res2.json();
  console.log(`Second: ${articles2.length} articles in ${Date.now() - start2}ms`);
  console.log(`Cache bypassed: ${Date.now() - start2 > 100}ms`);
};
```

### Component Testing
- [ ] FoloTimeline displays articles grouped by date
- [ ] FoloReader opens/closes correctly
- [ ] Font size controls work
- [ ] Theme switching works
- [ ] TranslationButton translates articles
- [ ] ShareList creates shareable links

---

## 📊 Progress Tracking

### Phase 1: Real-Time Implementation
- ✅ `useArticles.ts` updated (DONE)
- ⏳ `fetchRSSFeedViaMCPRealtime` function (TODO)
- ⏳ `rssService.ts` updated (TODO)
- ⏳ `HomePage.tsx` updated (TODO)
- ⏳ Testing (TODO)

### Phase 2: Folo UI Components
- ⏳ FoloTimeline (TODO)
- ⏳ FoloReader (TODO)
- ⏳ TranslationButton (TODO)
- ⏳ ShareList (TODO)

### Phase 3: CSS Styling
- ⏳ Folo CSS classes (TODO)

---

## 🎯 Success Criteria

### Real-Time Implementation
- ✅ Articles update every 30 seconds
- ✅ No caching occurs (verified in Network tab)
- ✅ MCP server requests include cache-busting
- ✅ Console shows "🔄 REAL-TIME" messages

### Folo UI Components
- ✅ Timeline view groups articles by date
- ✅ Reader view is distraction-free
- ✅ Translation works for multiple languages
- ✅ Lists can be shared via URL

---

*Last Updated: 2025-01-XX*
*Next Review: After Phase 1 completion*

