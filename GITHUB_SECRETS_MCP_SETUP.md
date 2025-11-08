# GitHub Secrets & Environment Variables Setup Guide

## 🔐 Required GitHub Secrets

Add these secrets in: **Settings → Secrets and variables → Actions → New repository secret**

### 1. **VITE_MCP_SERVER_URL** (Required for MCP Integration)

**Value:**
```
https://web3news-mcp-server.vercel.app/api/server
```

**Purpose:** 
- Enables MCP server integration for RSS feed fetching
- Bypasses CORS issues for blocked RSS feeds
- Provides access to 109+ news sources including Chinese sources

**How to Add:**
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `VITE_MCP_SERVER_URL`
5. Value: `https://web3news-mcp-server.vercel.app/api/server`
6. Click **Add secret**

---

## 📋 Complete List of Required Secrets

### Already Required (Existing)
- ✅ `VITE_REOWN_PROJECT_ID` - Your Reown AppKit project ID
- ✅ `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
- ✅ `VITE_SUPABASE_URL` - Your Supabase project URL (optional)
- ✅ `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key (optional)

### New Required (For MCP Integration)
- ⭐ **`VITE_MCP_SERVER_URL`** - MCP server URL (required for MCP features)

### Optional (For MCP Configuration)
- `VITE_USE_MCP_CATEGORY_FETCH` - Set to `false` to disable MCP category fetch (defaults to `true`)

---

## 🚀 Quick Setup Steps

### Step 1: Add MCP Server URL Secret

```bash
# In GitHub Web UI:
1. Repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: VITE_MCP_SERVER_URL
4. Value: https://web3news-mcp-server.vercel.app/api/server
5. Click "Add secret"
```

### Step 2: Verify Secrets Are Set

After adding the secret, verify it appears in your secrets list:
- Settings → Secrets and variables → Actions
- You should see `VITE_MCP_SERVER_URL` in the list

### Step 3: Trigger New Deployment

The next push to `main` branch will automatically:
1. Use the new `VITE_MCP_SERVER_URL` secret
2. Build the app with MCP integration enabled
3. Deploy to GitHub Pages

---

## 🔍 How to Verify MCP is Working

After deployment, check the browser console on your GitHub Pages site:

### ✅ Success Indicators:
```javascript
// In browser console, you should see:
[RSS] Attempting MCP category fetch for tech...
[RSS] ✅ MCP category fetch succeeded for tech: X articles
```

### ❌ If MCP Not Working:
```javascript
// You'll see:
⚠️ MCP server also failed: MCP server URL not configured
```

---

## 📊 Environment Variables Reference

### Build-Time Variables (Set in GitHub Actions)

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `VITE_REOWN_PROJECT_ID` | ✅ Yes | - | Reown AppKit project ID |
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ Yes | - | Clerk authentication key |
| `VITE_SUPABASE_URL` | ⚠️ Optional | - | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ⚠️ Optional | - | Supabase anonymous key |
| `VITE_MCP_SERVER_URL` | ✅ Yes (for MCP) | - | MCP server endpoint |
| `VITE_USE_MCP_CATEGORY_FETCH` | ⚠️ Optional | `true` | Enable MCP category fetch |
| `VITE_BASE_PATH` | ✅ Auto-set | `/scaling-octo-garbanzo` | GitHub Pages base path |

### Runtime Behavior

- **If `VITE_MCP_SERVER_URL` is NOT set:**
  - MCP category fetch will be skipped
  - Falls back to individual RSS feeds
  - MCP fallback for CORS-blocked feeds won't work

- **If `VITE_MCP_SERVER_URL` IS set:**
  - MCP category fetch will be attempted first
  - Falls back to individual RSS feeds if MCP fails
  - MCP fallback works for CORS-blocked feeds

---

## 🛠️ Troubleshooting

### Issue: "MCP server URL not configured"

**Solution:**
1. Verify `VITE_MCP_SERVER_URL` is set in GitHub Secrets
2. Check the secret name is exactly `VITE_MCP_SERVER_URL` (case-sensitive)
3. Verify the value is: `https://web3news-mcp-server.vercel.app/api/server`
4. Trigger a new deployment by pushing to `main` branch

### Issue: MCP requests failing

**Check:**
1. MCP server is accessible: https://web3news-mcp-server.vercel.app/api/server
2. Browser console for CORS errors
3. Network tab for failed requests

### Issue: Environment variable not available in build

**Solution:**
1. Ensure secret is added in GitHub Settings
2. Check workflow file includes the secret in `env:` section
3. Verify secret name matches exactly (case-sensitive)
4. Re-run the workflow after adding secret

---

## 📝 Example GitHub Secrets Configuration

```
Repository: clkhoo5211/scaling-octo-garbanzo
Settings → Secrets and variables → Actions

Secrets:
├── VITE_REOWN_PROJECT_ID: 1478687c5ec68d46a47d17c941950005
├── VITE_CLERK_PUBLISHABLE_KEY: pk_test_...
├── VITE_SUPABASE_URL: https://xxx.supabase.co
├── VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
└── VITE_MCP_SERVER_URL: https://web3news-mcp-server.vercel.app/api/server
```

---

## ✅ Verification Checklist

- [ ] `VITE_MCP_SERVER_URL` added to GitHub Secrets
- [ ] Value is: `https://web3news-mcp-server.vercel.app/api/server`
- [ ] Workflow file updated (already done in code)
- [ ] Push to `main` branch to trigger deployment
- [ ] Check browser console after deployment
- [ ] Verify MCP requests are being made
- [ ] Confirm articles are loading from MCP server

---

## 🎯 Next Steps

1. **Add the secret** in GitHub Settings
2. **Push a commit** to trigger deployment (or manually trigger workflow)
3. **Wait for deployment** to complete (2-5 minutes)
4. **Test the site** and check browser console
5. **Verify MCP integration** is working

EOF

