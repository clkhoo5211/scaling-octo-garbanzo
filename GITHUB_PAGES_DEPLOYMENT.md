# GitHub Pages Deployment Guide

This guide explains how to deploy your Web3News React application to GitHub Pages using GitHub Actions.

## ✅ Pre-Deployment Checklist

### 1. **GitHub Pages Settings**
- [ ] Repository is public (or you have GitHub Pro/Team)
- [ ] GitHub Pages is enabled in repository settings
- [ ] Source is set to "GitHub Actions" (not "Deploy from a branch")

### 2. **Required GitHub Secrets**
Add these secrets in: **Settings → Secrets and variables → Actions → New repository secret**

- [ ] `VITE_REOWN_PROJECT_ID` - Your Reown AppKit project ID
- [ ] `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### 3. **Workflow File**
- [x] `.github/workflows/deploy.yml` exists and is configured
- [x] Workflow triggers on push to `main` or `master` branch
- [x] Builds using Vite
- [x] Deploys to GitHub Pages

## 🚀 Deployment Steps

### Step 1: Add GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each:
   - Name: `VITE_REOWN_PROJECT_ID`, Value: Your Reown project ID
   - Name: `VITE_CLERK_PUBLISHABLE_KEY`, Value: Your Clerk key
   - Name: `VITE_SUPABASE_URL`, Value: Your Supabase URL
   - Name: `VITE_SUPABASE_ANON_KEY`, Value: Your Supabase key

### Step 2: Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save the settings

### Step 3: Push to GitHub

```bash
# Make sure you're on main/master branch
git checkout main  # or master

# Add all changes
git add .

# Commit changes
git commit -m "Configure Vite build for GitHub Pages"

# Push to trigger deployment
git push origin main  # or master
```

### Step 4: Monitor Deployment

1. Go to **Actions** tab in your repository
2. Click on the running workflow
3. Watch the build and deploy steps
4. Wait for deployment to complete (usually 2-5 minutes)

### Step 5: Access Your Site

After deployment completes:
- Your site will be available at: `https://[username].github.io/[repository-name]/`
- Example: `https://username.github.io/web3news-aggregator/`

## 📋 Workflow Configuration Details

The `.github/workflows/deploy.yml` file:

1. **Triggers**: Runs on push to `main`/`master` or manual dispatch
2. **Build Step**:
   - Uses Node.js 20
   - Installs dependencies with `npm ci`
   - Builds with `npm run build`
   - Sets `VITE_BASE_PATH` to `/repository-name` automatically
   - Uploads `dist` folder as artifact

3. **Deploy Step**:
   - Uses GitHub Pages deployment action
   - Deploys the artifact to GitHub Pages
   - Provides deployment URL

## 🔧 How It Works

### Base Path Configuration

The workflow automatically sets the base path:
```yaml
VITE_BASE_PATH: /${{ github.event.repository.name }}
```

This means:
- Repository name: `web3news-aggregator`
- Base path: `/web3news-aggregator`
- Site URL: `https://username.github.io/web3news-aggregator/`

### Build Process

1. **Checkout**: Gets your code
2. **Setup Node.js**: Installs Node.js 20
3. **Install Dependencies**: Runs `npm ci` (clean install)
4. **Build**: Runs `npm run build` which:
   - Uses Vite to build React app
   - Generates optimized production files in `dist/`
   - Creates service worker (`sw.js`)
   - Generates manifest (`manifest.webmanifest`)
5. **Upload Artifact**: Packages `dist/` for deployment
6. **Deploy**: Publishes to GitHub Pages

## 🐛 Troubleshooting

### Issue 1: Workflow Fails at Build Step

**Symptoms**: Build job fails with errors

**Solutions**:
- Check build logs in Actions tab
- Verify all dependencies are in `package.json`
- Ensure Node.js version matches (20.x)
- Check for TypeScript errors: `npm run typecheck`

### Issue 2: Site Shows 404 or Blank Page

**Symptoms**: Site loads but shows 404 or blank page

**Solutions**:
- Verify `VITE_BASE_PATH` is set correctly in workflow
- Check browser console for errors
- Verify `dist/index.html` exists
- Check that React Router `basename` matches basePath

### Issue 3: Assets Not Loading (CSS/JS/Images)

**Symptoms**: Styles missing, JavaScript errors, broken images

**Solutions**:
- Verify `base` in `vite.config.ts` matches `VITE_BASE_PATH`
- Check asset paths in `dist/index.html`
- Ensure icons are in `public/` folder
- Verify manifest icon paths include basePath

### Issue 4: Service Worker Not Registering

**Symptoms**: No service worker in DevTools

**Solutions**:
- Check `sw.js` exists in `dist/` after build
- Verify service worker path includes basePath
- Check browser console for registration errors
- Ensure HTTPS is enabled (GitHub Pages provides this)

### Issue 5: Environment Variables Not Working

**Symptoms**: API calls fail, missing configuration

**Solutions**:
- Verify secrets are set correctly in GitHub repository
- Check secret names match workflow file exactly
- Ensure secrets don't have extra spaces
- Verify environment variables are prefixed with `VITE_`

### Issue 6: Deployment Takes Too Long

**Symptoms**: Workflow runs for >10 minutes

**Solutions**:
- Check build logs for hanging processes
- Verify no infinite loops in build scripts
- Check for large dependencies slowing build
- Consider using build cache

## ✅ Verification Checklist

After deployment, verify:

- [ ] Site loads at correct URL
- [ ] All pages navigate correctly
- [ ] Assets (CSS, JS, images) load
- [ ] Service worker registers (check DevTools)
- [ ] Manifest loads correctly
- [ ] PWA can be installed
- [ ] API calls work (check network tab)
- [ ] No console errors
- [ ] Mobile responsive design works

## 🔄 Updating Your Site

To update your site:

1. Make changes to your code
2. Commit and push to `main`/`master`:
   ```bash
   git add .
   git commit -m "Update site"
   git push origin main
   ```
3. GitHub Actions will automatically:
   - Build your site
   - Deploy to GitHub Pages
4. Wait 2-5 minutes for deployment
5. Refresh your site to see changes

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [React Router Deployment](https://reactrouter.com/en/main/start/overview#deployment)

## 🎯 Quick Reference

**Workflow File**: `.github/workflows/deploy.yml`

**Build Command**: `npm run build`

**Output Directory**: `dist/`

**Base Path**: Automatically set to `/repository-name`

**Deployment URL**: `https://[username].github.io/[repository-name]/`

**Required Secrets**:
- `VITE_REOWN_PROJECT_ID`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
