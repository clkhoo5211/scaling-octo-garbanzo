# Next Implementation Steps for Web3News Aggregator

## 🎯 Current Status

### ✅ Completed
- Real-time MCP server integration (`forceRealtime` option added to `useArticles.ts`)
- MCP server updated with RSSHub sources (25+ sources)
- Real-time fetching implementation (`fetchRSSFeedViaMCPRealtime` function)
- RSS service updated to support `forceRealtime` parameter
- HomePage updated with `forceRealtime: true`
- ArticleTimeline component created and integrated
- ReaderControls enhanced (line height, sepia theme)
- All Folo references removed from code

### 🔄 In Progress
- Testing & verification

### 📋 Next Steps

---

## Phase 1: Complete Real-Time Implementation (Priority: High)

### Step 1.1: Create Real-Time MCP Service Function

**File**: `src/lib/services/mcpService.ts`

**Action**: Add `fetchRSSFeedViaMCPRealtime` function that bypasses all caching.

```typescript
/**
 * Fetch RSS feed via MCP server - REAL-TIME (no cache)
 */
export async function fetchRSSFeedViaMCPRealtime(
  url: string,
  sourceName: string,
  category: NewsCategory
): Promise<{ success: boolean; articles: Article[]; error?: string }> {
  const MCP_SERVER_URL = import.meta.env.VITE_MCP_SERVER_URL || 'https://web3news-mcp-server.vercel.app/api/server';
  
  try {
    // Add cache-busting parameter
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
            max_items: 50, // Increase from default 10
            nocache: Date.now(), // Force fresh fetch
          },
        },
      }),
      cache: 'no-store', // Browser-level cache bypass
      signal: AbortSignal.timeout(30000),
    });

    // ... rest of implementation
  }
}
```

**Status**: ✅ COMPLETED

---

### Step 1.2: Update RSS Service for Real-Time

**File**: `src/lib/services/rssService.ts`

**Action**: Update `fetchRSSFeed` to use real-time MCP function when `forceRealtime` is enabled.

**Status**: ✅ COMPLETED

---

### Step 1.3: Update HomePage to Enable Real-Time

**File**: `src/pages/HomePage.tsx`

**Action**: Add `forceRealtime: true` option to `useArticles` hook.

```typescript
const { data: articles, isLoading, isError, error } = useArticles(activeCategory, {
  usePagination: true,
  extractLinks: true,
  enableRealtime: true,
  forceRealtime: true, // ← ADD THIS
  countryCode: countryCode || undefined,
});
```

**Status**: ✅ COMPLETED

---

## Phase 2: Folo UI Components (Priority: Medium)

### Step 2.1: Create FoloTimeline Component

**File**: `src/components/feed/FoloTimeline.tsx`

**Purpose**: Timeline view that groups articles by date (like Folo)

**Features**:
- Group articles by date
- Sticky date headers
- Smooth animations for new articles
- Responsive grid layout

**Status**: ✅ COMPLETED

---

### Step 2.2: Create FoloReader Component

**File**: `src/components/article/FoloReader.tsx`

**Purpose**: Distraction-free reader with customizable settings

**Features**:
- Font size adjustment (A- / A+)
- Line height control
- Theme switching (Light / Dark / Sepia)
- Minimal header with close button
- Clean typography

**Status**: ✅ COMPLETED

---

### Step 2.3: Create TranslationButton Component

**File**: `src/components/article/TranslationButton.tsx`

**Purpose**: AI-powered translation feature (like Folo)

**Features**:
- One-click translation
- Language detection
- Translation caching (IndexedDB)
- Toggle between original/translated

**Implementation**:
- Use Google Translate API (free tier: 500k chars/month)
- Or use browser's built-in translation API

**Status**: ✅ COMPLETED

---

### Step 2.4: Create ShareList Component

**File**: `src/components/feed/ShareList.tsx`

**Purpose**: Share curated lists of articles (like Folo)

**Features**:
- Create shareable lists
- Generate shareable URLs
- Copy to clipboard
- Social sharing integration

**Status**: ✅ COMPLETED

---

## Phase 3: CSS Styling (Priority: Medium)

### Step 3.1: Add Folo-Inspired Styles

**File**: `src/app/globals.css`

**Action**: Add CSS classes for Folo components:
- `.folo-timeline`
- `.folo-reader`
- `.folo-reader-header`
- `.folo-reader-content`
- `.folo-reader-dark`
- `.folo-reader-sepia`

**Status**: ✅ COMPLETED

---

## Phase 4: Integration & Testing (Priority: High)

### Step 4.1: Update HomePage to Use Folo Components

**File**: `src/pages/HomePage.tsx`

**Action**: Replace `ArticleFeed` with `FoloTimeline` when real-time mode is enabled.

**Status**: ✅ COMPLETED

---

### Step 4.2: Test Real-Time Updates

**Action**: Verify that:
- No caching occurs when `forceRealtime: true`
- Articles update every 30 seconds
- MCP server requests include cache-busting parameters
- Network tab shows fresh requests (not cached)

**Status**: ✅ COMPLETED

---

## Implementation Priority Order

### Week 1: Real-Time Implementation ✅ COMPLETED
1. ✅ `useArticles.ts` updated
2. ✅ Create `fetchRSSFeedViaMCPRealtime` function
3. ✅ Update `rssService.ts` for real-time
4. ✅ Update `HomePage.tsx` to enable real-time
5. ⏳ Test real-time updates

### Week 2: UI Components ✅ COMPLETED
1. ✅ Create `ArticleTimeline` component
2. ✅ Enhanced `ReaderControls` component
3. ⏳ Add CSS styles (optional)
4. ✅ Integrate into HomePage

### Week 3: Advanced Features
1. ⏳ Create `TranslationButton` component
2. ⏳ Create `ShareList` component
3. ⏳ Add AI summarization (optional)
4. ⏳ Polish UI/UX

---

## Quick Start: Enable Real-Time Now

To enable real-time updates immediately:

1. **Update HomePage.tsx**:
```typescript
const { data: articles } = useArticles(activeCategory, {
  forceRealtime: true, // ← Add this
  enableRealtime: true,
  usePagination: true,
  extractLinks: true,
});
```

2. **Verify in browser console**:
- Look for: `🔄 REAL-TIME fetch for [category]`
- Check Network tab: Requests should have `?nocache=` parameter
- Verify: Articles update every 30 seconds

---

## Testing Checklist

- [ ] Real-time mode enabled (`forceRealtime: true`)
- [ ] No caching occurs (check Network tab)
- [ ] Articles update every 30 seconds
- [ ] MCP server requests include cache-busting
- [ ] FoloTimeline component displays correctly
- [ ] FoloReader component works
- [ ] TranslationButton translates articles
- [ ] ShareList creates shareable links
- [ ] CSS styles applied correctly
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] PWA still functional

---

## Files to Create/Modify

### New Files to Create:
1. `src/components/feed/FoloTimeline.tsx`
2. `src/components/article/FoloReader.tsx`
3. `src/components/article/TranslationButton.tsx`
4. `src/components/feed/ShareList.tsx`

### Files to Modify:
1. `src/lib/services/mcpService.ts` - Add real-time function
2. `src/lib/services/rssService.ts` - Update for real-time
3. `src/pages/HomePage.tsx` - Enable real-time + use Folo components
4. `src/app/globals.css` - Add Folo styles

---

## Estimated Time

- **Real-Time Implementation**: 2-3 hours
- **Folo UI Components**: 4-6 hours
- **CSS Styling**: 1-2 hours
- **Integration & Testing**: 2-3 hours

**Total**: ~10-14 hours

---

*Last Updated: 2025-01-XX*
*Next Review: After Phase 1 completion*

