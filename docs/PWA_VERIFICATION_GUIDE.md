# PWA Verification Guide

## How to Verify PWA Installation on Desktop

### Prerequisites for Install Prompt

For a PWA to show an install prompt, it must meet these criteria:

1. ✅ **HTTPS** - Your site must be served over HTTPS (GitHub Pages provides this)
2. ✅ **Valid Manifest** - `manifest.webmanifest` must be accessible and valid
3. ✅ **Service Worker** - Service Worker must be registered successfully
4. ✅ **Icons** - Icons (192x192 and 512x512) must exist and be accessible
5. ⚠️ **User Engagement** - User must interact with the site for a few seconds
6. ⚠️ **Not Already Installed** - PWA must not already be installed

## Step-by-Step Verification

### 1. Check Manifest File

**In Browser:**
```
https://clkhoo5211.github.io/scaling-octo-garbanzo/manifest.webmanifest
```

**Expected Response:**
```json
{
  "name": "Web3News - Decentralized News Aggregation",
  "short_name": "Web3News",
  "icons": [...],
  "start_url": "/scaling-octo-garbanzo/",
  "display": "standalone"
}
```

**If 404:** Manifest not being generated correctly

### 2. Check Service Worker Registration

**Open Browser Console (F12):**
- Look for: `"Service Worker registered: /scaling-octo-garbanzo/"`
- Check Application tab → Service Workers
- Should show: "activated and is running"

**If not registered:** Check console for errors

### 3. Check Icons

**Verify icons are accessible:**
```
https://clkhoo5211.github.io/scaling-octo-garbanzo/icon-192x192.png
https://clkhoo5211.github.io/scaling-octo-garbanzo/icon-512x512.png
```

**If 404:** Icons not being copied to build output

### 4. Check Chrome DevTools

**Open Chrome DevTools → Application Tab:**

1. **Manifest:**
   - Should show your manifest details
   - Check for any errors (red text)

2. **Service Workers:**
   - Should show registered service worker
   - Status: "activated and is running"

3. **Storage:**
   - Should show cached assets

### 5. Manual Install Trigger

**If install prompt doesn't appear automatically:**

**Chrome/Edge:**
1. Click the **lock icon** (or info icon) in address bar
2. Look for **"Install"** option
3. Or go to: Menu (⋮) → "Install Web3News..."

**Firefox:**
1. Click the **+** icon in address bar
2. Or go to: Menu → "Install Site as App"

**Safari (macOS):**
1. File → "Add to Dock"
2. (Safari has limited PWA support)

## Common Issues & Solutions

### Issue 1: Manifest Not Found (404)

**Problem:** `manifest.webmanifest` returns 404

**Solution:**
- Check if Next.js is generating the manifest correctly
- Verify `src/app/manifest.ts` exists
- Check build output for `manifest.webmanifest`

### Issue 2: Service Worker Not Registering

**Problem:** Console shows "Service Worker not found"

**Solution:**
- Verify `public/sw.js` exists
- Check Service Worker path matches basePath
- Ensure Service Worker is accessible at `/scaling-octo-garbanzo/sw.js`

### Issue 3: Icons Not Loading

**Problem:** Icons return 404

**Solution:**
- Verify icons exist in `public/` directory
- Check icons are copied to build output
- Verify icon paths in manifest match actual paths

### Issue 4: Install Prompt Not Showing

**Possible Reasons:**
1. **Already Installed** - Check if PWA is already installed
2. **Not Enough Engagement** - Interact with site for 30+ seconds
3. **Browser Doesn't Support** - Some browsers have limited PWA support
4. **Manifest Errors** - Check Chrome DevTools → Application → Manifest for errors

## Testing Checklist

- [ ] Manifest accessible at `/manifest.webmanifest`
- [ ] Service Worker registered successfully
- [ ] Icons accessible (192x192 and 512x512)
- [ ] Site served over HTTPS
- [ ] No console errors related to PWA
- [ ] Chrome DevTools → Application → Manifest shows no errors
- [ ] Service Worker shows "activated and is running"
- [ ] Interacted with site for 30+ seconds
- [ ] PWA not already installed

## Quick Test Commands

**Check manifest:**
```bash
curl https://clkhoo5211.github.io/scaling-octo-garbanzo/manifest.webmanifest
```

**Check service worker:**
```bash
curl https://clkhoo5211.github.io/scaling-octo-garbanzo/sw.js
```

**Check icons:**
```bash
curl -I https://clkhoo5211.github.io/scaling-octo-garbanzo/icon-512x512.png
```

## Browser Support

| Browser | Install Prompt | Manual Install |
|---------|---------------|----------------|
| Chrome (Desktop) | ✅ Automatic | ✅ Menu → Install |
| Edge (Desktop) | ✅ Automatic | ✅ Menu → Install |
| Firefox (Desktop) | ⚠️ Limited | ✅ Menu → Install |
| Safari (macOS) | ❌ No | ⚠️ Add to Dock only |
| Chrome (Mobile) | ✅ Automatic | ✅ Menu → Install |
| Safari (iOS) | ⚠️ Add to Home Screen | ✅ Share → Add to Home Screen |

## Next Steps

1. **Verify all requirements** using the checklist above
2. **Check Chrome DevTools** for any errors
3. **Test on different browsers** (Chrome/Edge have best support)
4. **Wait for user engagement** (interact with site for 30+ seconds)
5. **Try manual install** if automatic prompt doesn't appear

