# Next.js Cleanup Report

## Summary
Found several Next.js remnants that need to be removed or updated for the React/Vite migration.

## ✅ Workflow Status
**`.github/workflows/deploy.yml`** - ✅ **CORRECT**
- Uses Vite build (`npm run build`)
- Sets Vite environment variables correctly
- Deploys `dist/` folder correctly
- No Next.js references

## ❌ Files That Need Cleanup

### 1. **Duplicate Page Files** (src/app/ vs src/pages/)
The following files in `src/app/` are duplicates of migrated files in `src/pages/`:
- `src/app/article/page.tsx` - Uses `next/navigation` ❌
- `src/app/bookmarks/page.tsx` - Uses `next/link` ❌
- `src/app/lists/page.tsx` - Uses `next/link` ❌
- `src/app/profile/page.tsx` - Uses `next/link` ❌
- `src/app/subscription/page.tsx` - Uses `next/link` ❌
- `src/app/auth/page.tsx` - Uses `next/dynamic` ❌
- `src/app/page.tsx` - Old Next.js home page ❌
- All other page files in `src/app/` ❌

**Action**: Delete entire `src/app/` directory (except `globals.css` and `providers.tsx` if needed)

### 2. **Next.js API Routes** (Not needed - replaced with client-side services)
- `src/app/api/rss/route.ts` - Uses `NextRequest`, `NextResponse` ❌
- `src/app/api/article-content/route.ts` - Uses `NextRequest`, `NextResponse` ❌

**Action**: Delete `src/app/api/` directory (already replaced with client-side services)

### 3. **Next.js Layout File**
- `src/app/layout.tsx` - Uses `Metadata`, `Viewport`, `next/dynamic`, `next/script` ❌

**Action**: Delete (replaced by `App.tsx` and `index.html`)

### 4. **Next.js Config Files**
- `src/app/manifest.ts` - Uses `process.env.NEXT_PUBLIC_BASE_PATH` ❌
- `src/app/robots.ts` - Next.js specific ❌
- `src/app/sitemap.ts` - Next.js specific ❌
- `next.config.js` - Next.js configuration file ❌

**Action**: 
- Delete `src/app/manifest.ts` (handled by Vite PWA plugin)
- Delete `src/app/robots.ts` (use static `public/robots.txt` if needed)
- Delete `src/app/sitemap.ts` (use static `public/sitemap.xml` if needed)
- Keep `next.config.js` for reference or delete if not needed

### 5. **"use client" Directives**
Found 78 instances of `"use client"` directives. These are harmless but unnecessary in pure React.

**Action**: Optional cleanup - can be removed but won't cause issues

## ✅ Files That Are Correct

### Already Migrated (src/pages/)
- ✅ All page files in `src/pages/` use React Router
- ✅ No Next.js imports in migrated pages

### Configuration Files
- ✅ `vite.config.ts` - Correctly configured
- ✅ `package.json` - Uses Vite, no Next.js dependencies
- ✅ `tsconfig.json` - Configured for React/Vite
- ✅ `index.html` - Correct entry point

## 🧹 Cleanup Actions Required

1. **Delete `src/app/` directory** (except `globals.css` and `providers.tsx` if still needed)
2. **Delete `next.config.js`** (or keep for reference)
3. **Verify `src/app/globals.css`** is imported in `App.tsx` or `main.tsx`
4. **Verify `src/app/providers.tsx`** is imported in `App.tsx`

## 📋 Verification Checklist

After cleanup, verify:
- [ ] No `next/` imports in `src/` directory
- [ ] All pages use React Router (`react-router-dom`)
- [ ] No Next.js API routes exist
- [ ] Build succeeds: `npm run build`
- [ ] Dev server works: `npm run dev`
- [ ] All routes work correctly

