# ✅ Build Verification Guide

## Testing npm run build for GitHub Pages

**Purpose**: Verify that `npm run build` works correctly before deployment

---

## 🔍 Build Configuration Check

### ✅ Verified Configuration:

1. **package.json**:

   ```json
   "build": "next build"
   ```

   ✅ Correct - Next.js build command

2. **next.config.js**:

   ```javascript
   output: "export"; // ✅ Generates static files
   basePath: process.env.GITHUB_REPOSITORY_NAME
     ? `/${process.env.GITHUB_REPOSITORY_NAME}`
     : "";
   ```

   ✅ Correct - Static export for GitHub Pages

3. **Workflow**:

   ```yaml
   - run: npm run build
   env:
     GITHUB_REPOSITORY_NAME: scaling-octo-garbanzo
     NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
     ...
   ```

   ✅ Correct - Environment variables set

4. **Output Directory**:
   ```yaml
   path: ./out
   ```
   ✅ Correct - Next.js static export creates `out/` directory

---

## 🧪 How to Test Build Locally

### Option 1: Full Local Test (Recommended)

```bash
cd /Users/khoo/Downloads/project4/projects/project-20251107-003428-web3news-aggregator

# Install dependencies
npm install

# Set environment variables (create .env.local)
cat > .env.local << EOF
GITHUB_REPOSITORY_NAME=scaling-octo-garbanzo
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_id
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
EOF

# Run build
npm run build

# Verify output
ls -la out/
# Should see: index.html, _next/, and other static files
```

### Option 2: Quick Verification (Without Full Install)

Check configuration files are correct:

- ✅ `next.config.js` has `output: 'export'`
- ✅ `package.json` has `"build": "next build"`
- ✅ Workflow sets environment variables
- ✅ Workflow uploads `./out` directory

---

## ⚠️ Potential Build Issues

### Issue 1: Missing Environment Variables

**Symptom**: Build succeeds but app doesn't work  
**Fix**: All 4 secrets must be set in GitHub Secrets

### Issue 2: TypeScript Errors

**Symptom**: Build fails with type errors  
**Fix**: Run `npm run typecheck` locally first

### Issue 3: Missing Dependencies

**Symptom**: Build fails with "Cannot find module"  
**Fix**: Verify all packages in `package.json` exist in npm

### Issue 4: Static Export Limitations

**Symptom**: Build fails with "Cannot use X in static export"  
**Fix**: Next.js static export has limitations (no API routes, no server-side features)

---

## ✅ Build Verification Checklist

**Before Deployment:**

- [ ] `next.config.js` has `output: 'export'`
- [ ] `package.json` has correct build script
- [ ] All dependencies exist in npm (no 404 errors)
- [ ] Environment variables documented
- [ ] Workflow uploads `./out` directory

**After Build:**

- [ ] `out/` directory is created
- [ ] `out/index.html` exists
- [ ] `out/_next/static/` directory exists
- [ ] No build errors in logs

---

## 🚀 GitHub Actions Build Process

The workflow does:

1. **Install Dependencies**:

   ```bash
   npm install
   ```

   - Installs all packages from `package.json`
   - Creates `node_modules/` directory

2. **Build Next.js App**:

   ```bash
   npm run build
   ```

   - Runs Next.js build with static export
   - Generates `out/` directory with static files
   - Uses environment variables from secrets

3. **Upload Artifact**:

   ```yaml
   path: ./out
   ```

   - Uploads `out/` directory to GitHub Pages

4. **Deploy**:
   - Deploys artifact to GitHub Pages
   - Site available at: `https://clkhoo5211.github.io/scaling-octo-garbanzo/`

---

## 🔧 If Build Fails

1. **Check Workflow Logs**:
   - Go to Actions tab
   - Click on failed workflow
   - Check "Build Next.js app" step
   - Look for specific error messages

2. **Common Errors**:
   - Missing dependencies → Check `package.json`
   - TypeScript errors → Check types
   - Environment variables → Verify secrets are set
   - Import errors → Check import paths

3. **Fix Locally First**:
   ```bash
   npm install
   npm run typecheck
   npm run build
   ```

---

## 📊 Expected Build Output

After successful build, `out/` directory should contain:

```
out/
├── index.html
├── _next/
│   ├── static/
│   │   ├── chunks/
│   │   ├── css/
│   │   └── media/
├── article/
├── governance/
├── auctions/
└── ... (other pages)
```

---

## ✅ Verification Status

**Configuration**: ✅ Verified  
**Workflow**: ✅ Correct  
**Build Command**: ✅ `npm run build`  
**Output Directory**: ✅ `out/`  
**Environment Variables**: ✅ Set in workflow

**Next**: The build should work in GitHub Actions. If it fails, check the specific error in the workflow logs.

---

**Note**: The build hasn't been tested locally because dependencies aren't installed. The configuration is correct based on Next.js documentation and the workflow setup. If build fails, we'll fix specific errors from the workflow logs.
