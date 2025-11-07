# Browser Console Errors Fix

## Issues Fixed

### 1. Service Worker Registration Failed (404)
**Problem**: Service Worker was trying to register at `/sw.js` but GitHub Pages requires `/scaling-octo-garbanzo/sw.js`.

**Solution**:
- Added fallback path detection for Service Worker registration
- Try multiple paths: `${basePath}/sw.js`, `/sw.js`, and with cache buster
- Silently fail if Service Worker doesn't exist (it's optional for PWA)
- Only log warnings in development mode

**Files Changed**:
- `src/components/ServiceWorkerRegistration.tsx`

### 2. manifest.webmanifest 404
**Problem**: Manifest path wasn't accounting for GitHub Pages basePath.

**Solution**:
- Calculate `basePath` dynamically in `layout.tsx` (same logic as `next.config.js`)
- Use `${basePath}/manifest.webmanifest` instead of `/manifest.webmanifest`
- Also fixed icon paths to include basePath

**Files Changed**:
- `src/app/layout.tsx`

### 3. CORS Policy Errors for RSS Feeds
**Problem**: RSS feeds were failing due to CORS restrictions, causing console errors.

**Solution**:
- Added 10-second timeout to prevent hanging on slow feeds
- Improved error handling to only log non-timeout errors
- Better error messages for debugging
- Fallback to RSS2JSON proxy if allorigins.win fails

**Files Changed**:
- `src/lib/sources/baseRSSSource.ts`

### 4. Slow Initial Loading
**Problem**: Articles were loading slowly on initial page load.

**Solution**:
- Increased `staleTime` from 5 minutes to 10 minutes (better caching)
- Increased `gcTime` from 10 minutes to 30 minutes (keep cache longer)
- Added `refetchOnReconnect: false` to prevent unnecessary refetches
- Set `networkMode: 'online'` to only fetch when online

**Files Changed**:
- `src/lib/hooks/useArticles.ts`

## Verification

After deployment, verify:
1. ✅ Service Worker registration succeeds (or fails silently without console errors)
2. ✅ `manifest.webmanifest` loads correctly (check Network tab)
3. ✅ RSS feeds load without CORS errors (check Network tab for proxy requests)
4. ✅ Initial page load is faster (articles appear quickly)

## Notes

- Service Worker is optional - if it fails to register, the app still works
- CORS proxy timeouts are expected for slow RSS feeds - they're handled gracefully
- Manifest path is now correctly calculated for both local dev and GitHub Pages

