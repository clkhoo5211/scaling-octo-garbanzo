# Files to Delete - Next.js Migration Cleanup

This document lists all files that are no longer needed after migrating from Next.js to React.

## ⚠️ IMPORTANT: Backup Before Deleting

Before deleting these files, ensure:
1. ✅ All pages have been migrated to `src/pages/`
2. ✅ All components updated to use React Router
3. ✅ Build works with `npm run build`
4. ✅ GitHub Actions workflow updated

## 📁 Files to Delete

### Next.js Configuration Files
- ✅ `next.config.js` - Next.js configuration (replaced by `vite.config.ts`)
- ✅ `next-env.d.ts` - Next.js TypeScript definitions (if exists)

### Next.js App Router Directory (Entire Directory)
The entire `src/app/` directory can be deleted as all pages have been migrated:

**Delete these directories:**
- `src/app/api/` - API routes (converted to service functions)
  - `src/app/api/article-content/route.ts`
  - `src/app/api/rss/route.ts`
- `src/app/article/` - Article page (migrated to `src/pages/ArticlePage.tsx`)
  - `src/app/article/page.tsx`
  - `src/app/article/ArticleReaderClient.tsx` - **KEEP THIS** (moved to pages, but still used)
- `src/app/article-client/` - (if empty or unused)
- `src/app/auctions/` - Auctions page (migrated to `src/pages/AuctionsPage.tsx`)
  - `src/app/auctions/page.tsx`
- `src/app/auth/` - Auth page (migrated to `src/pages/AuthPage.tsx`)
  - `src/app/auth/page.tsx`
- `src/app/bookmarks/` - Bookmarks page (migrated to `src/pages/BookmarksPage.tsx`)
  - `src/app/bookmarks/page.tsx`
- `src/app/cookie-policy/` - Cookie policy page (migrated to `src/pages/CookiePolicyPage.tsx`)
  - `src/app/cookie-policy/page.tsx`
- `src/app/governance/` - Governance page (migrated to `src/pages/GovernancePage.tsx`)
  - `src/app/governance/page.tsx`
- `src/app/lists/` - Lists page (migrated to `src/pages/ListsPage.tsx`)
  - `src/app/lists/page.tsx`
- `src/app/messages/` - Messages page (migrated to `src/pages/MessagesPage.tsx`)
  - `src/app/messages/page.tsx`
- `src/app/points/` - Points page (migrated to `src/pages/PointsPage.tsx`)
  - `src/app/points/page.tsx`
- `src/app/privacy-policy/` - Privacy policy page (migrated to `src/pages/PrivacyPolicyPage.tsx`)
  - `src/app/privacy-policy/page.tsx`
- `src/app/profile/` - Profile page (migrated to `src/pages/ProfilePage.tsx`)
  - `src/app/profile/page.tsx`
- `src/app/search/` - Search page (migrated to `src/pages/SearchPage.tsx`)
  - `src/app/search/page.tsx`
- `src/app/social/` - Social page (migrated to `src/pages/SocialPage.tsx`)
  - `src/app/social/page.tsx`
- `src/app/subscription/` - Subscription page (migrated to `src/pages/SubscriptionPage.tsx`)
  - `src/app/subscription/page.tsx`

**Keep but update:**
- `src/app/globals.css` - **KEEP** (moved to `src/app/globals.css` - still used)
- `src/app/providers.tsx` - **KEEP** (still used by App.tsx)
- `src/app/layout.tsx` - **DELETE** (replaced by App.tsx and index.html)
- `src/app/page.tsx` - **DELETE** (migrated to `src/pages/HomePage.tsx`)
- `src/app/manifest.ts` - **DELETE** (handled by Vite PWA plugin)
- `src/app/robots.ts` - **DELETE** (can create `public/robots.txt` instead)
- `src/app/sitemap.ts` - **DELETE** (can create `public/sitemap.xml` instead)

### Build Scripts
- ✅ `scripts/post-build.sh` - Next.js post-build script (no longer needed)

### Deployment Configuration Files
- ✅ `vercel.json` - Vercel configuration (if not using Vercel)
- ✅ `netlify.toml` - Netlify configuration (if not using Netlify)

### Webpack Stubs (Next.js Specific)
- ✅ `webpack/async-storage-stub.js` - Next.js webpack stub
- ✅ `webpack/react-native-stub.js` - Next.js webpack stub
- ✅ `webpack/clerk-server-actions-stub.js` - Next.js webpack stub

### Build Output Directories (Auto-generated)
- ✅ `.next/` - Next.js build output (will be replaced by `dist/`)
- ✅ `out/` - Next.js static export output (replaced by `dist/`)

## 📝 Files to Keep but Update

### Components Still Using Next.js Imports
Check these files for any remaining Next.js imports:
- All files in `src/components/` - Most updated, but verify
- All files in `src/lib/` - Verify no Next.js imports

### Environment Files
- ✅ `.env.example` - **UPDATE** (change `NEXT_PUBLIC_*` to `VITE_*`)
- ✅ `.env.local` - **UPDATE** (if exists, change variable names)

## 🗑️ Deletion Commands

**⚠️ Run these commands carefully after verifying everything works:**

```bash
# Delete Next.js config
rm next.config.js

# Delete Next.js app router pages (keep globals.css and providers.tsx)
rm -rf src/app/api
rm -rf src/app/article/page.tsx
rm -rf src/app/auctions
rm -rf src/app/auth
rm -rf src/app/bookmarks
rm -rf src/app/cookie-policy
rm -rf src/app/governance
rm -rf src/app/lists
rm -rf src/app/messages
rm -rf src/app/points
rm -rf src/app/privacy-policy
rm -rf src/app/profile
rm -rf src/app/search
rm -rf src/app/social
rm -rf src/app/subscription
rm src/app/layout.tsx
rm src/app/page.tsx
rm src/app/manifest.ts
rm src/app/robots.ts
rm src/app/sitemap.ts

# Delete build scripts
rm scripts/post-build.sh

# Delete webpack stubs
rm -rf webpack/

# Delete deployment configs (if not using)
# rm vercel.json
# rm netlify.toml

# Delete build outputs (will be regenerated)
rm -rf .next/
rm -rf out/
```

## ✅ Verification Checklist

Before deleting, verify:
- [ ] `npm run build` works
- [ ] `npm run dev` works
- [ ] All routes work in browser
- [ ] GitHub Actions workflow updated
- [ ] Environment variables updated
- [ ] No Next.js imports remain

## 📋 After Deletion

1. **Move remaining files:**
   - Move `src/app/globals.css` to `src/globals.css` (or keep where it is)
   - Keep `src/app/providers.tsx` (still used)

2. **Create static files:**
   - Create `public/robots.txt` (if needed)
   - Create `public/sitemap.xml` (if needed)

3. **Update imports:**
   - Update any imports referencing deleted files
   - Update `src/main.tsx` if globals.css path changes

4. **Test deployment:**
   - Push to GitHub
   - Verify GitHub Actions workflow runs
   - Verify GitHub Pages deployment works

