# 🚀 GitHub Setup Instructions
## Web3News - Blockchain Content Aggregator

**Repository**: https://github.com/clkhoo5211/scaling-octo-garbanzo  
**Status**: Code ready to push, GitHub configuration needed

---

## 📤 Step 1: Push Code to GitHub

### Option A: Using GitHub CLI (Recommended)

```bash
cd /Users/khoo/Downloads/project4/projects/project-20251107-003428-web3news-aggregator

# Authenticate with GitHub
gh auth login

# Push code
git push -u origin master
```

### Option B: Using Git with Personal Access Token

1. **Create Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: "Web3News Project"
   - Expiration: 90 days (or your preference)
   - Scopes: Check `repo` (full control)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **Push with token:**
   ```bash
   cd /Users/khoo/Downloads/project4/projects/project-20251107-003428-web3news-aggregator
   
   # When prompted for password, use your Personal Access Token
   git push -u origin master
   ```

### Option C: Using SSH (If you have SSH key set up)

```bash
cd /Users/khoo/Downloads/project4/projects/project-20251107-003428-web3news-aggregator

# Change remote to SSH
git remote set-url origin git@github.com:SharlanAndy/scaling-octo-garbanzo.git

# Push
git push -u origin master
```

---

## ⚙️ Step 2: Configure GitHub Secrets

**Go to**: https://github.com/clkhoo5211/scaling-octo-garbanzo/settings/secrets/actions

**Click**: "New repository secret"

### Required Secrets (Add these 4):

#### 1. NEXT_PUBLIC_SUPABASE_URL
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Your Supabase project URL
  - Format: `https://xxxxx.supabase.co`
  - Get from: https://supabase.com/dashboard → Your Project → Settings → API

#### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anonymous/public key
  - Get from: https://supabase.com/dashboard → Your Project → Settings → API → Project API keys → `anon` `public`

#### 3. NEXT_PUBLIC_REOWN_PROJECT_ID
- **Name**: `NEXT_PUBLIC_REOWN_PROJECT_ID`
- **Value**: Your Reown AppKit project ID
  - Get from: https://cloud.reown.com → Your Project → Project ID

#### 4. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- **Name**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **Value**: Your Clerk publishable key
  - Get from: https://dashboard.clerk.com → Your Application → API Keys → Publishable key

### Optional Secrets:

#### 5. SNYK_TOKEN (Optional - for Snyk security scanning)
- **Name**: `SNYK_TOKEN`
- **Value**: Your Snyk API token (if you want Snyk scanning)
  - Get from: https://app.snyk.io/account → API Token

---

## 📄 Step 3: Enable GitHub Pages

**Go to**: https://github.com/clkhoo5211/scaling-octo-garbanzo/settings/pages

**Configure:**
1. **Source**: Select "GitHub Actions" (NOT "Deploy from a branch")
2. **Save** (no other settings needed)

**Result**: GitHub Pages will automatically deploy when the workflow runs

---

## 🔍 Step 4: Verify Deployment

### Check GitHub Actions

1. **Go to**: https://github.com/clkhoo5211/scaling-octo-garbanzo/actions
2. **Look for**: "Deploy to GitHub Pages" workflow
3. **Status**: Should show "Running" or "Completed"
4. **If failed**: Click on the workflow → Check logs for errors

### Check GitHub Pages

1. **Go to**: https://github.com/clkhoo5211/scaling-octo-garbanzo/settings/pages
2. **Look for**: Deployment URL
3. **Should show**: `https://clkhoo5211.github.io/scaling-octo-garbanzo/`

### Visit Your Site

**URL**: https://clkhoo5211.github.io/scaling-octo-garbanzo/

**Verify:**
- ✅ Homepage loads
- ✅ No console errors
- ✅ Assets load correctly (CSS, JS)
- ✅ Navigation works
- ✅ Service Worker registers (check DevTools → Application → Service Workers)

---

## 🛠️ Step 5: Configure Branch Protection (Optional but Recommended)

**Go to**: https://github.com/clkhoo5211/scaling-octo-garbanzo/settings/branches

**Click**: "Add rule"

**Branch name pattern**: `main` (or `master` if that's your default branch)

**Settings:**
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - Select: `CI - Format, Typecheck and Lint`
- ✅ Require conversation resolution before merging
- ✅ Include administrators (optional)

**Click**: "Create"

---

## 📊 Step 6: Verify Workflows Are Running

### After First Push

1. **Go to**: https://github.com/clkhoo5211/scaling-octo-garbanzo/actions
2. **You should see**:
   - ✅ "Deploy to GitHub Pages" workflow running/completed
   - ✅ "CI - Format, Typecheck and Lint" workflow running/completed

### Expected Workflow Status

**Deploy Workflow:**
- ✅ Build job: Green checkmark
- ✅ Deploy job: Green checkmark
- ✅ Site deployed: https://clkhoo5211.github.io/scaling-octo-garbanzo/

**CI Workflow:**
- ✅ Quality checks: Green checkmark (or warnings if code needs formatting)

---

## 🐛 Troubleshooting

### Push Fails with 403 Error

**Solution**: Use one of these methods:
1. **GitHub CLI**: `gh auth login` then push
2. **Personal Access Token**: Create token, use as password
3. **SSH**: Set up SSH key, change remote URL

### Build Fails in GitHub Actions

**Check:**
1. All 4 required secrets are set
2. Secret names match exactly (case-sensitive)
3. Secret values don't have extra spaces
4. Check Actions logs for specific error

### Deployment Fails

**Check:**
1. GitHub Pages is enabled (Settings → Pages → Source: GitHub Actions)
2. Workflow has `pages: write` permission (already configured)
3. Build step completed successfully
4. `out/` directory was generated

### Site Shows 404 or Blank Page

**Check:**
1. basePath is configured correctly (`/scaling-octo-garbanzo`)
2. Repository name matches `GITHUB_REPOSITORY_NAME` in workflow
3. Check browser console for path errors
4. Verify `out/` directory structure

### Assets (CSS/JS) Not Loading

**Check:**
1. basePath includes asset paths
2. Check browser Network tab for failed requests
3. Verify `_next/static/` directory exists in `out/`

---

## ✅ Quick Checklist

**Before First Push:**
- [ ] Code committed locally
- [ ] Remote configured: `git remote add origin https://github.com/clkhoo5211/scaling-octo-garbanzo.git`

**After Push:**
- [ ] Code pushed to GitHub
- [ ] 4 GitHub Secrets configured
- [ ] GitHub Pages enabled (Source: GitHub Actions)
- [ ] Workflows running in Actions tab
- [ ] Site accessible at: https://clkhoo5211.github.io/scaling-octo-garbanzo/

---

## 🔗 Quick Links

- **Repository**: https://github.com/clkhoo5211/scaling-octo-garbanzo
- **Actions**: https://github.com/clkhoo5211/scaling-octo-garbanzo/actions
- **Pages Settings**: https://github.com/clkhoo5211/scaling-octo-garbanzo/settings/pages
- **Secrets**: https://github.com/clkhoo5211/scaling-octo-garbanzo/settings/secrets/actions
- **Branches**: https://github.com/clkhoo5211/scaling-octo-garbanzo/settings/branches

---

## 📝 Summary

**What You Need to Do:**

1. **Push Code** (use GitHub CLI, Personal Access Token, or SSH)
2. **Add 4 Secrets** in Settings → Secrets and variables → Actions
3. **Enable GitHub Pages** in Settings → Pages → Source: GitHub Actions
4. **Verify** deployment in Actions tab and visit your site

**That's it!** Once you complete these steps, your site will automatically deploy on every push to `main`/`master` branch.

---

**Need Help?** Check the troubleshooting section or review the workflow logs in the Actions tab.

