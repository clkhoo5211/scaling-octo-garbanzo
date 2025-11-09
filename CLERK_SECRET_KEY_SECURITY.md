# Clerk Secret Key Security Guide

**Date:** 2025-11-09  
**Question:** Should it be `VITE_CLERK_SECRET_KEY`? Should it be in GitHub Secrets?

## 🔒 **CRITICAL: Secret Key Security**

### ❌ **DO NOT Use `VITE_` Prefix for Secret Keys**

**Why:**
- `VITE_` prefix = **Exposed to client-side** (browser bundle)
- `CLERK_SECRET_KEY` = **Backend secret** (must NEVER be exposed)
- If you use `VITE_CLERK_SECRET_KEY`, it will be visible in browser JavaScript!

### ✅ **Correct Configuration**

**`.env.local` (Local Development):**
```bash
# ✅ CORRECT: Publishable key (safe to expose)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# ✅ CORRECT: Secret key (NO VITE_ prefix - backend only)
CLERK_SECRET_KEY=sk_test_...
```

**Why NO `VITE_` prefix for secret key:**
- `VITE_*` variables are bundled into client-side JavaScript
- Anyone can view them in browser DevTools → Sources
- Secret keys must NEVER be in client-side code

## 📋 **GitHub Secrets Configuration**

### ✅ **What to Add to GitHub Secrets:**

**For GitHub Pages Build (`.github/workflows/deploy.yml`):**
```yaml
env:
  # ✅ Safe to expose (used in client-side React)
  VITE_CLERK_PUBLISHABLE_KEY: ${{ secrets.VITE_CLERK_PUBLISHABLE_KEY }}
  
  # ❌ DO NOT ADD: CLERK_SECRET_KEY
  # Secret keys should NOT be in GitHub Secrets for client-side builds
```

### ❌ **What NOT to Add:**

**DO NOT add `CLERK_SECRET_KEY` to GitHub Secrets** because:
1. **This is a static site** (GitHub Pages) - no backend server
2. **Secret key is only for:**
   - Local verification scripts (`verify-clerk-subscriptions.js`)
   - Backend API calls (if you had a backend server)
3. **If added to GitHub Secrets:**
   - Would be exposed in build logs (security risk)
   - Not needed for client-side React app
   - Could accidentally be bundled into client code

## 🔍 **Current Setup (Correct)**

**`.env.local` (Local - Gitignored):**
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...  # ✅ Client-side (safe)
CLERK_SECRET_KEY=sk_test_...            # ✅ Backend only (NOT exposed)
```

**`.gitignore` (Already configured):**
```gitignore
.env*.local  # ✅ Secret keys are gitignored
```

**GitHub Secrets (For Builds):**
```yaml
# ✅ Only publishable key needed
VITE_CLERK_PUBLISHABLE_KEY: pk_test_...
```

## 📝 **When to Use Each Key**

### `VITE_CLERK_PUBLISHABLE_KEY` (Client-Side)
- ✅ Used in React components (`<ClerkProvider>`)
- ✅ Safe to expose in browser
- ✅ Add to GitHub Secrets for builds
- ✅ Used in: `src/app/providers.tsx`

### `CLERK_SECRET_KEY` (Backend Only)
- ✅ Used for API calls (server-side)
- ✅ Used for verification scripts (local)
- ❌ **NEVER** expose to client-side
- ❌ **NEVER** add to GitHub Secrets (for client-side builds)
- ✅ Keep in `.env.local` (gitignored)

## 🛡️ **Security Best Practices**

1. **Never commit secret keys** ✅ (`.env.local` is gitignored)
2. **Never use `VITE_` prefix for secrets** ✅ (would expose to browser)
3. **Only add publishable keys to GitHub Secrets** ✅ (safe to expose)
4. **Secret keys only in local `.env.local`** ✅ (for verification scripts)

## 🔧 **Verification Script Usage**

The `verify-clerk-subscriptions.js` script:
- ✅ Reads `CLERK_SECRET_KEY` from `.env.local` (local only)
- ✅ Makes backend API calls (not exposed to browser)
- ✅ Only runs locally (not in GitHub Actions)
- ✅ Safe because it's not bundled into client code

## ✅ **Summary**

| Variable | Prefix | GitHub Secrets? | Used In |
|----------|--------|----------------|---------|
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ `VITE_` | ✅ Yes | Client-side React |
| `CLERK_SECRET_KEY` | ❌ **NO** `VITE_` | ❌ **NO** | Backend API only |

**Your current setup is CORRECT!** ✅

