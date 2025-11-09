# Supabase Global Disable Flag

**Date:** 2025-11-09  
**Purpose:** Temporarily disable all Supabase data operations globally

## 🚀 How to Disable Supabase

### Option 1: Environment Variable (Recommended)

Add to your `.env.local` file:

```bash
VITE_SUPABASE_DISABLED=true
```

### Option 2: GitHub Secrets (For Production)

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Add new secret:
   - **Name:** `VITE_SUPABASE_DISABLED`
   - **Value:** `true`
3. Update `.github/workflows/deploy.yml` to pass it to build:

```yaml
- name: Build React app with Vite
  run: npm run build
  env:
    # ... other env vars ...
    VITE_SUPABASE_DISABLED: ${{ secrets.VITE_SUPABASE_DISABLED || 'false' }}
```

## ✅ What Gets Disabled

When `VITE_SUPABASE_DISABLED=true`, **ALL** Supabase operations are skipped:

- ✅ **Bookmarks** - No create/delete/fetch operations
- ✅ **Article Likes** - No like/unlike operations
- ✅ **Submissions** - No create/fetch operations
- ✅ **User Follows** - No follow/unfollow operations
- ✅ **Messages** - No send/fetch operations, no real-time subscriptions
- ✅ **Conversations** - No create/fetch operations
- ✅ **Proposals** - No create/fetch operations
- ✅ **Votes** - No vote operations
- ✅ **Notifications** - No fetch/mark read operations
- ✅ **Points Transactions** - No logging to Supabase
- ✅ **Ad Slot Subscriptions** - No subscription operations
- ✅ **Lists** - No create/update/delete operations

## 📊 Behavior When Disabled

- **Queries:** Return empty arrays `[]` or `null`
- **Mutations:** Return error `"Supabase disabled"`
- **Real-time subscriptions:** Not initialized
- **Console logs:** Use `console.debug()` (less verbose)
- **No network requests:** Zero Supabase API calls

## 🔄 Re-enabling Supabase

Simply remove `VITE_SUPABASE_DISABLED` from your `.env.local` or set it to `false`:

```bash
VITE_SUPABASE_DISABLED=false
```

Or remove the variable entirely.

## 💡 Use Cases

- **Development:** Test app without Supabase connection
- **Debugging:** Isolate Supabase-related issues
- **Performance:** Reduce network requests during testing
- **Migration:** Temporarily disable while migrating data
- **Maintenance:** Disable during Supabase maintenance

## ⚠️ Important Notes

- **Data Loss:** When disabled, no data is saved to Supabase
- **Offline Queue:** Message queue will mark messages as "failed" if Supabase is disabled
- **Clerk Still Works:** Clerk authentication and metadata are **NOT** affected
- **MCP Server Still Works:** MCP server operations are **NOT** affected
- **IndexedDB Still Works:** Local caching (IndexedDB) still functions

## 🔍 Verification

After setting `VITE_SUPABASE_DISABLED=true`, check browser console:

```
⚠️ Supabase is DISABLED globally (VITE_SUPABASE_DISABLED=true). All Supabase operations will be skipped.
```

All Supabase operations will log:
```
Supabase disabled or not initialized - skipping operation
```

