# Supabase Database Setup Guide

## ✅ Current Status

**Articles:** ❌ NOT stored in Supabase (fetched in real-time)  
**User Data:** ✅ Stored in Supabase (bookmarks, likes, follows, etc.)

## 🔧 Missing Table: `article_likes`

The `article_likes` table is missing from your Supabase database, causing 404 errors.

### How to Fix:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `cmxzslsavosmdheqhvsq`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Copy the contents of `supabase-migration-create-article-likes.sql`
   - Paste into SQL Editor
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verify Table Created**
   - Go to "Table Editor" in left sidebar
   - You should see `article_likes` table listed

## 📊 Complete Database Schema

If you need to create ALL tables, run the complete schema:

1. Open `database-schema-20251107-003428.sql`
2. Copy all SQL statements
3. Run in Supabase SQL Editor

**Note:** The schema includes:
- ✅ `article_likes` - Article likes (MISSING - needs to be created)
- ✅ `bookmarks` - User bookmarks
- ✅ `user_follows` - Social follows
- ✅ `points_transactions` - Points history
- ✅ `messages`, `conversations` - Messaging
- ✅ `proposals`, `votes` - Governance
- ✅ `notifications` - User notifications
- ✅ `lists`, `list_articles`, `list_subscriptions` - Curated lists
- ✅ `submissions` - User-submitted articles
- ✅ `advertisements` - Ad content
- ✅ `auction_participants`, `auction_bids` - Auction system

## 🚫 What's NOT in Supabase

- ❌ **Articles** - Fetched in real-time, NOT cached in database
- ❌ **Users table** - User data stored in Clerk metadata
- ❌ **RSS feed data** - Fetched directly from sources

## 💾 Where Articles ARE Cached

Articles are cached **client-side only** in:
- **IndexedDB** (browser storage)
  - 30-minute TTL (Time To Live)
  - 2,000 article limit
  - Auto-cleanup of expired articles
- **Service Worker Cache** (PWA)
  - Last 100 articles cached for offline access

This design ensures:
- ✅ Always fresh content (no stale database cache)
- ✅ Fast loading (client-side cache)
- ✅ Minimal database costs (no article storage)
- ✅ Real-time aggregation (always latest news)

