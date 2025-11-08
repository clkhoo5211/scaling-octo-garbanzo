# Next.js Cleanup Summary

## ✅ Workflow Status: CORRECT
The GitHub Actions workflow (`.github/workflows/deploy.yml`) is correctly configured for Vite:
- ✅ Uses `npm run build` (Vite)
- ✅ Sets `VITE_BASE_PATH` correctly
- ✅ Deploys `dist/` folder
- ✅ No Next.js references

## ❌ Next.js Remnants Found

### Critical Issues (Will Break Build)

1. **Duplicate Page Files in `src/app/`**
   - All page files in `src/app/` are duplicates
   - They use Next.js imports (`next/link`, `next/navigation`, `next/dynamic`)
   - **Action**: Delete entire `src/app/` directory except:
     - ✅ Keep: `src/app/providers.tsx` (used by `App.tsx`)
     - ✅ Keep: `src/app/globals.css` (used by `App.tsx`)

2. **Next.js API Routes**
   - `src/app/api/rss/route.ts` - Uses `NextRequest`, `NextResponse`
   - `src/app/api/article-content/route.ts` - Uses `NextRequest`, `NextResponse`
   - **Action**: Delete `src/app/api/` directory (replaced with client-side services)

3. **Next.js Layout File**
   - `src/app/layout.tsx` - Uses Next.js `Metadata`, `Viewport`, `next/dynamic`, `next/script`
   - **Action**: Delete (replaced by `App.tsx`)

4. **Next.js Config Files**
   - `src/app/manifest.ts` - Uses `process.env.NEXT_PUBLIC_BASE_PATH`
   - `src/app/robots.ts` - Next.js specific
   - `src/app/sitemap.ts` - Next.js specific
   - **Action**: Delete (handled by Vite PWA plugin or static files)

### Non-Critical (Harmless but Unnecessary)

5. **"use client" Directives**
   - Found 78 instances
   - Harmless in React but unnecessary
   - **Action**: Optional cleanup

6. **next.config.js**
   - Old Next.js configuration
   - Not used by Vite
   - **Action**: Can delete or keep for reference

## 🧹 Recommended Cleanup Commands

```bash
# Delete Next.js API routes
rm -rf src/app/api

# Delete Next.js layout and config files
rm src/app/layout.tsx
rm src/app/manifest.ts
rm src/app/robots.ts
rm src/app/sitemap.ts

# Delete all Next.js page files (keep only providers.tsx and globals.css)
find src/app -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "providers.tsx" ! -name "globals.css" -delete
find src/app -type d -empty -delete

# Optional: Delete next.config.js (or keep for reference)
# rm next.config.js
```

## ✅ Files to Keep

- ✅ `src/app/providers.tsx` - Used by `App.tsx`
- ✅ `src/app/globals.css` - Used by `App.tsx`
- ✅ All files in `src/pages/` - Migrated React pages
- ✅ `vite.config.ts` - Vite configuration
- ✅ `package.json` - Vite dependencies
- ✅ `.github/workflows/deploy.yml` - Correctly configured

## 📋 Verification After Cleanup

After cleanup, verify:
1. ✅ `npm run build` succeeds
2. ✅ `npm run dev` works
3. ✅ No `next/` imports in `src/` directory
4. ✅ All routes work correctly
5. ✅ GitHub Actions workflow will deploy successfully

